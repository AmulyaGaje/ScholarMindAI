from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc
from typing import List, Optional

from app.models.history import HistorySession as HistorySessionModel
from app.schemas.history import HistorySessionCreate

async def get_sessions(db: AsyncSession, user_id: str) -> List[HistorySessionModel]:
    result = await db.execute(
        select(HistorySessionModel)
        .filter(HistorySessionModel.user_id == user_id)
        .order_by(desc(HistorySessionModel.updated_at))
    )
    return list(result.scalars().all())

async def get_session(db: AsyncSession, session_id: str, user_id: str) -> Optional[HistorySessionModel]:
    result = await db.execute(
        select(HistorySessionModel).filter(
            HistorySessionModel.id == session_id,
            HistorySessionModel.user_id == user_id
        )
    )
    return result.scalars().first()

async def create_session(db: AsyncSession, session_in: HistorySessionCreate, user_id: str) -> HistorySessionModel:
    db_session = HistorySessionModel(
        **session_in.model_dump(),
        user_id=user_id
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    return db_session

async def delete_session(db: AsyncSession, session_id: str, user_id: str) -> bool:
    result = await db.execute(
        delete(HistorySessionModel).where(
            HistorySessionModel.id == session_id,
            HistorySessionModel.user_id == user_id
        )
    )
    await db.commit()
    return result.rowcount > 0

async def clear_all_sessions(db: AsyncSession, user_id: str) -> int:
    result = await db.execute(
        delete(HistorySessionModel).where(HistorySessionModel.user_id == user_id)
    )
    await db.commit()
    return result.rowcount
