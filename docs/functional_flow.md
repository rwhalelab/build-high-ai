# 기능적 흐름 리스트 (Data Binding 중심)

> **목적**: 화면 중심이 아닌 데이터 흐름 중심으로 개발 우선순위를 정리한 기능 구현 리스트  
> **원칙**: 각 단계마다 "데이터 페칭 → 상태 관리 → UI 바인딩" 흐름을 명확히 정의

---

## Phase 1: Foundation (공통 유틸리티 및 기본 데이터 연결)

### 1.1 Google OAuth 인증 플로우 구현
**데이터 흐름**: `Google OAuth → Supabase Auth → 세션 생성 → profiles 자동 생성 (트리거)`

- **1.1.1** Google OAuth 버튼 클릭 핸들러 구현
  - 기술: `components/domain/auth/google-sign-in-button.tsx` (Client Component)
  - Supabase SDK: `supabase.auth.signInWithOAuth({ provider: 'google' })`
  - 리다이렉트 URL: `/api/auth/callback`
  
  - 상태: 로딩 상태 관리 (`useState`)

- **1.1.2** OAuth 콜백 처리 완성
  - 기술: `app/api/auth/callback/route.ts` (Server Route)
  - Supabase SDK: `supabase.auth.exchangeCodeForSession(code)`
  - 트리거: `handle_new_user()` 함수가 자동으로 `profiles` 레코드 생성
  - 리다이렉트: 인증 성공 시 `/(dashboard)`로 이동

- **1.1.3** 인증 상태 전역 관리 강화
  - 기술: `components/domain/auth/auth-provider.tsx` (Context Provider)
  - Supabase SDK: `supabase.auth.onAuthStateChange()` 구독
  - 상태: `user`, `loading` 전역 상태 제공
  - 미들웨어 연동: `lib/supabase/middleware.ts`와 세션 동기화

---

### 1.2 공통 코드 조회 유틸리티 구현
**데이터 흐름**: `common_code_master/detail 테이블 → 캐싱 → 전역 상태`

- **1.2.1** 공통 코드 조회 함수 구현
  - 기술: `lib/utils/common-codes.ts` (Server Utility)
  - Supabase SDK: `createClient()` (Server Component용)
  - 쿼리: `common_code_detail` 테이블에서 `master_code`로 필터링, `sort_order` 정렬
  - 반환 타입: `{ code: string, name: string }[]`

- **1.2.2** 공통 코드 클라이언트 훅 구현
  - 기술: `hooks/use-common-codes.ts` (Client Hook)
  - Supabase SDK: `createClient()` (Browser Client)
  - 상태: `useState`로 코드 목록 캐싱
  - 사용처: 신청 상태 표시, 권한 표시 등

---

### 1.3 프로필 기본 조회 및 표시
**데이터 흐름**: `auth.users → profiles 테이블 조회 → UI 바인딩`

- **1.3.1** 현재 사용자 프로필 조회 강화
  - 기술: `hooks/use-profile.ts` (기존 파일 개선)
  - Supabase SDK: `supabase.from('profiles').select().eq('id', user.id).single()`
  - 인증 체크: `supabase.auth.getUser()`로 세션 확인
  - 에러 핸들링: 프로필 없음 시 기본값 반환

- **1.3.2** 프로필 표시 컴포넌트 구현
  - 기술: `components/domain/profile/profile-display.tsx` (Server Component)
  - 데이터 페칭: Server Component에서 직접 `createClient()` 호출
  - Props: `userId` (UUID) 받아서 해당 프로필 조회
  - UI: 아바타, 사용자명, 기술 스택 표시

---

## Phase 2: Core Logic (주요 비즈니스 기능의 Read/Write)

### 2.1 게시글 목록 조회 및 필터링
**데이터 흐름**: `posts 테이블 → 필터/정렬 → 페이지네이션 → UI 렌더링`

- **2.1.1** 게시글 목록 Server Component 구현
  - 기술: `app/(dashboard)/posts/page.tsx` (Server Component)
  - Supabase SDK: `createClient()` (Server)
  - 쿼리: `posts` 테이블 조회, `author_id`로 `profiles` JOIN
  - 정렬: `created_at DESC` (최신순)
  - 필터: `category` (Project/Study/Development), `tags` 배열 검색

- **2.1.2** 게시글 목록 클라이언트 훅 개선
  - 기술: `hooks/use-posts.ts` (기존 파일 개선)
  - 상태: `posts`, `loading`, `error` 관리
  - 필터링: `category`, `tags`, `author_id` 파라미터 지원
  - 페이지네이션: `range()` 메서드로 페이지당 10개 제한

