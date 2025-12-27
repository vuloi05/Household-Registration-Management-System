"""
Auxiliary routes for AI Agent Server.
Contains knowledge base, session management, cache, and error handler endpoints.
"""
import json
import os
import traceback
from flask import jsonify, request

# Import app, logger, limiter from app module
from .app import app, limiter, logger
from . import settings
from .kb import trigger_reload, get_kb_status
from .logic import get_logic_metrics
from .utils import get_timestamp
from .memory import get_conversation_history, clear_session
from .metrics import update_cache_metrics
from .cache import get_cache_stats, clear_cache
from .exceptions import AIServerException, ValidationError

# Helper function for rate limiting
def apply_rate_limit(limit_string: str):
    """
    Helper function to apply rate limiting decorator safely.
    Returns a no-op decorator if limiter is not available.
    """
    if limiter:
        return limiter.limit(limit_string)
    return lambda f: f  # No-op decorator if limiter is not available

# Try to import auto_learning module
try:
    from .auto_learning import analyze_and_learn_from_conversations, get_auto_learning_status
    AUTO_LEARNING_AVAILABLE = True
except Exception:
    AUTO_LEARNING_AVAILABLE = False


@app.route('/kb/reload', methods=['POST'])
@apply_rate_limit(settings.RATE_LIMIT_KB_RELOAD)
def kb_reload():
    """Endpoint để trigger reload knowledge base thủ công."""
    try:
        logger.info("KB reload requested")
        result = trigger_reload()
        if result['success']:
            logger.info(
                f"KB reload successful: {result['items_count']} items",
                extra={'items_count': result['items_count'], 'previous_count': result.get('previous_count')}
            )
            return jsonify({
                "success": True,
                "message": "Knowledge base reloaded successfully",
                "items_count": result['items_count'],
                "previous_count": result['previous_count'],
                "timestamp": result['timestamp']
            })
        else:
            logger.error(
                f"KB reload failed: {result.get('error', 'Unknown error')}",
                extra={'items_count': result.get('items_count', 0)}
            )
            from .exceptions import KnowledgeBaseError
            raise KnowledgeBaseError(
                result.get('error', 'Unknown error'),
                details={'items_count': result.get('items_count', 0)}
            )
    except AIServerException:
        raise
    except Exception as e:
        logger.error(f"Error in kb_reload: {str(e)}", exc_info=True)
        raise


@app.route('/kb/status', methods=['GET'])
def kb_status():
    """Endpoint để xem trạng thái knowledge base."""
    try:
        status = get_kb_status()
        # Thêm thông tin auto-learning nếu có
        if AUTO_LEARNING_AVAILABLE:
            auto_learning_status = get_auto_learning_status()
            status['auto_learning'] = auto_learning_status
        # Thêm logic metrics
        status['logic_metrics'] = get_logic_metrics()
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        logger.error(f"Error in kb_status: {str(e)}", exc_info=True)
        raise


@app.route('/kb/auto-learn', methods=['POST'])
@apply_rate_limit(settings.RATE_LIMIT_AUTO_LEARN)
def kb_auto_learn():
    """Endpoint để trigger tự học chủ động ngay lập tức."""
    if not AUTO_LEARNING_AVAILABLE:
        from .exceptions import ConfigurationError
        raise ConfigurationError("Auto-learning module not available", config_key='AUTO_LEARNING_AVAILABLE')
    
    try:
        logger.info("Auto-learn requested")
        result = analyze_and_learn_from_conversations()
        if result['success']:
            logger.info(
                f"Auto-learn completed: {result['learned_count']} items learned from {result['analyzed_count']} analyzed",
                extra={
                    'analyzed_count': result['analyzed_count'],
                    'learned_count': result['learned_count'],
                    'total_score': result.get('total_score')
                }
            )
            return jsonify({
                "success": True,
                "message": "Auto-learning completed successfully",
                "analyzed_count": result['analyzed_count'],
                "learned_count": result['learned_count'],
                "total_score": result['total_score'],
                "timestamp": result['timestamp']
            })
        else:
            logger.warning(
                f"Auto-learn failed: {result.get('error', 'Unknown error')}",
                extra={
                    'analyzed_count': result.get('analyzed_count', 0),
                    'learned_count': result.get('learned_count', 0)
                }
            )
            from .exceptions import KnowledgeBaseError
            raise KnowledgeBaseError(
                result.get('error', 'Unknown error'),
                details={
                    'analyzed_count': result.get('analyzed_count', 0),
                    'learned_count': result.get('learned_count', 0)
                }
            )
    except AIServerException:
        raise
    except Exception as e:
        logger.error(f"Error in kb_auto_learn: {str(e)}", exc_info=True)
        raise


