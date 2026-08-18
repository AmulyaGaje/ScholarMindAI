from pydantic import BaseModel
from typing import List, Any
from app.schemas.paper import PaperInDB
from app.schemas.project import ProjectInDB
from app.schemas.history import HistorySessionInDB

class SearchResult(BaseModel):
    items: List[Any]
    total: int
    type: str