- **2.1.3** 게시글 카드 컴포넌트 데이터 바인딩
  - 기술: `components/domain/posts/post-card.tsx` (Client Component)
  - Props: `Post` 타입 (author 정보 포함)
  - 데이터 표시: 제목, 요약(3줄), 태그, 작성자, 작성일시
  - 링크: `/posts/[id]`로 이동

---

### 2.2 게시글 상세 조회 및 조회수 추적
**데이터 흐름**: `posts 테이블 조회 → post_views INSERT → 통계 업데이트`

- **2.2.1** 게시글 상세 Server Component 구현
  - 기술: `app/(dashboard)/posts/[id]/page.tsx` (Server Component)
  - Supabase SDK: `createClient()` (Server)
  - 쿼리: `posts` + `profiles` JOIN, `post_applications` COUNT
  - 에러: 404 처리 (게시글 없음)

- **2.2.2** 조회수 추적 API Route 구현
  - 기술: `app/api/posts/[id]/view/route.ts` (Server Route)
  - Supabase SDK: `createClient()` (Server)
  - 로직: `post_views` 테이블에 INSERT (중복 방지: `UNIQUE(post_id, user_id)`)
  - IP 추적: 익명 사용자용 `ip_address` 저장
  - 비동기: 조회수는 비동기 처리 (블로킹 방지)

- **2.2.3** 게시글 상세 클라이언트 컴포넌트 구현
  - 기술: `components/domain/posts/post-detail.tsx` (Client Component)
  - 데이터: Server Component에서 받은 `post` 데이터 바인딩
  - 마운트 시: `useEffect`로 조회수 추적 API 호출
  - UI: 본문 마크다운 렌더링, 태그 표시, 작성자 정보

---

### 2.3 게시글 생성 (AI 처리 포함)
**데이터 흐름**: `폼 입력 → AI API 호출 → posts INSERT → 활동 로그 INSERT`

- **2.3.1** 게시글 생성 폼 컴포넌트 구현
  - 기술: `components/domain/posts/post-editor.tsx` (Client Component)
  - 상태: `useState`로 폼 데이터 관리 (title, category, content, phone, email, contact_url)
  - 유효성 검사: 제목 5자 이상, 카테고리 필수
  - 제출: `/api/posts` POST 요청

- **2.3.2** AI 처리 로직 완성
  - 기술: `lib/ai/gemini.ts` (기존 파일 완성)
  - Gemini API: `gemini-pro:generateContent` 엔드포인트 호출
  - 프롬프트: "3줄 요약 + 5개 기술 태그 추출" 지시
  - 응답 파싱: JSON 응답에서 `summary[]`, `tags[]` 추출
  - 에러 처리: 실패 시 기본값 반환 (빈 배열)

- **2.3.3** 게시글 생성 API Route 개선
  - 기술: `app/api/posts/route.ts` (기존 파일 개선)
  - Supabase SDK: `createClient()` (Server)
  - AI 호출: `generateSummaryAndTags(content)` 실행
  - DB 저장: `posts` 테이블 INSERT (author_id, title, category, content, summary, tags, phone, email, contact_url)
  - 활동 로그: `user_activities` 테이블 INSERT (activity_type: 'post_create')

---

### 2.4 게시글 수정 및 삭제
**데이터 흐름**: `권한 체크 → posts UPDATE/DELETE → 활동 로그 INSERT`

- **2.4.1** 게시글 수정 API Route 구현
  - 기술: `app/api/posts/[id]/route.ts` (PUT 메서드 추가)
  - Supabase SDK: `createClient()` (Server)
  - 권한 체크: `auth.uid() === post.author_id` (RLS 정책 활용)
  - 업데이트: `posts.update().eq('id', id)`
  - AI 재처리: content 변경 시 `generateSummaryAndTags()` 재호출
  - 활동 로그: `user_activities` INSERT (activity_type: 'post_update')

- **2.4.2** 게시글 삭제 API Route 구현
  - 기술: `app/api/posts/[id]/route.ts` (DELETE 메서드, 기존 파일 개선)
  - Supabase SDK: `createClient()` (Server)
  - 권한 체크: 작성자만 삭제 가능
  - 삭제: `posts.delete().eq('id', id)` (CASCADE로 관련 데이터 자동 삭제)
  - 활동 로그: `user_activities` INSERT (activity_type: 'post_delete')

