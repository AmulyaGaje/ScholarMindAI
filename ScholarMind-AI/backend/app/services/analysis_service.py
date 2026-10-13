"""
ScholarMind AI – Paper Analysis Service
========================================
Handles paper extraction, background AI analysis execution, RAG vector indexing, and PostgreSQL updates.
"""

import uuid
import logging
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.paper import Paper
from app.models.analysis import PaperAnalysis
from app.utils.pdf_extractor import extract_text_from_pdf
from app.ai.llm_service import analyze_paper_text

logger = logging.getLogger("scholarmind.analysis_service")


async def get_analysis_by_paper_id(db: AsyncSession, paper_id: uuid.UUID) -> Optional[PaperAnalysis]:
    """Fetch analysis record for a paper."""
    stmt = select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id)
    res = await db.execute(stmt)
    return res.scalars().first()


async def process_and_analyze_paper(db: AsyncSession, paper_id: uuid.UUID, user_id: uuid.UUID) -> PaperAnalysis:
    """
    Executes full paper text extraction, RAG vector indexing, and AI analysis pipeline.
    Saves results to paper_analyses table.
    """
    # 1. Fetch paper record
    stmt = select(Paper).where(Paper.id == paper_id, Paper.user_id == user_id)
    res = await db.execute(stmt)
    paper = res.scalars().first()
    if not paper:
        raise ValueError("Paper not found or unauthorized access.")

    # 2. Get or create analysis record
    analysis = await get_analysis_by_paper_id(db, paper_id)
    if not analysis:
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

    # 3. Process PDF, RAG indexing & execute AI Analysis
    try:
        pdf_text, page_count = extract_text_from_pdf(paper.file_path)
        paper.page_count = page_count

        # RAG Chunking & Vector Indexing in PostgreSQL pgvector table
        try:
            from app.services.rag_service import index_paper_chunks
            await index_paper_chunks(db, paper_id, user_id, pdf_text)
        except Exception as chunk_ex:
            logger.warning(f"RAG Chunk indexing warning for paper {paper_id}: {chunk_ex}")
        
        analysis_data = await analyze_paper_text(paper.title, pdf_text, page_count)

        # Update all 21 analysis fields in database
        analysis.paper_overview = analysis_data.get("paper_overview")
        analysis.executive_summary = analysis_data.get("executive_summary")
        analysis.research_problem = analysis_data.get("research_problem")
        analysis.objectives = analysis_data.get("objectives")
        analysis.background = analysis_data.get("background")
        analysis.related_work = analysis_data.get("related_work")
        analysis.proposed_approach = analysis_data.get("proposed_approach")
        analysis.methodology = analysis_data.get("methodology")
        analysis.architecture = analysis_data.get("architecture")
        analysis.experimental_setup = analysis_data.get("experimental_setup")
        analysis.results = analysis_data.get("results")
        analysis.key_findings = analysis_data.get("key_findings")
        analysis.simple_understanding = analysis_data.get("simple_understanding")
        analysis.technical_understanding = analysis_data.get("technical_understanding")
        analysis.strengths = analysis_data.get("strengths")
        analysis.limitations = analysis_data.get("limitations")
        analysis.future_scope = analysis_data.get("future_scope")
        analysis.research_contribution = analysis_data.get("research_contribution")
        analysis.practical_applications = analysis_data.get("practical_applications")
        analysis.terminology = analysis_data.get("terminology")
        analysis.final_understanding = analysis_data.get("final_understanding")
        analysis.summary = analysis_data.get("summary")
        analysis.keywords = analysis_data.get("keywords")
        
        analysis.analysis_status = "completed"
        analysis.updated_at = datetime.now(timezone.utc)

        # Update paper status
        paper.status = "ready"

        await db.commit()
        await db.refresh(analysis)
        logger.info(f"AI analysis completed successfully for paper {paper_id}")
        return analysis

    except Exception as e:
        await db.rollback()
        logger.error(f"Analysis failed for paper {paper_id}: {e}")
        
        # Save failure state
        err_analysis = await get_analysis_by_paper_id(db, paper_id)
        if err_analysis:
            err_analysis.analysis_status = "failed"
            err_analysis.error_message = str(e)
            err_analysis.updated_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(err_analysis)
            return err_analysis
        raise
