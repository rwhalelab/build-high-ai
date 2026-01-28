# 데이터베이스 설계 가이드

## 📋 개요

Build-High 프로젝트의 PostgreSQL 데이터베이스 스키마 및 Row Level Security (RLS) 정책을 정의합니다.

---

## 🗄️ 데이터베이스 스키마

### 1. `profiles` 테이블

**역할**: 사용자 프로필 정보 저장 (Supabase Auth와 연동)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  tech_stack TEXT[], -- 기술 스택 배열 (예: ['React', 'TypeScript', 'Node.js'])
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스
CREATE INDEX idx_profiles_tech_stack ON profiles USING GIN(tech_stack);
```

**주요 컬럼 설명:**
- `id`: Supabase Auth의 `auth.users` 테이블과 1:1 관계 (UUID)
- `username`: 사용자 이름 (선택)
- `avatar_url`: 프로필 사진 URL (선택)
- `tech_stack`: 보유 기술 스택 배열 (TEXT[])
- `created_at`, `updated_at`: 생성/수정 시간

---

### 2. `posts` 테이블

**역할**: 게시글 정보 저장 (원문 + AI 가공 데이터)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Development', 'Study', 'Project')),
  content TEXT NOT NULL, -- 본문 내용
  summary TEXT[], -- AI가 생성한 3줄 요약 (배열)
  tags JSONB, -- AI가 추출한 기술 태그 (예: ["React", "TypeScript", "Next.js", "Supabase", "Tailwind"])
  contact TEXT, -- 외부 연락처 링크 (선택)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags); -- JSONB 인덱스
```

**주요 컬럼 설명:**
- `id`: 게시글 고유 식별자 (UUID)
- `author_id`: 작성자 프로필 ID (profiles 테이블 참조)
- `title`: 게시글 제목 (최대 100자)
- `category`: 카테고리 ('Development', 'Study', 'Project' 중 하나)
- `content`: 본문 내용 (마크다운 지원 가능)
- `summary`: AI가 생성한 3줄 요약 배열 (TEXT[])
- `tags`: AI가 추출한 기술 태그 (JSONB 배열)
- `contact`: 외부 연락처 링크 (선택)
- `created_at`, `updated_at`: 생성/수정 시간

**제약 조건:**
- `title`: 최소 5자 이상 (애플리케이션 레벨 검증)
- `category`: ENUM 값만 허용
- `summary`: AI 처리 후 자동 생성 (최대 3개 요소)
- `tags`: AI 처리 후 자동 생성 (최대 5개 요소)

---

## 🔐 Row Level Security (RLS) 정책

### `profiles` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 정책 2: 모든 사용자는 자신의 프로필 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 정책 3: 인증된 사용자는 모든 프로필 조회 가능 (Phase 1: 공개 프로필)
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 4: 프로필 생성은 Supabase Auth 트리거에서 처리
-- (auth.users 생성 시 자동으로 profiles 레코드 생성)
```

**보안 원칙:**
- 사용자는 자신의 프로필만 수정 가능
- 모든 인증된 사용자는 다른 사용자 프로필 조회 가능 (공개 프로필)
- 프로필 삭제는 `auth.users` 삭제 시 CASCADE로 자동 처리

---

### `posts` 테이블 RLS

```sql
-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 게시글 조회 가능
CREATE POLICY "Authenticated users can view all posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- 정책 2: 인증된 사용자는 게시글 작성 가능
CREATE POLICY "Authenticated users can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- 정책 3: 작성자만 자신의 게시글 수정 가능
CREATE POLICY "Authors can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- 정책 4: 작성자만 자신의 게시글 삭제 가능
CREATE POLICY "Authors can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);
```

**보안 원칙:**
- 모든 인증된 사용자는 게시글 조회 가능 (공개 게시판)
- 게시글 작성은 인증된 사용자만 가능하며, `author_id`는 자동으로 현재 사용자로 설정
- 게시글 수정/삭제는 작성자만 가능

---

## 🔄 데이터베이스 함수 및 트리거

### 프로필 자동 생성 트리거

```sql
-- auth.users에 새 사용자가 생성될 때 profiles 레코드 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**동작:**
- Google 로그인 시 `auth.users`에 레코드 생성
- 트리거가 자동으로 `profiles` 테이블에 기본 프로필 생성
- `username`은 메타데이터에서 가져오거나 이메일 사용