- **2.4.3** 게시글 수정/삭제 UI 구현
  - 기술: `components/domain/posts/post-actions.tsx` (Client Component)
  - 조건부 렌더링: `post.author_id === user.id`일 때만 표시
  - 수정: `/posts/[id]/edit` 페이지로 이동
  - 삭제: 확인 다이얼로그 후 DELETE API 호출

---

### 2.5 프로필 수정
**데이터 흐름**: `profiles 테이블 조회 → 폼 입력 → UPDATE → UI 반영`

- **2.5.1** 프로필 수정 폼 컴포넌트 구현
  - 기술: `components/domain/profile/profile-form.tsx` (기존 파일 개선)
  - 상태: `useProfile()` 훅으로 현재 프로필 로드
  - 필드: `username`, `avatar_url`, `tech_stack[]`
  - 제출: `updateProfile()` 호출

- **2.5.2** 프로필 수정 훅 개선
  - 기술: `hooks/use-profile.ts` (기존 파일 개선)
  - 업데이트: `supabase.from('profiles').update(updates).eq('id', user.id)`
  - 활동 로그: `user_activities` INSERT (activity_type: 'profile_update')
  - 낙관적 업데이트: UI 즉시 반영 후 서버 동기화

---

### 2.6 게시글 지원 (Application) CRUD
**데이터 흐름**: `post_applications 테이블 → 상태 변경 → 통계 반영`

- **2.6.1** 지원 생성 API Route 구현
  - 기술: `app/api/posts/[id]/applications/route.ts` (POST)
  - Supabase SDK: `createClient()` (Server)
  - 중복 체크: `UNIQUE(post_id, applicant_id)` 제약 조건 활용
  - INSERT: `post_applications` 테이블에 `status: 'pending'` 저장
  - 활동 로그: `user_activities` INSERT (activity_type: 'application_create')

- **2.6.2** 지원 목록 조회 구현
  - 기술: `app/api/posts/[id]/applications/route.ts` (GET)
  - Supabase SDK: `createClient()` (Server)
  - 권한: 게시글 작성자 또는 지원자만 조회 가능 (RLS 정책)
  - JOIN: `profiles` 테이블과 JOIN하여 지원자 정보 포함
  - 정렬: `created_at DESC`

- **2.6.3** 지원 상태 변경 API Route 구현
  - 기술: `app/api/applications/[id]/route.ts` (PATCH)
  - Supabase SDK: `createClient()` (Server)
  - 권한: 게시글 작성자만 승인/거절 가능, 지원자만 철회 가능
  - 상태 변경: `status` 필드 업데이트 ('pending' → 'approved'/'rejected'/'withdrawn')
  - 공통 코드 활용: `common_code_detail`에서 상태명 조회하여 표시

- **2.6.4** 지원 UI 컴포넌트 구현
  - 기술: `components/domain/posts/post-applications.tsx` (Client Component)
  - 지원 버튼: 게시글 상세 페이지에 "지원하기" 버튼
  - 지원 목록: 게시글 작성자에게 지원자 목록 표시
  - 상태 변경: 승인/거절 버튼 (작성자), 철회 버튼 (지원자)

---

## Phase 3: Interaction & Feedback (상태 변경, 알림, 에러 핸들링)

### 3.1 사용자 활동 로그 자동 기록
**데이터 흐름**: `사용자 액션 → user_activities INSERT → 통계 집계`

- **3.1.1** 활동 로그 유틸리티 함수 구현
  - 기술: `lib/utils/activity-logger.ts` (Server Utility)
  - Supabase SDK: `createClient()` (Server)
  - 함수: `logActivity(userId, activityType, metadata?)`
  - 활동 타입: 'login', 'post_view', 'post_create', 'post_update', 'post_delete', 'profile_update', 'application_create'
  - 비동기: 논블로킹 처리 (에러 발생해도 메인 로직 영향 없음)

- **3.1.2** 각 기능에 활동 로그 통합
  - 게시글 생성: `app/api/posts/route.ts`에서 `logActivity()` 호출
  - 게시글 수정: `app/api/posts/[id]/route.ts` (PUT)에서 호출
  - 게시글 삭제: `app/api/posts/[id]/route.ts` (DELETE)에서 호출
  - 프로필 수정: `hooks/use-profile.ts`의 `updateProfile()`에서 호출
  - 지원 생성: `app/api/posts/[id]/applications/route.ts`에서 호출
  - 로그인: `app/api/auth/callback/route.ts`에서 호출

---

### 3.2 통계 데이터 조회 및 표시
**데이터 흐름**: `집계 쿼리 → 통계 객체 → UI 컴포넌트`

