/**
 * 게시글 목록 컴포넌트 (Server Component)
 * 
 * 대시보드에서 최근 게시글을 표시하는 컴포넌트
 */

import { createClient } from '@/lib/supabase/server';
import { PostCard } from './post-card';
import { PostWithAuthor } from '@/types/post';
import { EmptyState } from '@/components/domain/shared/empty-state';

export async function PostsList({ limit = 6 }: { limit?: number }) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Supabase 환경 변수가 설정되지 않았습니다.</p>
      </div>
    );
  }

  // 최근 게시글 조회
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`*, author:profiles!posts_author_id_fkey (id, username, avatar_url)`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('게시글 조회 오류:', error);
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="아직 게시글이 없습니다"
        description="첫 번째 프로젝트의 주인공이 되어보세요!"
        actionLabel="게시글 작성하기"
        actionHref="/posts/new"
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post as PostWithAuthor} />
      ))}
    </div>
  );
}
