-- ============================================
-- Build-High Database Schema Migration
-- Table: post_views
-- Description: 게시글 조회수 추적 (상세 페이지 조회 기록)
-- ============================================

-- 게시글 조회 테이블 생성
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 로그인한 사용자 (nullable)
  ip_address INET, -- IP 주소 (익명 사용자 추적용)
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_views_post_id ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_post_user ON post_views(post_id, user_id); -- 중복 조회 방지용

-- 코멘트 추가
COMMENT ON TABLE post_views IS '게시글 조회수 추적 (상세 페이지 조회 기록)';
COMMENT ON COLUMN post_views.post_id IS '조회된 게시글 ID';
COMMENT ON COLUMN post_views.user_id IS '조회한 사용자 ID (로그인한 경우, nullable)';
COMMENT ON COLUMN post_views.ip_address IS 'IP 주소 (익명 사용자 추적용)';
COMMENT ON COLUMN post_views.viewed_at IS '조회 시각';
