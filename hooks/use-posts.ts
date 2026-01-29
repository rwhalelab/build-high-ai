/**
 * 게시글 CRUD 훅
 * 
 * 게시글 조회, 생성, 삭제를 위한 커스텀 훅
 */

'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { createClient } from '@/lib/supabase/client';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  // 게시글 목록 조회
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Supabase 클라이언트가 없으면 (환경 변수 미설정) 빈 배열로 처리
      if (!supabase) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
  };
}
