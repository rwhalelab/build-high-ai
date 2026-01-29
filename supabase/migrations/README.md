# Build-High Database Migrations

이 폴더에는 Supabase 데이터베이스 마이그레이션 파일들이 포함되어 있습니다.

## 마이그레이션 실행 순서

마이그레이션 파일들은 타임스탬프 순서대로 실행되어야 합니다:

1. `20250129000000_create_profiles.sql` - 프로필 테이블 생성
2. `20250129000001_create_posts.sql` - 게시글 테이블 생성
3. `20250129000002_create_post_views.sql` - 조회수 추적 테이블 생성
4. `20250129000003_create_post_applications.sql` - 지원/매칭 내역 테이블 생성
5. `20250129000004_create_user_activities.sql` - 사용자 활동 로그 테이블 생성
6. `20250129000007_create_common_codes.sql` - 공통 코드 마스터/상세 테이블 생성
7. `20250129000008_update_contact_fields.sql` - 게시글 연락처 필드 업데이트
8. `20250129000009_create_ai_responses.sql` - AI 응답 저장 테이블 생성 ⭐ NEW
9. `20250129000005_create_triggers.sql` - 트리거 함수 생성
10. `20250129000006_setup_rls_policies.sql` - RLS 정책 설정 (공통 코드 테이블 포함)

## Supabase에서 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard 사용
1. Supabase Dashboard → SQL Editor로 이동
2. 각 마이그레이션 파일의 내용을 순서대로 복사하여 실행

### 방법 2: Supabase CLI 사용 (로컬 개발)
```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트 초기화 (최초 1회)
supabase init

# 로컬 Supabase 시작
supabase start

# 마이그레이션 적용
supabase db reset
```

### 방법 3: 원격 프로젝트에 직접 적용
```bash
# Supabase 프로젝트에 연결
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

## 데이터베이스 스키마 개요

### 테이블 목록
- `profiles` - 사용자 프로필 정보
- `posts` - 게시글 정보 (원문 + AI 가공 데이터)
- `post_views` - 게시글 조회수 추적
- `post_applications` - 프로젝트 지원/매칭 내역
- `user_activities` - 사용자 활동 로그
- `common_code_master` - 공통 코드 마스터 (시스템 전역 코드 그룹)
- `common_code_detail` - 공통 코드 상세 (마스터 코드에 속하는 개별 코드 값)
- `ai_responses` - AI 응답 저장 테이블 (비용 절감을 위한 캐싱) ⭐ NEW

### 주요 기능
- **RLS (Row Level Security)**: 모든 테이블에 보안 정책 적용
- **자동 타임스탬프**: `updated_at` 자동 업데이트 트리거
- **프로필 자동 생성**: Google 로그인 시 프로필 자동 생성 트리거
- **인덱스 최적화**: 검색 및 조회 성능 최적화를 위한 인덱스

## 주의사항

⚠️ **프로덕션 환경에 적용하기 전에 반드시 백업을 수행하세요.**

⚠️ 마이그레이션 파일은 순서대로 실행되어야 하며, 이미 실행된 마이그레이션은 다시 실행하지 마세요.

## 시드 데이터 (선택사항)

초기 데이터 세팅을 위해 `docs/seed_data.sql` 파일을 사용할 수 있습니다:
- 공통 코드 마스터/상세 데이터
- 테스트용 유저 프로필 (5명)
- 테스트용 게시글 데이터 (9개)

**주의**: `profiles` 테이블은 `auth.users`와 연동되므로, 시드 데이터 실행 전에 Supabase Auth에 유저를 먼저 생성해야 합니다.
