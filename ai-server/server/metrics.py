"""
Prometheus Metrics Module
Tích hợp Prometheus metrics để monitoring và observability.
"""

from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST # pyright: ignore[reportMissingImports]
from functools import wraps
import time
from typing import Callable, Any

# Request Metrics
chat_requests_total = Counter(
    'chat_requests_total',
    'Total number of chat requests',
    ['method', 'endpoint']
)

chat_errors_total = Counter(
    'chat_errors_total',
    'Total number of chat errors',
    ['error_type', 'status_code']
)

chat_latency = Histogram(
    'chat_latency_seconds',
    'Chat request latency in seconds',
    ['method', 'endpoint'],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0)
)

# Session Metrics
active_sessions = Gauge(
    'active_sessions',
    'Number of active sessions'
)

# Cache Metrics
cache_size = Gauge(
    'cache_size',
    'Current cache size (number of cached items)'
)

cache_hits_total = Counter(
    'cache_hits_total',
    'Total number of cache hits'
)

cache_misses_total = Counter(
    'cache_misses_total',
    'Total number of cache misses'
)

# Knowledge Base Metrics
kb_size = Gauge(
    'kb_size',
    'Knowledge base size (number of Q&A pairs)'
)

kb_hits_total = Counter(
    'kb_hits_total',
    'Total number of knowledge base hits'
)

kb_queries_total = Counter(
    'kb_queries_total',
    'Total number of knowledge base queries'
)

kb_reloads_total = Counter(
    'kb_reloads_total',
    'Total number of knowledge base reloads',
    ['status']  # success, error
)

# AI Provider Metrics
ai_calls_total = Counter(
    'ai_calls_total',
    'Total number of AI provider calls',
    ['provider']  # ollama, gemini, fallback
)

ai_call_latency = Histogram(
    'ai_call_latency_seconds',
    'AI provider call latency in seconds',
    ['provider'],
    buckets=(0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0, 60.0)
)

ai_call_errors_total = Counter(
    'ai_call_errors_total',
    'Total number of AI provider call errors',
    ['provider', 'error_type']
)

# Circuit Breaker Metrics
circuit_breaker_state = Gauge(
    'circuit_breaker_state',
    'Circuit breaker state (0=closed, 1=open, 2=half-open)',
    ['breaker_name']
)

circuit_breaker_failures_total = Counter(
    'circuit_breaker_failures_total',
    'Total number of circuit breaker failures',
    ['breaker_name']
)

circuit_breaker_successes_total = Counter(
    'circuit_breaker_successes_total',
    'Total number of circuit breaker successes',
    ['breaker_name']
)

# Throughput Metrics
requests_in_flight = Gauge(
    'requests_in_flight',
    'Number of requests currently being processed'
)

# Response Validation Metrics
response_validation_total = Counter(
    'response_validation_total',
    'Total number of response validations',
    ['status']  # valid, invalid
)

response_validation_score = Histogram(
    'response_validation_score',
    'Response validation score distribution',
    buckets=(0.0, 0.3, 0.5, 0.7, 0.9, 1.0)
)


def track_request_metrics(endpoint: str, method: str = 'POST'):
    """
    Decorator để track request metrics (latency, errors, throughput).
    
    Usage:
        @track_request_metrics(endpoint='chat', method='POST')
        def chat():
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Track request start
            requests_in_flight.inc()
            chat_requests_total.labels(method=method, endpoint=endpoint).inc()
            start_time = time.time()
            
            try:
                result = func(*args, **kwargs)
                # Track success
                latency = time.time() - start_time
                chat_latency.labels(method=method, endpoint=endpoint).observe(latency)
                return result
            except Exception as e:
                # Track error
                error_type = type(e).__name__
                status_code = getattr(e, 'status_code', 500)
                chat_errors_total.labels(error_type=error_type, status_code=str(status_code)).inc()
                
                latency = time.time() - start_time
                chat_latency.labels(method=method, endpoint=endpoint).observe(latency)
                raise
            finally:
                requests_in_flight.dec()
        
        return wrapper
    return decorator


def update_cache_metrics(size: int, is_hit: bool = None):
    """Update cache metrics."""
    cache_size.set(size)
    if is_hit is True:
        cache_hits_total.inc()
    elif is_hit is False:
        cache_misses_total.inc()


def update_kb_metrics(size: int, is_hit: bool = None, is_query: bool = False):
    """Update knowledge base metrics."""
    kb_size.set(size)
    if is_hit is True:
        kb_hits_total.inc()
    if is_query:
        kb_queries_total.inc()


def update_ai_provider_metrics(provider: str, latency: float = None, error: Exception = None):
    """Update AI provider metrics."""
    ai_calls_total.labels(provider=provider).inc()
    if latency is not None:
        ai_call_latency.labels(provider=provider).observe(latency)
    if error is not None:
        error_type = type(error).__name__
        ai_call_errors_total.labels(provider=provider, error_type=error_type).inc()


def update_circuit_breaker_metrics(breaker_name: str, state: str, is_success: bool = None):
    """
    Update circuit breaker metrics.
    
    Args:
        breaker_name: Name of the circuit breaker
        state: State string ('closed', 'open', 'half-open')
        is_success: None, True (success), or False (failure)
    """
    state_value = {'closed': 0, 'open': 1, 'half-open': 2}.get(state.lower(), -1)
    if state_value >= 0:
        circuit_breaker_state.labels(breaker_name=breaker_name).set(state_value)
    
    if is_success is True:
        circuit_breaker_successes_total.labels(breaker_name=breaker_name).inc()
    elif is_success is False:
        circuit_breaker_failures_total.labels(breaker_name=breaker_name).inc()


def update_session_metrics(active_count: int):
    """Update active sessions count."""
    active_sessions.set(active_count)


def update_validation_metrics(is_valid: bool, score: float = None):
    """Update response validation metrics."""
    status = 'valid' if is_valid else 'invalid'
    response_validation_total.labels(status=status).inc()
    if score is not None:
        response_validation_score.observe(score)


def get_metrics():
    """Get Prometheus metrics as text format."""
    return generate_latest()


def get_metrics_content_type():
    """Get content type for Prometheus metrics."""
    return CONTENT_TYPE_LATEST

