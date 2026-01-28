/**
 * 루트 페이지
 * 
 * 인증 상태에 따라 로그인 페이지 또는 대시보드로 리다이렉트
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/(dashboard)');
  } else {
    redirect('/(auth)/login');
  }
}
