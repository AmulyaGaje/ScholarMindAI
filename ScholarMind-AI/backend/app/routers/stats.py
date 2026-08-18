from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas.common import StatsResponse
from app.models.user import User
from app.models.paper import Paper
from app.models.project import Project

router = APIRouter()


def format_storage_size(bytes_num: int) -> str:
    """Formats byte count to human-readable size string (0 MB, 1.2 MB, 500 KB)."""
    if not bytes_num or bytes_num <= 0:
        return "0 MB"
    units = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    size = float(bytes_num)
    while size >= 1024.0 and i < len(units) - 1:
        size /= 1024.0
        i += 1
    if units[i] in ["B", "KB"]:
        return f"{size:.1f} {units[i]}"
    return f"{size:.1f} {units[i]}"


@router.get("", response_model=StatsResponse, summary="Get user stats")
async def get_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve live statistics for the authenticated user from PostgreSQL."""

    # 1. Total papers count
    papers_count = await db.execute(select(func.count(Paper.id)).where(Paper.user_id == current_user.id))
    total_papers = papers_count.scalar_one() or 0

    # 2. Active projects count
    projects_count = await db.execute(
        select(func.count(Project.id)).where(Project.user_id == current_user.id, Project.is_archived == False)
    )
    active_projects = projects_count.scalar_one() or 0

    # 3. Recent uploads (last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_uploads_count = await db.execute(
        select(func.count(Paper.id)).where(
            Paper.user_id == current_user.id,
            Paper.created_at >= seven_days_ago,
        )
    )
    recent_uploads = recent_uploads_count.scalar_one() or 0

    # 4. Storage used (sum of file_size in bytes)
    storage_sum = await db.execute(select(func.coalesce(func.sum(Paper.file_size), 0)).where(Paper.user_id == current_user.id))
    storage_used_bytes = int(storage_sum.scalar_one() or 0)

    formatted_storage = format_storage_size(storage_used_bytes)

    return {
        "total_papers": total_papers,
        "total_projects": active_projects,
        "active_projects": active_projects,
        "recent_uploads": recent_uploads,
        "storage_used_bytes": storage_used_bytes,
        "storage_used": formatted_storage,
    }
