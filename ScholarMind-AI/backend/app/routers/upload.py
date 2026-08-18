from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.services import upload_service
from app.models.user import User

router = APIRouter()

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Direct file upload endpoint, returning metadata."""
    metadata = await upload_service.handle_file_upload(db, file, current_user.id)
    return metadata
