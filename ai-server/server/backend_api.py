"""Module để gọi backend API tìm kiếm nhân khẩu."""
import requests
import time
from typing import Optional, List, Dict, Any
from . import settings
from .logger import get_logger
from .exceptions import BackendAPIError
from .circuit_breaker import get_backend_api_circuit_breaker

logger = get_logger(__name__)

# Health check cache
_backend_health_cache: Dict[str, Any] = {
    'is_healthy': True,
    'last_check': 0,
    'check_interval': 30  # Check mỗi 30 giây
}


def check_backend_api_health(force_check: bool = False) -> Dict[str, Any]:
    """
    Kiểm tra health của backend API.
    
    Args:
        force_check: Nếu True, bỏ qua cache và check ngay
    
    Returns:
        Dict với thông tin health:
        {
            'is_healthy': bool,
            'status_code': int,
            'response_time_ms': float,
            'error': str (nếu có),
            'timestamp': float
        }
    """
    current_time = time.time()
    
    # Kiểm tra cache nếu không force
    if not force_check:
        if current_time - _backend_health_cache['last_check'] < _backend_health_cache['check_interval']:
            return {
                'is_healthy': _backend_health_cache['is_healthy'],
                'cached': True,
                'last_check': _backend_health_cache['last_check']
            }
    
    try:
        # Health check endpoint (có thể là /health hoặc /actuator/health)
        health_endpoints = [
            f"{settings.BACKEND_API_URL}/health",
            f"{settings.BACKEND_API_URL}/actuator/health",
            f"{settings.BACKEND_API_URL}/api/health"
        ]
        
        headers = {}
        if settings.BACKEND_API_TOKEN:
            headers["Authorization"] = f"Bearer {settings.BACKEND_API_TOKEN}"
        
        start_time = time.time()
        health_ok = False
        status_code = None
        error = None
        
        # Thử từng endpoint
        for endpoint in health_endpoints:
            try:
                response = requests.get(endpoint, headers=headers, timeout=3)
                status_code = response.status_code
                if response.status_code in [200, 204]:
                    health_ok = True
                    break
            except requests.exceptions.RequestException as e:
                error = str(e)
                continue
        
        response_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Update cache
        _backend_health_cache['is_healthy'] = health_ok
        _backend_health_cache['last_check'] = current_time
        
        result = {
            'is_healthy': health_ok,
            'status_code': status_code,
            'response_time_ms': round(response_time, 2),
            'timestamp': current_time,
            'cached': False
        }
        
        if error:
            result['error'] = error
        
        if not health_ok:
            logger.warning(
                "Backend API health check failed",
                extra={
                    'status_code': status_code,
                    'error': error,
                    'response_time_ms': response_time
                }
            )
        
        return result
        
    except Exception as e:
        logger.error(f"Error checking backend API health: {e}", exc_info=True)
        _backend_health_cache['is_healthy'] = False
        _backend_health_cache['last_check'] = current_time
        
        return {
            'is_healthy': False,
            'error': str(e),
            'timestamp': current_time,
            'cached': False
        }


def is_backend_api_healthy() -> bool:
    """
    Kiểm tra nhanh xem backend API có healthy không (sử dụng cache).
    
    Returns:
        True nếu backend API healthy, False nếu không
    """
    health = check_backend_api_health()
    return health.get('is_healthy', False)


