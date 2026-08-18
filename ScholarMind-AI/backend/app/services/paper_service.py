import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, desc

from app.models.paper import Paper
from app.schemas.paper import PaperCreate, PaperUpdate


async def get_papers(
    db: AsyncSession,
    user_id: uuid.UUID,
    skip: int = 0,
    limit: int = 10,
    project_id: Optional[uuid.UUID] = None,
) -> Tuple[List[Paper], int]:
    """Retrieve papers for user ordered by created_at."""
    query = select(Paper).where(Paper.user_id == user_id)
    count_query = select(func.count(Paper.id)).where(Paper.user_id == user_id)

    if project_id:
        query = query.where(Paper.project_id == project_id)
        count_query = count_query.where(Paper.project_id == project_id)

    query = query.order_by(desc(Paper.created_at)).offset(skip).limit(limit)

    result = await db.execute(query)
    count_result = await db.execute(count_query)

    return list(result.scalars().all()), count_result.scalar_one()


async def get_paper(db: AsyncSession, paper_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Paper]:
    """Retrieve single paper by UUID."""
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def create_paper(db: AsyncSession, paper_in: PaperCreate, user_id: uuid.UUID) -> Paper:
    """Create paper record in PostgreSQL."""
    db_paper = Paper(
        user_id=user_id,
        project_id=paper_in.project_id,
        title=paper_in.title,
        authors=paper_in.authors,
        abstract=paper_in.abstract,
        journal=paper_in.journal,
        year=paper_in.year,
        doi=paper_in.doi,
        tags=paper_in.tags,
        file_name=paper_in.file_name,
        file_path=paper_in.file_path,
        file_size=paper_in.file_size,
        page_count=paper_in.page_count,
        mime_type=paper_in.mime_type or "application/pdf",
        status="ready",
    )
    try:
        db.add(db_paper)
        await db.commit()
        await db.refresh(db_paper)
        return db_paper
    except Exception:
        await db.rollback()
        raise


async def update_paper(
    db: AsyncSession, paper_id: uuid.UUID, paper_in: PaperUpdate, user_id: uuid.UUID
) -> Optional[Paper]:
    """Update paper metadata."""
    db_paper = await get_paper(db, paper_id, user_id)
    if not db_paper:
        return None

    update_data = paper_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_paper, field, value)

    try:
        await db.commit()
        await db.refresh(db_paper)
        return db_paper
    except Exception:
        await db.rollback()
        raise


async def delete_paper(db: AsyncSession, paper_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    """Delete paper by UUID."""
    stmt = delete(Paper).where(Paper.id == paper_id, Paper.user_id == user_id)
    try:
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception:
        await db.rollback()
        raise
