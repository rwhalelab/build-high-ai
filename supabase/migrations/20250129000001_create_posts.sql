-- ============================================
-- Build-High Database Schema Migration
-- Table: posts
-- Description: 게시글 정보 저장 (원문 + AI 가공 데이터)
-- ============================================

-- 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Development', 'Study', 'Project')),
  content TEXT NOT NULL, -- 본문 내용
  summary TEXT[], -- AI가 생성한 3줄 요약 (배열)
  tags TEXT[], -- AI가 추출한 기술 태그 배열 (TEXT[]로 변경: JSONB보다 간단하고 효율적)
  contact TEXT, -- 외부 연락처 링크 (선택)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- posts 테이블의 updated_at 트리거
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags); -- GIN 인덱스로 배열 검색 최적화

-- 코멘트 추가
COMMENT ON TABLE posts IS '게시글 정보 저장 (원문 + AI 가공 데이터)';
COMMENT ON COLUMN posts.id IS '게시글 고유 식별자 (UUID)';
COMMENT ON COLUMN posts.author_id IS '작성자 프로필 ID (profiles 테이블 참조)';
COMMENT ON COLUMN posts.title IS '게시글 제목 (최대 100자)';
COMMENT ON COLUMN posts.category IS '카테고리 (Development, Study, Project 중 하나)';
COMMENT ON COLUMN posts.content IS '본문 내용 (마크다운 지원 가능)';
COMMENT ON COLUMN posts.summary IS 'AI가 생성한 3줄 요약 배열 (TEXT[])';
COMMENT ON COLUMN posts.tags IS 'AI가 추출한 기술 태그 배열 (TEXT[])';
COMMENT ON COLUMN posts.contact IS '외부 연락처 링크 (선택)';
