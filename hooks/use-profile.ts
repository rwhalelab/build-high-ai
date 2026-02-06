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
      setError(null);
      
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 빈 프로필로 처리
      if (!supabase) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 세션 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        // Refresh token 에러인 경우 세션 클리어
        if (authError.message?.includes('refresh_token_not_found') || 
            authError.message?.includes('Invalid Refresh Token') ||
            authError.status === 400) {
          console.log('유효하지 않은 세션, 로그아웃 처리');
          await supabase.auth.signOut();
        }
        console.error('인증 확인 오류:', authError);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // 프로필 조회
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // 프로필이 없는 경우 (PGRST116: No rows returned)
      if (profileError) {
        // 프로필이 없는 경우 기본값 반환
        if (profileError.code === 'PGRST116') {
          const defaultProfile: Profile = {
            id: user.id,
            username: user.email?.split('@')[0] || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            tech_stack: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(defaultProfile);
          setLoading(false);
          return;
        }
        throw profileError;
      }

      setProfile(data);
    } catch (err) {
      console.error('프로필 조회 오류:', err);
      setError(err as Error);
      setProfile(null);
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
      setError(null);
      
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 반환
      if (!supabase) {
        throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        // Refresh token 에러인 경우 세션 클리어
        if (authError.message?.includes('refresh_token_not_found') || 
            authError.message?.includes('Invalid Refresh Token') ||
            authError.status === 400) {
          await supabase.auth.signOut();
        }
        throw new Error('인증되지 않았습니다.');
      }
      
      if (!user) throw new Error('인증되지 않았습니다.');

      // 낙관적 업데이트: UI 즉시 반영
      const optimisticProfile = { ...profile, ...updates } as Profile;
      setProfile(optimisticProfile);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // 업데이트 실패 시 원래 프로필로 복원
        setProfile(profile);
        throw error;
      }

      setProfile(data);

      // 활동 로그 기록 (비동기, 논블로킹)
      try {
        await supabase.from('user_activities').insert({
          user_id: user.id,
          activity_type: 'profile_update',
          metadata: {
            updated_fields: Object.keys(updates),
          },
        });
      } catch (logError) {
        // 활동 로그 실패는 무시 (논블로킹)
        console.error('활동 로그 기록 오류:', logError);
      }

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
