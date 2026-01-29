/**
 * 사용자 활동 로그 유틸리티
 * 
 * Server Component 및 API Routes에서 사용하는 활동 로그 기록 함수
 * 논블로킹 처리: 에러 발생해도 메인 로직에 영향 없음
 */

import { createClient } from '@/lib/supabase/server';

export type ActivityType =
  | 'login'
  | 'post_view'
  | 'post_create'
  | 'post_update'
  | 'post_delete'
  | 'profile_update'
  | 'application_create';

export interface ActivityMetadata {
  [key: string]: unknown;
}

/**
 * 사용자 활동 로그 기록
 * 
 * @param userId 사용자 ID
 * @param activityType 활동 타입
 * @param metadata 추가 메타데이터 (선택)
 * @returns Promise<void> - 논블로킹, 에러 발생해도 무시
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  metadata?: ActivityMetadata
): Promise<void> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      // Supabase 클라이언트가 없으면 로그만 기록하고 종료
      console.warn('활동 로그 기록 실패: Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    const { error } = await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      metadata: metadata || null,
    });

    if (error) {
      // 에러 발생해도 메인 로직에 영향 주지 않음
      console.error('활동 로그 기록 오류:', error);
    }
  } catch (err) {
    // 예외 발생해도 메인 로직에 영향 주지 않음
    console.error('활동 로그 기록 예외:', err);
  }
}

/**
 * 여러 활동을 일괄 기록 (선택적)
 * 
 * @param activities 활동 배열
 */
export async function logActivities(
  activities: Array<{
    userId: string;
    activityType: ActivityType;
    metadata?: ActivityMetadata;
  }>
): Promise<void> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      console.warn('활동 로그 일괄 기록 실패: Supabase 클라이언트가 초기화되지 않았습니다.');
      return;
    }

    const records = activities.map(({ userId, activityType, metadata }) => ({
      user_id: userId,
      activity_type: activityType,
      metadata: metadata || null,
    }));

    const { error } = await supabase.from('user_activities').insert(records);

    if (error) {
      console.error('활동 로그 일괄 기록 오류:', error);
    }
  } catch (err) {
    console.error('활동 로그 일괄 기록 예외:', err);
  }
}
