/**
 * 인증 상태 관리 훅
 * 
 * Supabase 인증 상태를 관리하는 커스텀 훅
 * AuthProvider와 함께 사용
 */

'use client';

import { useAuth as useAuthContext } from '@/components/domain/auth/auth-provider';

export function useAuth() {
  return useAuthContext();
}
