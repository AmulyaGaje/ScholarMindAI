"""
ScholarMind AI – PDF Text Extractor Utility
============================================
Extracts clean plain text and per-page section metadata from uploaded PDF files
using PyMuPDF (fitz) or pypdf fallback.
"""

import os
import re
import logging
from typing import Tuple, List, Dict, Any

logger = logging.getLogger("scholarmind.pdf_extractor")

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

# Common academic section headings regex
SECTION_PATTERNS = [
    (re.compile(r"^\s*(?:1\.\s*)?abstract", re.I), "Abstract"),
    (re.compile(r"^\s*(?:1|2|\bI|II\b)\.?\s*(introduction|background)", re.I), "Introduction"),
    (re.compile(r"^\s*(?:2|3|\bII|III\b)\.?\s*(related work|literature review)", re.I), "Related Work"),
    (re.compile(r"^\s*(?:3|4|\bIII|IV\b)\.?\s*(methodology|proposed method|architecture|system model|approach)", re.I), "Methodology"),
    (re.compile(r"^\s*(?:4|5|\bIV|V\b)\.?\s*(experiments|experimental setup|dataset|data collection)", re.I), "Experimental Setup"),
    (re.compile(r"^\s*(?:5|6|\bV|VI\b)\.?\s*(results|evaluation|discussion|findings)", re.I), "Results"),
    (re.compile(r"^\s*(?:6|7|\bVI|VII\b)\.?\s*(limitations|threats to validity)", re.I), "Limitations"),
    (re.compile(r"^\s*(?:7|8|\bVII|VIII\b)\.?\s*(conclusion|future work|future scope)", re.I), "Conclusion"),
    (re.compile(r"^\s*(?:8|9|\bVIII|IX\b)\.?\s*(references|bibliography)", re.I), "References"),
]


def detect_section_header(line: str) -> str | None:
    """Detects if a text line is a standard academic section heading."""
    line_clean = line.strip()
    if len(line_clean) > 80:
        return None
    for pattern, section_name in SECTION_PATTERNS:
        if pattern.search(line_clean):
            return section_name
    return None


def extract_pages_with_metadata(file_path: str) -> List[Dict[str, Any]]:
    """
    Extracts text per page along with metadata: page_number and section headers.
    Returns list of dicts: [{"page_number": int, "text": str, "sections": List[str]}]
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at path: {file_path}")

    pages_data = []

    if HAS_PYMUPDF:
        try:
            doc = fitz.open(file_path)
            current_section = "Abstract"
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text("text") or ""
                
                # Check lines for section header
                lines = text.split("\n")
                for line in lines:
                    sec = detect_section_header(line)
                    if sec:
                        current_section = sec

                pages_data.append({
                    "page_number": page_num + 1,
                    "text": text,
                    "section": current_section,
                })
            doc.close()
            return pages_data
        except Exception as e:
            logger.warning(f"PyMuPDF metadata extraction failed, trying fallback: {e}")
            pages_data = []

    if not pages_data and HAS_PYPDF:
        try:
            reader = PdfReader(file_path)
            current_section = "Abstract"
            for i in range(len(reader.pages)):
                text = reader.pages[i].extract_text() or ""
                lines = text.split("\n")
                for line in lines:
                    sec = detect_section_header(line)
                    if sec:
                        current_section = sec
                pages_data.append({
                    "page_number": i + 1,
                    "text": text,
                    "section": current_section,
                })
            return pages_data
        except Exception as e:
            logger.error(f"pypdf metadata extraction failed: {e}")

    return pages_data


def extract_text_from_pdf(file_path: str) -> Tuple[str, int]:
    """
    Extracts full text content from a PDF file.
    Returns (cleaned_text_string, total_pages).
    Raises ValueError if PDF has no extractable text (image-only/scanned).
    """
    pages_meta = extract_pages_with_metadata(file_path)
    if not pages_meta:
        raise RuntimeError("Failed to extract pages from PDF.")

    page_count = len(pages_meta)
    extracted_texts = [p["text"] for p in pages_meta if p["text"].strip()]
    total_chars = sum(len(p) for p in extracted_texts)

    avg_chars = total_chars / page_count if page_count > 0 else 0
    if avg_chars < 50:
        logger.warning(f"Extracted average {avg_chars:.1f} characters per page from {file_path}. Likely image-only/scanned PDF.")
        raise ValueError(
            "This PDF does not contain sufficient extractable text for analysis. "
            "OCR support can be added in a future version."
        )

    full_text = "\n\n".join(extracted_texts)
    return full_text, page_count
