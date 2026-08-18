import os
import uuid
import mimetypes
from fastapi import UploadFile

def get_file_extension(filename: str) -> str:
    return os.path.splitext(filename)[1].lower()

def get_file_size_mb(size_bytes: int) -> float:
    return round(size_bytes / (1024 * 1024), 2)

def generate_unique_filename(original_filename: str) -> str:
    ext = get_file_extension(original_filename)
    return f"{uuid.uuid4().hex}{ext}"

def is_valid_pdf(filename: str, content_type: str) -> bool:
    if not content_type:
        content_type, _ = mimetypes.guess_type(filename)
    return content_type == "application/pdf" or filename.lower().endswith(".pdf")
