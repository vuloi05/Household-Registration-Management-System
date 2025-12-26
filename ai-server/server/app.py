import os
from flask import Flask
from flask_cors import CORS

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
    allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
    methods=['GET', 'POST', 'OPTIONS'],
    expose_headers=['Content-Type']
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