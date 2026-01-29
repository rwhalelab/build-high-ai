"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Zap, PenSquare, Search, User, LogOut, Bot } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

/**
 * PRD §4 반영 메뉴 구성
 * - 팀 찾기 (Discovery): 메인 탐색
 * - 모집글 작성 (Creation): 지능형 작성 에디터
 * - AI 챗봇: AI와의 대화 (우측에 특별 스타일로 배치)
 * - 마이페이지: Phase 1 기초 프로필 (닉네임 좌측에 배치)
 */
const NAV_ITEMS = [
  { href: "/", label: "팀 찾기", icon: Search, description: "메인 탐색 (Discovery)" },
  { href: "/posts/new", label: "모집글 작성", icon: PenSquare, description: "지능형 작성 에디터 (Creation)" },
] as const;

const AI_CHAT_ITEM = {
  href: "/ai/chat",
  label: "AI 챗봇",
  icon: Bot,
  description: "AI와의 대화",
} as const;

const PROFILE_ITEM = {
  href: "/profile",
  label: "마이페이지",
  icon: User,
  description: "기초 프로필",
} as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      try {
        // Supabase 세션 삭제
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('로그아웃 오류:', error);
        }
        // 로그인 페이지로 리다이렉트
        router.push("/login");
        // 페이지 새로고침으로 세션 상태 완전히 초기화
        router.refresh();
        // 추가로 window.location을 사용하여 완전한 페이지 리로드 (선택적)
        // window.location.href = '/login';
      } catch (err) {
        console.error('로그아웃 처리 중 오류:', err);
        // 에러가 나도 로그인 페이지로 이동
        router.push("/login");
      }
    }
  };

  // 구글 프로필 사진 URL 가져오기
  const getAvatarUrl = () => {
    if (!user) return null;
    // Google OAuth의 경우 user_metadata.picture 또는 user_metadata.avatar_url에 프로필 사진이 있음
    return user.user_metadata?.picture || user.user_metadata?.avatar_url || null;
  };

  // 사용자 이름 또는 이메일 가져오기
  const getUserDisplayName = () => {
    if (!user) return null;
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User";
  };

  // 아바타 초기값 (이름의 첫 글자)
  const getAvatarFallback = () => {
    const name = getUserDisplayName();
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const isAIChatActive =
    pathname === AI_CHAT_ITEM.href || pathname.startsWith(AI_CHAT_ITEM.href);
  const AIChatIcon = AI_CHAT_ITEM.icon;

  const isProfileActive =
    pathname === PROFILE_ITEM.href || pathname.startsWith(PROFILE_ITEM.href);
  const ProfileIcon = PROFILE_ITEM.icon;


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 좌측: 로고 + 메인 메뉴 */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Build-High
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {/* AI 챗봇 메뉴 - 모집글 작성 오른쪽에 특별 스타일로 배치 */}
            <Link
              href={AI_CHAT_ITEM.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
                "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20",
                "border border-primary/40 shadow-sm",
                "hover:from-primary/30 hover:via-primary/25 hover:to-primary/30",
                "hover:shadow-md hover:scale-[1.02] hover:border-primary/60",
                isAIChatActive && "ring-2 ring-primary/50 shadow-lg from-primary/30 to-primary/30"
              )}
            >
              <div className="relative">
                <AIChatIcon className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full animate-pulse" />
              </div>
              <span className={cn(
                "font-semibold",
                isAIChatActive 
                  ? "text-primary" 
                  : "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              )}>
                {AI_CHAT_ITEM.label}
              </span>
            </Link>
          </nav>
        </div>
        
        {/* 우측: 마이페이지 + 사용자 프로필 */}
        <div className="flex items-center gap-3">
          {loading ? (
            // 로딩 중일 때는 아무것도 표시하지 않음
            <div className="h-8 w-8" />
          ) : user ? (
            <>
              {/* 마이페이지 메뉴 - 닉네임 좌측에 배치 */}
              <Link
                href={PROFILE_ITEM.href}
                className={cn(
                  "hidden sm:flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isProfileActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <ProfileIcon className="h-4 w-4" />
                {PROFILE_ITEM.label}
              </Link>
              {/* 로그인된 경우: 프로필 사진과 드롭다운 메뉴 */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="hidden sm:block text-sm font-medium text-foreground">
                      {getUserDisplayName()}
                    </span>
                    <Avatar className="h-8 w-8 border-2 border-border hover:border-primary transition-colors">
                      <AvatarImage src={getAvatarUrl() || undefined} alt={getUserDisplayName() || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {getAvatarFallback()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 border-b">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    마이페이지
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            // 로그인하지 않은 경우: 로그인 버튼
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-2 bg-transparent sm:flex"
                asChild
              >
                <Link href="/login">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google 로그인</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 md:hidden"
                asChild
              >
                <Link href="/login" aria-label="로그인">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
