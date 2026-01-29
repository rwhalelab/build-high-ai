import { FileText, Users, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";

/**
 * FLOW.md: Stat Cards - Total Posts, Users
 * PRD §4: 메인 탐색 페이지 상단 3개 스탯 카드
 */
export function DiscoveryStatCards() {
  return (
    <section className="mb-10">
      <h2 className="mb-5 text-sm font-medium uppercase tracking-wider text-muted-foreground">
        플랫폼 현황
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="전체 게시글"
          value="0"
          icon={FileText}
          trend="up"
          trendValue="0%"
          description="이번 달"
        />
        <StatCard
          title="가입 유저"
          value="0"
          icon={Users}
          trend="up"
          trendValue="0%"
          description="주간 활성"
        />
        <StatCard
          title="매칭 완료"
          value="0"
          icon={TrendingUp}
          trend="up"
          trendValue="0%"
          description="성공적인 연결"
        />
      </div>
    </section>
  );
}
