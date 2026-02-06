/**
 * 루트(메인) 페이지
 *
 * 인증 시: FLOW.md Main Dashboard(Discovery) — 스탯 카드, 카테고리 탭, AI 요약 카드 리스트
 * 미인증 시: /login 리다이렉트
 * 
 * Supabase 환경 변수가 없으면 인증 체크를 건너뛰고 UI를 바로 표시 (UI 테스트용)
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiscoveryPage } from "@/components/posts/DiscoveryPage";

export default async function Home() {
  const supabase = await createClient();
  
  // Supabase 클라이언트가 없으면 (환경 변수 미설정) 인증 체크를 건너뛰고 UI 표시
  if (!supabase) {
    return <DiscoveryPage />;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // 인증 에러 처리
    if (error) {
      // 세션이 없는 경우는 정상적인 상황이므로 에러 로그 출력하지 않음
      const isSessionMissing = error.message?.includes('Auth session missing') || 
                               error.message?.includes('session_not_found');
      
      // refresh_token_not_found 또는 유효하지 않은 토큰 에러 처리
      if (error.message?.includes('refresh_token_not_found') || 
          error.message?.includes('Invalid Refresh Token') ||
          (error.status === 400 && !isSessionMissing)) {
        // 세션 클리어
        await supabase.auth.signOut();
        // 실제 에러인 경우에만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.error('인증 토큰 에러:', error);
        }
      } else if (!isSessionMissing && process.env.NODE_ENV === 'development') {
        // 세션이 없는 경우가 아닌 다른 에러만 로그 출력
        console.error('인증 에러:', error);
      }
      redirect("/login");
    }

    if (!user) {
      redirect("/login");
    }

    return <DiscoveryPage />;
  } catch (err: unknown) {
    // Next.js의 redirect는 NEXT_REDIRECT 에러를 throw하므로 재throw
    if (err && typeof err === 'object' && 'digest' in err && 
        typeof err.digest === 'string' && err.digest.includes('NEXT_REDIRECT')) {
      throw err;
    }
    
    // 실제 에러인 경우에만 로그 출력
    console.error('예상치 못한 인증 오류:', err);
    redirect("/login");
  }
}
