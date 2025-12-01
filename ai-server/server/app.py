from flask import Flask
from flask_cors import CORS


# Create Flask application
app = Flask(__name__)
# QUAN TRỌNG: Cho phép credentials để cookie có thể được gửi/nhận
CORS(app, supports_credentials=True)