- **3.2.1** 통계 조회 Server Action 구현
  - 기술: `app/(dashboard)/page.tsx` (Server Component)
  - Supabase SDK: `createClient()` (Server)
  - 집계 쿼리:
    - 총 게시글 수: `posts` COUNT
    - 총 사용자 수: `profiles` COUNT
    - 주간 활성 유저: `user_activities`에서 최근 7일간 고유 `user_id` COUNT
    - 매칭 완료 수: `post_applications`에서 `status = 'approved'` COUNT
  - 반환: 통계 객체 `{ totalPosts, totalUsers, weeklyActiveUsers, matchedCount }`

- **3.2.2** 통계 카드 컴포넌트 구현
  - 기술: `components/posts/StatCard.tsx` (기존 파일 활용)
  - Props: `label`, `value`, `icon`
  - UI: 숫자 표시, 아이콘, 라벨

---

### 3.3 에러 핸들링 및 사용자 피드백
**데이터 흐름**: `에러 발생 → 에러 객체 → 토스트/알림 표시`

- **3.3.1** 전역 에러 바운더리 구현
  - 기술: `app/error.tsx` (Next.js Error Boundary)
  - 에러 타입: 네트워크 에러, 인증 에러, 데이터베이스 에러 구분
  - UI: 에러 메시지 표시, 재시도 버튼

- **3.3.2** API 에러 핸들링 표준화
  - 기술: `lib/utils/api-error-handler.ts` (Utility)
  - 함수: `handleApiError(error)` - 에러 타입별 메시지 변환
  - Supabase 에러: `error.code`, `error.message` 파싱
  - HTTP 에러: 상태 코드별 메시지 매핑

- **3.3.3** 클라이언트 에러 피드백 구현
  - 기술: `components/ui/toast.tsx` (shadcn/ui 기반)
  - 훅: `hooks/use-toast.ts` - 토스트 상태 관리
  - 사용처: API 호출 실패 시 토스트 표시
  - 타입: success, error, warning, info

---

### 3.4 로딩 상태 관리
**데이터 흐름**: `데이터 페칭 시작 → loading: true → 완료 → loading: false`

- **3.4.1** 로딩 스피너 컴포넌트 구현
  - 기술: `components/domain/shared/loading-spinner.tsx` (기존 파일 활용)
  - Props: `size?` (small, medium, large)
  - UI: 회전 애니메이션

- **3.4.2** 스켈레톤 UI 구현
  - 기술: `components/ui/skeleton.tsx` (shadcn/ui 기반)
  - 사용처: 게시글 카드, 프로필 카드 로딩 시
  - UI: 펄스 애니메이션

---

### 3.5 실시간 업데이트 (선택사항, Phase 2 확장)
**데이터 흐름**: `Supabase Realtime 구독 → 이벤트 수신 → 상태 업데이트`

- **3.5.1** 게시글 실시간 구독 훅 구현
  - 기술: `hooks/use-posts-realtime.ts` (Client Hook)
  - Supabase SDK: `supabase.channel('posts').on('postgres_changes', ...)`
  - 이벤트: INSERT, UPDATE, DELETE 구독
  - 상태 업데이트: `setPosts()`로 목록 갱신

- **3.5.2** 지원 상태 실시간 업데이트
  - 기술: `hooks/use-applications-realtime.ts` (Client Hook)
  - 채널: `post_applications` 테이블 변경 구독
  - 사용처: 게시글 작성자가 지원 목록 실시간 확인

---

## 구현 우선순위 요약

### 🔴 최우선 (Phase 1 완료 필수)
1. **1.1** Google OAuth 인증 플로우 구현
2. **1.2** 공통 코드 조회 유틸리티 구현
3. **1.3** 프로필 기본 조회 및 표시

### 🟡 핵심 기능 (Phase 2 필수)
4. **2.1** 게시글 목록 조회 및 필터링
5. **2.2** 게시글 상세 조회 및 조회수 추적
6. **2.3** 게시글 생성 (AI 처리 포함)
7. **2.4** 게시글 수정 및 삭제
8. **2.5** 프로필 수정
9. **2.6** 게시글 지원 (Application) CRUD

### 🟢 사용자 경험 개선 (Phase 3)
10. **3.1** 사용자 활동 로그 자동 기록
11. **3.2** 통계 데이터 조회 및 표시
12. **3.3** 에러 핸들링 및 사용자 피드백
13. **3.4** 로딩 상태 관리
14. **3.5** 실시간 업데이트 (선택사항)

