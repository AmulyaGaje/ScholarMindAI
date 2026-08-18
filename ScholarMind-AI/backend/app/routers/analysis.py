import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db, SessionLocal
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.paper import Paper
from app.schemas.analysis import PaperAnalysisResponse, AnalysisStatusResponse
from app.services import analysis_service
from app.utils.pdf_report_generator import generate_analysis_pdf

logger = logging.getLogger("scholarmind.routers.analysis")
router = APIRouter()


async def _run_analysis_bg(paper_id: uuid.UUID, user_id: uuid.UUID):
    """Asynchronous background worker to analyze paper without blocking response."""
    async with SessionLocal() as db:
        try:
            await analysis_service.process_and_analyze_paper(db, paper_id, user_id)
        except Exception as e:
            logger.error(f"Background analysis failed for paper {paper_id}: {e}")


@router.post(
    "/{paper_id}/analyze",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger AI Analysis on a Paper",
)
async def trigger_paper_analysis(
    paper_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Triggers background text extraction and AI paper analysis."""
    # Verify paper exists and belongs to user
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalars().first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found or unauthorized.")

    # Get or create analysis record with 'processing' state
    analysis = await analysis_service.get_analysis_by_paper_id(db, paper_id)
    if not analysis:
        from app.models.analysis import PaperAnalysis
        analysis = PaperAnalysis(
            paper_id=paper_id,
            analysis_status="processing",
            model_name="gemini-1.5-flash",
        )
        db.add(analysis)
    else:
        analysis.analysis_status = "processing"
        analysis.error_message = None

    await db.commit()
    await db.refresh(analysis)

    # Queue background analysis task
    background_tasks.add_task(_run_analysis_bg, paper_id, current_user.id)

    return PaperAnalysisResponse.model_validate(analysis)


@router.get(
    "/{paper_id}/analysis",
    response_model=PaperAnalysisResponse,
    summary="Get Structured AI Paper Analysis",
)
async def get_paper_analysis(
    paper_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves existing structured AI analysis for a research paper."""
    # Verify paper ownership
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalars().first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found or unauthorized.")

    analysis = await analysis_service.get_analysis_by_paper_id(db, paper_id)
    if not analysis:
        # If no analysis exists yet, run it synchronous or raise. Let's run it inline for first-time retrieval.
        try:
            analysis = await analysis_service.process_and_analyze_paper(db, paper_id, current_user.id)
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Analysis failed: {str(e)}")

    return PaperAnalysisResponse.model_validate(analysis)


@router.get(
    "/{paper_id}/analysis/status",
    response_model=AnalysisStatusResponse,
    summary="Check AI Paper Analysis Status",
)
async def get_analysis_status(
    paper_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Polling endpoint for paper analysis status (processing, completed, failed)."""
    # Verify paper ownership
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalars().first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found or unauthorized.")

    analysis = await analysis_service.get_analysis_by_paper_id(db, paper_id)
    if not analysis:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis record not found.")

    return AnalysisStatusResponse(
        paper_id=analysis.paper_id,
        analysis_status=analysis.analysis_status,
        model_name=analysis.model_name,
        error_message=analysis.error_message,
        updated_at=analysis.updated_at,
    )


@router.get(
    "/{paper_id}/analysis/pdf",
    summary="Download Academic Report PDF",
)
async def download_analysis_pdf(
    paper_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generates and streams a professional ReportLab PDF analysis report."""
    # 1. Verify paper ownership
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == current_user.id)
    res = await db.execute(stmt)
    paper = res.scalars().first()
    if not paper:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found or unauthorized.")

    # 2. Get existing analysis
    analysis = await analysis_service.get_analysis_by_paper_id(db, paper_id)
    if not analysis or analysis.analysis_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI Analysis report is not yet completed. Please complete analysis before download."
        )

    # 3. Generate PDF report in-memory
    try:
        pdf_buffer = generate_analysis_pdf(analysis, paper)
    except Exception as e:
        logger.error(f"PDF generation failed for paper {paper_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to generate PDF report.")

    # Sanitize title for filename
    clean_title = "".join(c if c.isalnum() or c in ("-", "_") else "_" for c in paper.title)
    filename = f"ScholarMind_Analysis_{clean_title}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
