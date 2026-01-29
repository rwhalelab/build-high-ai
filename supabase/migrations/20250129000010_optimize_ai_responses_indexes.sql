-- ============================================
-- Build-High Database Schema Migration
-- Table: ai_responses
-- Description: 캐싱 성능 최적화를 위한 인덱스 추가
-- ============================================

-- 기존 HASH 인덱스 제거 (정확 일치만 가능하여 제한적)
DROP INDEX IF EXISTS idx_ai_responses_prompt_hash;

-- 복합 인덱스 추가: 캐싱 쿼리 최적화
-- (category, created_at DESC, user_id) 순서로 인덱스 생성
-- 이 순서는 getCachedAIResponse 함수의 쿼리 패턴과 일치
CREATE INDEX IF NOT EXISTS idx_ai_responses_category_created_user 
  ON ai_responses(category, created_at DESC, user_id);

-- prompt 텍스트 검색을 위한 인덱스 (대소문자 무시 검색 최적화)
-- lower(prompt) 함수 기반 인덱스로 정확 일치 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_ai_responses_prompt_lower 
  ON ai_responses(LOWER(TRIM(prompt)));

-- 복합 인덱스: category + lower(prompt) 조합 (정확 일치 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_ai_responses_category_prompt_lower 
  ON ai_responses(category, LOWER(TRIM(prompt)));

-- 코멘트 추가
COMMENT ON INDEX idx_ai_responses_category_created_user IS 
  '캐싱 쿼리 최적화: category, created_at DESC, user_id 복합 인덱스';
COMMENT ON INDEX idx_ai_responses_prompt_lower IS 
  'prompt 정확 일치 검색 최적화: 대소문자 무시 검색';
COMMENT ON INDEX idx_ai_responses_category_prompt_lower IS 
  'category + prompt 정확 일치 검색 최적화';
