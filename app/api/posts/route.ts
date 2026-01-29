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
import { logActivity } from '@/lib/utils/activity-logger';

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
    const { title, category, content, phone, email, contact_url } = body;

    // 유효성 검사
    if (!title || title.length < 5) {
      return NextResponse.json(
        { error: '제목은 최소 5자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // Category 검증 및 변환
    const validCategories = ['Development', 'Study', 'Project'] as const;
    const categoryMap: Record<string, typeof validCategories[number]> = {
      'development': 'Development',
      'study': 'Study',
      'project': 'Project',
      'Development': 'Development',
      'Study': 'Study',
      'Project': 'Project',
    };

    if (!category) {
      return NextResponse.json(
        { error: '카테고리를 선택해주세요.' },
        { status: 400 }
      );
    }

    const normalizedCategory = categoryMap[category.toLowerCase()];
    if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
      return NextResponse.json(
        { error: `유효하지 않은 카테고리입니다. 허용된 값: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Content 검증
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: '본문 내용을 입력해주세요.' },
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
        category: normalizedCategory, // 정규화된 카테고리 사용
        content,
        summary,
        tags,
        phone: phone || null,
        email: email || null,
        contact_url: contact_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 활동 로그 기록 (비동기, 논블로킹)
    logActivity(user.id, 'post_create', {
      post_id: data.id,
      post_title: title,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
