import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, ForeignKey, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PaperAnalysis(Base):
    __tablename__ = "paper_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    paper_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("papers.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    simple_understanding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    key_findings: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    research_problem: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objectives: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    methodology: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    results: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    limitations: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    future_scope: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    keywords: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    background: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    related_work: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proposed_approach: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    architecture: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    experimental_setup: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    technical_understanding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    strengths: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    research_contribution: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    practical_applications: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    terminology: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text), nullable=True)
    final_understanding: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    paper_overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    model_name: Mapped[str] = mapped_column(String(100), default="gemini-1.5-flash", nullable=False)
    analysis_status: Mapped[str] = mapped_column(String(50), default="processing", nullable=False) # processing, completed, failed
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    paper = relationship("Paper", back_populates="analysis")