@app.route('/kb/auto-learn/status', methods=['GET'])
def kb_auto_learn_status():
    """Endpoint để xem trạng thái auto-learning."""
    if not AUTO_LEARNING_AVAILABLE:
        from .exceptions import ConfigurationError
        raise ConfigurationError("Auto-learning module not available", config_key='AUTO_LEARNING_AVAILABLE')
    
    try:
        status = get_auto_learning_status()
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        logger.error(f"Error in kb_auto_learn_status: {str(e)}", exc_info=True)
        raise


@app.route('/session/<session_id>', methods=['DELETE'])
def clear_session_route(session_id: str):
    """Xóa conversation history của session."""
    try:
        if not session_id or len(session_id) > 200:
            raise ValidationError("Invalid session_id", field='session_id')
        
        logger.info(f"Clearing session: {session_id}")
        clear_session(session_id)
        return jsonify({
            "success": True,
            "message": f"Session {session_id} cleared"
        })
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error in clear_session_route: {str(e)}", exc_info=True, extra={'session_id': session_id})
        raise


@app.route('/session/<session_id>/history', methods=['GET'])
def get_session_history(session_id: str):
    """Lấy conversation history của session."""
    try:
        if not session_id or len(session_id) > 200:
            raise ValidationError("Invalid session_id", field='session_id')
        
        try:
            max_messages = int(request.args.get('max', 10))
            if max_messages < 1 or max_messages > 100:
                raise ValidationError("max must be between 1 and 100", field='max')
        except ValueError:
            raise ValidationError("max must be a valid integer", field='max')
        
        logger.debug(f"Getting history for session: {session_id}, max: {max_messages}")
        history = get_conversation_history(session_id, max_messages)
        return jsonify({
            "success": True,
            "session_id": session_id,
            "history": history,
            "count": len(history)
        })
    except ValidationError:
        raise
    except Exception as e:
        logger.error(f"Error in get_session_history: {str(e)}", exc_info=True, extra={'session_id': session_id})
        raise