---

## 기술 스택 요약

### Server Components
- Next.js App Router의 Server Components 활용
- `lib/supabase/server.ts`의 `createClient()` 사용
- 데이터 페칭은 Server Component에서 직접 수행

### Client Components
- 인터랙티브 UI는 Client Component로 구현
- `lib/supabase/client.ts`의 `createClient()` 사용
- `'use client'` 디렉티브 필수

### Supabase SDK 사용 패턴
- **서버**: `await createClient()` (비동기)
- **클라이언트**: `createClient()` (동기)
- **인증**: `supabase.auth.getUser()`, `supabase.auth.signInWithOAuth()`
- **데이터**: `supabase.from('table').select().eq().insert().update().delete()`

### Google OAuth 플로우
1. 클라이언트에서 `supabase.auth.signInWithOAuth({ provider: 'google' })` 호출
2. Google 인증 페이지로 리다이렉트
3. 인증 성공 시 `/api/auth/callback?code=...`로 리다이렉트
4. 서버에서 `supabase.auth.exchangeCodeForSession(code)` 실행
5. 트리거가 `profiles` 레코드 자동 생성
6. 대시보드로 리다이렉트

### AI 처리 플로우 (Gemini)
1. 게시글 생성 시 `generateSummaryAndTags(content)` 호출
2. Gemini API에 프롬프트 전송
3. 응답 파싱하여 `summary[]`, `tags[]` 추출
4. `posts` 테이블에 저장

---

## 구현 체크리스트

> 각 기능 구현 완료 시 체크박스를 체크하여 진행 상황을 추적합니다.

### Phase 1: Foundation (공통 유틸리티 및 기본 데이터 연결)

#### 1.1 Google OAuth 인증 플로우 구현
- [x] **1.1.1** Google OAuth 버튼 클릭 핸들러 구현
  - [x] `components/domain/auth/google-sign-in-button.tsx` 파일 생성/수정
  - [x] `supabase.auth.signInWithOAuth({ provider: 'google' })` 호출 구현
  - [x] 로딩 상태 관리 (`useState`)
  - [x] 에러 핸들링 구현

- [x] **1.1.2** OAuth 콜백 처리 완성
  - [x] `app/api/auth/callback/route.ts` 파일 수정
  - [x] `supabase.auth.exchangeCodeForSession(code)` 구현
  - [x] 인증 성공 시 `/(dashboard)`로 리다이렉트
  - [x] 에러 시 적절한 에러 페이지로 리다이렉트

- [x] **1.1.3** 인증 상태 전역 관리 강화
  - [x] `components/domain/auth/auth-provider.tsx` 파일 수정
  - [x] `supabase.auth.onAuthStateChange()` 구독 구현
  - [x] `user`, `loading` 상태 전역 제공 확인
  - [x] `lib/supabase/middleware.ts`와 세션 동기화 확인

#### 1.2 공통 코드 조회 유틸리티 구현
- [x] **1.2.1** 공통 코드 조회 함수 구현
  - [x] `lib/utils/common-codes.ts` 파일 생성
  - [x] Server Component용 `createClient()` 사용
  - [x] `common_code_detail` 테이블 쿼리 구현 (master_code 필터링, sort_order 정렬)
  - [x] 반환 타입 `{ code: string, name: string }[]` 정의

- [x] **1.2.2** 공통 코드 클라이언트 훅 구현
  - [x] `hooks/use-common-codes.ts` 파일 생성
  - [x] Browser Client용 `createClient()` 사용
  - [x] `useState`로 코드 목록 캐싱 구현
  - [x] 신청 상태, 권한 표시 등에서 사용 확인

#### 1.3 프로필 기본 조회 및 표시
- [x] **1.3.1** 현재 사용자 프로필 조회 강화
  - [x] `hooks/use-profile.ts` 파일 개선
  - [x] `supabase.from('profiles').select().eq('id', user.id).single()` 구현
  - [x] `supabase.auth.getUser()`로 세션 확인
  - [x] 프로필 없음 시 기본값 반환 로직 구현

- [x] **1.3.2** 프로필 표시 컴포넌트 구현
  - [x] `components/domain/profile/profile-display.tsx` 파일 생성
  - [x] Server Component에서 직접 `createClient()` 호출
  - [x] `userId` Props 받아서 프로필 조회
  - [x] 아바타, 사용자명, 기술 스택 UI 구현

---

### Phase 2: Core Logic (주요 비즈니스 기능의 Read/Write)