---

## 📊 통계 쿼리 (Aggregate)

### 플랫폼 통계 조회

```sql
-- 총 게시글 수
SELECT COUNT(*) as total_posts FROM posts;

-- 총 사용자 수
SELECT COUNT(*) as total_users FROM profiles;

-- 카테고리별 게시글 수
SELECT category, COUNT(*) as count
FROM posts
GROUP BY category
ORDER BY count DESC;

-- 인기 기술 태그 (Phase 2 확장용)
SELECT tag, COUNT(*) as count
FROM posts, jsonb_array_elements_text(tags) as tag
GROUP BY tag
ORDER BY count DESC
LIMIT 10;
```

**사용 위치:**
- 메인 대시보드의 통계 카드 (`components/domain/posts/post-stats.tsx`)
- 서버 컴포넌트에서 직접 쿼리 또는 API Route 활용

---

## 🔍 검색 및 필터링 (Phase 2 확장)

### 기술 스택 기반 검색

```sql
-- 특정 기술 태그를 가진 게시글 검색
SELECT *
FROM posts
WHERE tags @> '["React"]'::jsonb;

-- 여러 기술 태그 중 하나라도 포함하는 게시글 검색
SELECT *
FROM posts
WHERE tags ?| ARRAY['React', 'TypeScript'];

-- 사용자 프로필의 기술 스택과 매칭되는 게시글 검색
SELECT p.*
FROM posts p
WHERE EXISTS (
  SELECT 1
  FROM profiles pr
  WHERE pr.id = p.author_id
    AND pr.tech_stack && (
      SELECT ARRAY(SELECT jsonb_array_elements_text(p.tags))
    )
);
```

---

## 🗂️ 데이터베이스 마이그레이션 전략

### Supabase 마이그레이션 파일 구조

```
supabase/
├── migrations/
│   ├── 20240101000000_create_profiles.sql
│   ├── 20240101000001_create_posts.sql
│   ├── 20240101000002_setup_rls_policies.sql
│   └── 20240101000003_create_triggers.sql
└── seed.sql (선택: 개발용 시드 데이터)
```

### 마이그레이션 실행 순서

1. `profiles` 테이블 생성
2. `posts` 테이블 생성
3. 인덱스 생성
4. RLS 정책 설정
5. 트리거 및 함수 생성

---

## 🔒 보안 체크리스트

- [x] 모든 테이블에 RLS 활성화
- [x] 사용자는 자신의 데이터만 수정/삭제 가능
- [x] 외래 키 제약 조건으로 데이터 정합성 보장
- [x] CASCADE 삭제로 고아 레코드 방지
- [x] 인증된 사용자만 데이터 접근 가능
- [ ] Phase 2: 민감한 정보 암호화 (필요 시)

---

## 📝 타입 생성

### Supabase 타입 자동 생성

```bash
# Supabase CLI로 타입 생성
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

**생성된 타입 사용:**
```typescript
import { Database } from '@/types/database';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];
```

---

## 🚀 Phase 2 확장 계획

### 추가될 테이블

1. **`messages`**: 1:1 채팅 메시지
2. **`notifications`**: 알림 관리
3. **`project_applications`**: 프로젝트 지원 내역
4. **`media`**: 업로드된 이미지 메타데이터

### 추가될 기능

- 실시간 구독 (Supabase Realtime)
- 파일 스토리지 (Supabase Storage)
- 풀텍스트 검색 (PostgreSQL Full-Text Search)

---

## 📚 참고 자료

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSONB 문서](https://www.postgresql.org/docs/current/datatype-json.html)
- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/cli/local-development#database-migrations)
