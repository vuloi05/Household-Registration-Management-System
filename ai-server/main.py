"""
AI Agent Server - Household Registration Management System
Entry point. Keep running with: python main.py
"""

from server import app  # ensures routes are registered via package import
from server import settings


if __name__ == '__main__':
    print(f"Starting AI Agent Server on port {settings.PORT}")
    print(f"Debug mode: {settings.DEBUG}")
    print(settings.aws_summary())
    app.run(host='0.0.0.0', port=settings.PORT, debug=settings.DEBUG)

