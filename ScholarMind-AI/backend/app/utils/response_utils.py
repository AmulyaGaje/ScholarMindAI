from typing import Any, Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[dict] = None

def success_response(data: Any = None) -> StandardResponse:
    return StandardResponse(success=True, data=data)

def error_response(message: str, code: str = "ERROR", details: Any = None) -> StandardResponse:
    return StandardResponse(
        success=False,
        error={"message": message, "code": code, "details": details}
    )
