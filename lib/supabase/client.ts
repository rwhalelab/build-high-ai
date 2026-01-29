/**
 * 브라우저용 Supabase 클라이언트
 * 
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 * 브라우저 환경에서만 실행됨
 * 
 * 환경 변수가 없을 경우 null을 반환하여 UI 테스트 가능
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경 변수가 없으면 null 반환 (UI 테스트용)
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
