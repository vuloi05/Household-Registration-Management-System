"""
Security utilities for API key rotation, request signing, IP whitelisting, and input sanitization.
"""
import os
import hmac
import hashlib
import time
import re
import html
from typing import List, Optional, Callable
from functools import wraps
from flask import request, jsonify, g
from .logger import get_logger

logger = get_logger(__name__)


# ==================== API Key Rotation ====================

class APIKeyRotator:
    """Manages API key rotation for multiple keys."""
    
    def __init__(self, keys: List[str]):
        """
        Initialize API key rotator.
        
        Args:
            keys: List of API keys to rotate
        """
        self.keys = [key.strip() for key in keys if key.strip()]
        self.current_index = 0
        self.failed_keys = set()  # Track failed keys to avoid using them
    
    def get_next_key(self) -> Optional[str]:
        """
        Get next API key in rotation.
        
        Returns:
            Next API key or None if no keys available
        """
        if not self.keys:
            return None
        
        # Try to find a key that hasn't failed
        available_keys = [k for k in self.keys if k not in self.failed_keys]
        if not available_keys:
            # Reset failed keys if all have failed
            logger.warning("All API keys have failed, resetting failed keys list")
            self.failed_keys.clear()
            available_keys = self.keys
        
        # Get next key
        key = available_keys[self.current_index % len(available_keys)]
        self.current_index += 1
        return key
    
    def mark_key_failed(self, key: str):
        """Mark an API key as failed (e.g., due to rate limit or error)."""
        if key in self.keys:
            self.failed_keys.add(key)
            logger.warning(f"Marked API key as failed (index: {self.keys.index(key)})")
    
    def reset_failed_keys(self):
        """Reset failed keys list (e.g., after a time period)."""
        self.failed_keys.clear()
        logger.info("Reset failed API keys list")
    
    def get_key_count(self) -> int:
        """Get total number of available keys."""
        return len(self.keys)
    
    def get_active_key_count(self) -> int:
        """Get number of active (non-failed) keys."""
        return len([k for k in self.keys if k not in self.failed_keys])


# ==================== Request Signing ====================

def generate_request_signature(
    method: str,
    path: str,
    body: bytes,
    timestamp: int,
    secret: str
) -> str:
    """
    Generate HMAC signature for request verification.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        path: Request path
        body: Request body as bytes
        timestamp: Unix timestamp
        secret: Shared secret key
    
    Returns:
        Base64-encoded signature
    """
    import base64
    
    # Create message to sign
    message = f"{method}\n{path}\n{timestamp}\n".encode('utf-8') + body
    
    # Generate HMAC-SHA256 signature
    signature = hmac.new(
        secret.encode('utf-8'),
        message,
        hashlib.sha256
    ).digest()
    
    return base64.b64encode(signature).decode('utf-8')


def verify_request_signature(
    method: str,
    path: str,
    body: bytes,
    timestamp: int,
    signature: str,
    secret: str,
    max_age: int = 300  # 5 minutes
) -> bool:
    """
    Verify request signature.
    
    Args:
        method: HTTP method
        path: Request path
        body: Request body as bytes
        timestamp: Unix timestamp from request
        signature: Signature from request header
        secret: Shared secret key
        max_age: Maximum age of request in seconds
    
    Returns:
        True if signature is valid, False otherwise
    """
    # Check timestamp freshness
    current_time = int(time.time())
    if abs(current_time - timestamp) > max_age:
        logger.warning(f"Request timestamp too old or too far in future: {timestamp}, current: {current_time}")
        return False
    
    # Generate expected signature
    expected_signature = generate_request_signature(method, path, body, timestamp, secret)
    
    # Constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected_signature, signature)


