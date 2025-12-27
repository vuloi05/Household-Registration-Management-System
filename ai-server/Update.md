# Kế Hoạch Cải Thiện và Nâng Cấp AI Agent

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết các cải thiện, nâng cấp và bổ sung cần thiết cho hệ thống AI Agent của bạn. Các đề xuất được phân loại theo mức độ ưu tiên và tác động.

---

## 🔴 ƯU TIÊN CAO (High Priority)

### 1. **Cải Thiện Bảo Mật**

#### Vấn đề hiện tại:
- API keys được lưu trong .env (OK) nhưng không có rotation mechanism
- Thiếu input sanitization cho một số trường hợp
- Rate limiting có thể bypass nếu không có Redis

#### Đề xuất:
- **Thêm API key rotation mechanism:**
```python
# Hỗ trợ multiple API keys và tự động rotate
GEMINI_API_KEYS = os.getenv('GEMINI_API_KEYS', '').split(',')
current_key_index = 0

def get_next_api_key():
    global current_key_index
    if GEMINI_API_KEYS:
        key = GEMINI_API_KEYS[current_key_index % len(GEMINI_API_KEYS)]
        current_key_index += 1
        return key
    return None
```

- **Thêm request signing/verification cho internal APIs**
- **Thêm IP whitelist cho admin endpoints**
- **Cải thiện CORS configuration với validation**

**File cần sửa:** `server/settings.py`, `server/app.py`

---

### 2. **Cải Thiện Knowledge Base Matching**

#### Vấn đề hiện tại:
- Matching algorithm đơn giản (chỉ dùng SequenceMatcher và Jaccard)
- Không có semantic similarity
- Không có ranking theo relevance score

#### Đề xuất:
- **Thêm embedding-based similarity (tùy chọn):**
```python
# Sử dụng sentence-transformers cho semantic similarity
from sentence_transformers import SentenceTransformer

# Lazy load model
_similarity_model = None

def get_similarity_model():
    global _similarity_model
    if _similarity_model is None:
        _similarity_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    return _similarity_model

def find_best_local_answer_semantic(q: str, threshold: float = 0.7):
    model = get_similarity_model()
    q_embedding = model.encode([q])[0]
    
    best_score = 0.0
    best_ans = None
    
    with kb_lock:
        for item in qa_knowledge_base:
            kb_embedding = model.encode([item['q']])[0]
            similarity = cosine_similarity([q_embedding], [kb_embedding])[0][0]
            
            if similarity > best_score and similarity >= threshold:
                best_score = similarity
                best_ans = item['a']
    
    return best_ans
```

- **Hybrid approach: kết hợp keyword matching + semantic similarity**
- **Thêm caching cho embeddings**

**File cần sửa:** `server/kb.py`
**Dependencies:** `sentence-transformers>=2.2.0` (optional)

---

## 🟡 ƯU TIÊN TRUNG BÌNH (Medium Priority)

### 3. **Cải Thiện Conversation Memory**

#### Vấn đề hiện tại:
- Memory chỉ lưu trong-memory, mất khi restart
- Không có persistence layer
- Không có memory compression cho long conversations

#### Đề xuất:
- **Thêm Redis backend cho conversation memory:**
```python
# Thêm vào requirements.txt
redis>=5.0.0

# Sửa server/memory.py
import redis

redis_client = None
if os.getenv('REDIS_URL'):
    redis_client = redis.from_url(os.getenv('REDIS_URL'))

def get_conversation_history_redis(session_id: str, max_messages: int = 10):
    if not redis_client:
        return get_conversation_history_memory(session_id, max_messages)
    
    key = f"session:{session_id}:messages"
    messages = redis_client.lrange(key, -max_messages, -1)
    return [json.loads(msg) for msg in messages]
```

- **Thêm memory summarization cho conversations dài**
- **Thêm memory search (tìm kiếm trong conversation history)**

**File cần sửa:** `server/memory.py`

---

### 4. **Cải Thiện Action Inference**

#### Vấn đề hiện tại:
- Logic inference dựa trên keyword matching đơn giản
- Không có confidence score cho actions
- Không có validation cho action parameters

#### Đề xuất:
- **Thêm confidence scoring:**
```python
def infer_actions_with_confidence(message: str, history: list = None) -> list[dict]:
    actions = infer_actions(message, history)
    
    # Tính confidence score cho mỗi action
    for action in actions:
        confidence = calculate_action_confidence(message, action)
        action['confidence'] = confidence
    
    # Filter actions với confidence thấp
    return [a for a in actions if a.get('confidence', 0) >= 0.5]
```

- **Sử dụng LLM để extract entities chính xác hơn (optional)**
- **Thêm action validation và error handling**

**File cần sửa:** `server/actions.py`

---

### 5. **Cải Thiện Response Caching**

