import os
import json
import subprocess
import sys
import time
import socket
from pathlib import Path
from dotenv import load_dotenv

# Optional AWS SDK
try:
    import boto3  # type: ignore
    from botocore.exceptions import BotoCoreError, ClientError  # type: ignore
except Exception:  # boto3 optional for local-only mode
    boto3 = None  # type: ignore
    BotoCoreError = Exception  # type: ignore
    ClientError = Exception  # type: ignore


# Load environment variables
# Try to find .env file in multiple locations
env_loaded = False
env_paths = [
    Path(__file__).parent.parent / '.env',  # ai-server/.env
    Path.cwd() / '.env',  # Current working directory
    Path.home() / '.env',  # Home directory (fallback)
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        env_loaded = True
        if os.getenv('DEBUG', 'False').lower() == 'true':
            print(f"[Settings] Loaded .env from: {env_path}")
        break

if not env_loaded:
    # Try default load_dotenv() as fallback
    load_dotenv()
    if os.getenv('DEBUG', 'False').lower() == 'true':
        print("[Settings] Attempted to load .env using default method")

# Basic server config
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# AWS Config (optional)
AWS_REGION = os.getenv('AWS_REGION')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')  # AWS Access Key
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')  # AWS Secret Access Key
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET')  # where raw chat logs are stored
AWS_DDB_TABLE = os.getenv('AWS_DDB_TABLE')  # DynamoDB table for structured conversations

# Learning Config (optional)
LEARNING_FROM_AWS = os.getenv('LEARNING_FROM_AWS', 'false').lower() == 'true'
LEARNING_MAX_ITEMS = int(os.getenv('LEARNING_MAX_ITEMS', '16'))
LEARNING_S3_PREFIX = os.getenv('LEARNING_S3_PREFIX', 'chat-logs')
# Auto-reload knowledge base từ AWS định kỳ (giây), 0 để tắt
LEARNING_AUTO_RELOAD_INTERVAL = int(os.getenv('LEARNING_AUTO_RELOAD_INTERVAL', '300'))  # Mặc định 5 phút
LEARNING_AUTO_RELOAD_ENABLED = os.getenv('LEARNING_AUTO_RELOAD_ENABLED', 'true').lower() == 'true'

# Tự học chủ động - Tự động phân tích và học từ conversations (không cần feedback)
LEARNING_AUTO_LEARN_ENABLED = os.getenv('LEARNING_AUTO_LEARN_ENABLED', 'true').lower() == 'true'
LEARNING_AUTO_LEARN_INTERVAL = int(os.getenv('LEARNING_AUTO_LEARN_INTERVAL', '600'))  # Mặc định 10 phút
LEARNING_MIN_SCORE_THRESHOLD = float(os.getenv('LEARNING_MIN_SCORE_THRESHOLD', '0.5'))  # Điểm tối thiểu để học (0.0-1.0)
LEARNING_MAX_AUTO_LEARN_ITEMS = int(os.getenv('LEARNING_MAX_AUTO_LEARN_ITEMS', '10'))  # Số Q&A tối đa học mỗi lần chạy

# KB Matching thresholds
KB_SIMILARITY_THRESHOLD = float(os.getenv('KB_SIMILARITY_THRESHOLD', '0.8'))
KB_JACCARD_THRESHOLD = float(os.getenv('KB_JACCARD_THRESHOLD', '0.3'))

# KB Semantic Similarity (optional, requires sentence-transformers)
KB_USE_SEMANTIC_SIMILARITY = os.getenv('KB_USE_SEMANTIC_SIMILARITY', 'false').lower() == 'true'
KB_SEMANTIC_THRESHOLD = float(os.getenv('KB_SEMANTIC_THRESHOLD', '0.7'))
KB_SEMANTIC_MODEL = os.getenv('KB_SEMANTIC_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2')
KB_HYBRID_WEIGHT_KEYWORD = float(os.getenv('KB_HYBRID_WEIGHT_KEYWORD', '0.4'))  # Weight for keyword matching (0.0-1.0)
KB_HYBRID_WEIGHT_SEMANTIC = float(os.getenv('KB_HYBRID_WEIGHT_SEMANTIC', '0.6'))  # Weight for semantic similarity (0.0-1.0)

# Conversation history length used when calling models
MAX_HISTORY_MESSAGES = int(os.getenv('MAX_HISTORY_MESSAGES', '20'))

# Google Gemini Config (optional)
# Support single key (backward compatible) or multiple keys (comma-separated)
GEMINI_API_KEYS_STR = os.getenv('GEMINI_API_KEYS', '') or os.getenv('GOOGLE_GEMINI_API_KEY', '')
GEMINI_API_KEYS = [key.strip() for key in GEMINI_API_KEYS_STR.split(',') if key.strip()] if GEMINI_API_KEYS_STR else []
# Backward compatibility: support single key
GOOGLE_GEMINI_API_KEY = GEMINI_API_KEYS[0] if GEMINI_API_KEYS else None
# Google recommended model endpoint
GOOGLE_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


# Ollama local AI (optional, preferred)
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.1')

# Response caching
ENABLE_RESPONSE_CACHE = os.getenv('ENABLE_RESPONSE_CACHE', 'true').lower() == 'true'
RESPONSE_CACHE_TTL = int(os.getenv('RESPONSE_CACHE_TTL', '3600'))  # 1 giờ
RESPONSE_CACHE_MAX_SIZE = int(os.getenv('RESPONSE_CACHE_MAX_SIZE', '1000'))  # Max items in memory cache

# Redis cache config (optional, fallback to memory if not configured)
REDIS_URL = os.getenv('REDIS_URL', '')  # e.g., redis://localhost:6379/0
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))
REDIS_DB = int(os.getenv('REDIS_DB', '0'))
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD', '')
REDIS_SSL = os.getenv('REDIS_SSL', 'false').lower() == 'true'
USE_REDIS_CACHE = os.getenv('USE_REDIS_CACHE', 'false').lower() == 'true'  # Enable Redis backend

