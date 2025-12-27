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

# CORS Configuration - Improved security
# Allow specific origins instead of all origins
allowed_origins_env = os.getenv('ALLOWED_ORIGINS', '')
if allowed_origins_env:
    # Parse comma-separated origins from environment variable
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(',') if origin.strip()]
else:
    # Default: allow localhost for development
    allowed_origins = ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080']

# QUAN TRỌNG: Cho phép credentials để cookie có thể được gửi/nhận
# Cấu hình CORS với allowed origins cụ thể để tăng bảo mật
CORS(
    app,
    supports_credentials=True,
    origins=allowed_origins,
    allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-ID', 'X-Request-ID'],
    methods=['GET', 'POST', 'OPTIONS'],
    expose_headers=['Content-Type', 'X-Correlation-ID']
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

        try:
            limiter = Limiter(
                app=app,
                key_func=get_remote_address,
                default_limits=[settings.RATE_LIMIT_DEFAULT],
                storage_uri=storage_uri,
                headers_enabled=True,  # Include rate limit headers in response
                strategy="fixed-window",  # Use fixed window strategy
            )
            if os.getenv("DEBUG", "False").lower() == "true":
                print(
                    "[Rate Limiting] Enabled with default limits:",
                    settings.RATE_LIMIT_DEFAULT,
                    "| storage:",
                    storage_uri or "in-memory",
                )
        except ConfigurationError as e:  # e.g. Redis library not installed
            # Fall back to in-memory storage
            limiter = Limiter(
                app=app,
                key_func=get_remote_address,
                default_limits=[settings.RATE_LIMIT_DEFAULT],
                headers_enabled=True,
                strategy="fixed-window",
            )
            if os.getenv("DEBUG", "False").lower() == "true":
                print(
                    "[Rate Limiting] Redis storage unavailable, "
                    "falling back to in-memory. Error:",
                    e,
                )
    else:
        if os.getenv("DEBUG", "False").lower() == "true":
            print("[Rate Limiting] Disabled (RATE_LIMITING_ENABLED=false)")
else:
    if os.getenv("DEBUG", "False").lower() == "true":
        print(
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
    """Add correlation ID vào response header."""
    if hasattr(g, 'correlation_id'):
        response.headers['X-Correlation-ID'] = g.correlation_id
    return response