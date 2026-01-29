/**
 * 지원 상태 실시간 업데이트 훅
 * 
 * Supabase Realtime을 사용하여 지원 상태 변경사항을 실시간으로 구독
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Application {
  id: string;
  post_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  applicant?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    tech_stack: string[] | null;
  };
}

interface UseApplicationsRealtimeOptions {
  postId?: string;
  enabled?: boolean;
  onInsert?: (application: Application) => void;
  onUpdate?: (application: Application) => void;
  onDelete?: (applicationId: string) => void;
}

export function useApplicationsRealtime(options: UseApplicationsRealtimeOptions = {}) {
  const { postId, enabled = true, onInsert, onUpdate, onDelete } = options;
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!enabled || !supabase) {
      return;
    }

    // Realtime 채널 구독
    const realtimeChannel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_applications',
          filter: postId ? `post_id=eq.${postId}` : undefined,
        },
        (payload) => {
          console.log('지원 상태 변경 이벤트:', payload);

          if (payload.eventType === 'INSERT' && onInsert) {
            // INSERT 이벤트: 새 지원 추가
            supabase
              .from('post_applications')
              .select(`*, applicant:profiles!post_applications_applicant_id_fkey (id, username, avatar_url, tech_stack)`)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  onInsert(data as Application);
                }
              });
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            // UPDATE 이벤트: 지원 상태 변경
            supabase
              .from('post_applications')
              .select(`*, applicant:profiles!post_applications_applicant_id_fkey (id, username, avatar_url, tech_stack)`)
              .eq('id', payload.new.id)
              .single()
              .then(({ data, error }) => {
                if (!error && data) {
                  onUpdate(data as Application);
                }
              });
          } else if (payload.eventType === 'DELETE' && onDelete) {
            // DELETE 이벤트: 지원 철회
            onDelete(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('지원 상태 Realtime 구독 상태:', status);
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
  }, [enabled, postId, supabase, onInsert, onUpdate, onDelete]);

  return { channel };
}