#### 2.1 게시글 목록 조회 및 필터링
- [x] **2.1.1** 게시글 목록 Server Component 구현
  - [x] `app/(dashboard)/posts/page.tsx` 파일 생성/수정
  - [x] Server용 `createClient()` 사용
  - [x] `posts` 테이블 조회, `profiles` JOIN 구현
  - [x] `created_at DESC` 정렬 구현
  - [x] `category`, `tags` 필터링 구현

- [x] **2.1.2** 게시글 목록 클라이언트 훅 개선
  - [x] `hooks/use-posts.ts` 파일 개선
  - [x] `posts`, `loading`, `error` 상태 관리 확인
  - [x] `category`, `tags`, `author_id` 파라미터 지원
  - [x] `range()` 메서드로 페이지네이션 구현 (페이지당 10개)

- [x] **2.1.3** 게시글 카드 컴포넌트 데이터 바인딩
  - [x] `components/domain/posts/post-card.tsx` 파일 생성/수정
  - [x] `Post` 타입 Props 정의 (author 정보 포함)
  - [x] 제목, 요약(3줄), 태그, 작성자, 작성일시 표시
  - [x] `/posts/[id]` 링크 구현

#### 2.2 게시글 상세 조회 및 조회수 추적
- [x] **2.2.1** 게시글 상세 Server Component 구현
  - [x] `app/(dashboard)/posts/[id]/page.tsx` 파일 생성/수정
  - [x] Server용 `createClient()` 사용
  - [x] `posts` + `profiles` JOIN 쿼리 구현
  - [x] `post_applications` COUNT 쿼리 구현
  - [x] 404 에러 처리 (게시글 없음)

- [x] **2.2.2** 조회수 추적 API Route 구현
  - [x] `app/api/posts/[id]/view/route.ts` 파일 생성
  - [x] Server용 `createClient()` 사용
  - [x] `post_views` 테이블 INSERT 구현
  - [x] 중복 방지 로직 (`UNIQUE(post_id, user_id)`)
  - [x] IP 추적 구현 (익명 사용자용)
  - [x] 비동기 처리 (논블로킹)

- [x] **2.2.3** 게시글 상세 클라이언트 컴포넌트 구현
  - [x] `components/domain/posts/post-detail.tsx` 파일 생성/수정
  - [x] Server Component에서 받은 `post` 데이터 바인딩
  - [x] `useEffect`로 조회수 추적 API 호출
  - [x] 본문 마크다운 렌더링 구현
  - [x] 태그 표시, 작성자 정보 UI 구현

#### 2.3 게시글 생성 (AI 처리 포함)
- [x] **2.3.1** 게시글 생성 폼 컴포넌트 구현
  - [x] `components/domain/posts/post-editor.tsx` 파일 생성/수정
  - [x] `useState`로 폼 데이터 관리 (title, category, content, contact)
  - [x] 유효성 검사 구현 (제목 5자 이상, 카테고리 필수)
  - [x] `/api/posts` POST 요청 구현

- [x] **2.3.2** AI 처리 로직 완성
  - [x] `lib/ai/gemini.ts` 파일 완성
  - [x] Gemini API `gemini-pro:generateContent` 엔드포인트 호출
  - [x] 프롬프트 엔지니어링 ("3줄 요약 + 5개 기술 태그 추출")
  - [x] JSON 응답 파싱하여 `summary[]`, `tags[]` 추출
  - [x] 에러 처리 (실패 시 기본값 반환)

- [x] **2.3.3** 게시글 생성 API Route 개선
  - [x] `app/api/posts/route.ts` 파일 개선
  - [x] Server용 `createClient()` 사용
  - [x] `generateSummaryAndTags(content)` 호출
  - [x] `posts` 테이블 INSERT 구현
  - [x] `user_activities` 테이블 INSERT (activity_type: 'post_create')

#### 2.4 게시글 수정 및 삭제
- [x] **2.4.1** 게시글 수정 API Route 구현
  - [x] `app/api/posts/[id]/route.ts` 파일에 PUT 메서드 추가
  - [x] Server용 `createClient()` 사용
  - [x] 권한 체크 (`auth.uid() === post.author_id`)
  - [x] `posts.update().eq('id', id)` 구현
  - [x] content 변경 시 `generateSummaryAndTags()` 재호출
  - [x] `user_activities` INSERT (activity_type: 'post_update')

- [x] **2.4.2** 게시글 삭제 API Route 구현
  - [x] `app/api/posts/[id]/route.ts` 파일에 DELETE 메서드 개선
  - [x] Server용 `createClient()` 사용
  - [x] 권한 체크 (작성자만 삭제 가능)
  - [x] `posts.delete().eq('id', id)` 구현
  - [x] `user_activities` INSERT (activity_type: 'post_delete')

