"""
ScholarMind AI – Structured AI Analysis Schemas (Pydantic v2)
=============================================================
Defines Pydantic models for parsing LLM structured output and returning analysis endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class AnalysisStructuredOutput(BaseModel):
    """Pydantic model for validating raw LLM JSON output."""
    paper_overview: str = Field(..., description="Details about title, authors, source/journal, publication year")
    executive_summary: str = Field(..., description="Professional high-level overview (1-2 paragraphs)")
    research_problem: str = Field(..., description="Problem being addressed and why it exists")
    objectives: List[str] = Field(default_factory=list, description="Main objectives of the research")
    background: str = Field(..., description="Research context and concepts")
    related_work: str = Field(..., description="Existing approaches, important previous studies and differences")
    proposed_approach: str = Field(..., description="Core approach, architecture and workflow")
    methodology: str = Field(..., description="Detailed explanation of methodology, dataset, preprocessing")
    architecture: str = Field(..., description="Proposed system/model architecture components description")
    experimental_setup: str = Field(..., description="Experimental setup, datasets, parameters, training config")
    results: str = Field(..., description="Major results, comparisons, and findings")
    key_findings: List[str] = Field(default_factory=list, description="Bullet points of most important findings")
    simple_understanding: str = Field(..., description="Student-friendly simple explanation of what paper does")
    technical_understanding: str = Field(..., description="Deeper technical explanation suitable for final-year CS student")
    strengths: List[str] = Field(default_factory=list, description="Strengths of the proposed approach")
    limitations: List[str] = Field(default_factory=list, description="Explicit limitations mentioned or inferred")
    future_scope: List[str] = Field(default_factory=list, description="Future work suggested by authors")
    research_contribution: str = Field(..., description="Contributions to the research field")
    practical_applications: List[str] = Field(default_factory=list, description="Practical application areas")
    terminology: List[str] = Field(default_factory=list, description="Glossary of important terms in format 'Term: Definition'")
    final_understanding: str = Field(..., description="Concise conclusion summary")
    summary: str = Field(..., description="General summary of the research paper")
    keywords: List[str] = Field(default_factory=list, description="Extracted research keywords")


class PaperAnalysisResponse(BaseModel):
    """API response schema for paper analysis."""
    id: uuid.UUID
    paper_id: uuid.UUID
    paper_overview: Optional[str] = None
    executive_summary: Optional[str] = None
    research_problem: Optional[str] = None
    objectives: Optional[List[str]] = None
    background: Optional[str] = None
    related_work: Optional[str] = None
    proposed_approach: Optional[str] = None
    methodology: Optional[str] = None
    architecture: Optional[str] = None
    experimental_setup: Optional[str] = None
    results: Optional[str] = None
    key_findings: Optional[List[str]] = None
    simple_understanding: Optional[str] = None
    technical_understanding: Optional[str] = None
    strengths: Optional[List[str]] = None
    limitations: Optional[List[str]] = None
    future_scope: Optional[List[str]] = None
    research_contribution: Optional[str] = None
    practical_applications: Optional[List[str]] = None
    terminology: Optional[List[str]] = None
    final_understanding: Optional[str] = None
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    model_name: str
    analysis_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AnalysisStatusResponse(BaseModel):
    """Status check response model."""
    paper_id: uuid.UUID
    analysis_status: str
    model_name: str
    error_message: Optional[str] = None
    updated_at: datetime