# Auto-start Redis server config
AUTO_START_REDIS = os.getenv('AUTO_START_REDIS', 'true').lower() == 'true'  # Tự động khởi động Redis
REDIS_SERVER_PATH = os.getenv('REDIS_SERVER_PATH', '')  # Đường dẫn đến redis-server (để trống để tự tìm)

# Cache versioning (increment when KB updates to invalidate cache)
CACHE_VERSION = int(os.getenv('CACHE_VERSION', '1'))  # Auto-incremented when KB reloads

# Conversation memory
ENABLE_CONVERSATION_MEMORY = os.getenv('ENABLE_CONVERSATION_MEMORY', 'true').lower() == 'true'
SESSION_TIMEOUT_HOURS = int(os.getenv('SESSION_TIMEOUT_HOURS', '24'))

# Response validation
ENABLE_RESPONSE_VALIDATION = os.getenv('ENABLE_RESPONSE_VALIDATION', 'true').lower() == 'true'

# API retry config
API_RETRY_MAX_ATTEMPTS = int(os.getenv('API_RETRY_MAX_ATTEMPTS', '3'))
API_RETRY_DELAY_SECONDS = float(os.getenv('API_RETRY_DELAY_SECONDS', '1.0'))

# Backend API config
BACKEND_API_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8080/api')
BACKEND_API_TOKEN = os.getenv('BACKEND_API_TOKEN', '')  # Optional: JWT token if needed

# Rate limiting config
RATE_LIMITING_ENABLED = os.getenv('RATE_LIMITING_ENABLED', 'true').lower() == 'true'
RATE_LIMIT_STORAGE_URL = os.getenv('RATE_LIMIT_STORAGE_URL', '')  # Optional: Redis URL for distributed rate limiting
# Default rate limits (per IP address)
RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '200 per day, 50 per hour')
RATE_LIMIT_CHAT = os.getenv('RATE_LIMIT_CHAT', '30 per minute, 200 per hour')  # For /chat endpoint
RATE_LIMIT_KB_RELOAD = os.getenv('RATE_LIMIT_KB_RELOAD', '10 per hour')  # For /kb/reload endpoint
RATE_LIMIT_AUTO_LEARN = os.getenv('RATE_LIMIT_AUTO_LEARN', '5 per hour')  # For /kb/auto-learn endpoint

