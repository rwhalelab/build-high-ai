/**
 * 프로필 관리 훅
 * 
 * 사용자 프로필 정보 조회 및 수정을 위한 커스텀 훅
 */

'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { createClient } from '@/lib/supabase/client';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // 프로필 조회
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 빈 프로필로 처리
      if (!supabase) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 반환
      if (!supabase) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('인증되지 않았습니다.');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  };
}
