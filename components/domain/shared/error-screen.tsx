/**
 * 전역 오류 화면 컴포넌트
 * 
 * 모든 오류 상황에서 사용자에게 친절한 메시지와 메인 페이지로 돌아가는 버튼을 제공합니다.
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

interface ErrorScreenProps {
  /**
   * 오류 제목
   */
  title?: string;
  /**
   * 오류 설명 메시지
   */
  message?: string;
  /**
   * 메인 페이지로 이동할 버튼 텍스트
   */
  buttonText?: string;
  /**
   * 메인 페이지로 이동할 경로 (기본값: '/')
   */
  homePath?: string;
  /**
   * 재시도 함수 (선택사항)
   */
  onRetry?: () => void;
}

export function ErrorScreen({
  title = '오류가 발생했습니다',
  message = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  buttonText = '메인으로 돌아가기',
  homePath = '/',
  onRetry,
}: ErrorScreenProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push(homePath);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-base">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>문제가 계속되면 다음을 확인해주세요:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>인터넷 연결 상태</li>
              <li>페이지 새로고침</li>
              <li>잠시 후 다시 시도</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleGoHome}
            className="w-full"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full"
            >
              다시 시도
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
