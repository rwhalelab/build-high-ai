/**
 * 서버용 Supabase 클라이언트
 * 
 * 서버 컴포넌트 및 API Routes에서 사용하는 Supabase 클라이언트
 * 쿠키를 통한 세션 관리
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 쿠키 설정 실패 시 무시 (미들웨어에서 처리됨)
          }
        },
      },
    }
  );
}
