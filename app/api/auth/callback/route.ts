/**
 * Supabase Auth 콜백 처리
 * 
 * Google OAuth 인증 후 콜백을 처리하고 세션을 설정
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    } else {
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login?error=supabase_not_configured', request.url));
    }
  }

  // 인증 성공 시 대시보드로 리다이렉트
  return NextResponse.redirect(new URL('/(dashboard)', request.url));
}
