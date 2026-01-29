-- ============================================
-- Build-High Database Schema Migration
-- Table: ai_responses
-- Description: AI 응답 저장 테이블 (비용 절감을 위한 캐싱)
-- ============================================

-- AI 응답 테이블 생성
CREATE TABLE IF NOT EXISTS ai_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL, -- 사용자 질문
  response TEXT NOT NULL, -- AI 응답
  category TEXT NOT NULL, -- 기능 카테고리 (예: 'chat', 'summary', 'tag_extraction')
  tokens_used INTEGER, -- 사용된 토큰 수 (선택)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 트리거 생성
-- 참고: update_updated_at_column() 함수는 20250129000000_create_profiles.sql에서 이미 생성됨
CREATE TRIGGER update_ai_responses_updated_at
  BEFORE UPDATE ON ai_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ai_responses_user_id ON ai_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_category ON ai_responses(category);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_responses_prompt_hash ON ai_responses USING hash(prompt); -- 동일 질문 검색 최적화

-- 코멘트 추가
COMMENT ON TABLE ai_responses IS 'AI 응답 저장 테이블 (비용 절감을 위한 캐싱)';
COMMENT ON COLUMN ai_responses.id IS '응답 고유 식별자 (UUID)';
COMMENT ON COLUMN ai_responses.user_id IS '사용자 ID (선택, NULL 가능)';
COMMENT ON COLUMN ai_responses.prompt IS '사용자 질문 (프롬프트)';
COMMENT ON COLUMN ai_responses.response IS 'AI 응답 내용';
COMMENT ON COLUMN ai_responses.category IS '기능 카테고리 (chat, summary, tag_extraction 등)';
COMMENT ON COLUMN ai_responses.tokens_used IS '사용된 토큰 수 (비용 추적용)';

-- ============================================
-- RLS Policies: Row Level Security 정책 설정
-- ============================================

ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 자신의 AI 응답 조회 가능
DROP POLICY IF EXISTS "Users can view own AI responses" ON ai_responses;
CREATE POLICY "Users can view own AI responses"
  ON ai_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- 정책 2: 인증된 사용자는 AI 응답 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create AI responses" ON ai_responses;
CREATE POLICY "Authenticated users can create AI responses"
  ON ai_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 정책 3: 사용자는 자신의 AI 응답만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own AI responses" ON ai_responses;
CREATE POLICY "Users can delete own AI responses"
  ON ai_responses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
