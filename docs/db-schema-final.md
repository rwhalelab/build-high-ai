# Build-High 최종 데이터베이스 스키마 설계서

## 📋 개요

이 문서는 Build-High 프로젝트의 최종 데이터베이스 스키마 설계서입니다.
실제 UI 컴포넌트와 PRD를 모두 분석하여 설계되었습니다.

**생성일**: 2025-01-29
**버전**: 1.0.0

---

## 🗄️ 데이터베이스 스키마

### 1. `profiles` 테이블

**역할**: 사용자 프로필 정보 저장 (Supabase Auth와 연동)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  tech_stack TEXT[], -- 기술 스택 배열
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주요 컬럼:**
- `id`: Supabase Auth의 `auth.users` 테이블과 1:1 관계 (UUID)
- `username`: 사용자 이름 (선택)
- `avatar_url`: 프로필 사진 URL (선택)
- `tech_stack`: 보유 기술 스택 배열 (TEXT[])
- `created_at`, `updated_at`: 생성/수정 시간

**인덱스:**
- `idx_profiles_tech_stack`: GIN 인덱스 (배열 검색 최적화)
- `idx_profiles_created_at`: 생성일 기준 정렬 최적화

---

### 2. `posts` 테이블

**역할**: 게시글 정보 저장 (원문 + AI 가공 데이터)

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Development', 'Study', 'Project')),
  content TEXT NOT NULL,
  summary TEXT[], -- AI가 생성한 3줄 요약
  tags TEXT[], -- AI가 추출한 기술 태그 배열
  contact TEXT, -- 외부 연락처 링크 (선택, 하위 호환성 유지 - 향후 제거 예정)
  phone TEXT, -- 전화번호 (선택)
  email TEXT, -- 이메일 주소 (선택)
  contact_url TEXT, -- 연락처 URL (Discord, Telegram 등, 선택)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주요 컬럼:**
- `id`: 게시글 고유 식별자 (UUID)
- `author_id`: 작성자 프로필 ID
- `title`: 게시글 제목 (최대 100자)
- `category`: 카테고리 ('Development', 'Study', 'Project')
- `content`: 본문 내용 (마크다운 지원)
- `summary`: AI가 생성한 3줄 요약 배열 (TEXT[])
- `tags`: AI가 추출한 기술 태그 배열 (TEXT[]) - **JSONB에서 TEXT[]로 변경**
- `contact`: 외부 연락처 링크 (선택, 하위 호환성 유지 - 향후 제거 예정)
- `phone`: 전화번호 (선택)
- `email`: 이메일 주소 (선택)
- `contact_url`: 연락처 URL (Discord, Telegram 등, 선택)

**인덱스:**
- `idx_posts_author_id`: 작성자별 조회 최적화
- `idx_posts_category`: 카테고리별 필터링 최적화
- `idx_posts_created_at`: 최신순 정렬 최적화
- `idx_posts_tags`: GIN 인덱스 (태그 검색 최적화)

---

### 3. `post_views` 테이블 ⭐ NEW

**역할**: 게시글 조회수 추적 (상세 페이지 조회 기록)

```sql
CREATE TABLE post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address INET,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주요 컬럼:**
- `id`: 조회 기록 고유 ID
- `post_id`: 조회된 게시글 ID
- `user_id`: 조회한 사용자 ID (로그인한 경우, nullable)
- `ip_address`: IP 주소 (익명 사용자 추적용)
- `viewed_at`: 조회 시각

**용도:**
- 게시글 조회수 집계
- 인기 게시글 통계
- 사용자별 조회 이력 추적

---

### 4. `post_applications` 테이블 ⭐ NEW

**역할**: 프로젝트 지원/매칭 내역 (통계 카드의 "매칭 완료" 집계용)

```sql
CREATE TABLE post_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, applicant_id) -- 한 사용자는 한 게시글에 한 번만 지원 가능
);
```

**주요 컬럼:**
- `id`: 지원 내역 고유 ID
- `post_id`: 지원한 게시글 ID
- `applicant_id`: 지원자 프로필 ID
- `status`: 지원 상태 ('pending', 'accepted', 'rejected', 'withdrawn')
- `message`: 지원 메시지 (선택)

**용도:**
- 통계 카드의 "매칭 완료" 집계
- 지원 내역 관리
- 게시글 작성자의 지원 승인/거절

---

### 5. `user_activities` 테이블 ⭐ NEW

**역할**: 사용자 활동 로그 (주간 활성 유저 통계용)

```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'login', 'post_view', 'post_create', 'post_update', 
      'post_delete', 'profile_update', 'application_create'
    )
  ),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주요 컬럼:**
