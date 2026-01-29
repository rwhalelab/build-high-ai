/**
 * 게시글 수정/삭제 액션 컴포넌트
 * 
 * 게시글 작성자에게만 표시되는 수정/삭제 버튼
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { PostWithAuthor } from '@/types/post';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast-provider';

interface PostActionsProps {
  post: PostWithAuthor;
  onDelete?: () => void;
}

export function PostActions({ post, onDelete }: PostActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // 작성자만 표시
  if (!user || post.author_id !== user.id) {
    return null;
  }

  const handleEdit = () => {
    router.push(`/posts/${post.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 삭제에 실패했습니다.');
      }

      // 삭제 성공 토스트 표시
      success('게시글이 삭제되었습니다.');
      
      // 삭제 성공 시 콜백 호출 또는 리다이렉트
      if (onDelete) {
        onDelete();
      } else {
        setTimeout(() => {
          router.push('/posts');
        }, 500);
      }
    } catch (err) {
      console.error('게시글 삭제 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '게시글 삭제에 실패했습니다.';
      showError('삭제 실패', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleEdit}
        disabled={isDeleting}
      >
        <Edit className="h-4 w-4 mr-1" />
        수정
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {isDeleting ? '삭제 중...' : '삭제'}
      </Button>
    </div>
  );
}
