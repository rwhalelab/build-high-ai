/**
 * 게시글 지원 API Route
 * 
 * POST /api/posts/[id]/applications - 지원 생성
 * GET /api/posts/[id]/applications - 지원 목록 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/utils/activity-logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 지원 생성
 */
export async function POST(
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

    const { id: postId } = await params;

    // 게시글 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 자신의 게시글에는 지원 불가
    if (post.author_id === user.id) {
      return NextResponse.json(
        { error: '자신의 게시글에는 지원할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 중복 지원 체크 (UNIQUE 제약 조건 활용)
    const { data: existingApplication } = await supabase
      .from('post_applications')
      .select('id')
      .eq('post_id', postId)
      .eq('applicant_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 지원한 게시글입니다.' },
        { status: 400 }
      );
    }

    // 지원 생성
    const { data, error } = await supabase
      .from('post_applications')
      .insert({
        post_id: postId,
        applicant_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      // UNIQUE 제약 조건 위반 (중복 지원)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 지원한 게시글입니다.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    logActivity(user.id, 'application_create', {
      post_id: postId,
      application_id: data.id,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 지원 목록 조회
 */
export async function GET(
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

    const { id: postId } = await params;

    // 게시글 조회 (권한 체크)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크: 게시글 작성자 또는 지원자만 조회 가능
    const isAuthor = post.author_id === user.id;
    
    // 지원 목록 조회
    let query = supabase
      .from('post_applications')
      .select(`
        *,
        applicant:profiles!post_applications_applicant_id_fkey (
          id,
          username,
          avatar_url,
          tech_stack
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    // 작성자가 아닌 경우 자신의 지원만 조회
    if (!isAuthor) {
      query = query.eq('applicant_id', user.id);
    }

    const { data: applications, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: applications || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