- [x] **2.4.3** 게시글 수정/삭제 UI 구현
  - [x] `components/domain/posts/post-actions.tsx` 파일 생성
  - [x] 조건부 렌더링 (`post.author_id === user.id`)
  - [x] 수정 버튼: `/posts/[id]/edit` 페이지로 이동
  - [x] 삭제 버튼: 확인 다이얼로그 후 DELETE API 호출

#### 2.5 프로필 수정
- [x] **2.5.1** 프로필 수정 폼 컴포넌트 구현
  - [x] `components/domain/profile/profile-form.tsx` 파일 개선
  - [x] `useProfile()` 훅으로 현재 프로필 로드
  - [x] 필드 구현: `username`, `avatar_url`, `tech_stack[]`
  - [x] `updateProfile()` 호출 구현

- [x] **2.5.2** 프로필 수정 훅 개선
  - [x] `hooks/use-profile.ts` 파일 개선
  - [x] `supabase.from('profiles').update(updates).eq('id', user.id)` 구현
  - [x] `user_activities` INSERT (activity_type: 'profile_update')
  - [x] 낙관적 업데이트 구현 (UI 즉시 반영)

#### 2.6 게시글 지원 (Application) CRUD
- [x] **2.6.1** 지원 생성 API Route 구현
  - [x] `app/api/posts/[id]/applications/route.ts` 파일 생성 (POST)
  - [x] Server용 `createClient()` 사용
  - [x] 중복 체크 (`UNIQUE(post_id, applicant_id)`)
  - [x] `post_applications` INSERT (`status: 'pending'`)
  - [x] `user_activities` INSERT (activity_type: 'application_create')

- [x] **2.6.2** 지원 목록 조회 구현
  - [x] `app/api/posts/[id]/applications/route.ts` 파일에 GET 메서드 추가
  - [x] Server용 `createClient()` 사용
  - [x] 권한 체크 (게시글 작성자 또는 지원자만 조회)
  - [x] `profiles` JOIN하여 지원자 정보 포함
  - [x] `created_at DESC` 정렬

- [x] **2.6.3** 지원 상태 변경 API Route 구현
  - [x] `app/api/applications/[id]/route.ts` 파일 생성 (PATCH)
  - [x] Server용 `createClient()` 사용
  - [x] 권한 체크 (작성자만 승인/거절, 지원자만 철회)
  - [x] `status` 필드 업데이트 구현
  - [x] `common_code_detail`에서 상태명 조회하여 표시

- [x] **2.6.4** 지원 UI 컴포넌트 구현
  - [x] `components/domain/posts/post-applications.tsx` 파일 생성
  - [x] 게시글 상세 페이지에 "지원하기" 버튼 추가
  - [x] 게시글 작성자에게 지원자 목록 표시
  - [x] 승인/거절 버튼 (작성자), 철회 버튼 (지원자) 구현

---

### Phase 3: Interaction & Feedback (상태 변경, 알림, 에러 핸들링)

#### 3.1 사용자 활동 로그 자동 기록
- [x] **3.1.1** 활동 로그 유틸리티 함수 구현
  - [x] `lib/utils/activity-logger.ts` 파일 생성
  - [x] Server용 `createClient()` 사용
  - [x] `logActivity(userId, activityType, metadata?)` 함수 구현
  - [x] 활동 타입 정의: 'login', 'post_view', 'post_create', 'post_update', 'post_delete', 'profile_update', 'application_create'
  - [x] 논블로킹 처리 구현 (에러 발생해도 메인 로직 영향 없음)

- [x] **3.1.2** 각 기능에 활동 로그 통합
  - [x] 게시글 생성: `app/api/posts/route.ts`에서 `logActivity()` 호출
  - [x] 게시글 수정: `app/api/posts/[id]/route.ts` (PUT)에서 호출
  - [x] 게시글 삭제: `app/api/posts/[id]/route.ts` (DELETE)에서 호출
  - [x] 프로필 수정: `hooks/use-profile.ts`의 `updateProfile()`에서 호출 (기존 코드 유지)
  - [x] 지원 생성: `app/api/posts/[id]/applications/route.ts`에서 호출
  - [x] 로그인: `app/api/auth/callback/route.ts`에서 호출
  - [x] 게시글 조회: `app/api/posts/[id]/view/route.ts`에서 호출

