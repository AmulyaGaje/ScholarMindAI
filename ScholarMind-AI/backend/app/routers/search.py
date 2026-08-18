from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Literal

from app.core.database import get_db
from app.core.dependencies import get_current_active_user, PaginationParams
from app.schemas.search import SearchResult
from app.services import search_service
from app.models.user import User
from app.schemas.paper import PaperInDB
from app.schemas.project import ProjectInDB
from app.schemas.history import HistorySessionInDB

router = APIRouter()

@router.get("", response_model=SearchResult)
async def search(
    q: str = Query(..., min_length=1),
    type: Literal["papers", "projects", "history"] = Query("papers"),
    pagination: PaginationParams = Depends(),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Search globally across entities."""
    items, total = await search_service.search_items(
        db, current_user.id, q, type, skip=pagination.skip, limit=pagination.limit
    )
    
    # Map to schema models
    serialized_items = []
    if type == "papers":
        serialized_items = [PaperInDB.model_validate(item) for item in items]
    elif type == "projects":
        serialized_items = [ProjectInDB.model_validate(item) for item in items]
    elif type == "history":
        serialized_items = [HistorySessionInDB.model_validate(item) for item in items]
    
    return {
        "items": serialized_items,
        "total": total,
        "type": type
    }