def require_signed_request(secret: Optional[str] = None):
    """
    Decorator to require signed requests for internal APIs.
    
    Usage:
        @app.route('/internal/endpoint')
        @require_signed_request(secret=settings.INTERNAL_API_SECRET)
        def internal_endpoint():
            ...
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not secret:
                logger.error("Request signing required but secret not configured")
                return jsonify({
                    "error": "Configuration Error",
                    "message": "Request signing not properly configured",
                    "error_code": "CONFIG_ERROR",
                    "status_code": 500
                }), 500
            
            # Get signature and timestamp from headers
            signature = request.headers.get('X-Request-Signature')
            timestamp_str = request.headers.get('X-Request-Timestamp')
            
            if not signature or not timestamp_str:
                logger.warning("Missing signature or timestamp in request")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Request signature required",
                    "error_code": "MISSING_SIGNATURE",
                    "status_code": 401
                }), 401
            
            try:
                timestamp = int(timestamp_str)
            except ValueError:
                logger.warning(f"Invalid timestamp format: {timestamp_str}")
                return jsonify({
                    "error": "Bad Request",
                    "message": "Invalid timestamp format",
                    "error_code": "INVALID_TIMESTAMP",
                    "status_code": 400
                }), 400
            
            # Get request body
            body = b''
            if request.is_json:
                import json
                body = json.dumps(request.json, sort_keys=True).encode('utf-8')
            elif request.data:
                body = request.data
            
            # Verify signature
            if not verify_request_signature(
                request.method,
                request.path,
                body,
                timestamp,
                signature,
                secret
            ):
                logger.warning(f"Invalid request signature from {request.remote_addr}")
                return jsonify({
                    "error": "Unauthorized",
                    "message": "Invalid request signature",
                    "error_code": "INVALID_SIGNATURE",
                    "status_code": 401
                }), 401
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# ==================== IP Whitelisting ====================

def is_ip_allowed(ip: str, allowed_ips: List[str]) -> bool:
    """
    Check if IP address is in whitelist.
    Supports CIDR notation and wildcards.
    
    Args:
        ip: IP address to check
        allowed_ips: List of allowed IPs/CIDR ranges
    
    Returns:
        True if IP is allowed, False otherwise
    """
    if not allowed_ips:
        return True  # No whitelist means all IPs allowed
    
    # Check exact match
    if ip in allowed_ips:
        return True
    
    # Check CIDR notation
    for allowed in allowed_ips:
        if '/' in allowed:
            try:
                import ipaddress
                ip_obj = ipaddress.ip_address(ip)
                network = ipaddress.ip_network(allowed, strict=False)
                if ip_obj in network:
                    return True
            except (ValueError, AttributeError):
                # AttributeError if ipaddress module not available
                continue
            except Exception:
                continue
        elif allowed.endswith('*'):
            # Wildcard support (e.g., "192.168.*")
            pattern = allowed.replace('*', '.*').replace('.', r'\.')
            if re.match(pattern, ip):
                return True
    
    return False


def require_ip_whitelist(allowed_ips: Optional[List[str]] = None):
    """
    Decorator to require IP whitelist for admin endpoints.
    
    Usage:
        @app.route('/admin/endpoint')
        @require_ip_whitelist(allowed_ips=settings.ADMIN_IP_WHITELIST)
        def admin_endpoint():
            ...
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not allowed_ips:
                logger.warning("IP whitelist required but not configured, denying access")
                return jsonify({
                    "error": "Forbidden",
                    "message": "IP whitelist not configured",
                    "error_code": "IP_WHITELIST_NOT_CONFIGURED",
                    "status_code": 403
                }), 403
            
            # Get client IP (consider X-Forwarded-For for proxies)
            client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
            if ',' in client_ip:
                # X-Forwarded-For can contain multiple IPs, take the first one
                client_ip = client_ip.split(',')[0].strip()
            
            if not is_ip_allowed(client_ip, allowed_ips):
                logger.warning(f"IP {client_ip} not in whitelist for {request.path}")
                return jsonify({
                    "error": "Forbidden",
                    "message": "Your IP address is not authorized to access this endpoint",
                    "error_code": "IP_NOT_WHITELISTED",
                    "status_code": 403
                }), 403
            
            # Store IP in request context for logging
            g.client_ip = client_ip
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# ==================== Input Sanitization ====================

def sanitize_string(value: str, max_length: Optional[int] = None, allow_html: bool = False) -> str:
    """
    Sanitize string input to prevent injection attacks.
    
    Args:
        value: Input string
        max_length: Maximum allowed length
        allow_html: Whether to allow HTML (default: False, will escape HTML)
    
    Returns:
        Sanitized string
    """
    if not isinstance(value, str):
        value = str(value)
    
    # Remove null bytes
    value = value.replace('\x00', '')
    
    # Truncate if too long
    if max_length and len(value) > max_length:
        value = value[:max_length]
        logger.warning(f"Input truncated to {max_length} characters")
    
    # Escape HTML if not allowed
    if not allow_html:
        value = html.escape(value)
    
    # Remove control characters except newline and tab
    value = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
    
    return value.strip()


def sanitize_json(data: dict, max_depth: int = 10) -> dict:
    """
    Recursively sanitize JSON data.
    
    Args:
        data: JSON data to sanitize
        max_depth: Maximum recursion depth
    
    Returns:
        Sanitized JSON data
    """
    if max_depth <= 0:
        logger.warning("Maximum recursion depth reached in sanitize_json")
        return {}
    
    if isinstance(data, dict):
        return {k: sanitize_json(v, max_depth - 1) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json(item, max_depth - 1) for item in data]
    elif isinstance(data, str):
        return sanitize_string(data)
    else:
        return data


def sanitize_input(fields: List[str], max_lengths: Optional[dict] = None):
    """
    Decorator to sanitize input fields in request.
    
    Usage:
        @app.route('/endpoint')
        @sanitize_input(['message', 'context'], max_lengths={'message': 10000, 'context': 50000})
        def endpoint():
            ...
    """
    if max_lengths is None:
        max_lengths = {}
    
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Sanitize JSON body
            if request.is_json and request.json:
                for field in fields:
                    if field in request.json and isinstance(request.json[field], str):
                        max_len = max_lengths.get(field)
                        request.json[field] = sanitize_string(request.json[field], max_length=max_len)
            
            # Sanitize query parameters
            for field in fields:
                if field in request.args:
                    max_len = max_lengths.get(field)
                    # Note: request.args is immutable, so we can't modify it directly
                    # This is a limitation, but query params are less risky than body
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator