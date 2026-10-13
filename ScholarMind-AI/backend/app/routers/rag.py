import uuid
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.services import rag_service

logger = logging.getLogger("scholarmind.routers.rag")
router = APIRouter()


# ── Request / Response Schemas ───────────────────────────────────────────────

class ChatMessageTurn(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text")

class PaperChatRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Question about the paper")
    chat_history: Optional[List[ChatMessageTurn]] = Field(default=None, description="Previous conversation turns for coreference resolution")

class SourceCitation(BaseModel):
    section: str
    page: int

class RetainedChunk(BaseModel):
    chunk_id: str
    chunk_index: int
    section: Optional[str] = "General"
    page_number: Optional[int] = 1
    content: str
    score: float

class PaperChatResponse(BaseModel):
    answer: str
    grounded: bool
    paper_id: str
    paper_title: str
    sources: Optional[List[SourceCitation]] = []
    retrieved_chunks: List[RetainedChunk]

class PaperCompareRequest(BaseModel):
    paper_ids: List[uuid.UUID] = Field(..., min_length=2, description="List of at least 2 paper UUIDs to compare")

class ResearchGapsRequest(BaseModel):
    paper_ids: List[uuid.UUID] = Field(..., min_length=1, description="List of paper UUIDs to analyze for research gaps")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post(
    "/{paper_id}/chat",
    response_model=PaperChatResponse,
    summary="Ask Question About Uploaded Paper (RAG Q&A)",
)
async def chat_with_paper(
    paper_id: uuid.UUID,
    payload: PaperChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    RAG-grounded Paper Q&A:
    Retrieves vector similarity chunks from PostgreSQL, resolves coreferences from chat_history,
    constructs grounded prompt, and returns reasoned human-understandable answer with source section & page citations.
    """
    try:
        history_list = [h.model_dump() for h in payload.chat_history] if payload.chat_history else None
        res = await rag_service.answer_paper_question(
            db, paper_id, current_user.id, payload.query, chat_history=history_list
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"RAG Chat error for paper {paper_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to answer question: {str(e)}"
        )


@router.post(
    "/compare",
    summary="Compare 2 or More Selected Research Papers",
)
async def compare_papers(
    payload: PaperCompareRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates a structured comparative analysis of 2+ research papers
    across 9 key academic dimensions.
    """
    try:
        return await rag_service.compare_papers(db, payload.paper_ids, current_user.id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Paper comparison failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post(
    "/research-gaps",
    summary="Identify Research Gaps from Selected Papers",
)
async def identify_research_gaps(
    payload: ResearchGapsRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Analyzes selected research papers for limitations, missing approaches,
    and potential future research directions.
    """
    try:
        return await rag_service.identify_research_gaps(db, payload.paper_ids, current_user.id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Research gap identification failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/recommendations",
    summary="Get Personal Research Recommendations",
)
async def get_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns AI-generated research topic recommendations and search suggestions
    tailored to the student's active projects and paper library.
    """
    try:
        return await rag_service.get_recommendations(db, current_user.id)
    except Exception as e:
        logger.error(f"Failed to generate recommendations: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