# Security config
# Internal API secret for request signing (optional)
INTERNAL_API_SECRET = os.getenv('INTERNAL_API_SECRET', '')
# Admin IP whitelist (comma-separated, supports CIDR notation)
ADMIN_IP_WHITELIST_STR = os.getenv('ADMIN_IP_WHITELIST', '')
ADMIN_IP_WHITELIST = [ip.strip() for ip in ADMIN_IP_WHITELIST_STR.split(',') if ip.strip()] if ADMIN_IP_WHITELIST_STR else []
# Enable request signing for internal APIs
ENABLE_REQUEST_SIGNING = os.getenv('ENABLE_REQUEST_SIGNING', 'false').lower() == 'true'
# Enable IP whitelist for admin endpoints
ENABLE_IP_WHITELIST = os.getenv('ENABLE_IP_WHITELIST', 'false').lower() == 'true'


# Initialize AWS clients if configured
s3_client = None
ddb_client = None
if boto3 and AWS_REGION and (AWS_S3_BUCKET or AWS_DDB_TABLE):
    # Build credentials dict if provided
    aws_credentials = {}
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        aws_credentials = {
            'aws_access_key_id': AWS_ACCESS_KEY_ID,
            'aws_secret_access_key': AWS_SECRET_ACCESS_KEY
        }
    elif DEBUG:
        print("[Settings] Warning: AWS_REGION and bucket/table configured but AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing")
    
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION, **aws_credentials)
        if DEBUG:
            print(f"[Settings] S3 client initialized successfully (region: {AWS_REGION})")
    except Exception as e:
        s3_client = None
        if DEBUG:
            print(f"[Settings] Failed to initialize S3 client: {e}")
    try:
        ddb_client = boto3.client('dynamodb', region_name=AWS_REGION, **aws_credentials)
        if DEBUG:
            print(f"[Settings] DynamoDB client initialized successfully (region: {AWS_REGION})")
    except Exception as e:
        ddb_client = None
        if DEBUG:
            print(f"[Settings] Failed to initialize DynamoDB client: {e}")
elif DEBUG and boto3:
    # Debug: Show why AWS is not configured
    missing = []
    if not AWS_REGION:
        missing.append("AWS_REGION")
    if not AWS_S3_BUCKET and not AWS_DDB_TABLE:
        missing.append("AWS_S3_BUCKET or AWS_DDB_TABLE")
    if missing:
        print(f"[Settings] AWS not configured - missing: {', '.join(missing)}")
    if AWS_REGION and (AWS_S3_BUCKET or AWS_DDB_TABLE):
        if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
            print("[Settings] AWS_REGION and bucket/table found but credentials missing from .env")


