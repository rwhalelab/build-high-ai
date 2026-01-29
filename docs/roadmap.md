# Google OAuth 구현 로드맵 (Supabase SDK 기반)

## 📋 개요

이 문서는 Build-High 프로젝트에서 Supabase SDK를 활용하여 Google OAuth 인증을 구현하기 위한 단계별 구현 계획입니다.

**현재 상태:**
- ✅ Supabase 클라이언트 설정 완료 (client.ts, server.ts, middleware.ts)
- ✅ AuthProvider 구현 완료
- ✅ 콜백 라우트 기본 구조 완료
- ✅ 데이터베이스 스키마 및 RLS 정책 설정 완료
- ✅ 프로필 자동 생성 트리거 설정 완료
- ⏳ Google OAuth 제공자 설정 필요
- ⏳ Google Sign-In 버튼 구현 필요
- ⏳ 로그인 페이지 완성 필요

---

## 🎯 구현 목표

1. Google OAuth를 통한 사용자 인증
2. 인증 성공 시 자동 프로필 생성
3. 세션 관리 및 보호된 라우트 처리
4. 사용자 경험 최적화 (로딩 상태, 에러 처리)

---

## 📝 Step-by-Step 구현 계획

### Phase 1: Supabase Dashboard 설정

#### Step 1.1: Google OAuth 제공자 설정

**목표:** Supabase Dashboard에서 Google OAuth 제공자를 활성화하고 설정

**작업 내용:**

1. **Supabase Dashboard 접속**
   - [Supabase Dashboard](https://app.supabase.com) 접속
   - 프로젝트 선택

2. **Authentication 설정**
   - 좌측 메뉴에서 **Authentication** 클릭
   - **Providers** 탭 선택

3. **Google 제공자 활성화**
   - **Google** 제공자 찾기
   - **Enable Google provider** 토글 활성화

4. **Google OAuth 자격 증명 설정**
   - **Google Cloud Console**에서 OAuth 2.0 클라이언트 ID 생성 필요
   - **Client ID (for OAuth)** 입력
   - **Client Secret (for OAuth)** 입력

5. **리디렉션 URL 설정**
   - **Redirect URLs** 섹션 확인
   - 다음 URL이 자동으로 추가되어야 함:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - 개발 환경용 추가 (필요시):
     ```
     http://localhost:3000/api/auth/callback
     ```

**Google Cloud Console 설정 (필요한 경우):**

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 또는 생성
3. **APIs & Services** > **Credentials** 이동
4. **Create Credentials** > **OAuth 2.0 Client ID** 선택
5. **Application type**: Web application 선택
6. **Authorized redirect URIs**에 Supabase 콜백 URL 추가:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
7. 생성된 **Client ID**와 **Client Secret** 복사하여 Supabase에 입력

**검증:**
- ✅ Google 제공자가 활성화되어 있는지 확인
- ✅ Client ID와 Client Secret이 올바르게 설정되었는지 확인

---

### Phase 2: 환경 변수 설정

#### Step 2.1: 환경 변수 파일 생성 및 설정

**목표:** 프로젝트에 필요한 환경 변수 설정

**작업 내용:**

1. **`.env.local` 파일 생성** (이미 존재하는 경우 확인)
   ```bash
   # 프로젝트 루트에서
   cp .env.local.example .env.local
   ```

2. **환경 변수 값 설정**
   ```env
   # Supabase 환경 변수
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   
   # Google Gemini API 키 (AI 기능용)
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

3. **환경 변수 값 확인**
   - Supabase Dashboard > **Settings** > **API**에서 확인
   - `Project URL`: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - `anon public` key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용

**검증:**
- ✅ `.env.local` 파일이 존재하는지 확인
- ✅ 모든 환경 변수가 올바르게 설정되었는지 확인
- ✅ Git에 커밋되지 않았는지 확인 (`.gitignore` 확인)

---

### Phase 3: Google Sign-In 버튼 컴포넌트 구현

#### Step 3.1: GoogleSignInButton 컴포넌트 구현

**목표:** Supabase Auth를 사용한 Google 로그인 버튼 구현

**파일:** `components/domain/auth/google-sign-in-button.tsx`

**작업 내용:**

1. **Supabase 클라이언트 가져오기**
   ```typescript
   import { createClient } from '@/lib/supabase/client';
   ```

2. **로그인 핸들러 구현**
   ```typescript
   const handleSignIn = async () => {
     const supabase = createClient();
     if (!supabase) {
       console.error('Supabase client is not configured');
       return;
     }

     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: `${window.location.origin}/api/auth/callback`,
       },
     });

     if (error) {
       console.error('Error signing in:', error);
       // TODO: 에러 처리 (Toast 알림 등)
     }
   };
   ```

3. **UI 개선**
   - Google 아이콘 추가 (Lucide React 또는 SVG)
   - 로딩 상태 처리
   - 에러 상태 처리
   - 접근성 개선 (aria-label 등)

**구현 예시:**
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    const supabase = createClient();
    if (!supabase) {
      console.error('Supabase client is not configured');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        console.error('Error signing in:', error);
        // TODO: Toast 알림 표시
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2"
      variant="outline"
    >
      {/* Google 아이콘 SVG */}
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{loading ? '로그인 중...' : 'Google로 로그인'}</span>
    </Button>
  );
}
```

