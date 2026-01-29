/**
 * 라우트 레벨 오류 처리
 * 
 * Next.js App Router의 error.tsx는 해당 라우트 세그먼트와 그 하위 세그먼트에서 발생하는 오류를 처리합니다.
 * 레이아웃 오류는 제외됩니다 (레이아웃 오류는 global-error.tsx에서 처리).
 */

'use client';

import { useEffect } from 'react';
import { ErrorScreen } from '@/components/domain/shared/error-screen';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 오류를 로깅하거나 오류 리포팅 서비스에 전송할 수 있습니다
    console.error('Route error:', error);
  }, [error]);

  return (
    <ErrorScreen
      title="페이지를 불러올 수 없습니다"
      message="요청하신 페이지를 표시하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      onRetry={reset}
    />
  );
}
