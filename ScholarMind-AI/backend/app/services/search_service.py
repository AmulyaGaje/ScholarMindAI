from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import Tuple, List, Any

from app.models.paper import Paper
from app.models.project import Project
from app.models.history import HistorySession

async def search_items(
    db: AsyncSession, user_id: str, query: str, item_type: str, skip: int = 0, limit: int = 10
) -> Tuple[List[Any], int]:
    
    clean_query = query.strip()
    if not clean_query:
        return [], 0

    if item_type == "papers":
        authors_text = func.array_to_string(Paper.authors, ' ')
        tags_text = func.array_to_string(Paper.tags, ' ')

        stmt = select(Paper).where(
            Paper.user_id == user_id,
            or_(
                Paper.title.ilike(f"%{clean_query}%"),
                authors_text.ilike(f"%{clean_query}%"),
                Paper.abstract.ilike(f"%{clean_query}%"),
                tags_text.ilike(f"%{clean_query}%")
            )
        )
        count_stmt = select(func.count(Paper.id)).where(
            Paper.user_id == user_id,
            or_(
                Paper.title.ilike(f"%{clean_query}%"),
                authors_text.ilike(f"%{clean_query}%"),
                Paper.abstract.ilike(f"%{clean_query}%"),
                tags_text.ilike(f"%{clean_query}%")
            )
        )

    elif item_type == "projects":
        stmt = select(Project).where(
            Project.user_id == user_id,
            or_(
                Project.name.ilike(f"%{clean_query}%"),
                Project.description.ilike(f"%{clean_query}%")
            )
        )
        count_stmt = select(func.count(Project.id)).where(
            Project.user_id == user_id,
            or_(
                Project.name.ilike(f"%{clean_query}%"),
                Project.description.ilike(f"%{clean_query}%")
            )
        )

    elif item_type == "history":
        stmt = select(HistorySession).where(
            HistorySession.user_id == user_id,
            HistorySession.title.ilike(f"%{clean_query}%")
        )
        count_stmt = select(func.count(HistorySession.id)).where(
            HistorySession.user_id == user_id,
            HistorySession.title.ilike(f"%{clean_query}%")
        )

    else:
        return [], 0

    # Total count
    count_res = await db.execute(count_stmt)
    total = count_res.scalar_one() or 0

    # Paginated items
    paginated_stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(paginated_stmt)
    items = list(result.scalars().all())

    return items, total
