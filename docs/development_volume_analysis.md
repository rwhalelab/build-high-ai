# 개발 볼륨 분석 결과

> 작성일: 2025-01-29  
> 분석 기준: `docs/functional_flow.md`의 구현 리스트

---

## 📊 전체 개발 볼륨 요약

### 총 작업량
- **총 작업 항목**: 35개 (세부 작업 70+개)
- **신규 파일 생성**: 약 25개
- **기존 파일 수정**: 약 15개
- **예상 개발 시간**: 약 80-120시간 (개발자 1명 기준)

---

## 📈 Phase별 상세 분석

### Phase 1: Foundation (공통 유틸리티 및 기본 데이터 연결)

#### 작업량
- **작업 항목**: 7개
- **신규 파일**: 3개
- **수정 파일**: 4개
- **예상 시간**: 12-16시간
- **복잡도**: ⭐⭐ (중)

#### 상세 내역

**1.1 Google OAuth 인증 플로우 구현** (4-6시간)
- ✅ `app/api/auth/callback/route.ts` - 이미 존재, 개선 필요
- ⚠️ `components/domain/auth/google-sign-in-button.tsx` - 존재하나 TODO 상태
- ⚠️ `components/domain/auth/auth-provider.tsx` - 존재하나 강화 필요
- **작업**: OAuth 플로우 완성, 에러 핸들링, 세션 동기화

**1.2 공통 코드 조회 유틸리티 구현** (3-4시간)
- ❌ `lib/utils/common-codes.ts` - 신규 생성 필요
- ❌ `hooks/use-common-codes.ts` - 신규 생성 필요
- **작업**: 서버/클라이언트 유틸리티, 캐싱 로직

**1.3 프로필 기본 조회 및 표시** (5-6시간)
- ⚠️ `hooks/use-profile.ts` - 존재하나 개선 필요
- ❌ `components/domain/profile/profile-display.tsx` - 신규 생성 필요
- **작업**: 프로필 조회 강화, Server Component 구현

---

### Phase 2: Core Logic (주요 비즈니스 기능의 Read/Write)

#### 작업량
- **작업 항목**: 18개
- **신규 파일**: 12개
- **수정 파일**: 6개
- **예상 시간**: 45-60시간
- **복잡도**: ⭐⭐⭐ (높음)

#### 상세 내역

**2.1 게시글 목록 조회 및 필터링** (6-8시간)
- ⚠️ `app/(dashboard)/posts/page.tsx` - 존재하나 Server Component로 전환 필요
- ⚠️ `hooks/use-posts.ts` - 존재하나 필터링/페이지네이션 추가 필요
- ⚠️ `components/domain/posts/post-card.tsx` - 존재하나 데이터 바인딩 개선 필요
- **작업**: Server Component 전환, 필터링 로직, 페이지네이션

**2.2 게시글 상세 조회 및 조회수 추적** (6-8시간)
- ⚠️ `app/(dashboard)/posts/[id]/page.tsx` - 존재하나 개선 필요
- ❌ `app/api/posts/[id]/view/route.ts` - 신규 생성 필요
- ⚠️ `components/domain/posts/post-detail.tsx` - 존재하나 조회수 추적 추가 필요
- **작업**: 조회수 추적 API, 중복 방지 로직, IP 추적

**2.3 게시글 생성 (AI 처리 포함)** (8-10시간)
- ⚠️ `components/domain/posts/post-editor.tsx` - 존재하나 폼 검증 강화 필요
- ⚠️ `lib/ai/gemini.ts` - 존재하나 실제 API 연동 완성 필요
- ⚠️ `app/api/posts/route.ts` - 존재하나 AI 통합 및 활동 로그 추가 필요
- **작업**: Gemini API 완전 연동, 프롬프트 엔지니어링, 응답 파싱

**2.4 게시글 수정 및 삭제** (6-8시간)
- ⚠️ `app/api/posts/[id]/route.ts` - 존재하나 PUT 메서드 추가 필요
- ❌ `components/domain/posts/post-actions.tsx` - 신규 생성 필요
- **작업**: 수정 API 구현, 권한 체크, AI 재처리 로직

**2.5 프로필 수정** (4-5시간)
- ⚠️ `components/domain/profile/profile-form.tsx` - 존재하나 개선 필요
- ⚠️ `hooks/use-profile.ts` - 활동 로그 통합 필요
- **작업**: 낙관적 업데이트, 활동 로그 통합

**2.6 게시글 지원 (Application) CRUD** (15-20시간)
- ❌ `app/api/posts/[id]/applications/route.ts` - 신규 생성 필요 (POST, GET)
- ❌ `app/api/applications/[id]/route.ts` - 신규 생성 필요 (PATCH)
- ❌ `components/domain/posts/post-applications.tsx` - 신규 생성 필요
- **작업**: 지원 CRUD 전체, 권한 체크, 상태 변경 로직, UI 구현

