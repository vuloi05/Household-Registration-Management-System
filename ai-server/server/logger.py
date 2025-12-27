"""
Professional logging module với structured logging, log rotation, và security filters.
"""
import os
import json
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, Optional
from logging import Logger

# Try to import Flask g for correlation ID support
try:
    from flask import has_request_context, g
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    has_request_context = lambda: False
    g = None


class SensitiveDataFilter(logging.Filter):
    """
    Filter để loại bỏ sensitive data (API keys, tokens) khỏi logs.
    """
    
    SENSITIVE_PATTERNS = [
        r'api[_-]?key["\']?\s*[:=]\s*["\']?([^"\'\s]+)',
        r'api[_-]?token["\']?\s*[:=]\s*["\']?([^"\'\s]+)',
        r'authorization["\']?\s*[:=]\s*["\']?(bearer|basic)\s+([^"\'\s]+)',
        r'password["\']?\s*[:=]\s*["\']?([^"\'\s]+)',
        r'secret["\']?\s*[:=]\s*["\']?([^"\'\s]+)',
        r'key["\']?\s*[:=]\s*["\']?([a-zA-Z0-9_-]{20,})',  # Long keys
    ]
    
    def __init__(self):
        super().__init__()
        import re
        self.patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.SENSITIVE_PATTERNS]
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Filter và sanitize log messages."""
        # Sanitize message
        if hasattr(record, 'msg') and record.msg:
            record.msg = self._sanitize(str(record.msg))
        
        # Sanitize args
        if hasattr(record, 'args') and record.args:
            if isinstance(record.args, tuple):
                record.args = tuple(self._sanitize(str(arg)) for arg in record.args)
            else:
                record.args = self._sanitize(str(record.args))
        
        # Sanitize exc_info
        if hasattr(record, 'exc_info') and record.exc_info:
            if record.exc_info[1]:
                record.exc_text = self._sanitize(str(record.exc_info[1]))
        
        return True
    
    def _sanitize(self, text: str) -> str:
        """Sanitize text bằng cách thay thế sensitive data."""
        import re
        sanitized = text
        
        for pattern in self.patterns:
            sanitized = pattern.sub(r'\1[REDACTED]', sanitized)
        
        # Thay thế các API keys dài
        sanitized = re.sub(
            r'([a-zA-Z0-9_-]{32,})',
            lambda m: f"{m.group(1)[:8]}...[REDACTED]" if len(m.group(1)) > 32 else m.group(1),
            sanitized
        )
        
        return sanitized


class CorrelationIDFilter(logging.Filter):
    """
    Filter để thêm correlation ID từ Flask context vào log records.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        """Add correlation ID từ Flask g nếu có."""
        if FLASK_AVAILABLE and has_request_context():
            if hasattr(g, 'correlation_id'):
                record.correlation_id = g.correlation_id
        elif not hasattr(record, 'correlation_id'):
            record.correlation_id = '-'
        return True


class JSONFormatter(logging.Formatter):
    """
    JSON formatter cho structured logging (production).
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record thành JSON."""
        log_data: Dict[str, Any] = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Thêm exception info nếu có
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        # Thêm extra fields nếu có
        if hasattr(record, 'extra_fields'):
            log_data.update(record.extra_fields)
        
        # Thêm request info nếu có (từ Flask)
        correlation_id = getattr(record, 'correlation_id', None)
        if correlation_id and correlation_id != '-':
            log_data['correlation_id'] = correlation_id
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        if hasattr(record, 'session_id'):
            log_data['session_id'] = record.session_id
        if hasattr(record, 'user_ip'):
            log_data['user_ip'] = record.user_ip
        
        return json.dumps(log_data, ensure_ascii=False)


class StandardFormatter(logging.Formatter):
    """
    Standard formatter cho development (human-readable) với correlation ID support.
    """
    
    FORMAT = '%(asctime)s [%(levelname)-8s] [%(correlation_id)s] %(name)s:%(lineno)d - %(message)s'
    DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    
    def __init__(self):
        super().__init__(fmt=self.FORMAT, datefmt=self.DATE_FORMAT)
    
    def format(self, record: logging.LogRecord) -> str:
        """Format với correlation ID nếu có."""
        # Set default correlation_id nếu không có
        if not hasattr(record, 'correlation_id'):
            record.correlation_id = '-'
        return super().format(record)


def setup_logging(
    app_name: str = 'ai-server',
    log_level: Optional[str] = None,
    log_dir: Optional[str] = None,
    use_json: Optional[bool] = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 10
) -> Logger:
    """
    Setup logging với rotation và structured logging.
    
    Args:
        app_name: Tên ứng dụng
        log_level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Thư mục lưu logs (mặc định: logs/)
        use_json: Sử dụng JSON format (mặc định: True trong production)
        max_bytes: Kích thước tối đa mỗi log file
        backup_count: Số lượng backup files
    
    Returns:
        Logger instance
    """
    # Determine log level
    if log_level is None:
        log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    level = getattr(logging, log_level, logging.INFO)
    
    # Determine log directory
    if log_dir is None:
        log_dir = os.getenv('LOG_DIR', 'logs')
    
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    
    # Determine format (JSON for production, standard for development)
    if use_json is None:
        use_json = os.getenv('ENVIRONMENT', 'development').lower() == 'production'
    
    # Create logger
    logger = logging.getLogger(app_name)
    logger.setLevel(level)
    
    # Remove existing handlers để tránh duplicate
    logger.handlers.clear()
    
    # Create filters
    sensitive_filter = SensitiveDataFilter()
    correlation_filter = CorrelationIDFilter()
    
    # Console handler (always use standard format for readability)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_formatter = StandardFormatter()
    console_handler.setFormatter(console_formatter)
    console_handler.addFilter(correlation_filter)
    console_handler.addFilter(sensitive_filter)
    logger.addHandler(console_handler)
    
    # File handler với rotation
    log_file = log_path / f'{app_name}.log'
    file_handler = logging.handlers.RotatingFileHandler(
        filename=str(log_file),
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    file_handler.setLevel(level)
    
    # Sử dụng JSON format cho file nếu use_json=True
    if use_json:
        file_formatter = JSONFormatter()
    else:
        file_formatter = StandardFormatter()
    
    file_handler.setFormatter(file_formatter)
    file_handler.addFilter(correlation_filter)
    file_handler.addFilter(sensitive_filter)
    logger.addHandler(file_handler)
    
    # Error log file riêng (chỉ ERROR và CRITICAL)
    error_log_file = log_path / f'{app_name}-error.log'
    error_handler = logging.handlers.RotatingFileHandler(
        filename=str(error_log_file),
        maxBytes=max_bytes,
        backupCount=backup_count,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    error_handler.addFilter(correlation_filter)
    error_handler.addFilter(sensitive_filter)
    logger.addHandler(error_handler)
    
    # Suppress noisy third-party loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    logging.getLogger('boto3').setLevel(logging.WARNING)
    logging.getLogger('botocore').setLevel(logging.WARNING)
    
    logger.info(f"Logging initialized - Level: {log_level}, Format: {'JSON' if use_json else 'Standard'}, Directory: {log_path}")
    
    return logger


def get_logger(name: Optional[str] = None) -> Logger:
    """
    Get logger instance. Nếu chưa setup, sẽ tự động setup.
    
    Args:
        name: Logger name (mặc định: 'ai-server')
    
    Returns:
        Logger instance
    """
    if name is None:
        name = 'ai-server'
    
    logger = logging.getLogger(name)
    
    # Nếu chưa có handlers, setup logging
    if not logger.handlers:
        setup_logging(app_name=name)
    
    return logger