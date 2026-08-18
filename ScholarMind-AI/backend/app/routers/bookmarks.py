from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas.bookmark import BookmarkCreate, BookmarkInDB
from app.models.bookmark import Bookmark
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[BookmarkInDB])
async def get_bookmarks(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Get user bookmarks."""
    result = await db.execute(select(Bookmark).filter(Bookmark.user_id == current_user.id))
    return list(result.scalars().all())

@router.post("", response_model=BookmarkInDB, status_code=status.HTTP_201_CREATED)
async def create_bookmark(bookmark_in: BookmarkCreate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Create a new bookmark."""
    db_bookmark = Bookmark(
        user_id=current_user.id,
        paper_id=bookmark_in.paper_id,
        project_id=bookmark_in.project_id
    )
    db.add(db_bookmark)
    await db.commit()
    await db.refresh(db_bookmark)
    return db_bookmark

@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(bookmark_id: str, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Delete a bookmark."""
    result = await db.execute(
        delete(Bookmark).where(Bookmark.id == bookmark_id, Bookmark.user_id == current_user.id)
    )
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return None
