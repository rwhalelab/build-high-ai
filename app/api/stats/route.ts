/**
 * 플랫폼 통계 API Route
 * 
 * GET /api/stats
 * - 전체 게시글 수
 * - 가입 유저 수
 * - 주간 활성 유저 수
 * - 매칭 완료 수
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        {
          totalPosts: 0,
          totalUsers: 0,
          weeklyActiveUsers: 0,
          matchedCount: 0,
        },
        { status: 200 }
      );
    }

    // 총 게시글 수
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true });

    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 주간 활성 유저 (최근 7일간 활동한 고유 사용자 수)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let weeklyActiveUsers = 0;
    try {
      // user_activities 테이블이 있으면 사용
      const { data: activities } = await supabase
        .from('user_activities')
        .select('user_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const uniqueUserIds = new Set(activities?.map((a) => a.user_id) || []);
      weeklyActiveUsers = uniqueUserIds.size;
    } catch (error) {
      // user_activities 테이블이 없으면 최근 7일간 게시글 작성한 사용자 수로 대체
      const { data: recentPosts } = await supabase
        .from('posts')
        .select('author_id')
        .gte('created_at', sevenDaysAgo.toISOString());

      const uniqueAuthorIds = new Set(recentPosts?.map((p) => p.author_id) || []);
      weeklyActiveUsers = uniqueAuthorIds.size;
    }

    // 매칭 완료 수 (post_applications 테이블이 있으면 사용)
    let matchedCount = 0;
    try {
      const { count } = await supabase
        .from('post_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted');
      matchedCount = count || 0;
    } catch (error) {
      // post_applications 테이블이 없으면 0으로 설정
      matchedCount = 0;
    }

    // 이번 달 게시글 수 (트렌드 계산용)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const { count: thisMonthPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    return NextResponse.json({
      totalPosts: totalPosts || 0,
      totalUsers: totalUsers || 0,
      weeklyActiveUsers,
      matchedCount,
      thisMonthPosts: thisMonthPosts || 0,
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json(
      {
        totalPosts: 0,
        totalUsers: 0,
        weeklyActiveUsers: 0,
        matchedCount: 0,
        thisMonthPosts: 0,
      },
      { status: 200 } // 에러가 나도 0으로 반환하여 UI가 깨지지 않도록
    );
  }
}
