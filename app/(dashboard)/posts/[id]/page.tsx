/**
 * 게시글 상세 페이지 (Deep Dive)
 * 
 * - 본문 내용 표시
 * - AI가 추출한 기술 태그 뱃지 표시
 * - 작성자 프로필 카드
 * - 연락처 플로팅 액션 버튼
 */

import { PostDetail } from '@/components/domain/posts/post-detail';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostWithAuthor } from '@/types/post';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  // Supabase 클라이언트가 없으면 (환경 변수 미설정) 목업 데이터로 UI 표시
  if (!supabase) {
    // 목업 게시글 데이터 (UI 테스트용)
    const mockPost = {
      id,
      title: 'AI 기반 이커머스 플랫폼 개발',
      category: 'Development' as const,
      content: `# 프로젝트 소개

이 프로젝트는 Next.js 기반의 AI 추천 시스템을 갖춘 이커머스 플랫폼을 개발하는 프로젝트입니다.

## 주요 기능
- AI 기반 상품 추천
- 실시간 재고 관리
- 결제 시스템 연동

## 모집 인원
- 프론트엔드 개발자 2명
- 백엔드 개발자 2명
- AI/ML 엔지니어 1명

## 기술 스택
- Next.js
- TypeScript
- Prisma
- OpenAI API
- Tailwind CSS`,
      summary: ['Next.js 기반 쇼핑 플랫폼 구축', 'AI 상품 추천 시스템 적용', '프론트/백엔드 개발자 모집'],
      tags: ['Next.js', 'TypeScript', 'Prisma', 'OpenAI', 'Tailwind'],
      contact: 'discord.gg/example',
      author_id: 'mock-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: {
        id: 'mock-user-id',
        username: 'Alex Kim',
        avatar_url: null,
      },
    };

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Link>
        <PostDetail post={mockPost as PostWithAuthor & { applicationCount?: number }} />
      </div>
    );
  }

  // 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // 게시글 데이터 페칭 (작성자 프로필 정보 및 지원 수 포함)
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

  // 지원 수 조회
  let applicationCount = 0;
  if (post) {
    const { count } = await supabase
      .from('post_applications')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id);
    applicationCount = count || 0;
  }

  if (postError || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/posts"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>
      <PostDetail post={{ ...post, applicationCount } as PostWithAuthor & { applicationCount?: number }} />
    </div>
  );
}
