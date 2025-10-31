import json
from flask import jsonify, request, Response, stream_with_context

from .app import app
from . import settings
from .kb import find_best_local_answer
from .logic import process_message
from .actions import infer_actions
from .utils import get_timestamp, persist_chat_event


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
        data = request.json
        user_message = data.get('message', '')
        context = data.get('context', '')
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        kb_ans = find_best_local_answer(user_message)
        if kb_ans:
            persist_chat_event({
                "timestamp": get_timestamp(),
                "message": user_message,
                "response": kb_ans,
                "context": context,
                "source": "local-ai-server",
            })
            return jsonify({
                "success": True,
                "response": kb_ans,
                "actions": infer_actions(user_message),
                "timestamp": get_timestamp()
            })

        response_text = process_message(user_message, context)
        actions = infer_actions(user_message)

        if not stream_mode or len(response_text) < 200 or ('GOOGLE_GEMINI_API_KEY' not in settings.os.environ):
            persist_chat_event({
                "timestamp": get_timestamp(),
                "message": user_message,
                "response": response_text,
                "context": context,
                "source": "local-ai-server",
            })
            return jsonify({
                "success": True,
                "response": response_text,
                "actions": actions,
                "timestamp": get_timestamp()
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
                yield f"data: {json.dumps({"actions": actions}, ensure_ascii=False)}\n\n"

        persist_chat_event({
            "timestamp": get_timestamp(),
            "message": user_message,
            "response": response_text,
            "context": context,
            "source": "local-ai-server",
        })
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
            with kb_lock:
                qa_knowledge_base[:] = [it for it in qa_knowledge_base if it['q'].strip().lower() != question.strip().lower()]
            from .gemini import call_gemini
            generated = call_gemini(question, context)
            if generated:
                new_answer = generated
                with kb_lock:
                    qa_knowledge_base.append({'q': question, 'a': new_answer})
                persist_chat_event({
                    'timestamp': get_timestamp(),
                    'message': question,
                    'response': new_answer,
                    'context': context,
                    'source': 'auto-corrected',
                })
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
        else:
            return jsonify({"error": "invalid feedback_type"}), 400

        print(f"[KB][feedback] {feedback_type} - {question[:30]} => {(new_answer or answer)[:40] if (new_answer or answer) else ''}")
        return jsonify({"success": True, "new_answer": new_answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


