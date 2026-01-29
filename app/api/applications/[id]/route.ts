/**
 * 지원 상태 변경 API Route
 * 
 * PATCH /api/applications/[id] - 지원 상태 변경
 * - 게시글 작성자: 승인/거절 가능
 * - 지원자: 철회 가능
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 환경 변수가 설정되지 않았습니다.' },
        { status: 503 }
      );
    }

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = await params;
    const body = await request.json();
    const { status } = body;

    // 상태 값 검증 (데이터베이스 스키마에 맞춰 'accepted' 사용)
    const validStatuses = ['pending', 'accepted', 'rejected', 'withdrawn'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 값입니다.' },
        { status: 400 }
      );
    }

    // 지원 정보 조회
    const { data: application, error: fetchError } = await supabase
      .from('post_applications')
      .select(`
        *,
        post:posts!post_applications_post_id_fkey (
          id,
          author_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '지원 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const post = application.post as { id: string; author_id: string };
    const isAuthor = post.author_id === user.id;
    const isApplicant = application.applicant_id === user.id;

    // 권한 체크
    if (status === 'accepted' || status === 'rejected') {
      // 승인/거절: 게시글 작성자만 가능
      if (!isAuthor) {
        return NextResponse.json(
          { error: '승인/거절 권한이 없습니다.' },
          { status: 403 }
        );
      }
    } else if (status === 'withdrawn') {
      // 철회: 지원자만 가능
      if (!isApplicant) {
        return NextResponse.json(
          { error: '철회 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    // 상태 변경
    const { data, error: updateError } = await supabase
      .from('post_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
