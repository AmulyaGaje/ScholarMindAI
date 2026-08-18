from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BookmarkBase(BaseModel):
    paper_id: Optional[str] = None
    project_id: Optional[str] = None

class BookmarkCreate(BookmarkBase):
    pass

class BookmarkInDB(BookmarkBase):
    id: str
    user_id: str
    created_at: datetime
    
    model_config = {"from_attributes": True}
