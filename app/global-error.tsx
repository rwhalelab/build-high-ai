/**
 * 루트 레벨 전역 오류 처리
 * 
 * Next.js App Router의 global-error.tsx는 루트 레이아웃에서 발생하는 오류를 처리합니다.
 * 이 파일은 반드시 <html>과 <body> 태그를 포함해야 합니다.
 */

'use client';

import { useEffect } from 'react';
import { ErrorScreen } from '@/components/domain/shared/error-screen';
import { handleApiError } from '@/lib/utils/api-error-handler';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // 오류를 로깅하거나 오류 리포팅 서비스에 전송할 수 있습니다
    console.error('Global error:', error);
  }, [error]);

  const errorMessage = handleApiError(error);

  return (
    <html lang="ko">
      <body>
        <ErrorScreen
          title="시스템 오류가 발생했습니다"
          message={errorMessage || '애플리케이션에서 심각한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
