# 데이터베이스 스키마 설계 작업 변경 내역

**작업일**: 2025-01-29  
**작업 내용**: 실제 UI 컴포넌트와 PRD 분석 기반 최적의 Supabase DB 스키마 설계

---

## 📁 생성된 파일 (신규)

### SQL 마이그레이션 파일 (`supabase/migrations/`)

1. **`20250129000000_create_profiles.sql`**
   - 프로필 테이블 생성
   - 인덱스 및 트리거 설정
   - 42줄

2. **`20250129000001_create_posts.sql`**
   - 게시글 테이블 생성
   - tags 필드를 TEXT[] 타입으로 설정 (JSONB에서 변경)
   - 인덱스 및 트리거 설정
   - 43줄

3. **`20250129000002_create_post_views.sql`**
   - 게시글 조회수 추적 테이블 생성
   - 조회 기록 저장을 위한 스키마
   - 28줄

4. **`20250129000003_create_post_applications.sql`**
   - 프로젝트 지원/매칭 내역 테이블 생성
   - 통계 카드의 "매칭 완료" 집계용
   - 39줄

5. **`20250129000004_create_user_activities.sql`**
   - 사용자 활동 로그 테이블 생성
   - 주간 활성 유저 통계용
   - 27줄

6. **`20250129000005_create_triggers.sql`**
   - 프로필 자동 생성 트리거 함수
   - updated_at 자동 업데이트 함수
   - 30줄

7. **`20250129000007_create_common_codes.sql`** ⭐ NEW
   - 공통 코드 마스터 및 상세 테이블 생성
   - 시스템 전역 코드 관리용
   - 인덱스 및 트리거 설정

8. **`20250129000006_setup_rls_policies.sql`**
   - 모든 테이블에 대한 RLS 정책 설정
   - 보안 정책 정의 (공통 코드 테이블 포함)
   - 200줄 이상

### 문서 파일

8. **`supabase/migrations/README.md`**
   - 마이그레이션 실행 가이드
   - Supabase CLI 사용법 포함

9. **`docs/db-schema-final.md`**
   - 최종 데이터베이스 스키마 설계서
   - 전체 테이블 구조 및 RLS 정책 문서화
   - 통계 쿼리 예시 포함

10. **`docs/seed_data.sql`** ⭐ NEW
    - 초기 데이터 세팅용 시드 데이터
    - 공통 코드 마스터/상세 데이터 포함
    - 테스트용 유저 및 게시글 데이터 포함

---

## ✏️ 수정된 파일 (업데이트)

### 타입 정의 파일

1. **`types/database.ts`**
   - 새로 추가된 테이블 타입 정의:
     - `post_views` 테이블 타입 추가
     - `post_applications` 테이블 타입 추가
     - `user_activities` 테이블 타입 추가
     - `common_code_master` 테이블 타입 추가 ⭐ NEW
     - `common_code_detail` 테이블 타입 추가 ⭐ NEW
   - `posts` 테이블의 `tags` 필드 타입 변경:
     - `Json | null` → `string[] | null` (TEXT[] 타입 반영)

2. **`docs/db-schema.md`** ⭐ UPDATED
   - 공통 코드 테이블 스키마 추가
   - RLS 정책 문서화 추가
   - 마이그레이션 실행 순서 업데이트

3. **`docs/db-schema-final.md`** ⭐ UPDATED
   - 공통 코드 테이블 스키마 추가
   - RLS 정책 문서화 추가
   - 마이그레이션 실행 순서 업데이트

---

## 📊 통계

- **생성된 파일**: 11개
- **수정된 파일**: 4개
- **총 SQL 마이그레이션 파일**: 8개
- **총 코드 라인 수**: 약 600줄 이상

---

## 🎯 주요 변경 사항 요약

### 테이블 추가
- ✅ `post_views` - 조회수 추적
- ✅ `post_applications` - 지원/매칭 내역
- ✅ `user_activities` - 사용자 활동 로그
- ✅ `common_code_master` - 공통 코드 마스터 ⭐ NEW
- ✅ `common_code_detail` - 공통 코드 상세 ⭐ NEW

### 타입 변경
- ✅ `posts.tags`: JSONB → TEXT[] (코드에서 string[]로 사용)

### 보안 강화
- ✅ 모든 테이블에 RLS 정책 적용
- ✅ 세밀한 권한 제어 정책 구현

---

## 📝 다음 단계

1. Supabase Dashboard에서 마이그레이션 실행 (순서 중요!)
   - `20250129000007_create_common_codes.sql` 실행
   - `20250129000006_setup_rls_policies.sql` 재실행 (공통 코드 RLS 정책 포함)
2. 시드 데이터 실행 (선택사항):
   - `docs/seed_data.sql` 파일을 Supabase SQL Editor에서 실행
3. 타입 재생성 (선택사항):
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.ts
   ```

---

## 🆕 최신 변경 사항 (2025-01-29 추가)

### 공통 코드 테이블 추가
- **목적**: 시스템 전역에서 사용되는 코드 그룹 및 상세 코드 관리
- **마스터 코드 예시**: 
  - `BH_ST_APPLICATION`: 신청 상태
  - `BH_USER_ROLE`: 유저 권한
- **상세 코드 예시**:
  - `BH_ST_APPLICATION` → `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN`
  - `BH_USER_ROLE` → `ADMIN`, `MEMBER`, `GUEST`, `PREMIUM`
- **RLS 정책**: 모든 인증된 사용자 읽기 가능 (읽기 전용)
