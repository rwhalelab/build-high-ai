/**
 * 게시글 실시간 구독 훅
 * 
 * Supabase Realtime을 사용하여 게시글 변경사항을 실시간으로 구독
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PostWithAuthor } from '@/types/post';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UsePostsRealtimeOptions {
  enabled?: boolean;
  onInsert?: (post: PostWithAuthor) => void;
  onUpdate?: (post: PostWithAuthor) => void;
  onDelete?: (postId: string) => void;
}

export function usePostsRealtime(options: UsePostsRealtimeOptions = {}) {
  const { enabled = true, onInsert, onUpdate, onDelete } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || !supabase) {
      return;
    }

    // Realtime 채널 구독
    const realtimeChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('게시글 변경 이벤트:', payload);

          if (payload.eventType === 'INSERT' && onInsert) {
            // INSERT 이벤트: 새 게시글 추가
            // 작성자 정보는 별도로 조회 필요
            supabase
              .from('posts')
              .select(`*, author:profiles!posts_author_id_fkey (id, username, avatar_url)`)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  onInsert(data as PostWithAuthor);
                }
              });
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            // UPDATE 이벤트: 게시글 수정
            supabase
              .from('posts')
              .select(`*, author:profiles!posts_author_id_fkey (id, username, avatar_url)`)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  onUpdate(data as PostWithAuthor);
                }
              });
          } else if (payload.eventType === 'DELETE' && onDelete) {
            // DELETE 이벤트: 게시글 삭제
            onDelete(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime 구독 상태:', status);
      });

    // 비동기로 처리하여 렌더링 사이클 문제 방지
    Promise.resolve().then(() => {
      setChannel(realtimeChannel);
    });

    // 클린업: 구독 해제
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [enabled, supabase, onInsert, onUpdate, onDelete]);

  return { channel };
}
