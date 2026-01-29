/**
 * 게시글 조회 및 삭제 API Route
 * 
 * GET /api/posts/[id] - 게시글 상세 조회 (작성자 정보 포함)
 * DELETE /api/posts/[id] - 작성자만 자신의 게시글 삭제 가능
 * - RLS 정책으로 보안 보장
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 반환
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

    const { id } = await params;

    // 게시글 조회 (작성자 프로필 정보 포함)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ error: postError.message }, { status: 500 });
    }

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ data: post }, { status: 200 });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 반환
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

    const { id } = await params;

    // 게시글 삭제 (RLS 정책으로 작성자만 삭제 가능)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
