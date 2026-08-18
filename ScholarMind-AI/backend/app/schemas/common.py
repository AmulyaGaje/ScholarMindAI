from pydantic import BaseModel, Field
from typing import Optional

class ErrorSchema(BaseModel):
    message: str
    code: str = "ERROR"
    details: Optional[dict] = None

class StatsResponse(BaseModel):
    total_papers: int = Field(..., description="Total count of papers uploaded by user")
    total_projects: int = Field(..., description="Total count of active projects")
    active_projects: int = Field(..., description="Alias for active projects count")
    recent_uploads: int = Field(..., description="Count of uploads in the last 7 days")
    storage_used_bytes: int = Field(..., description="Raw sum of file sizes in bytes")
    storage_used: str = Field(..., description="Formatted storage size (e.g. 0 MB, 1.5 MB)")
