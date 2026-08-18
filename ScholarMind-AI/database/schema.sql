-- =============================================================================
-- ScholarMind AI – PostgreSQL Database Schema
-- Version: 1.0.0
-- Stage: 1 (No AI/Vector tables yet)
-- Run: psql -U scholarmind_user -d scholarmind_db -f schema.sql
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy search

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE paper_status AS ENUM ('uploading', 'processing', 'ready', 'error');
CREATE TYPE session_type AS ENUM ('chat', 'analysis', 'summary', 'review');
CREATE TYPE upload_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE bookmark_type AS ENUM ('paper', 'project');

-- =============================================================================
-- USERS TABLE
-- Central authentication and profile table
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    username    VARCHAR(100) UNIQUE NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    hashed_password TEXT NOT NULL,
    avatar_url  TEXT,
    bio         TEXT,
    institution VARCHAR(255),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for fast email/username lookups during login
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================================================
-- PROJECTS TABLE
-- Research project workspaces owned by users
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    color       VARCHAR(7) DEFAULT '#6366f1',   -- Hex color for UI
    icon        VARCHAR(50) DEFAULT 'folder',   -- Icon name
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    paper_count INT NOT NULL DEFAULT 0,         -- Denormalized counter
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
-- Full-text search on project names
CREATE INDEX idx_projects_name_trgm ON projects USING gin(name gin_trgm_ops);

-- =============================================================================
-- PAPERS TABLE
-- Uploaded research papers (PDFs) with metadata
-- =============================================================================
CREATE TABLE IF NOT EXISTS papers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    title           VARCHAR(500) NOT NULL,
    authors         TEXT[],                     -- Array of author names
    abstract        TEXT,
    journal         VARCHAR(255),
    year            INT,
    doi             VARCHAR(255),
    tags            TEXT[] DEFAULT '{}',
    file_name       VARCHAR(500) NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       BIGINT NOT NULL,            -- Size in bytes
    page_count      INT,
    mime_type       VARCHAR(100) DEFAULT 'application/pdf',
    status          paper_status NOT NULL DEFAULT 'ready',
    is_bookmarked   BOOLEAN NOT NULL DEFAULT FALSE,
    view_count      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_papers_user_id ON papers(user_id);
CREATE INDEX idx_papers_project_id ON papers(project_id);
CREATE INDEX idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX idx_papers_status ON papers(status);
-- Full-text search on title and abstract
CREATE INDEX idx_papers_title_trgm ON papers USING gin(title gin_trgm_ops);
CREATE INDEX idx_papers_tags ON papers USING gin(tags);

-- =============================================================================
-- UPLOADS TABLE
-- Audit log for all file uploads
-- =============================================================================
CREATE TABLE IF NOT EXISTS uploads (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id            UUID REFERENCES papers(id) ON DELETE SET NULL,
    original_filename   VARCHAR(500) NOT NULL,
    stored_filename     VARCHAR(500) NOT NULL,
    file_path           TEXT NOT NULL,
    file_size           BIGINT NOT NULL,
    mime_type           VARCHAR(100),
    upload_status       upload_status NOT NULL DEFAULT 'completed',
    error_message       TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_paper_id ON uploads(paper_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);

-- =============================================================================
-- HISTORY_SESSIONS TABLE
-- Chat/interaction history grouped into sessions (like ChatGPT history)
-- =============================================================================
CREATE TABLE IF NOT EXISTS history_sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id    UUID REFERENCES papers(id) ON DELETE SET NULL,
    project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
    title       VARCHAR(500) NOT NULL DEFAULT 'Untitled Session',
    session_type session_type NOT NULL DEFAULT 'chat',
    message_count INT NOT NULL DEFAULT 0,
    is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_user_id ON history_sessions(user_id);
CREATE INDEX idx_history_created_at ON history_sessions(created_at DESC);
CREATE INDEX idx_history_paper_id ON history_sessions(paper_id);
CREATE INDEX idx_history_title_trgm ON history_sessions USING gin(title gin_trgm_ops);

-- =============================================================================
-- BOOKMARKS TABLE
-- Users can bookmark papers and projects
-- =============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id    UUID REFERENCES papers(id) ON DELETE CASCADE,
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    note        TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- Ensure user doesn't bookmark the same item twice
    CONSTRAINT uq_bookmark_paper UNIQUE (user_id, paper_id),
    CONSTRAINT uq_bookmark_project UNIQUE (user_id, project_id),
    -- At least one of paper_id or project_id must be set
    CONSTRAINT ck_bookmark_target CHECK (
        (paper_id IS NOT NULL AND project_id IS NULL) OR
        (paper_id IS NULL AND project_id IS NOT NULL)
    )
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_paper_id ON bookmarks(paper_id);
CREATE INDEX idx_bookmarks_project_id ON bookmarks(project_id);

-- =============================================================================
-- PAPER_PROJECT_ASSOCIATIONS TABLE
-- Papers can belong to multiple projects (many-to-many)
-- =============================================================================
CREATE TABLE IF NOT EXISTS paper_project_associations (
    paper_id    UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    added_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (paper_id, project_id)
);

CREATE INDEX idx_ppa_paper_id ON paper_project_associations(paper_id);
CREATE INDEX idx_ppa_project_id ON paper_project_associations(project_id);

-- =============================================================================
-- TRIGGER: Auto-update updated_at timestamps
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papers_updated_at
    BEFORE UPDATE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_history_updated_at
    BEFORE UPDATE ON history_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TRIGGER: Maintain project paper_count
-- =============================================================================
CREATE OR REPLACE FUNCTION update_project_paper_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE projects SET paper_count = paper_count + 1
        WHERE id = NEW.project_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects SET paper_count = GREATEST(paper_count - 1, 0)
        WHERE id = OLD.project_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        IF OLD.project_id IS NOT NULL THEN
            UPDATE projects SET paper_count = GREATEST(paper_count - 1, 0)
            WHERE id = OLD.project_id;
        END IF;
        IF NEW.project_id IS NOT NULL THEN
            UPDATE projects SET paper_count = paper_count + 1
            WHERE id = NEW.project_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER maintain_project_paper_count
    AFTER INSERT OR UPDATE OR DELETE ON papers
    FOR EACH ROW EXECUTE FUNCTION update_project_paper_count();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- User dashboard stats view
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id AS user_id,
    COUNT(DISTINCT p.id)        AS total_papers,
    COUNT(DISTINCT pr.id)       AS total_projects,
    COALESCE(SUM(p.file_size), 0) AS total_storage_bytes,
    COUNT(DISTINCT CASE
        WHEN p.created_at >= NOW() - INTERVAL '7 days'
        THEN p.id END)          AS recent_uploads_week
FROM users u
LEFT JOIN papers p ON p.user_id = u.id
LEFT JOIN projects pr ON pr.user_id = u.id AND pr.is_archived = FALSE
GROUP BY u.id;

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE users IS 'Platform users with authentication credentials';
COMMENT ON TABLE projects IS 'Research project workspaces grouping related papers';
COMMENT ON TABLE papers IS 'Uploaded research paper PDFs with extracted metadata';
COMMENT ON TABLE uploads IS 'Audit trail for all file upload operations';
COMMENT ON TABLE history_sessions IS 'User interaction history sessions (ChatGPT-style)';
COMMENT ON TABLE bookmarks IS 'User bookmarks for papers and projects';
COMMENT ON TABLE paper_project_associations IS 'Many-to-many relationship between papers and projects';
