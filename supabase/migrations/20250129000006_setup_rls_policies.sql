-- ============================================
-- Build-High Database Schema Migration
-- RLS Policies: Row Level Security 정책 설정
-- Description: 모든 테이블에 대한 보안 정책 설정
-- ============================================

-- ============================================
-- profiles 테이블 RLS 정책
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사용자는 자신의 프로필 조회 가능
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 정책 2: 모든 사용자는 자신의 프로필 수정 가능
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 정책 3: 인증된 사용자는 모든 프로필 조회 가능 (공개 프로필)
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 4: 프로필 생성은 트리거에서 처리 (INSERT 정책 불필요)

-- ============================================
-- posts 테이블 RLS 정책
-- ============================================

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 게시글 조회 가능
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON posts;
CREATE POLICY "Authenticated users can view all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 2: 인증된 사용자는 게시글 작성 가능
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 정책 3: 작성자만 자신의 게시글 수정 가능
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
CREATE POLICY "Authors can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- 정책 4: 작성자만 자신의 게시글 삭제 가능
DROP POLICY IF EXISTS "Authors can delete own posts" ON posts;
CREATE POLICY "Authors can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- ============================================
-- post_views 테이블 RLS 정책
-- ============================================

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 조회 기록 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create view records" ON post_views;
CREATE POLICY "Authenticated users can create view records"
  ON post_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 정책 2: 인증된 사용자는 자신의 조회 기록 조회 가능
DROP POLICY IF EXISTS "Users can view own view records" ON post_views;
CREATE POLICY "Users can view own view records"
  ON post_views
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR true); -- 통계용으로 모든 조회 기록 조회 허용

-- ============================================
-- post_applications 테이블 RLS 정책
-- ============================================

ALTER TABLE post_applications ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 지원 내역 조회 가능 (자신의 지원 또는 자신의 게시글에 대한 지원)
DROP POLICY IF EXISTS "Users can view relevant applications" ON post_applications;
CREATE POLICY "Users can view relevant applications"
  ON post_applications
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = applicant_id OR 
    auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id)
  );

-- 정책 2: 인증된 사용자는 자신의 지원 내역 생성 가능
DROP POLICY IF EXISTS "Users can create own applications" ON post_applications;
CREATE POLICY "Users can create own applications"
  ON post_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

-- 정책 3: 지원자는 자신의 지원 내역 수정 가능 (상태 변경 등)
DROP POLICY IF EXISTS "Applicants can update own applications" ON post_applications;
CREATE POLICY "Applicants can update own applications"
  ON post_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = applicant_id);

-- 정책 4: 게시글 작성자는 자신의 게시글에 대한 지원 내역 수정 가능 (승인/거절)
DROP POLICY IF EXISTS "Post authors can update applications" ON post_applications;
CREATE POLICY "Post authors can update applications"
  ON post_applications
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id)
  );

-- ============================================
-- user_activities 테이블 RLS 정책
-- ============================================

ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- 정책 1: 인증된 사용자는 활동 기록 생성 가능
DROP POLICY IF EXISTS "Authenticated users can create activity records" ON user_activities;
CREATE POLICY "Authenticated users can create activity records"
  ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 정책 2: 인증된 사용자는 자신의 활동 기록 조회 가능
DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
CREATE POLICY "Users can view own activities"
  ON user_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR true); -- 통계용으로 모든 활동 기록 조회 허용

-- ============================================
-- common_code_master 테이블 RLS 정책
-- ============================================

ALTER TABLE common_code_master ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 공통 코드 마스터 조회 가능 (읽기 전용)
DROP POLICY IF EXISTS "Authenticated users can view common code masters" ON common_code_master;
CREATE POLICY "Authenticated users can view common code masters"
  ON common_code_master
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 2: 관리자만 공통 코드 마스터 생성/수정/삭제 가능 (향후 구현)
-- 현재는 관리자 권한 체크가 없으므로 주석 처리
-- DROP POLICY IF EXISTS "Admins can manage common code masters" ON common_code_master;
-- CREATE POLICY "Admins can manage common code masters"
--   ON common_code_master
--   FOR ALL
--   TO authenticated
--   USING (/* 관리자 권한 체크 로직 */);

-- ============================================
-- common_code_detail 테이블 RLS 정책
-- ============================================

ALTER TABLE common_code_detail ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 공통 코드 상세 조회 가능 (읽기 전용)
DROP POLICY IF EXISTS "Authenticated users can view common code details" ON common_code_detail;
CREATE POLICY "Authenticated users can view common code details"
  ON common_code_detail
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 2: 관리자만 공통 코드 상세 생성/수정/삭제 가능 (향후 구현)
-- 현재는 관리자 권한 체크가 없으므로 주석 처리
-- DROP POLICY IF EXISTS "Admins can manage common code details" ON common_code_detail;
-- CREATE POLICY "Admins can manage common code details"
--   ON common_code_detail
--   FOR ALL
--   TO authenticated
--   USING (/* 관리자 권한 체크 로직 */);