---

### Phase 3: Interaction & Feedback (상태 변경, 알림, 에러 핸들링)

#### 작업량
- **작업 항목**: 10개
- **신규 파일**: 10개
- **수정 파일**: 6개
- **예상 시간**: 25-35시간
- **복잡도**: ⭐⭐ (중)

#### 상세 내역

**3.1 사용자 활동 로그 자동 기록** (4-6시간)
- ❌ `lib/utils/activity-logger.ts` - 신규 생성 필요
- **작업**: 6개 API/훅에 활동 로그 통합

**3.2 통계 데이터 조회 및 표시** (4-6시간)
- ⚠️ `app/(dashboard)/page.tsx` - 통계 쿼리 추가 필요
- ⚠️ `components/posts/StatCard.tsx` - 존재하나 활용 필요
- **작업**: 집계 쿼리, 통계 컴포넌트

**3.3 에러 핸들링 및 사용자 피드백** (8-10시간)
- ⚠️ `app/error.tsx` - 존재하나 개선 필요
- ❌ `lib/utils/api-error-handler.ts` - 신규 생성 필요
- ❌ `components/ui/toast.tsx` - 신규 생성 필요 (shadcn/ui)
- ❌ `hooks/use-toast.ts` - 신규 생성 필요
- **작업**: 에러 바운더리, API 에러 핸들링, 토스트 시스템

**3.4 로딩 상태 관리** (3-4시간)
- ⚠️ `components/domain/shared/loading-spinner.tsx` - 존재하나 개선 필요
- ❌ `components/ui/skeleton.tsx` - 신규 생성 필요 (shadcn/ui)
- **작업**: 스피너 개선, 스켈레톤 UI

**3.5 실시간 업데이트 (선택사항)** (6-9시간)
- ❌ `hooks/use-posts-realtime.ts` - 신규 생성 필요
- ❌ `hooks/use-applications-realtime.ts` - 신규 생성 필요
- **작업**: Supabase Realtime 구독, 상태 업데이트

---

## 📋 파일 생성/수정 리스트

### 신규 파일 생성 필요 (25개)

#### Phase 1 (3개)
1. `lib/utils/common-codes.ts`
2. `hooks/use-common-codes.ts`
3. `components/domain/profile/profile-display.tsx`

#### Phase 2 (12개)
4. `app/api/posts/[id]/view/route.ts`
5. `components/domain/posts/post-actions.tsx`
6. `app/api/posts/[id]/applications/route.ts`
7. `app/api/applications/[id]/route.ts`
8. `components/domain/posts/post-applications.tsx`

#### Phase 3 (10개)
9. `lib/utils/activity-logger.ts`
10. `lib/utils/api-error-handler.ts`
11. `components/ui/toast.tsx`
12. `hooks/use-toast.ts`
13. `components/ui/skeleton.tsx`
14. `hooks/use-posts-realtime.ts` (선택)
15. `hooks/use-applications-realtime.ts` (선택)

### 기존 파일 수정 필요 (15개)

#### Phase 1 (4개)
1. `components/domain/auth/google-sign-in-button.tsx` - OAuth 구현 완성
2. `components/domain/auth/auth-provider.tsx` - 상태 관리 강화
3. `app/api/auth/callback/route.ts` - 에러 핸들링 개선
4. `hooks/use-profile.ts` - 프로필 조회 강화

#### Phase 2 (6개)
5. `app/(dashboard)/posts/page.tsx` - Server Component 전환
6. `hooks/use-posts.ts` - 필터링/페이지네이션 추가
7. `components/domain/posts/post-card.tsx` - 데이터 바인딩 개선
8. `app/(dashboard)/posts/[id]/page.tsx` - 조회수 추적 통합
9. `components/domain/posts/post-detail.tsx` - 조회수 API 호출 추가
10. `lib/ai/gemini.ts` - API 연동 완성
11. `app/api/posts/route.ts` - AI 통합 및 활동 로그
12. `app/api/posts/[id]/route.ts` - PUT 메서드 추가
13. `components/domain/profile/profile-form.tsx` - 개선
14. `hooks/use-profile.ts` - 활동 로그 통합

#### Phase 3 (5개)
15. `app/error.tsx` - 에러 바운더리 개선
16. `app/(dashboard)/page.tsx` - 통계 쿼리 추가
17. `components/posts/StatCard.tsx` - 활용
18. `components/domain/shared/loading-spinner.tsx` - 개선

---

## 🎯 개발 우선순위 및 단계별 계획

### Step 1: Phase 1 완료 (필수 기반 작업)
**예상 시간**: 12-16시간  
**목표**: 인증, 공통 코드, 프로필 기본 기능 완성

