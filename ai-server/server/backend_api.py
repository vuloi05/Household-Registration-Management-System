"""Module để gọi backend API tìm kiếm nhân khẩu."""
import requests
from typing import Optional, List, Dict, Any
from . import settings


def search_nhan_khau_by_address(
    address: str,
    name: Optional[str] = None,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Tìm kiếm nhân khẩu theo địa chỉ hộ khẩu.
    
    Args:
        address: Địa chỉ hộ khẩu để tìm kiếm
        name: Tên nhân khẩu (optional, để kết hợp tìm kiếm)
        max_results: Số lượng kết quả tối đa
    
    Returns:
        List các nhân khẩu tìm được
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
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        else:
            if settings.DEBUG:
                print(f"[BackendAPI] Error searching: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        if settings.DEBUG:
            print(f"[BackendAPI] Exception searching nhan khau: {e}")
        return []


def search_nhan_khau_by_name_and_address(
    name: str,
    address: str,
    max_results: int = 10
) -> List[Dict[str, Any]]:
    """
    Tìm kiếm nhân khẩu theo tên và địa chỉ.
    
    Args:
        name: Tên nhân khẩu
        address: Địa chỉ hộ khẩu
        max_results: Số lượng kết quả tối đa
    
    Returns:
        List các nhân khẩu tìm được
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
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("data", [])
        else:
            if settings.DEBUG:
                print(f"[BackendAPI] Error searching: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        if settings.DEBUG:
            print(f"[BackendAPI] Exception searching nhan khau: {e}")
        return []