/**
 * 게시글 작성 에디터 컴포넌트
 * 
 * 제목, 카테고리, 본문 입력 폼
 * 저장 시 AI 처리 로직 포함
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePosts } from '@/hooks/use-posts';
import { useToast } from '@/components/ui/toast-provider';

export function PostEditor() {
  const router = useRouter();
  const { createPost } = usePosts();
  const { success, error: showError } = useToast();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Development' | 'Study' | 'Project'>('Development');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (title.length < 5) {
      setError('제목은 최소 5자 이상이어야 합니다.');
      return;
    }

    if (!category) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('본문 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const post = await createPost({
        title,
        category,
        content,
        contact: contact || undefined,
      });

      // 성공 토스트 표시
      success('게시글이 성공적으로 작성되었습니다.', '잠시 후 상세 페이지로 이동합니다.');
      
      // 성공 시 게시글 상세 페이지로 리다이렉트
      setTimeout(() => {
        router.push(`/posts/${post.id}`);
      }, 500);
    } catch (err) {
      console.error('게시글 생성 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '게시글 생성에 실패했습니다.';
      setError(errorMessage);
      showError('게시글 작성 실패', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>새 게시글 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="게시글 제목을 입력하세요 (최소 5자)"
              required
              minLength={5}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/5자 이상
            </p>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category">
              카테고리 <span className="text-destructive">*</span>
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'Development' | 'Study' | 'Project')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isSubmitting}
            >
              <option value="Development">개발</option>
              <option value="Study">스터디</option>
              <option value="Project">프로젝트</option>
            </select>
          </div>

          {/* 본문 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content">
              본문 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="게시글 본문을 입력하세요. 마크다운 형식을 지원합니다."
              rows={15}
              required
              disabled={isSubmitting}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              마크다운 형식 지원: # 헤더, - 리스트, **굵게** 등
            </p>
          </div>

          {/* 연락처 입력 */}
          <div className="space-y-2">
            <Label htmlFor="contact">연락처 (선택)</Label>
            <Input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Discord, Slack, 이메일 등 (예: discord.gg/example)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              지원자들이 연락할 수 있는 방법을 입력하세요.
            </p>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '게시글 작성'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
