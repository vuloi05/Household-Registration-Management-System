"""
Circuit Breaker Pattern Implementation
Bảo vệ hệ thống khỏi việc gọi liên tục các service đang down hoặc có vấn đề.
"""

import time
import threading
from typing import Callable, Any, Optional, Dict
from enum import Enum
from .logger import get_logger
from .exceptions import CircuitBreakerOpenError

logger = get_logger(__name__)


class CircuitState(Enum):
    """Trạng thái của circuit breaker."""
    CLOSED = "closed"  # Bình thường, cho phép requests
    OPEN = "open"  # Đã fail quá nhiều, block requests
    HALF_OPEN = "half_open"  # Đang test xem service đã recover chưa


class CircuitBreaker:
    """
    Circuit Breaker để bảo vệ khỏi cascading failures.
    
    States:
    - CLOSED: Bình thường, cho phép tất cả requests
    - OPEN: Đã fail quá nhiều, block tất cả requests
    - HALF_OPEN: Cho phép một số requests để test xem service đã recover chưa
    
    Args:
        failure_threshold: Số lần fail liên tiếp trước khi mở circuit (default: 5)
        recovery_timeout: Thời gian (giây) chờ trước khi chuyển sang HALF_OPEN (default: 60)
        success_threshold: Số lần success trong HALF_OPEN để đóng circuit lại (default: 2)
        name: Tên của circuit breaker (để logging)
    """
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        success_threshold: int = 2,
        name: str = "CircuitBreaker"
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.name = name
        
        # State tracking
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: Optional[float] = None
        self.last_success_time: Optional[float] = None
        
        # Thread safety
        self._lock = threading.Lock()
        
        # Metrics
        self.total_requests = 0
        self.total_failures = 0
        self.total_successes = 0
        self.total_rejected = 0
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """
        Gọi function với circuit breaker protection.
        
        Args:
            func: Function cần gọi
            *args, **kwargs: Arguments cho function
        
        Returns:
            Kết quả từ function
        
        Raises:
            CircuitBreakerOpenError: Nếu circuit đang OPEN
            Exception: Exception từ function call
        """
        with self._lock:
            self.total_requests += 1
            self._update_state()
            
            if self.state == CircuitState.OPEN:
                self.total_rejected += 1
                logger.warning(
                    f"[{self.name}] Circuit breaker is OPEN, rejecting request",
                    extra={
                        'circuit_name': self.name,
                        'state': self.state.value,
                        'failure_count': self.failure_count,
                        'last_failure_time': self.last_failure_time
                    }
                )
                raise CircuitBreakerOpenError(
                    f"Circuit breaker '{self.name}' is OPEN. Service may be down. "
                    f"Please try again later.",
                    circuit_name=self.name,
                    details={
                        'failure_count': self.failure_count,
                        'recovery_timeout': self.recovery_timeout,
                        'last_failure_time': self.last_failure_time
                    }
                )
        
        # Gọi function
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _update_state(self) -> None:
        """Cập nhật state của circuit breaker dựa trên thời gian và failure count."""
        current_time = time.time()
        
        if self.state == CircuitState.OPEN:
            # Kiểm tra xem đã đủ thời gian recovery chưa
            if self.last_failure_time and \
               (current_time - self.last_failure_time) >= self.recovery_timeout:
                logger.info(
                    f"[{self.name}] Recovery timeout reached, transitioning to HALF_OPEN",
                    extra={'circuit_name': self.name, 'recovery_timeout': self.recovery_timeout}
                )
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
                self.failure_count = 0
        
        elif self.state == CircuitState.HALF_OPEN:
            # Nếu đã có đủ success trong HALF_OPEN, đóng circuit lại
            if self.success_count >= self.success_threshold:
                logger.info(
                    f"[{self.name}] Success threshold reached in HALF_OPEN, closing circuit",
                    extra={
                        'circuit_name': self.name,
                        'success_count': self.success_count,
                        'success_threshold': self.success_threshold
                    }
                )
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                self.success_count = 0
    
    def _on_success(self) -> None:
        """Xử lý khi call thành công."""
        with self._lock:
            self.total_successes += 1
            self.last_success_time = time.time()
            
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                logger.debug(
                    f"[{self.name}] Success in HALF_OPEN state (count: {self.success_count}/{self.success_threshold})",
                    extra={
                        'circuit_name': self.name,
                        'success_count': self.success_count,
                        'success_threshold': self.success_threshold
                    }
                )
            elif self.state == CircuitState.CLOSED:
                # Reset failure count khi có success
                if self.failure_count > 0:
                    logger.debug(
                        f"[{self.name}] Success after failures, resetting failure count",
                        extra={'circuit_name': self.name, 'previous_failures': self.failure_count}
                    )
                    self.failure_count = 0
    
    def _on_failure(self) -> None:
        """Xử lý khi call fail."""
        with self._lock:
            self.total_failures += 1
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            logger.warning(
                f"[{self.name}] Request failed (failure count: {self.failure_count}/{self.failure_threshold})",
                extra={
                    'circuit_name': self.name,
                    'failure_count': self.failure_count,
                    'failure_threshold': self.failure_threshold,
                    'state': self.state.value
                }
            )
            
            if self.state == CircuitState.HALF_OPEN:
                # Nếu fail trong HALF_OPEN, mở circuit lại ngay
                logger.error(
                    f"[{self.name}] Failure in HALF_OPEN state, opening circuit",
                    extra={'circuit_name': self.name}
                )
                self.state = CircuitState.OPEN
                self.success_count = 0
            elif self.state == CircuitState.CLOSED:
                # Nếu đạt failure threshold, mở circuit
                if self.failure_count >= self.failure_threshold:
                    logger.error(
                        f"[{self.name}] Failure threshold reached, opening circuit",
                        extra={
                            'circuit_name': self.name,
                            'failure_count': self.failure_count,
                            'failure_threshold': self.failure_threshold
                        }
                    )
                    self.state = CircuitState.OPEN
    
    def reset(self) -> None:
        """Reset circuit breaker về trạng thái ban đầu (CLOSED)."""
        with self._lock:
            logger.info(f"[{self.name}] Circuit breaker reset", extra={'circuit_name': self.name})
            self.state = CircuitState.CLOSED
            self.failure_count = 0
            self.success_count = 0
            self.last_failure_time = None
            self.last_success_time = None
    
    def get_state(self) -> Dict[str, Any]:
        """Lấy thông tin trạng thái hiện tại của circuit breaker."""
        with self._lock:
            return {
                'name': self.name,
                'state': self.state.value,
                'failure_count': self.failure_count,
                'success_count': self.success_count,
                'failure_threshold': self.failure_threshold,
                'success_threshold': self.success_threshold,
                'recovery_timeout': self.recovery_timeout,
                'last_failure_time': self.last_failure_time,
                'last_success_time': self.last_success_time,
                'metrics': {
                    'total_requests': self.total_requests,
                    'total_successes': self.total_successes,
                    'total_failures': self.total_failures,
                    'total_rejected': self.total_rejected,
                    'success_rate': (
                        self.total_successes / self.total_requests
                        if self.total_requests > 0 else 0.0
                    )
                }
            }


