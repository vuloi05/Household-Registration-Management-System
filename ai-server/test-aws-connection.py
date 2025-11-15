"""
Script test để kiểm tra kết nối AWS và khả năng lưu dữ liệu
"""
import boto3
import os
from dotenv import load_dotenv
from datetime import datetime
import json

load_dotenv()

AWS_REGION = os.getenv('AWS_REGION')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET')
AWS_DDB_TABLE = os.getenv('AWS_DDB_TABLE')

print(f"AWS Region: {AWS_REGION}")
print(f"S3 Bucket: {AWS_S3_BUCKET}")
print(f"DynamoDB Table: {AWS_DDB_TABLE}")
print(f"AWS Credentials: {'Configured' if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY else 'Using default chain'}")
print("-" * 50)

# Build credentials dict if provided
aws_credentials = {}
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    aws_credentials = {
        'aws_access_key_id': AWS_ACCESS_KEY_ID,
        'aws_secret_access_key': AWS_SECRET_ACCESS_KEY
    }

# Test S3
if AWS_S3_BUCKET:
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION, **aws_credentials)
        # Test list bucket (read permission)
        s3_client.head_bucket(Bucket=AWS_S3_BUCKET)
        print("[OK] S3 Connection: OK")
        
        # Test write (put a test file)
        test_key = f"test-connection/{datetime.now().strftime('%Y%m%d%H%M%S')}.txt"
        s3_client.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=test_key,
            Body=b"Test connection from AI server",
            ContentType='text/plain'
        )
        print(f"[OK] S3 Write Test: OK (test file: {test_key})")
        
        # Clean up test file
        try:
            s3_client.delete_object(Bucket=AWS_S3_BUCKET, Key=test_key)
            print("[OK] S3 Test Cleanup: OK")
        except:
            pass
            
    except Exception as e:
        print(f"[ERROR] S3 Error: {str(e)}")

# Test DynamoDB
if AWS_DDB_TABLE:
    try:
        ddb_client = boto3.client('dynamodb', region_name=AWS_REGION, **aws_credentials)
        # Test describe table (read permission)
        ddb_client.describe_table(TableName=AWS_DDB_TABLE)
        print("[OK] DynamoDB Connection: OK")
        
        # Test write
        test_pk = f"test#{datetime.now().strftime('%Y%m%d')}"
        test_sk = datetime.now().strftime('%Y%m%d%H%M%S%f')
        ddb_client.put_item(
            TableName=AWS_DDB_TABLE,
            Item={
                'pk': {'S': test_pk},
                'sk': {'S': test_sk},
                'timestamp': {'S': datetime.now().strftime('%Y-%m-%d %H:%M:%S')},
                'message': {'S': 'Test connection'},
                'response': {'S': 'OK'},
                'source': {'S': 'test-script'}
            }
        )
        print(f"[OK] DynamoDB Write Test: OK (pk: {test_pk}, sk: {test_sk})")
        
        # Clean up test item
        try:
            ddb_client.delete_item(
                TableName=AWS_DDB_TABLE,
                Key={'pk': {'S': test_pk}, 'sk': {'S': test_sk}}
            )
            print("[OK] DynamoDB Test Cleanup: OK")
        except:
            pass
            
    except Exception as e:
        print(f"[ERROR] DynamoDB Error: {str(e)}")

print("-" * 50)
print("Test completed!")

