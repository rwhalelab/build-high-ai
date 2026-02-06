/**
 * 인증 상태 제공자 컴포넌트
 * 
 * Supabase 세션 상태를 전역으로 관리하는 Context Provider
 * 미들웨어와 세션 동기화: 쿠키 기반 세션 관리로 서버/클라이언트 세션 일관성 유지
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, type AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Supabase 클라이언트가 없으면 (환경 변수 미설정) 로딩 완료 처리만 수행
    if (!supabase) {
      // 비동기로 처리하여 렌더링 사이클 문제 방지
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    // 초기 세션 확인 (서버 세션과 동기화)
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Refresh token 에러인 경우 세션 클리어
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token') ||
              error.status === 400) {
            console.log('유효하지 않은 세션, 로그아웃 처리');
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            return;
          }
          console.error('세션 조회 오류:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error('인증 초기화 오류:', err);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변경 감지 (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 등)
    // 미들웨어와 세션 동기화: 쿠키가 업데이트되면 자동으로 상태 반영
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log('인증 상태 변경:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      setLoading(false);

      // 세션이 변경되면 페이지 새로고침으로 서버 세션과 동기화
      // (선택적: 필요시에만 활성화)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        // 세션 변경 시 서버 컴포넌트도 업데이트되도록 처리
        // 실제로는 쿠키가 자동으로 동기화되므로 대부분의 경우 불필요
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
