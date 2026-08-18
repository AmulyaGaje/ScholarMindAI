import uuid
import math
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_active_user, PaginationParams
from app.schemas.paper import PaperCreate, PaperUpdate, PaperInDB, PaginatedPapers
from app.services import paper_service, upload_service
from app.models.user import User

router = APIRouter()


async def _trigger_analysis_bg(paper_id: uuid.UUID, user_id: uuid.UUID):
    """Background task: opens its own DB session so it doesn't interfere with the request session."""
    from app.services import analysis_service  # local import to avoid circular
    async with SessionLocal() as db:
        try:
            await analysis_service.process_and_analyze_paper(db, paper_id, user_id)
        except Exception:
            pass  # Errors are saved in paper_analyses.error_message; don't crash the bg task


@router.get("", response_model=PaginatedPapers, summary="List user papers")
async def read_papers(
    pagination: PaginationParams = Depends(),
    project_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user papers with pagination and optional project filter."""
    items, total = await paper_service.get_papers(
        db, current_user.id, skip=pagination.skip, limit=pagination.limit, project_id=project_id
    )
    pages = math.ceil(total / pagination.limit) if total > 0 else 0
    return {"items": items, "total": total, "page": pagination.page, "limit": pagination.limit, "pages": pages}


@router.post("/upload", response_model=PaperInDB, status_code=status.HTTP_201_CREATED, summary="Upload PDF paper & trigger AI analysis")
async def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Query(...),
    authors: Optional[str] = Query(None),
    abstract: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    project_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF, create the paper record, then kick off AI analysis as a background task."""
    file_metadata = await upload_service.handle_file_upload(db, file, current_user.id)

    author_list = [a.strip() for a in authors.split(",")] if authors else None
    tag_list = [t.strip() for t in tags.split(",")] if tags else None

    paper_in = PaperCreate(
        title=title,
        authors=author_list,
        abstract=abstract,
        tags=tag_list,
        project_id=project_id,
        file_path=file_metadata["file_path"],
        file_name=file_metadata["file_name"],
        file_size=file_metadata["file_size"],
    )

    new_paper = await paper_service.create_paper(db, paper_in, current_user.id)

    # Kick off AI analysis in background (separate DB session, non-blocking)
    background_tasks.add_task(_trigger_analysis_bg, new_paper.id, current_user.id)

    return new_paper


@router.get("/{paper_id}", response_model=PaperInDB, summary="Get paper by ID")
async def read_paper(
    paper_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    paper = await paper_service.get_paper(db, paper_id, current_user.id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.put("/{paper_id}", response_model=PaperInDB, summary="Update paper")
async def update_paper(
    paper_id: uuid.UUID,
    paper_in: PaperUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    paper = await paper_service.update_paper(db, paper_id, paper_in, current_user.id)
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete paper")
async def delete_paper(
    paper_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    success = await paper_service.delete_paper(db, paper_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Paper not found")
    return None
