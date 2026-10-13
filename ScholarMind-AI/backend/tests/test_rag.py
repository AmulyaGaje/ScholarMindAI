"""
ScholarMind AI – Integration Test Suite for RAG Pipeline & Advanced AI Features
=================================================================================
Tests text chunking, embedding generation, vector similarity search, and RAG Q&A logic.
"""

import pytest
import uuid
import asyncio
from app.services.rag_service import (
    chunk_text,
    _fallback_dense_embedding,
    cosine_similarity,
    generate_embedding,
)


def test_text_chunking():
    """Verify text chunking splits text cleanly into overlapping segments."""
    sample_text = (
        "ScholarMind AI is an academic research assistant designed for students. "
        "It supports PDF paper upload, text extraction, chunking, and vector embedding storage. "
        "The system uses PostgreSQL pgvector for similarity retrieval. "
        "Students can ask grounded questions about their research papers."
    ) * 10

    chunks = chunk_text(sample_text, chunk_size=300, overlap=50)
    assert len(chunks) > 1
    assert all(len(c) > 30 for c in chunks)


def test_vector_embeddings_and_cosine_similarity():
    """Verify dense vector embedding creation and L2 cosine similarity distance logic."""
    text1 = "Deep learning and neural network models for image classification."
    text2 = "Convolutional neural networks for computer vision tasks."
    text3 = "PostgreSQL relational database schema design."

    v1 = _fallback_dense_embedding(text1)
    v2 = _fallback_dense_embedding(text2)
    v3 = _fallback_dense_embedding(text3)

    assert len(v1) == 128
    assert len(v2) == 128
    assert len(v3) == 128

    sim_related = cosine_similarity(v1, v2)
    sim_unrelated = cosine_similarity(v1, v3)

    # Related AI/CV texts should have higher similarity than unrelated DB text
    assert sim_related > sim_unrelated


@pytest.mark.asyncio
async def test_async_generate_embedding():
    """Verify async embedding generator returns non-empty float list."""
    emb = await generate_embedding("Natural Language Processing with Transformer models.")
    assert isinstance(emb, list)
    assert len(emb) > 0
    assert isinstance(emb[0], float)
