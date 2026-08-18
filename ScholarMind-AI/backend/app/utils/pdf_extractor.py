"""
ScholarMind AI – PDF Text Extractor Utility
============================================
Extracts clean plain text from uploaded PDF files using PyMuPDF (fitz) or pypdf fallback.
Returns a tuple of (extracted_text, page_count).
Raises ValueError for scanned/image-only PDFs with no extractable text.
"""

import os
import logging

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


def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
    """
    Extracts text content from a PDF file.
    Returns (cleaned_text_string, total_pages).
    Raises ValueError if PDF has no extractable text (image-only/scanned).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found at path: {file_path}")

    extracted_pages = []
    page_count = 0

    if HAS_PYMUPDF:
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                text = page.get_text("text")
                extracted_pages.append(text or "")
            doc.close()
            logger.info(f"PyMuPDF extracted {len(extracted_pages)} pages from {file_path}")
        except Exception as e:
            logger.warning(f"PyMuPDF failed, falling back: {e}")
            extracted_pages = []

    if not extracted_pages and HAS_PYPDF:
        try:
            reader = PdfReader(file_path)
            page_count = len(reader.pages)
            for i in range(page_count):
                text = reader.pages[i].extract_text()
                extracted_pages.append(text or "")
            logger.info(f"pypdf extracted {len(extracted_pages)} pages from {file_path}")
        except Exception as e:
            logger.error(f"pypdf failed: {e}")

    if not page_count and not extracted_pages:
        raise RuntimeError("No PDF extraction library available or failed to read PDF.")

    # Calculate average characters per page to detect scanned/image-only PDFs
    non_empty_pages = [p.strip() for p in extracted_pages if p.strip()]
    total_chars = sum(len(p) for p in non_empty_pages)
    
    if page_count > 0:
        avg_chars = total_chars / page_count
    else:
        avg_chars = 0

    if avg_chars < 50:
        logger.warning(f"Extracted average {avg_chars:.1f} characters per page from {file_path}. Likely image-only/scanned PDF.")
        raise ValueError(
            "This PDF does not contain sufficient extractable text for analysis. "
            "OCR support can be added in a future version."
        )

    full_text = "\n\n".join(non_empty_pages)
    return full_text, page_count
