"""
AI Agent Server - Household Registration Management System
Backend server để xử lý các yêu cầu AI chatbot
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Configuration
PORT = int(os.getenv('PORT', 5000))
DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "AI Agent Server"})


@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint để xử lý tin nhắn từ chatbot
    POST /chat
    Body: {"message": "user message", "context": "optional context"}
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        context = data.get('context', '')
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Process the message with AI
        response = process_message(user_message, context)
        
        return jsonify({
            "success": True,
            "response": response,
            "timestamp": get_timestamp()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def process_message(message: str, context: str = "") -> str:
    """
    Xử lý tin nhắn và tạo phản hồi
    
    Args:
        message: Tin nhắn từ người dùng
        context: Context bổ sung (optional)
    
    Returns:
        Phản hồi từ AI
    """
    # Tạm thời sử dụng logic rule-based
    # Có thể tích hợp OpenAI API, LangChain, hoặc các model AI khác
    
    message_lower = message.lower()
    
    # Hệ thống chào hỏi
    if any(word in message_lower for word in ['xin chào', 'hello', 'hi', 'chào']):
        return "Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống."
    
    # Trợ giúp về hộ khẩu
    elif any(word in message_lower for word in ['hộ khẩu', 'ho khau', 'household']):
        return """Để quản lý hộ khẩu, bạn có thể:
        
        1. **Xem danh sách hộ khẩu**: Vào trang "Quản lý Hộ khẩu" để xem tất cả hộ khẩu
        2. **Tạo hộ khẩu mới**: Click nút "Thêm hộ khẩu" và điền thông tin
        3. **Chỉnh sửa hộ khẩu**: Click icon "Sửa" trên từng hộ khẩu
        4. **Xem chi tiết**: Click vào mã hộ khẩu để xem thông tin chi tiết
        
        Mỗi hộ khẩu bao gồm: Mã hộ khẩu, Địa chỉ, Chủ hộ và các thành viên trong hộ."""
    
    # Trợ giúp về nhân khẩu
    elif any(word in message_lower for word in ['nhân khẩu', 'nhan khau', 'person', 'thành viên']):
        return """Để quản lý nhân khẩu:
        
        1. **Xem danh sách**: Vào "Quản lý Nhân khẩu" để xem tất cả nhân khẩu
        2. **Thêm nhân khẩu**: Có thể thêm từ trang "Nhân khẩu" hoặc từ chi tiết hộ khẩu
        3. **Tìm kiếm**: Sử dụng thanh tìm kiếm theo tên, CCCD, nghề nghiệp
        4. **Lọc**: Lọc theo độ tuổi, giới tính, địa chỉ
        5. **Xuất dữ liệu**: Export Excel hoặc PDF
        
        Mỗi nhân khẩu cần thông tin: Họ tên, Ngày sinh, CCCD, Quê quán, Nghề nghiệp."""
    
    # Trợ giúp về thu phí
    elif any(word in message_lower for word in ['thu phí', 'khoản thu', 'khoan thu', 'payment', 'fee']):
        return """Quản lý thu phí bao gồm:
        
        1. **Khoản thu bắt buộc**: Phí vệ sinh, phí an ninh,...
        2. **Khoản thu đóng góp**: Ủng hộ, từ thiện,...
        
        Các chức năng:
        - Tạo khoản thu mới
        - Xem chi tiết khoản thu và danh sách đã nộp
        - Xem thống kê: Số hộ đã nộp, Tổng số tiền
        - Ghi nhận nộp tiền cho hộ khẩu"""
    
    # Trợ giúp về thống kê
    elif any(word in message_lower for word in ['thống kê', 'thong ke', 'dashboard', 'statistics']):
        return """Bảng thống kê cung cấp:
        
        1. **Tổng quan**: Số hộ khẩu, số nhân khẩu
        2. **Phân bố độ tuổi**: Mầm non, Tiểu học, THCS, THPT, Lao động, Nghỉ hưu
        3. **Biểu đồ**: Visualize dữ liệu độ tuổi
        
        Vào trang "Dashboard" để xem tất cả thống kê."""
    
    # Trợ giúp về đăng nhập
    elif any(word in message_lower for word in ['đăng nhập', 'dang nhap', 'login']):
        return """Để đăng nhập hệ thống:
        
        1. Nhập Username (ví dụ: admin, ketoan)
        2. Nhập Password (mật khẩu đã được cấp)
        3. Click "Đăng nhập"
        
        Có 2 loại tài khoản:
        - **ADMIN**: Toàn quyền quản lý
        - **ACCOUNTANT**: Quản lý khoản thu và thu phí"""
    
    # Trợ giúp chung
    elif any(word in message_lower for word in ['giúp', 'help', 'hướng dẫn', 'huong dan']):
        return """Tôi có thể giúp bạn với:
        
        - Quản lý Hộ khẩu
        - Quản lý Nhân khẩu
        - Thu phí và Khoản thu
        - Xem Thống kê
        - Hướng dẫn Đăng nhập
        
        Hãy hỏi tôi về bất kỳ chức năng nào!"""
    
    # Phản hồi mặc định
    else:
        return f"""Cảm ơn bạn đã liên hệ! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu.
        
Hệ thống này giúp bạn:
- Quản lý hộ khẩu và nhân khẩu
- Quản lý các khoản thu phí
- Xem thống kê và báo cáo

Bạn có thể hỏi tôi về bất kỳ tính năng nào của hệ thống. Hoặc gõ "giúp" để xem danh sách chức năng."""
    
    # Có thể mở rộng với AI models sau:
    # - OpenAI GPT API
    # - LangChain với RAG
    # - Local LLM (Ollama, LM Studio)


def get_timestamp():
    """Get current timestamp"""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


if __name__ == '__main__':
    print(f"🚀 Starting AI Agent Server on port {PORT}")
    print(f"Debug mode: {DEBUG}")
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)

