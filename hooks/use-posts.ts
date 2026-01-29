/**
 * 게시글 CRUD 훅
 * 
 * 게시글 조회, 생성, 삭제를 위한 커스텀 훅
 * 필터링 및 페이지네이션 지원
 */

'use client';

import { useState, useEffect } from 'react';
import { Post, PostWithAuthor } from '@/types/post';
import { createClient } from '@/lib/supabase/client';

interface UsePostsOptions {
  category?: 'Development' | 'Study' | 'Project';
  tags?: string[];
  authorId?: string;
  page?: number;
  pageSize?: number;
}

export function usePosts(options: UsePostsOptions = {}) {
  const { category, tags, authorId, page = 1, pageSize = 10 } = options;
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // 게시글 목록 조회
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 빈 배열로 처리
      if (!supabase) {
        setPosts([]);
        setLoading(false);
        return;
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
      if (category && ['Development', 'Study', 'Project'].includes(category)) {
        query = query.eq('category', category);
      }

      // 필터링: tags (배열 검색)
      if (tags && tags.length > 0) {
        // 각 태그에 대해 OR 조건 사용
        query = query.or(tags.map((tag) => `tags.cs.{${tag}}`).join(','));
      }

      // 필터링: author_id
      if (authorId) {
        query = query.eq('author_id', authorId);
      }

      // 페이지네이션
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPosts((data || []) as PostWithAuthor[]);
    } catch (err) {
      console.error('게시글 조회 오류:', err);
      setError(err as Error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tags?.join(','), authorId, page, pageSize]);

  // 게시글 생성
  const createPost = async (postData: {
    title: string;
    category: string;
    content: string;
    contact?: string;
  }) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 생성 실패');
      }

      const { data } = await response.json();
      await fetchPosts(); // 목록 새로고침
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // 게시글 삭제
  const deletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 삭제 실패');
      }

      await fetchPosts(); // 목록 새로고침
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    deletePost,
    refetch: fetchPosts,
  };
}