# Global circuit breakers cho các services
_gemini_circuit_breaker: Optional[CircuitBreaker] = None
_ollama_circuit_breaker: Optional[CircuitBreaker] = None
_backend_api_circuit_breaker: Optional[CircuitBreaker] = None


def get_gemini_circuit_breaker() -> CircuitBreaker:
    """Lấy circuit breaker cho Gemini API."""
    global _gemini_circuit_breaker
    if _gemini_circuit_breaker is None:
        _gemini_circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=60,
            success_threshold=2,
            name="GeminiAPI"
        )
    return _gemini_circuit_breaker


def get_ollama_circuit_breaker() -> CircuitBreaker:
    """Lấy circuit breaker cho Ollama API."""
    global _ollama_circuit_breaker
    if _ollama_circuit_breaker is None:
        _ollama_circuit_breaker = CircuitBreaker(
            failure_threshold=5,
            recovery_timeout=60,
            success_threshold=2,
            name="OllamaAPI"
        )
    return _ollama_circuit_breaker


def get_backend_api_circuit_breaker() -> CircuitBreaker:
    """Lấy circuit breaker cho Backend API."""
    global _backend_api_circuit_breaker
    if _backend_api_circuit_breaker is None:
        _backend_api_circuit_breaker = CircuitBreaker(
            failure_threshold=3,  # Thấp hơn vì backend API quan trọng hơn
            recovery_timeout=30,  # Recovery nhanh hơn
            success_threshold=1,
            name="BackendAPI"
        )
    return _backend_api_circuit_breaker


def get_all_circuit_breakers() -> Dict[str, CircuitBreaker]:
    """Lấy tất cả circuit breakers."""
    breakers = {}
    if _gemini_circuit_breaker:
        breakers['gemini'] = _gemini_circuit_breaker
    if _ollama_circuit_breaker:
        breakers['ollama'] = _ollama_circuit_breaker
    if _backend_api_circuit_breaker:
        breakers['backend_api'] = _backend_api_circuit_breaker
    return breakers