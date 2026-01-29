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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DiscoveryPage />;
}
