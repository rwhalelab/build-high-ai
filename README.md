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
├── docs/                  # 문서
│   ├── PRD.md            # 제품 요구사항 정의서
│   ├── FLOW.md           # 서비스 흐름도
│   ├── functional_flow.md # 기능적 흐름 리스트
│   ├── tech-stack.md     # 기술 명세서
│   ├── db-schema.md      # 데이터베이스 설계 가이드
│   ├── db-schema-final.md # 데이터베이스 최종 스키마
│   ├── SUPABASE_UPDATE_GUIDE.md # Supabase 업데이트 가이드
│   └── seed_data.sql     # 시드 데이터
└── supabase/
    └── migrations/       # 데이터베이스 마이그레이션 파일
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
2. 데이터베이스 스키마 설정:
   - [Supabase 업데이트 가이드](./docs/SUPABASE_UPDATE_GUIDE.md)를 참고하여 마이그레이션 실행
   - 또는 `docs/db-schema-final.md`를 참고하여 수동으로 스키마 생성
3. Google OAuth 제공자 설정:
   - Supabase Dashboard → Authentication → Providers → Google
   - Google Cloud Console에서 OAuth 클라이언트 ID 및 Secret 설정

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📚 문서

### 핵심 문서
- [PRD (제품 요구사항 정의서)](./docs/PRD.md)
- [FLOW (서비스 흐름도)](./docs/FLOW.md)
- [기능적 흐름 리스트](./docs/functional_flow.md)

### 기술 문서
- [기술 스택 명세서](./docs/tech-stack.md)
- [데이터베이스 설계 가이드](./docs/db-schema.md)
- [데이터베이스 최종 스키마](./docs/db-schema-final.md)
- [Supabase 업데이트 가이드](./docs/SUPABASE_UPDATE_GUIDE.md)

### 개발 문서
- [로드맵](./docs/roadmap.md)
- [시드 데이터](./docs/seed_data.sql)

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

## 📝 구현 현황

### Phase 1: Foundation ✅
- [x] 프로젝트 구조 설계
- [x] Supabase 인증 (Google OAuth)
- [x] 공통 코드 조회 유틸리티
- [x] 프로필 기본 조회 및 표시

### Phase 2: Core Logic ✅
- [x] 게시글 목록 조회 및 필터링
- [x] 게시글 상세 조회 및 조회수 추적
- [x] 게시글 생성 (AI 처리 포함)
- [x] 게시글 수정 및 삭제
- [x] 프로필 수정
- [x] 게시글 지원 (Application) CRUD

### Phase 3: Interaction & Feedback ✅
- [x] 사용자 활동 로그 자동 기록
- [x] 통계 데이터 조회 및 표시
- [x] 에러 핸들링 및 사용자 피드백
- [x] 로딩 상태 관리
- [x] 실시간 업데이트

자세한 구현 현황은 [기능적 흐름 리스트](./docs/functional_flow.md)를 참고하세요.

## 🔒 보안

- **Row Level Security (RLS)**: 모든 테이블에 RLS 정책 적용으로 데이터 접근 제어
- **환경 변수**: 민감 정보는 `.env.local`에서 관리 (Git에 커밋하지 않음)
- **서버 사이드 세션 검증**: 모든 API Route에서 세션 검증 수행
- **인증**: Google OAuth를 통한 안전한 인증 플로우

자세한 보안 정책은 [DBA 정책 문서](./docs/DBA_POLICY.md)를 참고하세요.

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**작성일**: 2025-01-29  
**최종 업데이트**: 2025-01-29
