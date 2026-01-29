/**
 * 게시글 조회, 수정 및 삭제 API Route
 * 
 * GET /api/posts/[id] - 게시글 상세 조회 (작성자 정보 포함)
 * PUT /api/posts/[id] - 작성자만 자신의 게시글 수정 가능
 * DELETE /api/posts/[id] - 작성자만 자신의 게시글 삭제 가능
 * - RLS 정책으로 보안 보장
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummaryAndTags } from '@/lib/ai/gemini';
import { logActivity } from '@/lib/utils/activity-logger';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { title, category, content, phone, email, contact_url } = body;

    // 게시글 조회 (권한 체크)
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, content, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크: 작성자만 수정 가능
    if (existingPost.author_id !== user.id) {
      return NextResponse.json(
        { error: '게시글을 수정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 유효성 검사
    if (title && title.length < 5) {
      return NextResponse.json(
        { error: '제목은 최소 5자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // Category 검증 및 변환 (category가 제공된 경우)
    let normalizedCategory: 'Development' | 'Study' | 'Project' | undefined = undefined;
    if (category !== undefined) {
      const validCategories = ['Development', 'Study', 'Project'] as const;
      const categoryMap: Record<string, typeof validCategories[number]> = {
        'development': 'Development',
        'study': 'Study',
        'project': 'Project',
        'Development': 'Development',
        'Study': 'Study',
        'Project': 'Project',
      };

      normalizedCategory = categoryMap[category.toLowerCase()];
      if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
        return NextResponse.json(
          { error: `유효하지 않은 카테고리입니다. 허용된 값: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // 업데이트 데이터 준비
    const updateData: {
      title?: string;
      category?: 'Development' | 'Study' | 'Project';
      content?: string;
      phone?: string | null;
      email?: string | null;
      contact_url?: string | null;
      summary?: string[];
      tags?: string[];
    } = {};

    if (title !== undefined) updateData.title = title;
    if (normalizedCategory !== undefined) updateData.category = normalizedCategory;
    if (content !== undefined) updateData.content = content;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (contact_url !== undefined) updateData.contact_url = contact_url || null;

    // content가 변경된 경우 AI 재처리
    if (content !== undefined && content !== existingPost.content) {
      try {
        const { summary, tags } = await generateSummaryAndTags(content);
        updateData.summary = summary;
        updateData.tags = tags;
      } catch (aiError) {
        console.error('AI 처리 오류:', aiError);
        // AI 처리 실패해도 게시글 수정은 진행
      }
    }

    // 게시글 업데이트
    const { data, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    logActivity(user.id, 'post_update', {
      post_id: id,
      post_title: title || existingPost.title,
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
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

    // 게시글 조회 (권한 체크 및 활동 로그용)
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 체크: 작성자만 삭제 가능
    if (existingPost.author_id !== user.id) {
      return NextResponse.json(
        { error: '게시글을 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 게시글 삭제 (RLS 정책으로 작성자만 삭제 가능, CASCADE로 관련 데이터 자동 삭제)
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    logActivity(user.id, 'post_delete', {
      post_id: id,
      post_title: existingPost.title,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