def check_redis_connection(host: str = REDIS_HOST, port: int = REDIS_PORT, timeout: float = 1.0) -> bool:
    """Kiểm tra xem Redis server đã chạy chưa."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception:
        return False


def find_redis_server() -> str:
    """Tìm đường dẫn đến redis-server executable."""
    # Common paths for Redis server
    possible_paths = [
        'redis-server',  # Linux/Mac (in PATH)
        'redis-server.exe',  # Windows (in PATH)
        r'C:\Program Files\Redis\redis-server.exe',  # Windows default install
        r'C:\redis\redis-server.exe',  # Windows alternative
        '/usr/local/bin/redis-server',  # Mac Homebrew
        '/usr/bin/redis-server',  # Linux
    ]
    
    # Check if custom path is provided
    if REDIS_SERVER_PATH:
        if os.path.exists(REDIS_SERVER_PATH):
            return REDIS_SERVER_PATH
    
    # Try to find in PATH
    for path in possible_paths:
        try:
            # Check if command exists
            result = subprocess.run(
                ['where' if sys.platform == 'win32' else 'which', path.split(os.sep)[-1]],
                capture_output=True,
                timeout=2
            )
            if result.returncode == 0:
                found_path = result.stdout.decode().strip().split('\n')[0]
                if os.path.exists(found_path):
                    return found_path
        except Exception:
            continue
        
        # Check if absolute path exists
        if os.path.exists(path):
            return path
    
    return None


def start_redis_server() -> bool:
    """Tự động khởi động Redis server nếu chưa chạy."""
    if not AUTO_START_REDIS:
        return False
    
    # Check if Redis is already running
    if check_redis_connection():
        if DEBUG:
            print(f"[Settings] Redis server is already running on {REDIS_HOST}:{REDIS_PORT}")
        return True
    
    # Try to find Redis server executable
    redis_server_path = find_redis_server()
    if not redis_server_path:
        if DEBUG:
            print("[Settings] Redis server executable not found. Please install Redis or set REDIS_SERVER_PATH in .env")
        return False
    
    try:
        if DEBUG:
            print(f"[Settings] Starting Redis server from: {redis_server_path}")
        
        # Start Redis server in background
        if sys.platform == 'win32':
            # Windows: use CREATE_NO_WINDOW flag to hide console window
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startupinfo.wShowWindow = subprocess.SW_HIDE
            
            process = subprocess.Popen(
                [redis_server_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                startupinfo=startupinfo,
                creationflags=subprocess.CREATE_NO_WINDOW
            )
        else:
            # Linux/Mac: run in background
            process = subprocess.Popen(
                [redis_server_path],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True
            )
        
        # Wait a bit for Redis to start
        max_wait = 5  # seconds
        waited = 0
        while waited < max_wait:
            time.sleep(0.5)
            waited += 0.5
            if check_redis_connection():
                if DEBUG:
                    print(f"[Settings] Redis server started successfully on {REDIS_HOST}:{REDIS_PORT}")
                return True
        
        if DEBUG:
            print("[Settings] Redis server start timeout - may still be starting")
        return False
        
    except Exception as e:
        if DEBUG:
            print(f"[Settings] Failed to start Redis server: {e}")
        return False


# Initialize Redis client if configured
redis_client = None
if USE_REDIS_CACHE:
    # Try to start Redis server if not running
    if AUTO_START_REDIS and not check_redis_connection():
        start_redis_server()
        # Wait a bit more for connection to be ready
        time.sleep(1)
    try:
        import redis
        if REDIS_URL:
            # Use connection string
            # Note: ssl parameter should be in URL or use ssl_cert_reqs
            redis_kwargs = {'decode_responses': True}
            if REDIS_SSL:
                # For SSL, use ssl_cert_reqs instead of ssl parameter
                redis_kwargs['ssl_cert_reqs'] = 'required' if REDIS_SSL else None
            redis_client = redis.from_url(REDIS_URL, **redis_kwargs)
        else:
            # Use individual parameters
            redis_kwargs = {
                'host': REDIS_HOST,
                'port': REDIS_PORT,
                'db': REDIS_DB,
                'password': REDIS_PASSWORD if REDIS_PASSWORD else None,
                'decode_responses': True,
                'socket_connect_timeout': 5,
                'socket_timeout': 5
            }
            # Only add SSL parameters if SSL is enabled
            if REDIS_SSL:
                redis_kwargs['ssl_cert_reqs'] = 'required'
            redis_client = redis.Redis(**redis_kwargs)
        # Test connection
        redis_client.ping()
        if DEBUG:
            print(f"[Settings] Redis client initialized successfully (host: {REDIS_HOST}, port: {REDIS_PORT}, db: {REDIS_DB})")
    except ImportError:
        redis_client = None
        if DEBUG:
            print("[Settings] Redis not available - install redis package: pip install redis")
    except Exception as e:
        redis_client = None
        if DEBUG:
            print(f"[Settings] Failed to initialize Redis client: {e}")
elif DEBUG:
    print("[Settings] Redis cache disabled (USE_REDIS_CACHE=false)")


def aws_summary() -> str:
    """Return a concise AWS summary string for logging."""
    return (
        "AWS config => boto3:%s region:%s s3:%s ddb:%s | enabled s3:%s ddb:%s | bedrock:%s model:%s"
        % (
            bool(boto3),
            AWS_REGION or "",
            AWS_S3_BUCKET or "",
            AWS_DDB_TABLE or "",
            bool(s3_client and AWS_S3_BUCKET),
            bool(ddb_client and AWS_DDB_TABLE),
            False,
            "",
        )
    )