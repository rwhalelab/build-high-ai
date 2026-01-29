/**
 * 플랫폼 통계 훅
 * 
 * 플랫폼 현황 통계 데이터를 가져오는 커스텀 훅
 */

'use client';

import { useState, useEffect } from 'react';

interface PlatformStats {
  totalPosts: number;
  totalUsers: number;
  weeklyActiveUsers: number;
  matchedCount: number;
  thisMonthPosts: number;
}

export function useStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalPosts: 0,
    totalUsers: 0,
    weeklyActiveUsers: 0,
    matchedCount: 0,
    thisMonthPosts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('통계 데이터를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('통계 조회 오류:', err);
        setError(err as Error);
        // 에러가 나도 기본값 유지
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // 30초마다 통계 갱신 (선택적)
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}
