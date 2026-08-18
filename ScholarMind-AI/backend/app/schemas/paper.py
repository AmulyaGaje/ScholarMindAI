from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class PaperBase(BaseModel):
    title: str
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    journal: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None
    tags: Optional[List[str]] = None
    project_id: Optional[uuid.UUID] = None

class PaperCreate(PaperBase):
    file_path: str
    file_name: str
    file_size: int
    page_count: Optional[int] = None
    mime_type: Optional[str] = "application/pdf"

class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    tags: Optional[List[str]] = None
    project_id: Optional[uuid.UUID] = None
    status: Optional[str] = None

class PaperInDB(PaperBase):
    id: uuid.UUID
    user_id: uuid.UUID
    file_path: str
    file_name: str
    file_size: int
    status: str
    page_count: Optional[int] = None
    is_bookmarked: bool = False
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

class PaginatedPapers(BaseModel):
    items: List[PaperInDB]
    total: int
    page: int
    limit: int
    pages: int
