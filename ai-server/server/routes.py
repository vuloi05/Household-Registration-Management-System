import json
from flask import jsonify, request, Response, stream_with_context

from .app import app
from . import settings
from .kb import find_best_local_answer, trigger_reload, get_kb_status
from .logic import process_message, get_logic_metrics
from .actions import infer_actions
from .utils import get_timestamp, persist_chat_event
from .memory import get_or_create_session, add_message, get_conversation_history, clear_session
from .cache import get_cache_stats, clear_cache
try:
    from .auto_learning import analyze_and_learn_from_conversations, get_auto_learning_status
    AUTO_LEARNING_AVAILABLE = True
except Exception:
    AUTO_LEARNING_AVAILABLE = False


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI Agent Server"
    })


@app.route('/health/aws', methods=['GET'])
def health_aws():
    return jsonify({
        "boto3_available": bool(settings.boto3),
        "aws_region": settings.AWS_REGION or "",
        "s3_bucket": settings.AWS_S3_BUCKET or "",
        "ddb_table": settings.AWS_DDB_TABLE or "",
        "s3_enabled": bool(settings.s3_client and settings.AWS_S3_BUCKET),
        "ddb_enabled": bool(settings.ddb_client and settings.AWS_DDB_TABLE)
    })


@app.route('/chat', methods=['POST'])
def chat():
    stream_mode = str(request.args.get('stream', 'false')).lower() == 'true'
    try:
        data = request.json or {}
        user_message = data.get('message', '').strip()
        context = data.get('context', '').strip()
        session_id = data.get('session_id')
        system_info = data.get('system_info')  # Optional: stats, metadata
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # Lấy hoặc tạo session
        if settings.ENABLE_CONVERSATION_MEMORY:
            session_id = get_or_create_session(session_id)
            # Lấy conversation history
            history = get_conversation_history(session_id)
        else:
            history = None

        # Thử suy luận hành động trước để tránh gọi AI không cần thiết
        actions = infer_actions(user_message)

        if actions:
            # Bỏ qua tạo câu trả lời AI, chỉ trả về action
            response_text = ""
            source = 'agent/actions'
            from_cache = False
            validation = {'valid': True, 'score': 1.0}
        else:
            # Process message với các tính năng nâng cao (AI)
            result = process_message(
                user_message,
                context,
                bypass_kb=False,
                session_id=session_id,
                history=history,
                system_info=system_info
            )
            response_text = result['response']
            source = result.get('source', 'unknown')
            from_cache = result.get('from_cache', False)
            validation = result.get('validation', {})

        # Lưu vào conversation memory
        if settings.ENABLE_CONVERSATION_MEMORY and session_id:
            add_message(session_id, 'user', user_message)
            if response_text:
                add_message(session_id, 'assistant', response_text)

        # Persist chat event
        persist_chat_event({
            "timestamp": get_timestamp(),
            "message": user_message,
            "response": response_text,
            "context": context,
            "source": source,
            "session_id": session_id,
            "from_cache": from_cache,
            "validation_score": validation.get('score', 1.0)
        })

        if not stream_mode or len(response_text) < 200:
            return jsonify({
                "success": True,
                "response": response_text,
                "actions": actions,
                "timestamp": get_timestamp(),
                "session_id": session_id,
                "source": source,
                "from_cache": from_cache,
                "validation": validation
            })

        def generate_streamed_response(full_response: str):
            import time
            chunk_len = 24
            for i in range(0, len(full_response), chunk_len):
                chunk = full_response[i:i+chunk_len]
                yield f"data: {chunk}\n\n"
                time.sleep(0.04)
            yield f"data: [END] \n\n"
            if actions:
                yield f"agent_actions: {json.dumps(actions, ensure_ascii=False)}\n\n"
                actions_data = {"actions": actions, "session_id": session_id, "source": source}
                yield f"data: {json.dumps(actions_data, ensure_ascii=False)}\n\n"

        return Response(stream_with_context(generate_streamed_response(response_text)), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/agent/plan', methods=['POST'])
def agent_plan():
    try:
        data = request.json or {}
        user_message = data.get('message', '')
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        actions = infer_actions(user_message)
        return jsonify({
            "success": True,
            "actions": actions,
            "timestamp": get_timestamp()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/qa-feedback', methods=['POST'])
def qa_feedback():
    from .kb import qa_knowledge_base, kb_lock  # local import to avoid circular
    try:
        data = request.json or {}
        question = (data.get('question') or '').strip()
        answer = (data.get('answer') or '').strip()
        feedback_type = (data.get('feedback_type') or 'confirm').strip()
        context = (data.get('context') or '').strip()
        if not question:
            return jsonify({"error": "question is required"}), 400

        new_answer = None

        if feedback_type == 'wrong':
            # Thực hiện quá trình học và cập nhật KB ở background để không chặn phản hồi hiện tại
            import threading
            def background_learn_wrong(q: str, ctx: str):
                from .kb import qa_knowledge_base, kb_lock  # re-import inside thread context
                from .ollama import call_ollama
                from .gemini import call_gemini
                # Loại bỏ câu trả lời cũ nếu có
                with kb_lock:
                    qa_knowledge_base[:] = [it for it in qa_knowledge_base if it['q'].strip().lower() != q.strip().lower()]
                # Sinh câu trả lời mới từ mô hình
                generated = call_ollama(q, ctx) or call_gemini(q, ctx)
                if generated:
                    with kb_lock:
                        qa_knowledge_base.append({'q': q, 'a': generated})
                    persist_chat_event({
                        'timestamp': get_timestamp(),
                        'message': q,
                        'response': generated,
                        'context': ctx,
                        'source': 'auto-corrected',
                    })
                # Trigger reload sau một khoảng ngắn để đồng bộ kho tri thức
                def delayed_reload_wrong():
                    import time
                    time.sleep(2)
                    trigger_reload()
                threading.Thread(target=delayed_reload_wrong, daemon=True).start()

            threading.Thread(target=background_learn_wrong, args=(question, context), daemon=True).start()
        elif feedback_type in ('confirm', 'correct'):
            if not answer:
                return jsonify({"error": "answer is required for confirm/correct"}), 400
            new_item = {'q': question, 'a': answer}
            with kb_lock:
                found = False
                for idx, it in enumerate(qa_knowledge_base):
                    if it['q'].strip().lower() == question.strip().lower():
                        qa_knowledge_base[idx] = new_item
                        found = True
                        break
                if not found:
                    qa_knowledge_base.append(new_item)
            persist_chat_event({
                'timestamp': get_timestamp(),
                'message': question,
                'response': answer,
                'context': context,
                'source': f'user-feedback/{feedback_type}',
            })
            # Tự động trigger reload sau khi có feedback để cập nhật từ AWS
            # Sử dụng background thread để không block response
            import threading
            def delayed_reload():
                import time
                time.sleep(2)  # Đợi 2 giây để AWS có thời gian lưu dữ liệu
                trigger_reload()
            threading.Thread(target=delayed_reload, daemon=True).start()
        else:
            return jsonify({"error": "invalid feedback_type"}), 400

        print(f"[KB][feedback] {feedback_type} - {question[:30]} => {(new_answer or answer)[:40] if (new_answer or answer) else ''}")
        return jsonify({"success": True, "new_answer": new_answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/kb/reload', methods=['POST'])
def kb_reload():
    """Endpoint để trigger reload knowledge base thủ công."""
    try:
        result = trigger_reload()
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Knowledge base reloaded successfully",
                "items_count": result['items_count'],
                "previous_count": result['previous_count'],
                "timestamp": result['timestamp']
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error'),
                "items_count": result['items_count']
            }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
        return jsonify({"error": str(e)}), 500


@app.route('/kb/auto-learn', methods=['POST'])
def kb_auto_learn():
    """Endpoint để trigger tự học chủ động ngay lập tức."""
    if not AUTO_LEARNING_AVAILABLE:
        return jsonify({
            "success": False,
            "error": "Auto-learning module not available"
        }), 503
    
    try:
        result = analyze_and_learn_from_conversations()
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Auto-learning completed successfully",
                "analyzed_count": result['analyzed_count'],
                "learned_count": result['learned_count'],
                "total_score": result['total_score'],
                "timestamp": result['timestamp']
            })
        else:
            return jsonify({
                "success": False,
                "error": result.get('error', 'Unknown error'),
                "analyzed_count": result['analyzed_count'],
                "learned_count": result['learned_count']
            }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/kb/auto-learn/status', methods=['GET'])
def kb_auto_learn_status():
    """Endpoint để xem trạng thái auto-learning."""
    if not AUTO_LEARNING_AVAILABLE:
        return jsonify({
            "success": False,
            "error": "Auto-learning module not available"
        }), 503
    
    try:
        status = get_auto_learning_status()
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/session/<session_id>', methods=['DELETE'])
def clear_session_route(session_id: str):
    """Xóa conversation history của session."""
    try:
        clear_session(session_id)
        return jsonify({
            "success": True,
            "message": f"Session {session_id} cleared"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/session/<session_id>/history', methods=['GET'])
def get_session_history(session_id: str):
    """Lấy conversation history của session."""
    try:
        max_messages = int(request.args.get('max', 10))
        history = get_conversation_history(session_id, max_messages)
        return jsonify({
            "success": True,
            "session_id": session_id,
            "history": history,
            "count": len(history)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/cache/stats', methods=['GET'])
def cache_stats():
    """Xem thống kê cache."""
    try:
        stats = get_cache_stats()
        return jsonify({
            "success": True,
            "stats": stats
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/cache/clear', methods=['POST'])
def cache_clear():
    """Xóa toàn bộ cache."""
    try:
        count = clear_cache()
        return jsonify({
            "success": True,
            "message": f"Cleared {count} cached items"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


