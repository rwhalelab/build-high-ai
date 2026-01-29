"use client";

import { FileText, Users, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { useStats } from "@/hooks/use-stats";
import { LoadingSpinner } from "@/components/domain/shared/loading-spinner";

/**
 * FLOW.md: Stat Cards - Total Posts, Users
 * PRD §4: 메인 탐색 페이지 상단 3개 스탯 카드
 */
export function DiscoveryStatCards() {
  const { stats, loading } = useStats();

  // 숫자 포맷팅 (천 단위 콤마)
  const formatNumber = (num: number): string => {
    return num.toLocaleString('ko-KR');
  };

  // 이번 달 게시글 증가율 계산 (간단한 예시)
  const monthlyTrend = stats.totalPosts > 0 && stats.thisMonthPosts > 0
    ? Math.round((stats.thisMonthPosts / stats.totalPosts) * 100)
    : 0;

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        플랫폼 현황
      </h2>
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="medium" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="전체 게시글"
            value={formatNumber(stats.totalPosts)}
            icon={FileText}
            trend={monthlyTrend > 0 ? "up" : undefined}
            trendValue={monthlyTrend > 0 ? `${monthlyTrend}%` : undefined}
            description={`이번 달 ${formatNumber(stats.thisMonthPosts)}개`}
          />
          <StatCard
            title="가입 유저"
            value={formatNumber(stats.totalUsers)}
            icon={Users}
            trend="up"
            trendValue={stats.weeklyActiveUsers > 0 ? `${stats.weeklyActiveUsers}명` : undefined}
            description="주간 활성"
          />
          <StatCard
            title="매칭 완료"
            value={formatNumber(stats.matchedCount)}
            icon={TrendingUp}
            trend={stats.matchedCount > 0 ? "up" : undefined}
            description="성공적인 연결"
          />
        </div>
      )}
    </section>
  );
}
