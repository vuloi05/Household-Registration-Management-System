import json
from datetime import datetime
from . import settings


def get_timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def persist_chat_event(event: dict) -> None:
    """Persist a chat event to AWS S3 (raw ndjson) and DynamoDB (structured) if configured.
    Safe no-op when AWS is not configured.
    """
    try:
        if settings.s3_client and settings.AWS_S3_BUCKET:
            key = f"chat-logs/{datetime.now().strftime('%Y/%m/%d')}.ndjson"
            line = json.dumps(event, ensure_ascii=False) + "\n"
            try:
                existing = settings.s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=key)
                body = existing['Body'].read().decode('utf-8') + line
            except settings.s3_client.exceptions.NoSuchKey:  # type: ignore[attr-defined]
                body = line
            except Exception:
                body = line
            settings.s3_client.put_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=key,
                Body=body.encode('utf-8'),
                ContentType='application/x-ndjson'
            )
    except (settings.BotoCoreError, settings.ClientError, Exception):
        pass

    try:
        if settings.ddb_client and settings.AWS_DDB_TABLE:
            settings.ddb_client.put_item(
                TableName=settings.AWS_DDB_TABLE,
                Item={
                    'pk': {'S': f"chat#{datetime.now().strftime('%Y%m%d')}"},
                    'sk': {'S': f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}"},
                    'timestamp': {'S': event.get('timestamp', '')},
                    'message': {'S': event.get('message', '')[:2000]},
                    'response': {'S': event.get('response', '')[:2000]},
                    'context': {'S': event.get('context', '')[:1000]},
                    'source': {'S': event.get('source', 'local-ai-server')},
                }
            )
    except (settings.BotoCoreError, settings.ClientError, Exception):
        pass


