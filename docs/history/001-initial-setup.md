# 001 - 초기 환경 구축 (Initial Setup)

## 1. 프로젝트 개요

- **프로젝트명:** Build-High (빌드-하이)
- **목적:** 대학생/취준생을 위한 사이드 프로젝트 팀원 모집 및 커뮤니티 플랫폼
- **핵심 가치:** 5가지 핵심 데이터 칩(직군, 기술, 기간 등)을 통한 명확한 정보 전달

---

## 2. 기술 스택 선정 이유 (Tech Stack)

| 구분 | 선택 | 이유 |
|------|------|------|
| **Framework** | Next.js 15 (App Router) | SEO 및 최적화된 사용자 경험 |
| **Styling** | Tailwind CSS + Lucide React | 빠른 UI 프로토타이핑 |
| **Backend/DB** | Supabase | 서버리스 환경 및 실시간 데이터 처리 |
| **Package Manager** | pnpm | 설치 속도 및 디스크 효율성 |
| **AI Tooling** | Cursor | v0 UI 이식 및 Vibe Coding 전략 |

---

## 3. 초기 환경 구축 내역

### Boilerplate
- Next.js 기본 구조 세팅
- `lib`, `components`, `types` 폴더 구조 확립
- App Router 기반 라우팅 (`app/`, `app/(auth)/`, `app/(dashboard)/` 등)

### Design Assets
- v0.dev를 통한 초기 UI 설계 및 자재 확보
- 공통 컴포넌트(`components/ui/`, `components/common/`) 및 도메인 컴포넌트 구조 정립

### Project Rules
- `.cursor/rules/*.mdc`를 통한 AI 협업 규칙 수립
  - **000-project-core.mdc:** PRD·FLOW 준수, 프로젝트 구조 및 제외 규칙
  - **100-frontend-style.mdc:** 프론트엔드 스타일 가이드
  - **200-nextjs-supabase-standard.mdc:** Next.js·Supabase 표준
  - **300-history-logging.mdc:** 히스토리 로깅 규칙

---

## 4. 주요 문서화 현황

| 문서 | 설명 |
|------|------|
| `docs/PRD.md` | 제품 요구사항 정의서 (타겟 유저, 로드맵, DB 스키마, AI 시나리오 등) |
| `docs/FLOW.md` | 유저 시나리오 및 데이터 흐름도 (서비스 아키텍처, 시퀀스 다이어그램) |

---

*이 문서는 초기 세팅 시점의 프로젝트 개요·기술 선택·구축 내역·문서 현황을 기록한 히스토리 문서입니다.*
