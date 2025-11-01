import os
import json
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
load_dotenv()

# Basic server config
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

# AWS Config (optional)
AWS_REGION = os.getenv('AWS_REGION')
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

# Google Gemini Config (optional)
GOOGLE_GEMINI_API_KEY = os.getenv('GOOGLE_GEMINI_API_KEY')
# Google recommended model endpoint
GOOGLE_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


# Ollama local AI (optional, preferred)
OLLAMA_HOST = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3.1')

# Response caching
ENABLE_RESPONSE_CACHE = os.getenv('ENABLE_RESPONSE_CACHE', 'true').lower() == 'true'
RESPONSE_CACHE_TTL = int(os.getenv('RESPONSE_CACHE_TTL', '3600'))  # 1 giờ

# Conversation memory
ENABLE_CONVERSATION_MEMORY = os.getenv('ENABLE_CONVERSATION_MEMORY', 'true').lower() == 'true'
SESSION_TIMEOUT_HOURS = int(os.getenv('SESSION_TIMEOUT_HOURS', '24'))

# Response validation
ENABLE_RESPONSE_VALIDATION = os.getenv('ENABLE_RESPONSE_VALIDATION', 'true').lower() == 'true'

# API retry config
API_RETRY_MAX_ATTEMPTS = int(os.getenv('API_RETRY_MAX_ATTEMPTS', '3'))
API_RETRY_DELAY_SECONDS = float(os.getenv('API_RETRY_DELAY_SECONDS', '1.0'))


# Initialize AWS clients if configured
s3_client = None
ddb_client = None
if boto3 and AWS_REGION and (AWS_S3_BUCKET or AWS_DDB_TABLE):
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
    except Exception:
        s3_client = None
    try:
        ddb_client = boto3.client('dynamodb', region_name=AWS_REGION)
    except Exception:
        ddb_client = None


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


