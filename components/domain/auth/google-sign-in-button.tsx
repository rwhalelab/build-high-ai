/**
 * Google 로그인 버튼 컴포넌트
 * 
 * Supabase Auth를 사용한 Google OAuth 로그인 처리
 */

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getClientBaseUrl } from '@/lib/utils/url';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignIn = async () => {
    if (!supabase) {
      console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    try {
      setLoading(true);

      // Base URL 가져오기 (로컬/운영 환경 자동 구분)
      const baseUrl = getClientBaseUrl();
      const redirectTo = `${baseUrl}/api/auth/callback`;
      
      // 디버깅 로그 출력 (항상 출력하여 확인 가능)
      console.log('OAuth 리다이렉트 URL:', redirectTo);
      console.log('Base URL:', baseUrl);
      console.log('현재 호스트:', window.location.hostname);
      console.log('환경:', window.location.hostname === 'localhost' ? '로컬' : '운영');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account', // 계정 선택 화면을 항상 표시하여 다른 계정으로 로그인 가능하도록
          },
        },
      });

      if (error) {
        console.error('Google 로그인 오류:', error);
        // TODO: 에러 핸들링 (토스트 알림 등)
      } else if (data?.url) {
        // OAuth URL이 생성되면 리다이렉트
        // Supabase가 생성한 URL로 리다이렉트 (이 URL이 Google OAuth를 포함)
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('예상치 못한 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading || !supabase}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {/* Google 아이콘 */}
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>{loading ? '로그인 중...' : 'Google로 로그인'}</span>
    </button>
  );
}