@app.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Xem thống kê cache."""
    try:
        stats = get_cache_stats()
        # Update cache metrics
        try:
            update_cache_metrics(size=stats.get('total_items', 0), is_hit=None)
        except (ImportError, AttributeError):
            pass
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        logger.error(f"Error in cache_stats: {str(e)}", exc_info=True)
        raise


@app.route('/cache/clear', methods=['POST'])
def cache_clear():
    """Xóa toàn bộ cache."""
    try:
        logger.info("Cache clear requested")
        count = clear_cache()
        logger.info(f"Cache cleared: {count} items")
        return jsonify({
            "success": True,
            "message": f"Cleared {count} cached items"
        })
    except Exception as e:
        logger.error(f"Error in cache_clear: {str(e)}", exc_info=True)
        raise


# Error handlers
@app.errorhandler(AIServerException)
def handle_ai_server_exception(error: AIServerException):
    """Handle custom AIServerException."""
    logger.warning(
        f"AIServerException: {error.error_code} - {error.message}",
        extra={
            'error_code': error.error_code,
            'status_code': error.status_code,
            'details': error.details
        }
    )
    return jsonify(error.to_dict()), error.status_code


@app.errorhandler(400)
def bad_request_handler(error):
    """Handle 400 Bad Request errors."""
    logger.warning(f"Bad Request: {str(error)}", exc_info=True)
    return jsonify({
        "error": "Bad Request",
        "message": "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu gửi lên.",
        "error_code": "BAD_REQUEST",
        "status_code": 400
    }), 400


@app.errorhandler(401)
def unauthorized_handler(error):
    """Handle 401 Unauthorized errors."""
    logger.warning(f"Unauthorized: {str(error)}")
    return jsonify({
        "error": "Unauthorized",
        "message": "Bạn cần đăng nhập để thực hiện thao tác này.",
        "error_code": "UNAUTHORIZED",
        "status_code": 401
    }), 401


@app.errorhandler(403)
def forbidden_handler(error):
    """Handle 403 Forbidden errors."""
    logger.warning(f"Forbidden: {str(error)}")
    return jsonify({
        "error": "Forbidden",
        "message": "Bạn không có quyền thực hiện thao tác này.",
        "error_code": "FORBIDDEN",
        "status_code": 403
    }), 403


@app.errorhandler(404)
def not_found_handler(error):
    """Handle 404 Not Found errors."""
    logger.info(f"Not Found: {str(error)}")
    return jsonify({
        "error": "Not Found",
        "message": "Tài nguyên không tìm thấy.",
        "error_code": "NOT_FOUND",
        "status_code": 404
    }), 404


@app.errorhandler(429)
def ratelimit_handler(e):
    """Custom error handler for rate limit exceeded."""
    logger.warning(
        f"Rate limit exceeded: {getattr(e, 'description', 'Unknown')}",
        extra={'retry_after': getattr(e, "retry_after", None)}
    )
    return jsonify({
        "error": "Rate limit exceeded",
        "message": "Bạn đã gửi quá nhiều requests. Vui lòng thử lại sau.",
        "error_code": "RATE_LIMIT_EXCEEDED",
        "retry_after": getattr(e, "retry_after", None),
        "status_code": 429
    }), 429


@app.errorhandler(500)
def internal_error_handler(error):
    """Handle 500 Internal Server Error."""
    # Log full traceback
    logger.error(
        f"Internal Server Error: {str(error)}",
        exc_info=True,
        extra={
            'request_path': request.path if request else None,
            'request_method': request.method if request else None,
            'user_ip': request.remote_addr if request else None
        }
    )
    
    # Không expose stack trace trong production
    is_production = os.getenv('ENVIRONMENT', 'development').lower() == 'production'
    
    response = {
        "error": "Internal Server Error",
        "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
        "error_code": "INTERNAL_SERVER_ERROR",
        "status_code": 500
    }
    
    # Chỉ hiển thị chi tiết lỗi trong development
    if not is_production and settings.DEBUG:
        response["details"] = str(error)
        response["traceback"] = traceback.format_exc()
    
    return jsonify(response), 500


@app.errorhandler(Exception)
def generic_exception_handler(error: Exception):
    """Handle all unhandled exceptions."""
    # Nếu là AIServerException, đã được xử lý ở handler trên
    if isinstance(error, AIServerException):
        return handle_ai_server_exception(error)
    
    # Log full traceback
    logger.error(
        f"Unhandled exception: {type(error).__name__}: {str(error)}",
        exc_info=True,
        extra={
            'exception_type': type(error).__name__,
            'request_path': request.path if request else None,
            'request_method': request.method if request else None,
            'user_ip': request.remote_addr if request else None
        }
    )
    
    # Không expose stack trace trong production
    is_production = os.getenv('ENVIRONMENT', 'development').lower() == 'production'
    
    response = {
        "error": "Internal Server Error",
        "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
        "error_code": "INTERNAL_SERVER_ERROR",
        "status_code": 500
    }
    
    # Chỉ hiển thị chi tiết lỗi trong development
    if not is_production and settings.DEBUG:
        response["details"] = str(error)
        response["exception_type"] = type(error).__name__
    
    return jsonify(response), 500

