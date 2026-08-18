import os
import aiofiles
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import mimetypes

from app.core.config import settings
from app.utils.file_utils import is_valid_pdf
from app.models.upload import Upload


async def handle_file_upload(db: AsyncSession, file: UploadFile, user_id: uuid.UUID) -> dict:
    """Handle PDF file upload and persist upload audit log to PostgreSQL."""
    if not is_valid_pdf(file.filename, file.content_type):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    user_upload_dir = os.path.join(settings.UPLOAD_DIR, str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(user_upload_dir, unique_filename)

    file_size = 0
    try:
        async with aiofiles.open(file_path, "wb") as out_file:
            while content := await file.read(1024 * 1024):
                await out_file.write(content)
                file_size += len(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        await file.seek(0)

    content_type, _ = mimetypes.guess_type(file.filename)

    db_upload = Upload(
        user_id=user_id,
        original_filename=file.filename,
        stored_filename=unique_filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=content_type or "application/pdf",
        upload_status="completed",
    )
    try:
        db.add(db_upload)
        await db.commit()
        await db.refresh(db_upload)
    except Exception:
        await db.rollback()
        raise

    return {
        "file_path": file_path,
        "file_name": file.filename,
        "file_size": file_size,
        "mime_type": db_upload.mime_type,
    }
