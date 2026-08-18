from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas.history import HistorySessionCreate, HistorySessionInDB
from app.services import history_service
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[HistorySessionInDB])
async def read_history(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Get all user history sessions."""
    return await history_service.get_sessions(db, current_user.id)

@router.post("", response_model=HistorySessionInDB, status_code=status.HTTP_201_CREATED)
async def create_history_session(session_in: HistorySessionCreate, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Create a new history session."""
    return await history_service.create_session(db, session_in, current_user.id)

@router.get("/{session_id}", response_model=HistorySessionInDB)
async def read_history_session(session_id: str, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Get history session by ID."""
    session = await history_service.get_session(db, session_id, current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_session(session_id: str, current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Delete history session."""
    success = await history_service.delete_session(db, session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return None

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(current_user: User = Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    """Clear all history sessions."""
    await history_service.clear_all_sessions(db, current_user.id)
    return None
