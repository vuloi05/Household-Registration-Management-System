"""
Custom exception classes cho AI Server.
"""
from typing import Optional, Dict, Any


class AIServerException(Exception):
    """Base exception cho AI Server."""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.status_code = status_code
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception thành dictionary để trả về JSON response."""
        return {
            'error': self.message,
            'error_code': self.error_code,
            'status_code': self.status_code,
            'details': self.details
        }


class ValidationError(AIServerException):
    """Lỗi validation input."""
    
    def __init__(self, message: str, field: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='VALIDATION_ERROR', status_code=400, details=details)
        if field:
            self.details['field'] = field


class AuthenticationError(AIServerException):
    """Lỗi authentication."""
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='AUTHENTICATION_ERROR', status_code=401, details=details)


class AuthorizationError(AIServerException):
    """Lỗi authorization."""
    
    def __init__(self, message: str = "Authorization failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='AUTHORIZATION_ERROR', status_code=403, details=details)


class NotFoundError(AIServerException):
    """Resource không tìm thấy."""
    
    def __init__(self, message: str = "Resource not found", resource: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='NOT_FOUND', status_code=404, details=details)
        if resource:
            self.details['resource'] = resource


class RateLimitError(AIServerException):
    """Lỗi rate limit exceeded."""
    
    def __init__(self, message: str = "Rate limit exceeded", retry_after: Optional[int] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='RATE_LIMIT_EXCEEDED', status_code=429, details=details)
        if retry_after:
            self.details['retry_after'] = retry_after


class AIProviderError(AIServerException):
    """Lỗi từ AI provider (Gemini, Ollama, etc.)."""
    
    def __init__(
        self,
        message: str,
        provider: Optional[str] = None,
        status_code: int = 502,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, error_code='AI_PROVIDER_ERROR', status_code=status_code, details=details)
        if provider:
            self.details['provider'] = provider


class BackendAPIError(AIServerException):
    """Lỗi khi gọi backend API."""
    
    def __init__(
        self,
        message: str,
        endpoint: Optional[str] = None,
        status_code: int = 502,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, error_code='BACKEND_API_ERROR', status_code=status_code, details=details)
        if endpoint:
            self.details['endpoint'] = endpoint


class ConfigurationError(AIServerException):
    """Lỗi cấu hình."""
    
    def __init__(self, message: str, config_key: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='CONFIGURATION_ERROR', status_code=500, details=details)
        if config_key:
            self.details['config_key'] = config_key


class CacheError(AIServerException):
    """Lỗi cache."""
    
    def __init__(self, message: str = "Cache operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='CACHE_ERROR', status_code=500, details=details)


class KnowledgeBaseError(AIServerException):
    """Lỗi knowledge base."""
    
    def __init__(self, message: str = "Knowledge base operation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, error_code='KNOWLEDGE_BASE_ERROR', status_code=500, details=details)


class CircuitBreakerOpenError(AIServerException):
    """Lỗi khi circuit breaker đang mở (service down)."""
    
    def __init__(
        self,
        message: str = "Circuit breaker is open. Service may be down.",
        circuit_name: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message,
            error_code='CIRCUIT_BREAKER_OPEN',
            status_code=503,  # Service Unavailable
            details=details or {}
        )
        if circuit_name:
            self.details['circuit_name'] = circuit_name