"""
Script để kiểm tra xem file .env có được load đúng không
Chạy: python check-env.py
"""
import os
from pathlib import Path
from dotenv import load_dotenv

print("=" * 60)
print("Kiểm tra file .env")
print("=" * 60)

# Kiểm tra các vị trí có thể có file .env
env_paths = [
    Path(__file__).parent / '.env',  # ai-server/.env
    Path.cwd() / '.env',  # Current working directory
]

print("\n1. Kiểm tra file .env có tồn tại không:")
env_found = False
for env_path in env_paths:
    exists = env_path.exists()
    print(f"   {env_path}: {'✓ TỒN TẠI' if exists else '✗ KHÔNG TỒN TẠI'}")
    if exists:
        env_found = True
        print(f"      Kích thước: {env_path.stat().st_size} bytes")

if not env_found:
    print("\n⚠ CẢNH BÁO: Không tìm thấy file .env ở bất kỳ vị trí nào!")
    print("   Hãy tạo file .env trong thư mục ai-server/")
    exit(1)

# Load .env
print("\n2. Load file .env:")
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
    print(f"   ✓ Đã load từ: {env_path}")
else:
    load_dotenv()
    print("   ✓ Đã load bằng phương thức mặc định")

# Kiểm tra các biến AWS
print("\n3. Kiểm tra các biến AWS trong .env:")
aws_vars = {
    'AWS_REGION': os.getenv('AWS_REGION'),
    'AWS_ACCESS_KEY_ID': os.getenv('AWS_ACCESS_KEY_ID'),
    'AWS_SECRET_ACCESS_KEY': os.getenv('AWS_SECRET_ACCESS_KEY'),
    'AWS_S3_BUCKET': os.getenv('AWS_S3_BUCKET'),
    'AWS_DDB_TABLE': os.getenv('AWS_DDB_TABLE'),
}

all_present = True
for var_name, var_value in aws_vars.items():
    if var_value:
        # Ẩn giá trị nhạy cảm
        if 'SECRET' in var_name or 'KEY' in var_name:
            display_value = f"{var_value[:4]}...{var_value[-4:]}" if len(var_value) > 8 else "***"
        else:
            display_value = var_value
        print(f"   ✓ {var_name}: {display_value}")
    else:
        print(f"   ✗ {var_name}: KHÔNG CÓ")
        all_present = False

print("\n" + "=" * 60)
if all_present:
    print("✓ TẤT CẢ các biến AWS đã được cấu hình!")
else:
    print("⚠ MỘT SỐ biến AWS chưa được cấu hình!")
    print("   Hãy kiểm tra lại file .env")
print("=" * 60)

