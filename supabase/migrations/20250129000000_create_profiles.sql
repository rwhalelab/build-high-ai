-- ============================================
-- Build-High Database Schema Migration
-- Table: profiles
-- Description: 사용자 프로필 정보 저장 (Supabase Auth와 연동)
-- ============================================

-- 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  tech_stack TEXT[], -- 기술 스택 배열 (예: ['React', 'TypeScript', 'Node.js'])
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블의 updated_at 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_tech_stack ON profiles USING GIN(tech_stack);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- 코멘트 추가
COMMENT ON TABLE profiles IS '사용자 프로필 정보 저장 (Supabase Auth와 연동)';
COMMENT ON COLUMN profiles.id IS 'Supabase Auth의 auth.users 테이블과 1:1 관계 (UUID)';
COMMENT ON COLUMN profiles.username IS '사용자 이름 (선택)';
COMMENT ON COLUMN profiles.avatar_url IS '프로필 사진 URL (선택)';
COMMENT ON COLUMN profiles.tech_stack IS '보유 기술 스택 배열 (TEXT[])';