- `id`: 활동 기록 고유 ID
- `user_id`: 활동한 사용자 ID
- `activity_type`: 활동 유형
- `metadata`: 추가 메타데이터 (JSONB) - 예: `{ "post_id": "...", "category": "..." }`
- `created_at`: 활동 시각

**용도:**
- 통계 카드의 "주간 활성 유저" 집계
- 사용자 활동 추적
- 분석 및 모니터링

---

### 6. `common_code_master` 테이블 ⭐ NEW

**역할**: 공통 코드 마스터 정보 저장 (시스템 전역에서 사용되는 코드 그룹)

```sql
CREATE TABLE common_code_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE, -- 마스터 코드 (예: BH_ST_APPLICATION)
  name VARCHAR(100) NOT NULL, -- 마스터 코드명 (예: 신청 상태)
  description TEXT, -- 설명
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**주요 컬럼:**
- `id`: 마스터 코드 고유 식별자 (UUID)
- `code`: 마스터 코드 (예: `BH_ST_APPLICATION`, `BH_USER_ROLE`)
- `name`: 마스터 코드명 (예: "신청 상태", "유저 권한")
- `description`: 마스터 코드 설명
- `created_at`, `updated_at`: 생성/수정 시간

**인덱스:**
- `idx_common_code_master_code`: 마스터 코드 기준 조회 최적화

**용도:**
- 시스템 전역에서 사용되는 코드 그룹 관리
- 신청 상태, 유저 권한 등 마스터 데이터 관리

**예시 데이터:**
- `BH_ST_APPLICATION`: 신청 상태
- `BH_USER_ROLE`: 유저 권한

---

### 7. `common_code_detail` 테이블 ⭐ NEW

**역할**: 공통 코드 상세 정보 저장 (마스터 코드에 속하는 개별 코드 값)

```sql
CREATE TABLE common_code_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_code VARCHAR(50) NOT NULL REFERENCES common_code_master(code) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL, -- 상세 코드 (예: PENDING)
  name VARCHAR(100) NOT NULL, -- 상세 코드명 (예: 대기중)
  description TEXT, -- 설명
  sort_order INTEGER DEFAULT 0, -- 정렬 순서
  is_active BOOLEAN DEFAULT TRUE, -- 사용 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(master_code, code) -- 마스터 코드와 상세 코드 조합은 유일해야 함
);
```

**주요 컬럼:**
- `id`: 상세 코드 고유 식별자 (UUID)
- `master_code`: 마스터 코드 참조 (외래 키)
- `code`: 상세 코드 (예: `PENDING`, `APPROVED`, `REJECTED`)
- `name`: 상세 코드명 (예: "대기중", "승인됨", "거절됨")
- `description`: 상세 코드 설명
- `sort_order`: 정렬 순서 (낮을수록 먼저 표시)
- `is_active`: 사용 여부 (false인 경우 비활성화)
- `created_at`, `updated_at`: 생성/수정 시간

**인덱스:**
- `idx_common_code_detail_master_code`: 마스터 코드 기준 조회 최적화
- `idx_common_code_detail_code`: 상세 코드 기준 조회 최적화
- `idx_common_code_detail_is_active`: 활성화 여부 필터링 최적화
- `idx_common_code_detail_sort_order`: 정렬 순서 기준 조회 최적화

**용도:**
- 마스터 코드에 속하는 개별 코드 값 관리
- 드롭다운, 선택 옵션 등 UI 컴포넌트에서 사용

**예시 데이터:**
- `BH_ST_APPLICATION` 마스터의 상세 코드:
  - `PENDING`: 대기중 (sort_order: 1)
  - `APPROVED`: 승인됨 (sort_order: 2)
  - `REJECTED`: 거절됨 (sort_order: 3)
  - `WITHDRAWN`: 철회됨 (sort_order: 4)
- `BH_USER_ROLE` 마스터의 상세 코드:
  - `ADMIN`: 관리자 (sort_order: 1)
  - `MEMBER`: 일반 회원 (sort_order: 2)
  - `GUEST`: 게스트 (sort_order: 3)
  - `PREMIUM`: 프리미엄 회원 (sort_order: 4)

---

## 🔐 Row Level Security (RLS) 정책

모든 테이블에 RLS가 활성화되어 있으며, 다음 정책들이 적용됩니다:

### `profiles` 테이블
- ✅ 모든 사용자는 자신의 프로필 조회/수정 가능
- ✅ 인증된 사용자는 모든 프로필 조회 가능 (공개 프로필)

### `posts` 테이블
- ✅ 모든 인증된 사용자는 게시글 조회 가능
- ✅ 인증된 사용자는 게시글 작성 가능 (자신의 ID로만)
- ✅ 작성자만 자신의 게시글 수정/삭제 가능

### `post_views` 테이블
- ✅ 인증된 사용자는 조회 기록 생성 가능
- ✅ 통계용으로 모든 조회 기록 조회 허용

### `post_applications` 테이블
- ✅ 지원자와 게시글 작성자는 관련 지원 내역 조회 가능
- ✅ 인증된 사용자는 자신의 지원 내역 생성 가능
- ✅ 지원자는 자신의 지원 내역 수정 가능
- ✅ 게시글 작성자는 자신의 게시글에 대한 지원 내역 수정 가능 (승인/거절)

### `user_activities` 테이블
- ✅ 인증된 사용자는 활동 기록 생성 가능
- ✅ 통계용으로 모든 활동 기록 조회 허용

### `common_code_master` 테이블
- ✅ 모든 인증된 사용자는 공통 코드 마스터 조회 가능 (읽기 전용)
- ⏳ 생성/수정/삭제는 관리자 권한 필요 (향후 구현)

### `common_code_detail` 테이블
- ✅ 모든 인증된 사용자는 공통 코드 상세 조회 가능 (읽기 전용)
- ⏳ 생성/수정/삭제는 관리자 권한 필요 (향후 구현)

---

## 🔄 트리거 및 함수

### 1. `update_updated_at_column()` 함수
- 모든 테이블의 `updated_at` 컬럼을 자동으로 업데이트

### 2. `handle_new_user()` 함수
- Google 로그인 시 `auth.users`에 레코드 생성 시
- `profiles` 테이블에 기본 프로필 자동 생성

---

## 📊 통계 쿼리 예시

### 총 게시글 수
```sql
SELECT COUNT(*) as total_posts FROM posts;
```

### 총 사용자 수
```sql
SELECT COUNT(*) as total_users FROM profiles;
```

### 매칭 완료 수 (통계 카드용)
```sql
SELECT COUNT(*) as total_matches 
FROM post_applications 
WHERE status = 'accepted';
```

### 주간 활성 유저 수 (통계 카드용)
```sql
SELECT COUNT(DISTINCT user_id) as weekly_active_users
FROM user_activities
WHERE created_at >= NOW() - INTERVAL '7 days';
```

### 카테고리별 게시글 수
```sql
SELECT category, COUNT(*) as count
FROM posts
GROUP BY category
ORDER BY count DESC;
```

### 게시글 조회수 집계
```sql
SELECT post_id, COUNT(*) as view_count
FROM post_views
GROUP BY post_id
ORDER BY view_count DESC;
```

---

## 🚀 마이그레이션 실행

마이그레이션 파일은 `supabase/migrations/` 폴더에 있으며, 다음 순서로 실행해야 합니다:

1. `20250129000000_create_profiles.sql`
2. `20250129000001_create_posts.sql`
3. `20250129000002_create_post_views.sql`
4. `20250129000003_create_post_applications.sql`
5. `20250129000004_create_user_activities.sql`
6. `20250129000007_create_common_codes.sql`
7. `20250129000008_update_contact_fields.sql` ⭐ NEW (posts 테이블 연락처 필드 세분화)
8. `20250129000005_create_triggers.sql`
9. `20250129000006_setup_rls_policies.sql`

자세한 실행 방법은 `supabase/migrations/README.md`를 참조하세요.

---

## 📝 변경 사항

### 주요 변경점
1. **tags 필드 타입 변경**: `JSONB` → `TEXT[]` (코드에서 string[]로 사용하므로)
2. **contact 필드 세분화**: `contact TEXT` → `phone TEXT`, `email TEXT`, `contact_url TEXT` (기존 contact 필드는 하위 호환성 유지)
3. **새로운 테이블 추가**: 
   - `post_views` - 조회수 추적
   - `post_applications` - 지원/매칭 내역
   - `user_activities` - 사용자 활동 로그
   - `common_code_master` - 공통 코드 마스터
   - `common_code_detail` - 공통 코드 상세

### 설계 원칙
- ✅ 실제 UI 컴포넌트가 요구하는 데이터 구조 우선
- ✅ PRD 요구사항과 코드 구현의 균형
- ✅ 확장 가능한 구조 (Phase 2 기능 대비)
- ✅ 보안 최우선 (모든 테이블에 RLS 적용)

---

## 🔗 관련 문서

- [PRD.md](./PRD.md) - 제품 요구사항 정의서
- [FLOW.md](./FLOW.md) - 서비스 흐름도
- [supabase/migrations/README.md](../supabase/migrations/README.md) - 마이그레이션 실행 가이드