#### Vấn đề hiện tại:
- Cache chỉ lưu trong-memory, không persistent
- Cache key không tính đến conversation context đầy đủ
- Không có cache invalidation strategy

#### Đề xuất:
- **Thêm Redis backend cho cache:**
```python
# Sửa server/cache.py
def get_cached_response_redis(message: str, context: str = ""):
    if not redis_client:
        return get_cached_response_memory(message, context)
    
    cache_key = f"response:{_generate_cache_key(message, context)}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    return None
```

- **Thêm cache warming cho popular queries**
- **Thêm cache versioning để invalidate khi KB update**

**File cần sửa:** `server/cache.py`

---

### 6. **Thêm Unit Tests và Integration Tests**

#### Vấn đề hiện tại:
- Không có test coverage
- Khó maintain và refactor code

#### Đề xuất:
- **Tạo test structure:**
```
tests/
  unit/
    test_logic.py
    test_actions.py
    test_kb.py
    test_cache.py
  integration/
    test_chat_endpoint.py
    test_kb_reload.py
  fixtures/
    sample_conversations.json
```

- **Thêm pytest và coverage:**
```python
# requirements-dev.txt
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-mock>=3.12.0
httpx>=0.25.0  # For testing async endpoints
```

- **Target: 70%+ code coverage**

**Files cần tạo:** `tests/` directory với các test files

---

### 7. **Thêm Health Checks Chi Tiết**

#### Vấn đề hiện tại:
- Health check endpoint quá đơn giản
- Không check dependencies (AI providers, backend API, AWS)

#### Đề xuất:
- **Thêm dependency health checks:**
```python
@app.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    checks = {
        'server': {'status': 'healthy', 'timestamp': datetime.now().isoformat()},
        'gemini': check_gemini_health(),
        'ollama': check_ollama_health(),
        'backend_api': check_backend_api_health(),
        'aws_s3': check_aws_s3_health(),
        'aws_ddb': check_aws_ddb_health(),
        'redis': check_redis_health() if redis_client else {'status': 'not_configured'},
    }
    
    overall_status = 'healthy' if all(c.get('status') == 'healthy' for c in checks.values()) else 'degraded'
    
    return jsonify({
        'status': overall_status,
        'checks': checks,
        'timestamp': datetime.now().isoformat()
    }), 200 if overall_status == 'healthy' else 503
```

**File cần sửa:** `server/routes.py`

---

## 🟢 ƯU TIÊN THẤP (Low Priority - Nice to Have)

### 8. **Thêm Multi-Language Support**

#### Đề xuất:
- **Detect language và respond bằng ngôn ngữ tương ứng:**
```python
from langdetect import detect

def detect_language(text: str) -> str:
    try:
        return detect(text)
    except:
        return 'vi'  # Default to Vietnamese

# Sử dụng trong prompts
if detect_language(message) == 'en':
    system_prompt = ENGLISH_SYSTEM_PROMPT
else:
    system_prompt = VIETNAMESE_SYSTEM_PROMPT
```

**Dependencies:** `langdetect>=1.0.9`

---

### 9. **Thêm Sentiment Analysis**

#### Đề xuất:
- **Phân tích sentiment của user message:**
```python
from textblob import TextBlob

def analyze_sentiment(text: str) -> dict:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1 to 1
    subjectivity = blob.sentiment.subjectivity  # 0 to 1
    
    return {
        'polarity': polarity,
        'subjectivity': subjectivity,
        'sentiment': 'positive' if polarity > 0.1 else 'negative' if polarity < -0.1 else 'neutral'
    }
```

**Use case:** Điều chỉnh tone của response dựa trên sentiment

**Dependencies:** `textblob>=0.17.1`

---

### 10. **Thêm Conversation Analytics**

#### Đề xuất:
- **Track metrics về conversations:**
  - Average conversation length
  - Most common questions
  - User satisfaction (nếu có feedback)
  - Response time statistics
  - Error rates by endpoint

- **Thêm endpoint `/analytics` để xem metrics**

**File cần tạo:** `server/analytics.py`

---

### 11. **Thêm A/B Testing Framework**

#### Đề xuất:
- **Test different prompts/models:**
```python
class ABTest:
    def __init__(self, variants: list):
        self.variants = variants
    
    def get_variant(self, session_id: str):
        # Consistent assignment based on session_id
        hash_value = hash(session_id) % len(self.variants)
        return self.variants[hash_value]

# Sử dụng
prompt_test = ABTest([
    {'name': 'baseline', 'prompt': SYSTEM_PROMPT},
    {'name': 'detailed', 'prompt': DETAILED_SYSTEM_PROMPT},
])
```

---

### 12. **Thêm WebSocket Support**

#### Đề xuất:
- **Real-time bidirectional communication:**
```python
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('chat_message')
def handle_chat_message(data):
    message = data.get('message')
    session_id = data.get('session_id')
    
    # Process message
    result = process_message(message, session_id=session_id)
    
    # Emit response
    emit('chat_response', {
        'response': result['response'],
        'actions': result.get('actions', [])
    })
```