**검증:**
- ✅ 버튼 클릭 시 Google OAuth 페이지로 리디렉션되는지 확인
- ✅ 로딩 상태가 올바르게 표시되는지 확인
- ✅ 에러 발생 시 적절한 처리가 되는지 확인

---

### Phase 4: 로그인 페이지 완성

#### Step 4.1: LoginPage 컴포넌트 구현

**목표:** Google Sign-In 버튼을 포함한 로그인 페이지 완성

**파일:** `app/(auth)/login/page.tsx`

**작업 내용:**

1. **GoogleSignInButton 컴포넌트 통합**
   ```typescript
   import { GoogleSignInButton } from '@/components/domain/auth/google-sign-in-button';
   ```

2. **이미 로그인한 사용자 처리**
   - `useAuth` 훅을 사용하여 현재 사용자 확인
   - 이미 로그인한 경우 대시보드로 리디렉션

3. **UI/UX 개선**
   - 로그인 페이지 레이아웃 개선
   - 브랜딩 요소 추가
   - 에러 메시지 표시 영역 추가

**구현 예시:**
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { GoogleSignInButton } from '@/components/domain/auth/google-sign-in-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인한 경우 대시보드로 리디렉션
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (user) {
    return null; // 리디렉션 중
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Build-High에 오신 것을 환영합니다
          </CardTitle>
          <CardDescription className="text-center">
            엔지니어를 위한 스터디 및 프로젝트 팀 빌딩 플랫폼
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  );
}
```

**검증:**
- ✅ 로그인 페이지가 올바르게 렌더링되는지 확인
- ✅ 이미 로그인한 사용자가 접근 시 대시보드로 리디렉션되는지 확인
- ✅ Google Sign-In 버튼이 정상 작동하는지 확인

---

### Phase 5: 콜백 처리 개선

#### Step 5.1: 콜백 라우트 검증 및 개선

**목표:** OAuth 콜백 처리 로직 검증 및 에러 처리 개선

**파일:** `app/api/auth/callback/route.ts`

**작업 내용:**

1. **현재 구현 검토**
   - 코드 교환 로직 확인
   - 에러 처리 개선
   - 리디렉션 경로 확인

2. **에러 처리 개선**
   ```typescript
   export async function GET(request: NextRequest) {
     const requestUrl = new URL(request.url);
     const code = requestUrl.searchParams.get('code');
     const error = requestUrl.searchParams.get('error');
     const errorDescription = requestUrl.searchParams.get('error_description');

     // OAuth 에러 처리
     if (error) {
       console.error('OAuth error:', error, errorDescription);
       return NextResponse.redirect(
         new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
       );
     }

     if (!code) {
       return NextResponse.redirect(
         new URL('/login?error=no_code', request.url)
       );
     }

     const supabase = await createClient();
     if (!supabase) {
       return NextResponse.redirect(
         new URL('/login?error=supabase_not_configured', request.url)
       );
     }

     try {
       const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
       
       if (exchangeError) {
         console.error('Session exchange error:', exchangeError);
         return NextResponse.redirect(
           new URL(`/login?error=exchange_failed`, request.url)
         );
       }

       // 인증 성공 시 대시보드로 리디렉트
       return NextResponse.redirect(new URL('/', request.url));
     } catch (err) {
       console.error('Unexpected error:', err);
       return NextResponse.redirect(
         new URL('/login?error=unexpected', request.url)
       );
     }
   }
   ```

**검증:**
- ✅ 정상적인 OAuth 플로우에서 세션이 올바르게 설정되는지 확인
- ✅ 에러 발생 시 적절한 에러 페이지로 리디렉션되는지 확인
- ✅ 콜백 후 대시보드로 올바르게 리디렉션되는지 확인

---

### Phase 6: 프로필 자동 생성 확인

#### Step 6.1: 프로필 자동 생성 트리거 검증

**목표:** Google 로그인 시 프로필이 자동으로 생성되는지 확인

**작업 내용:**

1. **트리거 함수 확인**
   - `supabase/migrations/20250129000005_create_triggers.sql` 확인
   - `handle_new_user()` 함수가 올바르게 생성되었는지 확인

2. **프로필 생성 테스트**
   - Google 로그인 수행
   - Supabase Dashboard > **Table Editor** > **profiles** 테이블 확인
   - 새 사용자의 프로필이 자동으로 생성되었는지 확인

3. **프로필 데이터 확인**
   - `id`: auth.users의 id와 일치하는지 확인
   - `username`: Google 계정의 이메일에서 추출된 값인지 확인
   - `avatar_url`: Google 프로필 이미지 URL이 설정되었는지 확인 (있는 경우)

**검증 SQL:**
```sql
-- 최근 생성된 프로필 확인
SELECT 
  p.*,
  u.email,
  u.raw_user_meta_data
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
```

**검증:**
- ✅ Google 로그인 후 profiles 테이블에 레코드가 자동 생성되는지 확인
- ✅ 프로필 데이터가 올바르게 설정되었는지 확인

---

### Phase 7: 세션 관리 및 보호된 라우트

#### Step 7.1: 미들웨어를 통한 라우트 보호

**목표:** 인증되지 않은 사용자의 보호된 라우트 접근 차단

**작업 내용:**

1. **미들웨어 파일 생성/확인**
   - `middleware.ts` 파일이 프로젝트 루트에 있는지 확인
   - 없으면 생성

2. **라우트 보호 로직 구현**
   ```typescript
   // middleware.ts
   import { createClient } from '@/lib/supabase/middleware';
   import { NextResponse, type NextRequest } from 'next/server';

   export async function middleware(request: NextRequest) {
     const { supabase, supabaseResponse } = createClient(request);
     
     // 세션 확인
     const {
       data: { session },
     } = await supabase.auth.getSession();

     const url = request.nextUrl.clone();
     const isAuthPage = url.pathname.startsWith('/login');
     const isPublicPage = url.pathname === '/' || url.pathname.startsWith('/api');

     // 인증되지 않은 사용자가 보호된 페이지에 접근하는 경우
     if (!session && !isAuthPage && !isPublicPage) {
       url.pathname = '/login';
       return NextResponse.redirect(url);
     }

     // 이미 로그인한 사용자가 로그인 페이지에 접근하는 경우
     if (session && isAuthPage) {
       url.pathname = '/';
       return NextResponse.redirect(url);
     }

     return supabaseResponse;
   }

   export const config = {
     matcher: [
       /*
        * Match all request paths except for the ones starting with:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder
        */
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   };
   ```

**검증:**
- ✅ 인증되지 않은 사용자가 보호된 라우트 접근 시 로그인 페이지로 리디렉션되는지 확인
- ✅ 이미 로그인한 사용자가 로그인 페이지 접근 시 대시보드로 리디렉션되는지 확인
- ✅ 세션이 올바르게 유지되는지 확인

---

### Phase 8: 로그아웃 기능 구현

#### Step 8.1: 로그아웃 버튼 및 핸들러 구현

**목표:** 사용자가 로그아웃할 수 있는 기능 제공

**작업 내용:**

1. **로그아웃 함수 구현**
   - `hooks/use-auth.ts` 또는 별도 유틸리티에 로그아웃 함수 추가

2. **로그아웃 버튼 컴포넌트 생성**
   - Header 또는 Navigation 컴포넌트에 로그아웃 버튼 추가

**구현 예시:**
```typescript
// hooks/use-auth.ts에 추가
export function useAuth() {
  const context = useAuthContext();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return {
    ...context,
    signOut,
  };
}
```

**검증:**
- ✅ 로그아웃 버튼 클릭 시 세션이 올바르게 종료되는지 확인
- ✅ 로그아웃 후 로그인 페이지로 리디렉션되는지 확인

---

### Phase 9: 에러 처리 및 사용자 피드백

#### Step 9.1: Toast 알림 시스템 구현

**목표:** 인증 관련 에러 및 성공 메시지를 사용자에게 표시

**작업 내용:**

1. **Toast 컴포넌트 추가** (shadcn/ui 사용)
   ```bash
   npx shadcn@latest add toast
   ```

2. **Toast Provider 설정**
   - `app/layout.tsx`에 Toaster 컴포넌트 추가

3. **에러 메시지 표시**
   - GoogleSignInButton에서 에러 발생 시 Toast 표시
   - 콜백 라우트에서 에러 발생 시 Toast 표시

**구현 예시:**
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// 에러 발생 시
toast({
  title: '로그인 실패',
  description: error.message,
  variant: 'destructive',
});
```

**검증:**
- ✅ 에러 발생 시 Toast 알림이 표시되는지 확인
- ✅ 성공 메시지가 적절히 표시되는지 확인

---

### Phase 10: 테스트 및 검증

#### Step 10.1: 전체 인증 플로우 테스트

**목표:** Google OAuth 인증 플로우의 모든 단계 검증

**테스트 시나리오:**

1. **신규 사용자 로그인**
   - ✅ Google 로그인 버튼 클릭
   - ✅ Google OAuth 페이지로 리디렉션
   - ✅ Google 계정 선택 및 승인
   - ✅ 콜백 처리 및 세션 설정
   - ✅ 프로필 자동 생성 확인
   - ✅ 대시보드로 리디렉션

2. **기존 사용자 로그인**
   - ✅ Google 로그인 버튼 클릭
   - ✅ Google OAuth 페이지로 리디렉션
   - ✅ Google 계정 선택 및 승인
   - ✅ 콜백 처리 및 세션 설정
   - ✅ 기존 프로필 확인
   - ✅ 대시보드로 리디렉션

3. **세션 유지**
   - ✅ 페이지 새로고침 후에도 로그인 상태 유지 확인
   - ✅ 다른 페이지 이동 후에도 로그인 상태 유지 확인

4. **로그아웃**
   - ✅ 로그아웃 버튼 클릭
   - ✅ 세션 종료 확인
   - ✅ 로그인 페이지로 리디렉션 확인

5. **에러 처리**
   - ✅ OAuth 취소 시 에러 처리 확인
   - ✅ 네트워크 에러 시 에러 처리 확인
   - ✅ 잘못된 콜백 코드 시 에러 처리 확인

**검증 체크리스트:**
- ✅ 모든 테스트 시나리오 통과
- ✅ 콘솔에 에러가 없는지 확인
- ✅ 사용자 경험이 부드러운지 확인
- ✅ 보안 정책이 올바르게 적용되었는지 확인

---

## 🔧 추가 개선 사항 (선택사항)

### 1. 소셜 로그인 추가 제공자
- GitHub OAuth
- Apple OAuth
- Email/Password 인증

### 2. 프로필 이미지 최적화
- Google 프로필 이미지를 Supabase Storage에 저장
- 이미지 리사이징 및 최적화

### 3. 인증 상태 지속성 개선
- Refresh token 자동 갱신
- 세션 만료 전 자동 갱신

### 4. 다국어 지원
- 로그인 페이지 다국어 지원
- 에러 메시지 다국어 지원

---

## 📚 참고 자료

### Supabase 공식 문서
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Google OAuth 설정 가이드](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js 통합 가이드](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### Next.js 공식 문서
- [Next.js App Router 문서](https://nextjs.org/docs/app)
- [Middleware 문서](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### Google Cloud Console
- [OAuth 2.0 설정 가이드](https://developers.google.com/identity/protocols/oauth2)

---

## ✅ 구현 완료 체크리스트

- [ ] Phase 1: Supabase Dashboard 설정 완료
- [ ] Phase 2: 환경 변수 설정 완료
- [ ] Phase 3: Google Sign-In 버튼 구현 완료
- [ ] Phase 4: 로그인 페이지 완성 완료
- [ ] Phase 5: 콜백 처리 개선 완료
- [ ] Phase 6: 프로필 자동 생성 확인 완료
- [ ] Phase 7: 세션 관리 및 보호된 라우트 완료
- [ ] Phase 8: 로그아웃 기능 구현 완료
- [ ] Phase 9: 에러 처리 및 사용자 피드백 완료
- [ ] Phase 10: 테스트 및 검증 완료

---

**작성일**: 2025-01-29  
**버전**: 1.0.0  
**작성자**: AI Assistant
