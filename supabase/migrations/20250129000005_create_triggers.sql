-- ============================================
-- Build-High Database Schema Migration
-- Triggers: 프로필 자동 생성 및 기타 트리거
-- Description: auth.users 생성 시 profiles 레코드 자동 생성
-- ============================================

-- 프로필 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때 profiles 레코드 자동 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 코멘트 추가
COMMENT ON FUNCTION public.handle_new_user() IS 'Google 로그인 시 auth.users에 레코드 생성 시 profiles 테이블에 기본 프로필 자동 생성';
