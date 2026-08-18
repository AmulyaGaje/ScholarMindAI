from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import Tuple, List

from app.models.paper import Paper
from app.models.project import Project
from app.models.history import HistorySession

async def search_items(
    db: AsyncSession, user_id: str, query: str, item_type: str, skip: int = 0, limit: int = 10
) -> Tuple[List[any], int]:
    
    if item_type == "papers":
        stmt = select(Paper).filter(
            Paper.user_id == user_id,
            or_(
                Paper.title.ilike(f"%{query}%"),
                Paper.authors.ilike(f"%{query}%"),
                Paper.abstract.ilike(f"%{query}%"),
                Paper.tags.ilike(f"%{query}%")
            )
        )
    elif item_type == "projects":
        stmt = select(Project).filter(
            Project.user_id == user_id,
            or_(
                Project.name.ilike(f"%{query}%"),
                Project.description.ilike(f"%{query}%")
            )
        )
    elif item_type == "history":
        stmt = select(HistorySession).filter(
            HistorySession.user_id == user_id,
            HistorySession.title.ilike(f"%{query}%")
        )
    else:
        return [], 0

    paginated_stmt = stmt.offset(skip).limit(limit)
    
    result = await db.execute(paginated_stmt)
    items = list(result.scalars().all())
    
    return items, len(items) # In production we should use a real count query here
