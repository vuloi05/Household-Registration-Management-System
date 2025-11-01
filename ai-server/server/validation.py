"""
Response Validation - Kiểm tra chất lượng response trước khi trả về
"""

import re
from typing import Dict, Optional


def validate_response(response: str, original_message: str = "") -> Dict:
    """
    Validate response quality.
    
    Returns:
        {
            'valid': bool,
            'score': float (0.0-1.0),
            'issues': List[str],
            'suggestions': List[str]
        }
    """
    issues = []
    suggestions = []
    score = 1.0
    
    if not response or len(response.strip()) == 0:
        return {
            'valid': False,
            'score': 0.0,
            'issues': ['Response rỗng'],
            'suggestions': []
        }
    
    # Kiểm tra độ dài
    if len(response) < 10:
        issues.append('Response quá ngắn (< 10 ký tự)')
        score -= 0.3
    elif len(response) > 5000:
        issues.append('Response quá dài (> 5000 ký tự)')
        score -= 0.2
        suggestions.append('Cân nhắc rút gọn response')
    
    # Kiểm tra có chứa lỗi API rõ ràng
    error_patterns = [
        r'API.*error',
        r'API.*failed',
        r'request.*failed',
        r'Error.*\d{3}',
        r'Exception',
        r'Traceback',
    ]
    for pattern in error_patterns:
        if re.search(pattern, response, re.IGNORECASE):
            issues.append(f'Response có vẻ chứa thông báo lỗi ({pattern})')
            score -= 0.5
    
    # Kiểm tra response có trả lời được câu hỏi (nếu có original_message)
    if original_message:
        # Kiểm tra response có quá giống với question (có thể là echo)
        response_lower = response.lower()
        question_lower = original_message.lower()
        question_words = set(question_lower.split())
        response_words = set(response_lower.split())
        
        if len(question_words) > 3:
            overlap = len(question_words & response_words) / len(question_words)
            if overlap > 0.8 and len(response_words) < len(question_words) * 1.5:
                issues.append('Response có vẻ chỉ lặp lại câu hỏi')
                score -= 0.3
    
    # Kiểm tra có chứa ký tự lạ hoặc encoding issues
    try:
        response.encode('utf-8')
    except UnicodeEncodeError:
        issues.append('Response có vấn đề về encoding')
        score -= 0.4
    
    # Kiểm tra có cấu trúc hợp lý (có dấu chấm, xuống dòng, hoặc danh sách)
    has_structure = bool(re.search(r'[\.\!\?]|\\n|- |\d+\.', response))
    if not has_structure and len(response) > 100:
        suggestions.append('Response nên có cấu trúc rõ ràng hơn (dấu chấm, xuống dòng)')
    
    score = max(0.0, min(1.0, score))
    
    return {
        'valid': score >= 0.5 and len(issues) == 0,
        'score': score,
        'issues': issues,
        'suggestions': suggestions
    }


def sanitize_response(response: str) -> str:
    """
    Làm sạch response (loại bỏ các phần không mong muốn).
    
    Returns:
        Sanitized response
    """
    if not response:
        return ""
    
    # Loại bỏ các dòng traceback nếu có
    lines = response.split('\n')
    cleaned_lines = []
    in_traceback = False
    
    for line in lines:
        if 'traceback' in line.lower() or 'error' in line.lower():
            in_traceback = True
            continue
        if in_traceback and (line.strip().startswith('File ') or line.strip().startswith('at ')):
            continue
        if in_traceback and not line.strip().startswith(('File ', 'at ')):
            in_traceback = False
        
        if not in_traceback:
            cleaned_lines.append(line)
    
    result = '\n'.join(cleaned_lines).strip()
    
    # Loại bỏ các error messages rõ ràng
    error_prefixes = [
        'API request failed:',
        'Gemini API call error:',
        'Error:',
        'Exception:',
    ]
    
    for prefix in error_prefixes:
        if result.startswith(prefix):
            # Thử extract phần sau error message
            parts = result.split('\n', 1)
            if len(parts) > 1:
                result = parts[1].strip()
            else:
                result = ""
            break
    
    return result

