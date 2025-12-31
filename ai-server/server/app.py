import os
import uuid
from flask import Flask, request, g
from flask_cors import CORS
from .logger import setup_logging, get_logger
import logging

# Rate limiting (optional import)
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    try:
        # Optional: used to detect invalid Redis config and fallback safely
        from limits.errors import ConfigurationError  # type: ignore
    except Exception:  # pragma: no cover - very unlikely to fail
        ConfigurationError = Exception  # type: ignore
    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    Limiter = None  # type: ignore
    get_remote_address = None  # type: ignore
    ConfigurationError = Exception  # type: ignore

# Create Flask application
app = Flask(__name__)

# Setup logging
logger = setup_logging(
    app_name='ai-server',
    log_level=os.getenv('LOG_LEVEL', 'INFO'),
    log_dir=os.getenv('LOG_DIR', 'logs'),
    use_json=os.getenv('ENVIRONMENT', 'development').lower() == 'production'
)

# CORS Configuration - Improved security with validation
# Allow specific origins instead of all origins
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '')
if allowed_origins_env:
    # Parse comma-separated origins from environment variable
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(',') if origin.strip()]
else:
    # Default: allow localhost for development
    allowed_origins = ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080']

# Validate origins format
def validate_origin(origin: str) -> bool:
    """Validate origin format (basic validation)."""
    if not origin:
        return False
    # Must start with http:// or https://
    if not (origin.startswith('http://') or origin.startswith('https://')):
        return False
    # Basic format check
    try:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        return bool(parsed.scheme and parsed.netloc)
    except Exception:
        return False

# Filter out invalid origins
allowed_origins = [origin for origin in allowed_origins if validate_origin(origin)]

# QUAN TRỌNG: Cho phép credentials để cookie có thể được gửi/nhận
# Cấu hình CORS với allowed origins cụ thể để tăng bảo mật
CORS(
    app,
    supports_credentials=True,
    origins=allowed_origins if allowed_origins else None,  # None means no CORS (more secure)
    allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-ID', 'X-Request-ID', 'X-Request-Signature', 'X-Request-Timestamp'],
    methods=['GET', 'POST', 'OPTIONS'],
    expose_headers=['Content-Type', 'X-Correlation-ID'],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Rate Limiting Configuration
limiter = None
if RATE_LIMITING_AVAILABLE:
    from . import settings

    if settings.RATE_LIMITING_ENABLED:
        # Use Redis if configured, otherwise use in-memory storage.
        # If Redis client lib is missing or config is invalid, we gracefully
        # fall back to in-memory storage instead of crashing the app.
        storage_uri = settings.RATE_LIMIT_STORAGE_URL or None
        use_redis = bool(storage_uri)

        try:
            # Try to initialize with Redis if configured
            if use_redis:
                # Test Redis connection before using it
                try:
                    from limits.storage import storage_from_string
                    test_storage = storage_from_string(storage_uri)
                    # Try a simple operation to verify connection
                    test_storage.hit("test_key")
                    logger.info(f"Redis connection verified for rate limiting: {storage_uri}")
                except Exception as redis_test_error:
                    logger.warning(
                        f"Redis connection test failed, falling back to in-memory storage: {redis_test_error}"
                    )
                    use_redis = False
                    storage_uri = None

            limiter = Limiter(
                app=app,
                key_func=get_remote_address,
                default_limits=[settings.RATE_LIMIT_DEFAULT],
                storage_uri=storage_uri,
                headers_enabled=True,  # Include rate limit headers in response
                strategy="fixed-window",  # Use fixed window strategy
                on_breach=lambda request, endpoint: logger.warning(
                    f"Rate limit breached: {endpoint} from {get_remote_address()}",
                    extra={'endpoint': endpoint, 'ip': get_remote_address()}
                )
            )
            
            storage_type = "Redis" if use_redis else "in-memory"
            logger.info(
                f"Rate limiting enabled with default limits: {settings.RATE_LIMIT_DEFAULT} | storage: {storage_type}"
            )
            
            if not use_redis:
                logger.warning(
                    "Rate limiting using in-memory storage. "
                    "This means rate limits are per-process and won't work across multiple instances. "
                    "Consider configuring Redis for distributed rate limiting."
                )
                
        except ConfigurationError as e:  # e.g. Redis library not installed
            # Fall back to in-memory storage
            logger.warning(f"Rate limiting configuration error, using in-memory fallback: {e}")
            try:
                limiter = Limiter(
                    app=app,
                    key_func=get_remote_address,
                    default_limits=[settings.RATE_LIMIT_DEFAULT],
                    headers_enabled=True,
                    strategy="fixed-window",
                    on_breach=lambda request, endpoint: logger.warning(
                        f"Rate limit breached: {endpoint} from {get_remote_address()}",
                        extra={'endpoint': endpoint, 'ip': get_remote_address()}
                    )
                )
                logger.info(
                    f"Rate limiting enabled with in-memory storage (fallback mode). "
                    f"Default limits: {settings.RATE_LIMIT_DEFAULT}"
                )
            except Exception as fallback_error:
                logger.error(f"Failed to initialize rate limiting even with fallback: {fallback_error}")
                limiter = None
        except Exception as e:
            logger.error(f"Unexpected error initializing rate limiting: {e}", exc_info=True)
            limiter = None
    else:
        logger.info("[Rate Limiting] Disabled (RATE_LIMITING_ENABLED=false)")
else:
    logger.warning(
        "[Rate Limiting] flask-limiter not installed. "
        "Install with: pip install flask-limiter"
    )


# Correlation ID support - Generate và attach correlation ID cho mỗi request
@app.before_request
def add_correlation_id():
    """Generate correlation ID cho mỗi request để track logs."""
    # Check nếu client đã gửi correlation ID trong header
    correlation_id = request.headers.get('X-Correlation-ID') or request.headers.get('X-Request-ID')
    
    if not correlation_id:
        # Generate UUID nếu không có
        correlation_id = str(uuid.uuid4())
    
    # Store trong Flask g để access trong request context
    g.correlation_id = correlation_id


@app.after_request
def add_correlation_id_header(response):
    """Add correlation ID và security headers vào response."""
    if hasattr(g, 'correlation_id'):
        response.headers['X-Correlation-ID'] = g.correlation_id
    
    # Add security headers
    is_production = os.getenv('ENVIRONMENT', 'development').lower() == 'production'
    if is_production:
        # Prevent clickjacking
        response.headers['X-Frame-Options'] = 'DENY'
        # Prevent MIME type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        # Enable XSS protection
        response.headers['X-XSS-Protection'] = '1; mode=block'
        # Strict Transport Security (only if HTTPS)
        if request.is_secure:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        # Content Security Policy (basic)
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    
    return response