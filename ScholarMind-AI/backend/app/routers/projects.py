import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectInDB
from app.schemas.paper import PaperInDB
from app.services import project_service, paper_service
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[ProjectInDB], summary="List all user projects")
async def read_projects(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all non-archived projects for authenticated user."""
    return await project_service.get_projects(db, current_user.id)


@router.post(
    "",
    response_model=ProjectInDB,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new project",
)
async def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Creates a new research project and returns HTTP 201 with project record."""
    try:
        return await project_service.create_project(db, project_in, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project: {str(e)}",
        )


@router.get("/{project_id}", response_model=ProjectInDB, summary="Get project by ID")
async def read_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single project by UUID."""
    project = await project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectInDB, summary="Update project")
async def update_project(
    project_id: uuid.UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update project metadata."""
    project = await project_service.update_project(db, project_id, project_in, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete project")
async def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete project."""
    success = await project_service.delete_project(db, project_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None


@router.get("/{project_id}/papers", response_model=List[PaperInDB], summary="List papers in project")
async def read_project_papers(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get list of research papers associated with a project."""
    project = await project_service.get_project(db, project_id, current_user.id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    papers, _ = await paper_service.get_papers(db, current_user.id, limit=100, project_id=str(project_id))
    return papers
