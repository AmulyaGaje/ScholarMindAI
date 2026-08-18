-- =============================================================================
-- ScholarMind AI – Database Seed / Initialization Script
-- This runs automatically on Docker first startup
-- =============================================================================

-- Run schema first
\i /docker-entrypoint-initdb.d/schema.sql

-- =============================================================================
-- SEED DATA – Demo User
-- Password: Scholar@123 (bcrypt hashed)
-- =============================================================================
INSERT INTO users (
    id, email, username, full_name, hashed_password, bio, institution, is_active, is_verified
) VALUES (
    uuid_generate_v4(),
    'demo@scholarmind.ai',
    'demo_user',
    'Demo Researcher',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFb7pLNs3k6BGBW',  -- Scholar@123
    'B.Tech Computer Science Student | AI Research Enthusiast',
    'Indian Institute of Technology',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- SEED DATA – Demo Projects
-- =============================================================================
WITH demo_user AS (SELECT id FROM users WHERE email = 'demo@scholarmind.ai')
INSERT INTO projects (user_id, name, description, color, icon)
SELECT
    demo_user.id,
    name, description, color, icon
FROM demo_user,
(VALUES
    ('Deep Learning Research', 'Collection of papers on neural networks and deep learning architectures', '#6366f1', 'brain'),
    ('NLP & Transformers', 'Research papers related to BERT, GPT, and transformer models', '#8b5cf6', 'file-text'),
    ('Computer Vision', 'Papers on image recognition, object detection, and visual understanding', '#06b6d4', 'image')
) AS v(name, description, color, icon)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- NOTE
-- Actual paper uploads are done through the application.
-- File paths are managed by the backend service.
-- This seed only creates structural/user data.
-- =============================================================================

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO scholarmind_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO scholarmind_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO scholarmind_user;
