from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Project title")
    description: Optional[str] = Field(None, max_length=1000, description="Project overview")
    color: Optional[str] = Field("#6366f1", max_length=7, description="Hex color tag")
    icon: Optional[str] = Field("folder", max_length=50, description="Icon name")

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    color: Optional[str] = Field(None, max_length=7)
    icon: Optional[str] = Field(None, max_length=50)

class ProjectInDB(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    paper_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
