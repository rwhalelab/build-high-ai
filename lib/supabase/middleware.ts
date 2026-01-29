/**
 * 미들웨어용 Supabase 클라이언트
 * 
 * Next.js 미들웨어에서 사용하는 Supabase 클라이언트
 * 
 * 환경 변수가 없을 경우 null을 반환하여 UI 테스트 가능
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(request: NextRequest): { supabase: SupabaseClient | null; supabaseResponse: NextResponse } {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경 변수가 없으면 null 반환 (UI 테스트용)
  if (!supabaseUrl || !supabaseAnonKey) {
    return { supabase: null, supabaseResponse };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, supabaseResponse };
}
