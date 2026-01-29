/**
 * 게시글 조회수 추적 API Route
 * 
 * 게시글 조회 시 조회수를 기록하는 엔드포인트
 * 중복 방지: UNIQUE(post_id, user_id) 제약 조건 활용
 * IP 추적: 익명 사용자용 ip_address 저장
 * 비동기 처리: 논블로킹 (조회수 기록 실패해도 메인 로직 영향 없음)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/utils/activity-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 클라이언트가 초기화되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 사용자 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    
    // IP 주소 추출 (익명 사용자용)
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // 조회수 기록 (비동기, 논블로킹)
    // 중복 방지: UNIQUE(post_id, user_id) 제약 조건으로 자동 처리
    const viewData: {
      post_id: string;
      user_id?: string | null;
      ip_address?: string | null;
    } = {
      post_id: id,
      user_id: user?.id || null,
      ip_address: user ? null : ipAddress, // 인증된 사용자는 IP 저장 안 함
    };

    const { error: viewError } = await supabase
      .from('post_views')
      .insert(viewData);

    // 조회수 기록 실패해도 에러 반환하지 않음 (논블로킹)
    if (viewError) {
      // 중복 조회는 정상적인 경우이므로 에러로 처리하지 않음
      if (viewError.code !== '23505') { // UNIQUE 제약 조건 위반이 아닌 경우만 로그
        console.error('조회수 기록 오류:', viewError);
      }
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    if (user) {
      logActivity(user.id, 'post_view', {
        post_id: id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('조회수 추적 예외:', err);
    // 에러가 발생해도 성공 응답 반환 (논블로킹)
    return NextResponse.json({ success: true });
  }
}
