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
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 인증 성공 시 대시보드로 리다이렉트
  return NextResponse.redirect(new URL('/(dashboard)', request.url));
}
