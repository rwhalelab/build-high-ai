/**
 * 게시글 목록 페이지
 * 
 * Server Component에서 게시글 목록을 조회하여 표시
 * 필터링: category, tags
 * 정렬: created_at DESC (최신순)
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PostCard } from '@/components/domain/posts/post-card';
import { PostWithAuthor } from '@/types/post';

interface PostsPageProps {
  searchParams: Promise<{
    category?: string;
    tags?: string;
    page?: string;
  }>;
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 인증 확인
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }
  }

  // Supabase 클라이언트가 없으면 (환경 변수 미설정) 빈 목록 표시
  if (!supabase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">게시글 목록</h1>
        <div className="text-center text-muted-foreground">
          <p>Supabase 환경 변수가 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  // 쿼리 빌더 시작
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  // 필터링: category
  if (params.category && ['Development', 'Study', 'Project'].includes(params.category)) {
    query = query.eq('category', params.category);
  }

  // 필터링: tags (배열 검색)
  if (params.tags) {
    const tagsArray = params.tags.split(',').map((tag) => tag.trim());
    // PostgreSQL의 배열 포함 검색: tags 배열이 tagsArray의 어떤 요소도 포함하는지 확인
    // Supabase에서는 @> 연산자를 직접 사용할 수 없으므로, 각 태그에 대해 OR 조건 사용
    query = query.or(tagsArray.map((tag) => `tags.cs.{${tag}}`).join(','));
  }

  // 페이지네이션 (페이지당 10개)
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data: posts, error } = await query;

  if (error) {
    console.error('게시글 조회 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">게시글 목록</h1>
        <div className="text-center text-muted-foreground">
          <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">게시글 목록</h1>
        
        {/* 필터 UI (향후 구현) */}
        <div className="flex gap-2 mb-4">
          <Link
            href="/posts"
            className={`px-4 py-2 rounded-lg border transition-colors ${
              !params.category
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            전체
          </Link>
          <Link
            href="/posts?category=Development"
            className={`px-4 py-2 rounded-lg border transition-colors ${
              params.category === 'Development'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            개발
          </Link>
          <Link
            href="/posts?category=Study"
            className={`px-4 py-2 rounded-lg border transition-colors ${
              params.category === 'Study'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            스터디
          </Link>
          <Link
            href="/posts?category=Project"
            className={`px-4 py-2 rounded-lg border transition-colors ${
              params.category === 'Project'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            프로젝트
          </Link>
        </div>
      </div>

      {/* 게시글 목록 */}
      {posts && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as PostWithAuthor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>게시글이 없습니다.</p>
        </div>
      )}

      {/* 페이지네이션 (향후 구현) */}
      {posts && posts.length === pageSize && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}${params.category ? `&category=${params.category}` : ''}`}
              className="px-4 py-2 rounded-lg border hover:bg-muted"
            >
              이전
            </Link>
          )}
          <Link
            href={`/posts?page=${page + 1}${params.category ? `&category=${params.category}` : ''}`}
            className="px-4 py-2 rounded-lg border hover:bg-muted"
          >
            다음
          </Link>
        </div>
      )}
    </div>
  );
}