#### 3.2 통계 데이터 조회 및 표시
- [x] **3.2.1** 통계 조회 Server Action 구현
  - [x] `app/(dashboard)/page.tsx` 파일 수정
  - [x] Server용 `createClient()` 사용
  - [x] 총 게시글 수: `posts` COUNT 쿼리
  - [x] 총 사용자 수: `profiles` COUNT 쿼리
  - [x] 주간 활성 유저: `user_activities`에서 최근 7일간 고유 `user_id` COUNT
  - [x] 매칭 완료 수: `post_applications`에서 `status = 'accepted'` COUNT (스키마에 맞게 수정)
  - [x] 통계 객체 반환: `{ totalPosts, totalUsers, weeklyActiveUsers, matchedCount }`

- [x] **3.2.2** 통계 카드 컴포넌트 구현
  - [x] `components/posts/StatCard.tsx` 파일 활용/수정
  - [x] Props 정의: `label`, `value`, `icon`
  - [x] 숫자 표시, 아이콘, 라벨 UI 구현

#### 3.3 에러 핸들링 및 사용자 피드백
- [x] **3.3.1** 전역 에러 바운더리 구현
  - [x] `app/error.tsx` 파일 수정 (에러 타입별 메시지 표시)
  - [x] 에러 타입 구분: 네트워크 에러, 인증 에러, 데이터베이스 에러
  - [x] 에러 메시지 표시 UI 구현
  - [x] 재시도 버튼 구현

- [x] **3.3.2** API 에러 핸들링 표준화
  - [x] `lib/utils/api-error-handler.ts` 파일 생성
  - [x] `handleApiError(error)` 함수 구현
  - [x] Supabase 에러 파싱 (`error.code`, `error.message`)
  - [x] HTTP 에러 상태 코드별 메시지 매핑

- [x] **3.3.3** 클라이언트 에러 피드백 구현
  - [x] `components/ui/toast.tsx` 파일 생성 (shadcn/ui 기반)
  - [x] `components/ui/toast-provider.tsx` 파일 생성 (토스트 상태 관리)
  - [x] `components/ui/toaster.tsx` 파일 생성 (토스트 표시 컴포넌트)
  - [x] API 호출 실패 시 토스트 표시 통합 준비 완료
  - [x] 토스트 타입 구현: success, error, warning, info

#### 3.4 로딩 상태 관리
- [x] **3.4.1** 로딩 스피너 컴포넌트 구현
  - [x] `components/domain/shared/loading-spinner.tsx` 파일 활용/수정
  - [x] Props 정의: `size?` (small, medium, large)
  - [x] 회전 애니메이션 구현

- [x] **3.4.2** 스켈레톤 UI 구현
  - [x] `components/ui/skeleton.tsx` 파일 생성 (shadcn/ui 기반)
  - [x] 게시글 카드 로딩 시 스켈레톤 적용 준비 완료
  - [x] 프로필 카드 로딩 시 스켈레톤 적용 준비 완료
  - [x] 펄스 애니메이션 구현

#### 3.5 실시간 업데이트 (선택사항, Phase 2 확장)
- [x] **3.5.1** 게시글 실시간 구독 훅 구현
  - [x] `hooks/use-posts-realtime.ts` 파일 생성
  - [x] `supabase.channel('posts').on('postgres_changes', ...)` 구현
  - [x] INSERT, UPDATE, DELETE 이벤트 구독
  - [x] 콜백 함수로 목록 갱신 구현

- [x] **3.5.2** 지원 상태 실시간 업데이트
  - [x] `hooks/use-applications-realtime.ts` 파일 생성
  - [x] `post_applications` 테이블 변경 구독 구현
  - [x] 게시글 작성자가 지원 목록 실시간 확인 기능 구현 준비 완료

---

## 진행률 추적

### Phase 1: Foundation
- 전체 항목: 7개
- 완료 항목: 7개
- 진행률: 100% ✅

### Phase 2: Core Logic
- 전체 항목: 18개
- 완료 항목: 18개
- 진행률: 100% ✅

### Phase 3: Interaction & Feedback
- 전체 항목: 10개
- 완료 항목: 10개
- 진행률: 100% ✅

### 전체 진행률
- 전체 항목: 35개
- 완료 항목: 35개
- 진행률: 100% ✅

---

**작성일**: 2025-01-29  
**버전**: 1.0.0  
**마지막 업데이트**: 2025-01-29 (Phase 3 완료)  
**다음 단계**: 전체 기능 구현 완료. 테스트 및 버그 수정 단계로 진행
