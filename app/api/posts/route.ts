/**
 * 게시글 생성 API Route
 * 
 * POST /api/posts
 * - 게시글 데이터 수신
 * - AI API 호출하여 요약 및 태그 생성
 * - Supabase에 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSummaryAndTags } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, category, content, contact } = body;

    // 유효성 검사
    if (!title || title.length < 5) {
      return NextResponse.json(
        { error: '제목은 최소 5자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // AI 처리: 요약 및 태그 생성
    const { summary, tags } = await generateSummaryAndTags(content);

    // DB 저장
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title,
        category,
        content,
        summary,
        tags,
        contact,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
