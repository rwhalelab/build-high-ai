-- ============================================
-- Build-High Database Schema Migration
-- Table: post_applications
-- Description: 프로젝트 지원/매칭 내역 (통계 카드의 "매칭 완료" 집계용)
-- ============================================

-- 게시글 지원 테이블 생성
CREATE TABLE IF NOT EXISTS post_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message TEXT, -- 지원 메시지 (선택)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 한 사용자는 한 게시글에 한 번만 지원 가능
  UNIQUE(post_id, applicant_id)
);

-- post_applications 테이블의 updated_at 트리거
CREATE TRIGGER update_post_applications_updated_at
  BEFORE UPDATE ON post_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_applications_post_id ON post_applications(post_id);
CREATE INDEX IF NOT EXISTS idx_post_applications_applicant_id ON post_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_post_applications_status ON post_applications(status);
CREATE INDEX IF NOT EXISTS idx_post_applications_created_at ON post_applications(created_at DESC);

-- 코멘트 추가
COMMENT ON TABLE post_applications IS '프로젝트 지원/매칭 내역 (통계 카드의 "매칭 완료" 집계용)';
COMMENT ON COLUMN post_applications.post_id IS '지원한 게시글 ID';
COMMENT ON COLUMN post_applications.applicant_id IS '지원자 프로필 ID';
COMMENT ON COLUMN post_applications.status IS '지원 상태 (pending, accepted, rejected, withdrawn)';
COMMENT ON COLUMN post_applications.message IS '지원 메시지 (선택)';
