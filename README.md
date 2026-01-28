# Build-High

엔지니어를 위한 스터디 및 프로젝트 팀 빌딩 매칭 플랫폼

## 🚀 기술 스택

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini API

## 📁 프로젝트 구조

```
build-high-ai/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 라우트
│   ├── (dashboard)/       # 대시보드 라우트
│   └── api/               # API Routes
├── components/
│   ├── ui/                # shadcn/ui 공유 컴포넌트
│   └── domain/            # 도메인별 비즈니스 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
│   ├── supabase/         # Supabase 클라이언트
│   ├── ai/               # AI 연동
│   └── utils/            # 유틸리티 함수
├── hooks/                 # 커스텀 훅
├── types/                 # TypeScript 타입 정의
└── docs/                  # 문서
    ├── tech-stack.md     # 기술 명세서
    └── db-schema.md      # 데이터베이스 설계 가이드
```

## 🛠️ 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env.local.example`을 참고하여 `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `docs/db-schema.md`를 참고하여 데이터베이스 스키마 생성
3. Google OAuth 제공자 설정 (인증 > 제공자 > Google)

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📚 문서

- [기술 스택 명세서](./docs/tech-stack.md)
- [데이터베이스 설계 가이드](./docs/db-schema.md)
- [PRD](./PRD.md)
- [FLOW](./FLOW.md)

## 🏗️ 개발 가이드

### 컴포넌트 추가

- **공유 UI 컴포넌트**: `components/ui/`에 shadcn/ui로 추가
  ```bash
  npx shadcn@latest add button
  ```

- **도메인 컴포넌트**: `components/domain/`에 도메인별로 구성

### 타입 생성

Supabase 데이터베이스 타입 자동 생성:

```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

### 코드 스타일

- 파일 명명: `kebab-case`
- 컴포넌트: PascalCase
- 함수/변수: camelCase

## 📝 Phase 1 구현 목표

- [x] 프로젝트 구조 설계
- [ ] Supabase 인증 (Google OAuth)
- [ ] 프로필 관리 (기술 스택 등록/수정)
- [ ] 게시글 CRUD (AI 요약/태그 자동 생성)
- [ ] 메인 대시보드 (통계 카드, 게시글 리스트)
- [ ] 상세 페이지

## 🔒 보안

- Row Level Security (RLS) 정책으로 데이터 접근 제어
- 환경 변수로 민감 정보 관리
- 서버 사이드 세션 검증

## 📄 라이선스

MIT
