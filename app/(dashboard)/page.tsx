/**
 * 메인 대시보드 페이지 (Discovery)
 * 
 * - 상단 통계 카드 (총 게시글, 유저 수 등)
 * - 카테고리 탭 (Study, Project, Development)
 * - AI 요약이 포함된 게시글 카드 리스트
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/posts/StatCard';
import { PostsList } from '@/components/domain/posts/posts-list';
import { FileText, Users, Activity, CheckCircle2 } from 'lucide-react';

interface DashboardStats {
  totalPosts: number;
  totalUsers: number;
  weeklyActiveUsers: number;
  matchedCount: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      totalPosts: 0,
      totalUsers: 0,
      weeklyActiveUsers: 0,
      matchedCount: 0,
    };
  }

  try {
    // 총 게시글 수
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 주간 활성 유저 (최근 7일간 고유 user_id COUNT)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 고유 user_id 개수 계산
    const { data: activities } = await supabase
      .from('user_activities')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString());

    const uniqueUserIds = new Set(activities?.map((a) => a.user_id) || []);
    const weeklyActiveUsersCount = uniqueUserIds.size;

    // 매칭 완료 수 (status = 'accepted')
    const { count: matchedCount } = await supabase
      .from('post_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted');

    return {
      totalPosts: totalPosts || 0,
      totalUsers: totalUsers || 0,
      weeklyActiveUsers: weeklyActiveUsersCount,
      matchedCount: matchedCount || 0,
    };
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return {
      totalPosts: 0,
      totalUsers: 0,
      weeklyActiveUsers: 0,
      matchedCount: 0,
    };
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // 인증 확인
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }
  }

  // 통계 조회
  const stats = await getDashboardStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-muted-foreground">
          Build-High 플랫폼 현황을 확인하세요
        </p>
      </div>

      {/* 통계 카드 영역 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="총 게시글"
          value={stats.totalPosts}
          icon={FileText}
          description="전체 프로젝트/스터디 게시글 수"
        />
        <StatCard
          title="총 사용자"
          value={stats.totalUsers}
          icon={Users}
          description="가입한 사용자 수"
        />
        <StatCard
          title="주간 활성 유저"
          value={stats.weeklyActiveUsers}
          icon={Activity}
          description="최근 7일간 활동한 사용자 수"
        />
        <StatCard
          title="매칭 완료"
          value={stats.matchedCount}
          icon={CheckCircle2}
          description="승인된 지원 건수"
        />
      </div>

      {/* 게시글 리스트 영역 */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">최근 게시글</h2>
        <PostsList />
      </div>
    </div>
  );
}
