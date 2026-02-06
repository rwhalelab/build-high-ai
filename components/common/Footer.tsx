import Link from "next/link";
import { Zap } from "lucide-react";

/**
 * PRD §4 메뉴 구성에 맞춘 푸터 링크
 * - 팀 찾기 (Discovery), 모집글 작성 (Creation), AI 챗봇, 마이페이지
 */
const FOOTER_LINKS = [
  { href: "/", label: "팀 찾기" },
  { href: "/posts/new", label: "모집글 작성" },
  { href: "/ai/chat", label: "AI 챗봇" },
  { href: "/profile", label: "마이페이지" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground hover:opacity-80"
          >
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">Build-High</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground sm:text-left">
          © 2026 JWhaleLab Build-High. 엔지니어를 위한 스터디 및 프로젝트 팀 빌딩 플랫폼.
        </p>
      </div>
    </footer>
  );
}
