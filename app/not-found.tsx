/**
 * 404 Not Found 오류 처리
 * 
 * Next.js App Router의 not-found.tsx는 존재하지 않는 페이지에 대한 오류를 처리합니다.
 * notFound() 함수를 호출하거나 존재하지 않는 라우트에 접근할 때 표시됩니다.
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription className="mt-2 text-base">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>다음을 확인해주세요:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>URL 주소가 정확한지 확인</li>
              <li>페이지가 삭제되었거나 이동되었을 수 있음</li>
              <li>메인 페이지에서 다시 시작해보세요</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              메인으로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
