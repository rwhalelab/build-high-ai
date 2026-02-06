# 환경변수 설정 가이드

이 프로젝트는 두 가지 환경변수 파일을 사용하여 로컬 개발 환경과 운영 환경을 분리합니다.

## 파일 구조

- `.env.local` - 로컬 공통 설정 (모든 환경에서 최우선, Git 커밋 안 됨)
- `.env.development.local` - 로컬 개발 전용 설정 (최우선순위, Git 커밋 안 됨)
- `.env.development` - 개발/운영 환경용 (Vercel 배포용, Git 커밋 가능)
- `.env.production` - 프로덕션 환경용 (NODE_ENV=production일 때 자동 로드)
- `.env.local.example` - 로컬 환경 설정 예제
- `.env.development.local.example` - 로컬 개발 전용 설정 예제
- `.env.development.example` - 개발 환경 설정 예제

## 설정 방법

### 1. 로컬 개발 환경 설정

1. `.env.local.example`을 복사하여 `.env.local` 파일 생성:
   ```bash
   cp .env.local.example .env.local
   ```

2. `.env.local` 파일을 열어 실제 값으로 수정:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
   SUPABASE_PROJECT_ID=your_supabase_project_id
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

3. `.env.development.local.example`을 복사하여 `.env.development.local` 파일 생성:
   ```bash
   cp .env.development.local.example .env.development.local
   ```

4. `.env.development.local` 파일은 이미 localhost 설정이 되어 있으므로 수정할 필요 없습니다.
   - 이 파일이 최우선순위이므로 `.env.development`의 Vercel URL을 무시합니다.
   - 로컬 개발 시 항상 `localhost:3000`을 사용합니다.

### 2. 개발/운영 환경 설정

1. `.env.development.example`을 복사하여 `.env.development` 파일 생성:
   ```bash
   cp .env.development.example .env.development
   ```

2. `.env.development` 파일을 열어 실제 값으로 수정:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE=your_supabase_service_role_key
   SUPABASE_PROJECT_ID=your_supabase_project_id
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

### 3. Vercel 배포 시 설정

Vercel에 배포할 때는 `.env.development` 파일의 값들을 Vercel 대시보드의 환경변수로 설정해야 합니다:

1. Vercel 프로젝트 대시보드로 이동
2. **Settings** → **Environment Variables** 선택
3. `.env.development` 파일의 모든 변수를 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`
   - `SUPABASE_PROJECT_ID`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `NEXTAUTH_URL`
   - `NEXT_PUBLIC_NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`

4. 각 환경(Production, Preview, Development)에 대해 설정할 수 있습니다.

## 환경변수 우선순위

Next.js는 다음 순서로 환경변수를 로드합니다 (높은 순서가 우선):

1. **`.env.development.local`** (로컬 개발 전용, 최우선순위) ⭐
2. `.env.local` (모든 환경 공통 설정)
3. `.env.development` 또는 `.env.production` (NODE_ENV에 따라 자동 로드)
4. `.env` (기본 설정)
5. 시스템 환경변수 (Vercel 등)

**중요**: 
- `.env.development.local`이 **최우선순위**이므로, 로컬 개발 시 이 파일의 값이 사용됩니다.
- `.env.development`에 Vercel URL이 있어도, `.env.development.local`에 localhost가 설정되어 있으면 localhost가 사용됩니다.
- Vercel에서는 시스템 환경변수가 자동으로 설정되므로, Vercel 대시보드에서 환경변수를 설정하면 됩니다.

## 보안 주의사항

- ⚠️ `.env.local`, `.env.development.local`, `.env.production.local` 파일은 **절대 Git에 커밋하지 마세요**
- ⚠️ `.env.development`, `.env.production` 파일은 Git에 커밋 가능하지만, 실제 API 키는 포함하지 마세요
- ⚠️ `.gitignore`에 이미 포함되어 있지만, 확인해보세요
- ⚠️ 민감한 정보(API 키, Secret 등)는 안전하게 관리하세요
- ⚠️ `.env.*.example` 파일에는 실제 값 대신 예제 값만 포함하세요

## 문제 해결

### 로컬에서 Vercel URL로 리다이렉트되는 경우

1. `.env.development.local` 파일이 존재하고 localhost URL이 설정되어 있는지 확인
2. 빌드 캐시 삭제: `.next` 폴더 삭제
3. 개발 서버 재시작 (`pnpm dev`)
4. 브라우저 콘솔에서 `process.env.NEXT_PUBLIC_NEXTAUTH_URL` 값 확인
5. 브라우저 캐시를 삭제하고 다시 시도

### 운영 환경에서 localhost로 리다이렉트되는 경우

1. Vercel 대시보드에서 환경변수가 올바르게 설정되어 있는지 확인
2. `.env.development` 파일의 값들이 올바른지 확인
3. Vercel에서 재배포
