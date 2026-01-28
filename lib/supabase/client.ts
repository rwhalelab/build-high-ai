/**
 * 브라우저용 Supabase 클라이언트
 * 
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 * 브라우저 환경에서만 실행됨
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
