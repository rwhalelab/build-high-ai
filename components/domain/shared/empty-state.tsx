/**
 * 빈 상태 컴포넌트
 *
 * PRD §6: 리스트 부재 시 "첫 번째 프로젝트의 주인공이 되어보세요!" 안내
 * FLOW: 팀원 모집하기 클릭 시 /posts/new 이동
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rocket, PlusCircle } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void; // 클릭 핸들러 (actionHref보다 우선)
}

export function EmptyState({
  title = "첫 번째 프로젝트의 주인공이 되어보세요!",
  description = "첫 번째 모집글을 작성하고 팀 빌딩을 시작해보세요.",
  actionLabel = "팀원 모집하기",
  actionHref = "/posts/new",
  onAction,
}: EmptyStateProps) {
  const hasAction = actionLabel && (actionHref || onAction);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Rocket className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
      {hasAction && (
        onAction ? (
          <Button onClick={onAction} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {actionLabel}
          </Button>
        ) : (
          <Button asChild>
            <Link href={actionHref!} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
        )
      )}
    </div>
  );
}
