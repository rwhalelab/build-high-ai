# 002 · UI 마이그레이션 및 의존성 추가

## 1. 개요

| 항목 | 내용 |
|------|------|
| **작업 시기** | 2025년 1월 |
| **작업자** | 시니어 개발자 & AI 파트너 |
| **목적** | v0.dev 기반 UI 이식, shadcn/ui 스타일 유틸리티 및 아이콘·백엔드 연동을 위한 패키지 추가 |

---

## 2. `pnpm add`로 추가한 라이브러리 목록

### 2.1 프로덕션 의존성 (dependencies)

| 패키지 | 버전 (package.json 기준) | 용도 구분 |
|--------|---------------------------|-----------|
| `lucide-react` | ^0.454.0 | UI · 아이콘 |
| `tailwind-merge` | ^3.3.1 | 스타일 유틸리티 |
| `clsx` | ^2.1.1 | 스타일 유틸리티 |
| `@supabase/supabase-js` | ^2.93.2 | 백엔드 · DB · 인증 |
| `@supabase/ssr` | ^0.8.0 | 백엔드 · SSR 세션 |

※ Next.js, React, React-DOM은 초기 프로젝트 생성 시 포함된 코어 의존성으로, 본 문서의 “추가 라이브러리” 목록에서는 제외함.

---

## 3. 각 라이브러리를 설치한 이유

### 3.1 UI · 스타일 유틸리티

- **`lucide-react`**
  - v0.dev / shadcn/ui 계열 UI에서 사용하는 아이콘 세트와 동일하게 맞추기 위함.
  - 네비게이션(Header, Footer, navigation), 카드(DiscoveryPostCard, StatCard), 폼(프로필·글쓰기), 상세·빈 상태 등 전역에서 아이콘으로 일관된 톤 유지.
  - 트리 쉐이킹 지원으로 번들 크기 관리에 유리.

- **`tailwind-merge`**
  - Tailwind CSS 클래스명을 병합할 때 충돌을 방지하기 위함.
  - 예: `"p-4 p-6"` → `p-6`만 적용되도록 후속 클래스가 이전 클래스를 덮어쓰도록 처리.
  - `lib/utils/cn.ts`에서 `twMerge`로 사용하며, 모든 UI 컴포넌트(Button, Card, Input, Badge 등)의 `className` 병합에 사용.

- **`clsx`**
  - 조건부·여러 개의 클래스명을 하나의 문자열로 합치기 위함.
  - `cn()` 유틸에서 `clsx(inputs)`로 사용하며, `tailwind-merge`와 함께 “조건부 클래스 + Tailwind 충돌 제거”를 한 번에 처리.
  - variant·size·상태에 따른 스타일 조합(예: `button.tsx`의 variant/size)에 필수.

### 3.2 백엔드 · 인증

- **`@supabase/supabase-js`**
  - Supabase 클라이언트(DB, Auth, Realtime 등) 연동용 공식 라이브러리.
  - 프로젝트의 데이터 저장·인증(Google OAuth 등)을 Supabase 기준으로 구현하기 위함.

- **`@supabase/ssr`**
  - Next.js App Router 환경에서 서버·클라이언트 양쪽에서 쿠키 기반 세션을 안전하게 다루기 위함.
  - SSR/미들웨어에서 세션 검증 및 클라이언트 생성 시 사용.

---

## 4. 발생했던 에러와 해결 과정 요약

- **Tailwind 클래스 충돌**
  - 문제: v0/shadcn 스타일 이식 시 `className`을 단순 이어붙이면 동일 유틸리티(예: `p-4` vs `p-6`)가 동시에 적용되어 레이아웃이 깨짐.
  - 해결: `tailwind-merge`로 병합 순서를 고려한 최종 클래스만 적용하도록 하고, `cn()`에서 `clsx` + `twMerge` 조합으로 통일.

- **`cn()` 유틸 없음**
  - 문제: shadcn/ui 스타일 컴포넌트는 대부분 `cn(...)`으로 클래스를 합치는데, 해당 유틸이 없으면 import 에러 발생.
  - 해결: `clsx`와 `tailwind-merge`를 설치한 뒤 `lib/utils/cn.ts`에 `cn()` 구현 및 전역 사용.

- **Tailwind v4와의 호환**
  - 참고: 프로젝트는 Tailwind v4(`@tailwindcss/postcss`, `tailwindcss: ^4`) 사용. `tailwind-merge`는 Tailwind 버전과 무관하게 “문자열 클래스명”만 병합하므로 v4에서도 그대로 사용 가능.

- **아이콘 일관성**
  - v0/shadcn 컴포넌트는 대부분 Lucide 아이콘을 가정하므로, `lucide-react` 하나로 통일하여 네이밍·사이즈·스타일을 맞춤.

---

## 5. 참고

- 스타일·UI 규칙: `.cursor/rules/100-frontend-style.mdc`, `docs/tech-stack.md`
- `cn()` 구현: `lib/utils/cn.ts`
- 전체 의존성 목록: `package.json`
