/**
 * Supabase Auth 콜백 처리
 * 
 * Google OAuth 인증 후 콜백을 처리하고 세션을 설정
 * 트리거: handle_new_user() 함수가 자동으로 profiles 레코드 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/utils/activity-logger';
import { getServerBaseUrl } from '@/lib/utils/url';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  
  // Base URL 가져오기 (개발/운영 환경 자동 구분)
  const baseUrl = getServerBaseUrl(request);

  // OAuth 에러가 있는 경우
  if (error) {
    console.error('OAuth 에러:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '인증에 실패했습니다.')}`, baseUrl)
    );
  }

  // 인증 코드가 없는 경우
  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code&message=인증 코드가 없습니다.', baseUrl)
    );
  }

  const supabase = await createClient();
  
  // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 페이지로 리다이렉트
  if (!supabase) {
    return NextResponse.redirect(
      new URL('/login?error=supabase_not_configured&message=Supabase 환경 변수가 설정되지 않았습니다.', baseUrl)
    );
  }

  try {
    // 인증 코드를 세션으로 교환
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('세션 교환 오류:', exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, baseUrl)
      );
    }

    // 사용자 정보 가져오기 (활동 로그용)
    const { data: { user } } = await supabase.auth.getUser();
    
    // 활동 로그 기록 (비동기, 논블로킹)
    if (user) {
      logActivity(user.id, 'login', {
        provider: 'google',
      });
    }

    // 인증 성공 시 메인 페이지로 리다이렉트
    // 트리거가 자동으로 profiles 레코드를 생성함
    // Note: (dashboard)는 라우트 그룹이므로 URL에 포함되지 않음. 루트 경로(/)로 리다이렉트
    return NextResponse.redirect(new URL('/', baseUrl));
  } catch (err) {
    console.error('예상치 못한 오류:', err);
    return NextResponse.redirect(
      new URL('/login?error=unexpected&message=예상치 못한 오류가 발생했습니다.', baseUrl)
    );
  }
}
