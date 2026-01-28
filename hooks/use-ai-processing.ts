/**
 * AI 처리 상태 관리 훅
 * 
 * 게시글 작성 중 AI 분석 상태를 관리하는 훅
 */

'use client';

import { useState } from 'react';

interface AIProcessingState {
  isLoading: boolean;
  summary: string[];
  tags: string[];
  error: string | null;
}

export function useAIProcessing() {
  const [state, setState] = useState<AIProcessingState>({
    isLoading: false,
    summary: [],
    tags: [],
    error: null,
  });

  const processContent = async (content: string) => {
    setState({
      isLoading: true,
      summary: [],
      tags: [],
      error: null,
    });

    try {
      // TODO: AI API 호출 (실제 구현 시)
      // 임시로 setTimeout으로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState({
        isLoading: false,
        summary: ['요약 1', '요약 2', '요약 3'],
        tags: ['React', 'TypeScript', 'Next.js', 'Supabase', 'Tailwind'],
        error: null,
      });
    } catch (error) {
      setState({
        isLoading: false,
        summary: [],
        tags: [],
        error: error instanceof Error ? error.message : 'AI 처리 중 오류가 발생했습니다.',
      });
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      summary: [],
      tags: [],
      error: null,
    });
  };

  return {
    ...state,
    processContent,
    reset,
  };
}
