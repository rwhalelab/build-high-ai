-- ============================================
-- Build-High Database Schema Migration
-- Table: user_activities
-- Description: 사용자 활동 로그 (주간 활성 유저 통계용)
-- ============================================

-- 사용자 활동 테이블 생성
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'post_view', 'post_create', 'post_update', 'post_delete', 'profile_update', 'application_create')),
  metadata JSONB, -- 추가 메타데이터 (예: { "post_id": "...", "category": "..." })
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_created ON user_activities(user_id, created_at DESC); -- 사용자별 활동 조회 최적화

-- 코멘트 추가
COMMENT ON TABLE user_activities IS '사용자 활동 로그 (주간 활성 유저 통계용)';
COMMENT ON COLUMN user_activities.user_id IS '활동한 사용자 ID';
COMMENT ON COLUMN user_activities.activity_type IS '활동 유형 (login, post_view, post_create, post_update, post_delete, profile_update, application_create)';
COMMENT ON COLUMN user_activities.metadata IS '추가 메타데이터 (JSONB)';
