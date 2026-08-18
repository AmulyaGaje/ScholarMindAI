from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HistorySessionBase(BaseModel):
    title: str
    session_type: str
    paper_id: Optional[str] = None
    project_id: Optional[str] = None

class HistorySessionCreate(HistorySessionBase):
    pass

class HistorySessionInDB(HistorySessionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}