**작업 순서**:
1. Google OAuth 완성 (1.1)
2. 공통 코드 유틸리티 (1.2)
3. 프로필 조회/표시 (1.3)

**완료 기준**:
- ✅ Google 로그인 정상 작동
- ✅ 공통 코드 조회 가능
- ✅ 프로필 표시 정상 작동

---

### Step 2: Phase 2 핵심 기능 (게시글 CRUD)
**예상 시간**: 30-40시간  
**목표**: 게시글 생성/조회/수정/삭제 완성

**작업 순서**:
1. 게시글 목록 조회 (2.1)
2. 게시글 상세 조회 및 조회수 (2.2)
3. 게시글 생성 + AI 처리 (2.3)
4. 게시글 수정/삭제 (2.4)

**완료 기준**:
- ✅ 게시글 목록 필터링/페이지네이션 작동
- ✅ 게시글 상세 조회 및 조회수 추적 작동
- ✅ AI 요약/태그 자동 생성 작동
- ✅ 게시글 수정/삭제 정상 작동

---

### Step 3: Phase 2 확장 기능 (프로필 수정, 지원)
**예상 시간**: 15-20시간  
**목표**: 프로필 수정 및 지원 기능 완성

**작업 순서**:
1. 프로필 수정 (2.5)
2. 게시글 지원 CRUD (2.6)

**완료 기준**:
- ✅ 프로필 수정 정상 작동
- ✅ 지원 생성/조회/상태 변경 정상 작동

---

### Step 4: Phase 3 사용자 경험 개선
**예상 시간**: 25-35시간  
**목표**: 에러 핸들링, 로딩, 통계, 활동 로그 완성

**작업 순서**:
1. 활동 로그 자동 기록 (3.1)
2. 통계 데이터 조회 (3.2)
3. 에러 핸들링 및 피드백 (3.3)
4. 로딩 상태 관리 (3.4)
5. 실시간 업데이트 (3.5, 선택)

**완료 기준**:
- ✅ 모든 주요 액션에 활동 로그 기록
- ✅ 대시보드 통계 표시 정상 작동
- ✅ 에러 핸들링 및 토스트 알림 정상 작동
- ✅ 로딩 상태 표시 정상 작동

---

## ⚠️ 주요 리스크 및 고려사항

### 기술적 리스크
1. **Gemini API 연동** (높음)
   - 프롬프트 엔지니어링 필요
   - 응답 파싱 안정성 확보 필요
   - 에러 처리 및 재시도 로직 필요

2. **Supabase Realtime** (중간)
   - 구독 관리 복잡도
   - 메모리 누수 방지 필요

3. **권한 체크** (중간)
   - RLS 정책과 API 권한 체크 일관성
   - 다양한 시나리오 테스트 필요

### 개발 리스크
1. **기존 코드와의 통합** (중간)
   - 일부 파일이 이미 존재하여 수정 작업 필요
   - 기존 코드 스타일과의 일관성 유지

2. **데이터베이스 스키마** (낮음)
   - 마이그레이션은 이미 완료된 것으로 보임
   - RLS 정책 확인 필요

---

## 📊 복잡도별 작업 분류

### ⭐ 낮은 복잡도 (단순 구현)
- 공통 코드 조회 유틸리티
- 프로필 표시 컴포넌트
- 로딩 스피너 개선
- 스켈레톤 UI

### ⭐⭐ 중간 복잡도 (로직 구현 필요)
- Google OAuth 완성
- 게시글 목록 필터링
- 프로필 수정
- 활동 로그 통합
- 통계 조회
- 에러 핸들링

### ⭐⭐⭐ 높은 복잡도 (복잡한 로직)
- AI 처리 로직 완성 (Gemini API)
- 게시글 지원 CRUD (권한 체크, 상태 관리)
- 실시간 업데이트 (Realtime 구독)

---

## 🎯 권장 개발 전략

### 1. 단계별 완성 전략
- 각 Step을 완전히 완성한 후 다음 Step 진행
- 중간 테스트를 통해 안정성 확보

### 2. 병렬 작업 가능 영역
- UI 컴포넌트와 API Route는 독립적으로 개발 가능
- 훅과 컴포넌트는 분리하여 개발 가능

### 3. 우선순위 조정 가능 영역
- **3.5 실시간 업데이트**: 선택사항이므로 마지막에 구현
- **에러 핸들링**: 기본 기능 완성 후 강화 가능

---

## 📝 다음 단계

1. **Step 1 승인** → Phase 1 구현 시작
2. **Step 2 승인** → Phase 2 핵심 기능 구현
3. **Step 3 승인** → Phase 2 확장 기능 구현
4. **Step 4 승인** → Phase 3 사용자 경험 개선

각 Step 완료 후 테스트 및 검토를 거쳐 다음 Step으로 진행하는 것을 권장합니다.