def _search_nhan_khau_by_address_internal(
    address: str,
    name: Optional[str] = None,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Internal function để tìm kiếm nhân khẩu (không có circuit breaker).
    """
    try:
        url = f"{settings.BACKEND_API_URL}/nhankhau-management"
        params = {
            "page": 0,
            "size": max_results,
            "locationFilter": address
        }
        
        # Nếu có tên, thêm vào search
        if name:
            params["search"] = name
        
        headers = {}
        if settings.BACKEND_API_TOKEN:
            headers["Authorization"] = f"Bearer {settings.BACKEND_API_TOKEN}"
        
        logger.debug(f"Searching nhan khau by address: {address}, name: {name}")
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("data", [])
            logger.debug(f"Found {len(results)} results for address search")
            return results
        else:
            logger.warning(
                f"Backend API error searching nhan khau: {response.status_code}",
                extra={'status_code': response.status_code, 'endpoint': url}
            )
            # Không raise exception để cho phép fallback
            return []
    except requests.exceptions.Timeout:
        logger.error(f"Backend API timeout when searching nhan khau by address")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Backend API request error when searching nhan khau: {e}", exc_info=True)
        return []
    except Exception as e:
        logger.error(f"Unexpected error searching nhan khau by address: {e}", exc_info=True)
        return []


def search_nhan_khau_by_address(
    address: str,
    name: Optional[str] = None,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Tìm kiếm nhân khẩu theo địa chỉ hộ khẩu với circuit breaker và health check.
    
    Args:
        address: Địa chỉ hộ khẩu để tìm kiếm
        name: Tên nhân khẩu (optional, để kết hợp tìm kiếm)
        max_results: Số lượng kết quả tối đa
    
    Returns:
        List các nhân khẩu tìm được (empty list nếu có lỗi)
    """
    # Kiểm tra health trước
    if not is_backend_api_healthy():
        logger.warning("Backend API is not healthy, skipping search request")
        return []
    
    # Sử dụng circuit breaker
    circuit_breaker = get_backend_api_circuit_breaker()
    
    try:
        return circuit_breaker.call(
            _search_nhan_khau_by_address_internal,
            address,
            name,
            max_results
        )
    except Exception as e:
        logger.error(f"Error in search_nhan_khau_by_address: {e}", exc_info=True)
        return []  # Return empty list để cho phép fallback


def _search_nhan_khau_by_name_and_address_internal(
    name: str,
    address: str,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Internal function để tìm kiếm nhân khẩu (không có circuit breaker).
    """
    try:
        url = f"{settings.BACKEND_API_URL}/nhankhau-management"
        params = {
            "page": 0,
            "size": max_results,
            "search": name,  # Tìm theo tên
            "locationFilter": address  # Lọc theo địa chỉ
        }
        
        headers = {}
        if settings.BACKEND_API_TOKEN:
            headers["Authorization"] = f"Bearer {settings.BACKEND_API_TOKEN}"
        
        logger.debug(f"Searching nhan khau by name and address: name={name}, address={address}")
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            results = data.get("data", [])
            logger.debug(f"Found {len(results)} results for name+address search")
            return results
        else:
            logger.warning(
                f"Backend API error searching nhan khau: {response.status_code}",
                extra={'status_code': response.status_code, 'endpoint': url}
            )
            # Không raise exception để cho phép fallback
            return []
    except requests.exceptions.Timeout:
        logger.error(f"Backend API timeout when searching nhan khau by name and address")
        return []
    except requests.exceptions.RequestException as e:
        logger.error(f"Backend API request error when searching nhan khau: {e}", exc_info=True)
        return []
    except Exception as e:
        logger.error(f"Unexpected error searching nhan khau by name and address: {e}", exc_info=True)
        return []


def search_nhan_khau_by_name_and_address(
    name: str,
    address: str,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Tìm kiếm nhân khẩu theo tên và địa chỉ với circuit breaker và health check.
    
    Args:
        name: Tên nhân khẩu
        address: Địa chỉ hộ khẩu
        max_results: Số lượng kết quả tối đa
    
    Returns:
        List các nhân khẩu tìm được (empty list nếu có lỗi)
    """
    # Kiểm tra health trước
    if not is_backend_api_healthy():
        logger.warning("Backend API is not healthy, skipping search request")
        return []
    
    # Sử dụng circuit breaker
    circuit_breaker = get_backend_api_circuit_breaker()
    
    try:
        return circuit_breaker.call(
            _search_nhan_khau_by_name_and_address_internal,
            name,
            address,
            max_results
        )
    except Exception as e:
        logger.error(f"Error in search_nhan_khau_by_name_and_address: {e}", exc_info=True)
        return []  # Return empty list để cho phép fallback