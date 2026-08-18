import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


async def get_projects(db: AsyncSession, user_id: uuid.UUID) -> List[Project]:
    """Retrieve all non-archived projects owned by user ordered by recent update."""
    stmt = (
        select(Project)
        .where(Project.user_id == user_id, Project.is_archived == False)
        .order_by(Project.updated_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Project]:
    """Retrieve single project by ID owned by user."""
    stmt = select(Project).where(Project.id == project_id, Project.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def create_project(db: AsyncSession, project_in: ProjectCreate, user_id: uuid.UUID) -> Project:
    """Create and persist new project to PostgreSQL."""
    db_project = Project(
        user_id=user_id,
        name=project_in.name.strip(),
        description=project_in.description.strip() if project_in.description else None,
        color=project_in.color or "#6366f1",
        icon=project_in.icon or "folder",
    )
    try:
        db.add(db_project)
        await db.commit()
        await db.refresh(db_project)
        return db_project
    except Exception:
        await db.rollback()
        raise


async def update_project(
    db: AsyncSession, project_id: uuid.UUID, project_in: ProjectUpdate, user_id: uuid.UUID
) -> Optional[Project]:
    """Update project details."""
    db_project = await get_project(db, project_id, user_id)
    if not db_project:
        return None

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(db_project, field, value)

    try:
        await db.commit()
        await db.refresh(db_project)
        return db_project
    except Exception:
        await db.rollback()
        raise


async def delete_project(db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    """Delete project."""
    stmt = delete(Project).where(Project.id == project_id, Project.user_id == user_id)
    try:
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
    except Exception:
        await db.rollback()
        raise