**Dependencies:** `flask-socketio>=5.3.0`

---

## 📦 Dependencies Cần Bổ Sung

### Core Dependencies (High Priority):
```txt
# Caching & Memory
redis>=5.0.0

# Testing
pytest>=7.4.0
pytest-cov>=4.1.0
pytest-mock>=3.12.0
httpx>=0.25.0
```

### Optional Dependencies (Medium/Low Priority):
```txt
# Semantic similarity (optional)
sentence-transformers>=2.2.0
torch>=2.0.0  # Required by sentence-transformers

# Language detection
langdetect>=1.0.9

# Sentiment analysis
textblob>=0.17.1

# WebSocket
flask-socketio>=5.3.0
```

---

## 🏗️ Kiến Trúc và Cấu Trúc Code

### 13. **Refactor Code Structure**

#### Đề xuất:
- **Tách business logic ra khỏi routes:**
```
server/
  api/          # API routes
  services/     # Business logic
    ai_service.py
    kb_service.py
    cache_service.py
  models/       # Data models
    conversation.py
    session.py
  utils/        # Utilities
    text_utils.py
    validation_utils.py
```

- **Thêm dependency injection để dễ test:**
```python
class AIService:
    def __init__(self, gemini_client, ollama_client, kb_service):
        self.gemini_client = gemini_client
        self.ollama_client = ollama_client
        self.kb_service = kb_service
```

---

## 🔧 Configuration Improvements

### 14. **Cải Thiện Configuration Management**

#### Đề xuất:
- **Sử dụng Pydantic cho config validation:**
```python
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    port: int = Field(5000, env='PORT')
    debug: bool = Field(False, env='DEBUG')
    gemini_api_key: str = Field(..., env='GOOGLE_GEMINI_API_KEY')
    
    class Config:
        env_file = '.env'
        case_sensitive = False

settings = Settings()
```

**Dependencies:** `pydantic>=2.0.0`

---

## 📊 Performance Optimizations

### 15. **Async/Await Support**

#### Đề xuất:
- **Chuyển sang async/await cho I/O operations:**
```python
import asyncio
import aiohttp

async def call_gemini_async(message: str, context: str = ""):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            return await response.json()
```

**Note:** Cần chuyển Flask sang FastAPI hoặc Quart để support async đầy đủ

---

### 16. **Connection Pooling**

#### Đề xuất:
- **Sử dụng connection pooling cho HTTP requests:**
```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry_strategy = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504],
)
adapter = HTTPAdapter(max_retries=retry_strategy)
session.mount("http://", adapter)
session.mount("https://", adapter)
```

---

## 🚀 Deployment Improvements

### 17. **Docker Compose với Tất Cả Services**

#### Đề xuất:
```yaml
# docker-compose.yml
version: '3.8'
services:
  ai-server:
    build: .
    ports:
      - "5000:5000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

---

## 📝 Documentation Improvements

### 18. **API Documentation với OpenAPI/Swagger**

#### Đề xuất:
- **Thêm Swagger UI:**
```python
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "AI Agent API"}
)

app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
```

**Dependencies:** `flask-swagger-ui>=4.11.0`

---

## 🎯 Roadmap Ưu Tiên

### Phase 1 (1-2 tuần):
1. Cải thiện bảo mật
6. Thêm unit tests cơ bản

### Phase 2 (2-3 tuần):
3. Cải thiện conversation memory với Redis
4. Cải thiện action inference
5. Cải thiện response caching

### Phase 3 (3-4 tuần):
2. Thêm semantic similarity cho KB
13. Refactor code structure
7. Thêm health checks chi tiết
18. API documentation

### Phase 4 (Tùy chọn):
8. Multi-language support
9. Sentiment analysis
12. WebSocket support
11. A/B testing
10. Conversation analytics

---

## 📌 Lưu Ý Quan Trọng

1. **Backward Compatibility**: Đảm bảo các thay đổi không break existing functionality
2. **Gradual Migration**: Implement từng feature một, test kỹ trước khi deploy
3. **Performance Impact**: Monitor performance khi thêm features mới
4. **Cost Consideration**: Một số features (như semantic similarity) có thể tốn tài nguyên
5. **Security First**: Luôn ưu tiên bảo mật khi thêm features mới

---

## 🔗 Tài Liệu Tham Khảo

- [Flask Best Practices](https://flask.palletsprojects.com/en/2.3.x/patterns/)
- [Prometheus Metrics](https://prometheus.io/docs/instrumenting/clientlibs/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Semantic Similarity](https://www.sbert.net/)

---

**Ngày cập nhật:** 2025-01-20
**Phiên bản:** 1.0
**Tác giả:** AI Assistant

