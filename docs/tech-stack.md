# 기술 스택 명세서

## 📋 개요

Build-High 프로젝트의 기술 스택 및 아키텍처 설계 원칙을 정의합니다.

---

## 🛠️ 핵심 기술 스택

### Frontend Framework
- **Next.js 15** (App Router)
  - 서버 컴포넌트 우선 아키텍처
  - 파일 기반 라우팅
  - 서버 액션 및 API Routes 활용
  - React 19.2.3

### 스타일링
- **Tailwind CSS 4**
  - 유틸리티 퍼스트 CSS 프레임워크
  - 다크 모드 지원
  - 반응형 디자인

### UI 컴포넌트 라이브러리
- **shadcn/ui**
  - Radix UI 기반 접근성 컴포넌트
  - 커스터마이징 가능한 디자인 시스템
  - 복사-붙여넣기 방식의 컴포넌트 관리

### 아이콘
- **Lucide React**
  - 일관된 아이콘 세트
  - 트리 쉐이킹 지원

### 백엔드 & 데이터베이스
- **Supabase**
  - PostgreSQL 데이터베이스
  - Row Level Security (RLS) 기반 인증/권한 관리
  - 실시간 구독 기능 (Phase 2 확장용)
  - 스토리지 (Phase 2 미디어 관리용)

### 인증
- **Supabase Auth**
  - Google OAuth 2.0
  - 세션 관리 자동화
  - 서버/클라이언트 양쪽 지원

### AI 통합
- **Google Gemini API** (Phase 1)
  - 게시글 요약 생성 (3줄)
  - 기술 태그 추출 (5개)
  - 동기식 처리 (Sync-Save)

### 타입 안정성
- **TypeScript 5**
  - 엄격한 타입 체크
  - Supabase 자동 생성 타입 활용

---

## 📦 주요 의존성 패키지

### 필수 패키지
```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "lucide-react": "^0.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5",
    "tailwindcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "^16.1.6"
  }
}
```

### Phase 2 확장용 (향후 추가)
- `recharts`: 데이터 시각화
- `react-markdown`: 마크다운 에디터
- `zod`: 스키마 유효성 검사
- `react-hook-form`: 폼 관리

---

## 🏗️ 아키텍처 설계 원칙

### 1. 컴포넌트 계층 구조

```
components/
├── ui/              # 순수 UI 컴포넌트 (재사용 가능, 비즈니스 로직 없음)
└── domain/          # 도메인별 컴포넌트 (비즈니스 로직 포함)
    ├── auth/
    ├── posts/
    ├── profile/
    └── shared/
```

**원칙:**
- `ui/`: shadcn/ui 기반, props로만 동작하는 순수 컴포넌트
- `domain/`: 특정 도메인(게시글, 프로필 등)에 종속된 컴포넌트
- 도메인 컴포넌트는 `ui/` 컴포넌트를 조합하여 구성

### 2. 데이터 페칭 전략

- **서버 컴포넌트 우선**: 기본적으로 서버 컴포넌트에서 데이터 페칭
- **클라이언트 상호작용**: `use client`가 필요한 경우에만 클라이언트 컴포넌트 사용
- **React Server Actions**: 폼 제출 및 뮤테이션은 서버 액션 활용
- **API Routes**: 외부 API 호출 (AI 처리 등)은 API Routes 사용

### 3. 상태 관리

- **서버 상태**: Supabase를 통한 서버 상태는 React Query (Phase 2) 또는 커스텀 훅으로 관리
- **클라이언트 상태**: `useState`, `useReducer` 활용
- **전역 상태**: 필요 시 Context API (인증 상태 등)

### 4. 타입 안정성

- **Supabase 타입 자동 생성**: `supabase gen types` 명령어로 DB 스키마 타입 생성
- **도메인 타입 분리**: `types/` 폴더에 도메인별 타입 정의
- **API 응답 타입**: AI 응답, API 응답 등 명시적 타입 정의

### 5. 에러 처리

- **에러 바운더리**: Next.js Error Boundary 활용
- **폼 유효성 검사**: 클라이언트 및 서버 양쪽 검사
- **사용자 피드백**: Toast 알림 (shadcn/ui toast 컴포넌트)

---

## 🎨 UI/UX 가이드라인

### 디자인 시스템
- **v0.dev 기반**: 전문적이고 깔끔한 UI 디자인
- **컬러 팔레트**: Tailwind 기본 컬러 + 커스텀 컬러
- **타이포그래피**: Geist 폰트 (Next.js 기본)

### 반응형 디자인
- 모바일 퍼스트 접근
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### 접근성 (A11y)
- shadcn/ui의 Radix UI 기반 컴포넌트 활용
- 키보드 네비게이션 지원
- ARIA 레이블 적절히 사용

---

## 🔐 보안 고려사항

### 인증 & 권한
- Supabase RLS 정책으로 데이터 접근 제어
- 서버 사이드에서 세션 검증
- 클라이언트 사이드 토큰 관리

### 환경 변수
- `.env.local`: 로컬 개발 환경 변수
- Supabase URL/Key, AI API Key 등 민감 정보 관리
- Git에 커밋하지 않도록 `.gitignore` 설정

### 데이터 검증
- 클라이언트: 폼 레벨 유효성 검사
- 서버: API Routes 및 Server Actions에서 재검증

---

## 🚀 성능 최적화

### 이미지 최적화
- Next.js Image 컴포넌트 활용
- Phase 2에서 Supabase Storage 연동

### 코드 스플리팅
- Next.js 자동 코드 스플리팅
- 동적 임포트 활용 (`next/dynamic`)

### 캐싱 전략
- 서버 컴포넌트 캐싱
- Supabase 쿼리 결과 캐싱 (Phase 2)

---

## 📝 코딩 컨벤션

### 파일 명명 규칙
- 컴포넌트: `kebab-case.tsx` (예: `post-card.tsx`)
- 훅: `use-kebab-case.ts` (예: `use-auth.ts`)
- 유틸리티: `kebab-case.ts` (예: `cn.ts`)

### 컴포넌트 구조
```tsx
// 1. Imports
import { ... } from '...'

// 2. Types/Interfaces
interface Props { ... }

// 3. Component
export function ComponentName({ ... }: Props) {
  // 4. Hooks
  // 5. Handlers
  // 6. Render
  return (...)
}
```

### 주석 규칙
- 복잡한 로직은 JSDoc 주석
- TODO는 `// TODO: 설명` 형식
- Phase 2 기능은 `// Phase 2:` 주석

---

## 🔄 Phase 1 → Phase 2 마이그레이션 가이드

### 추가될 기술 스택
- **Recharts**: 통계 차트 시각화
- **React Hook Form + Zod**: 고급 폼 관리 및 검증
- **Supabase Realtime**: 실시간 채팅 기능
- **Supabase Storage**: 이미지 업로드
- **Streaming API**: AI 실시간 피드백

### 확장 포인트
- `lib/ai/`: 스트리밍 처리 로직 추가
- `components/domain/posts/`: 이미지 업로드 컴포넌트 추가
- `hooks/`: 실시간 구독 훅 추가

---

## 📚 참고 자료

- [Next.js 15 공식 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Google Gemini API 문서](https://ai.google.dev/docs)
