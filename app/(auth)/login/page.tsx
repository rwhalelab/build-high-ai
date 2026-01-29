/**
 * 로그인 페이지
 * 
 * Google OAuth를 통한 Supabase 인증 처리
 * 인증 성공 시 대시보드로 리다이렉트
 */

import { GoogleSignInButton } from '@/components/domain/auth/google-sign-in-button';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Build-High</h1>
          <p className="mt-2 text-muted-foreground">
            엔지니어를 위한 스터디 및 프로젝트 팀 빌딩 플랫폼
          </p>
        </div>
        <div className="space-y-4">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
