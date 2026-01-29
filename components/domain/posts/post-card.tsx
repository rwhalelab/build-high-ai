/**
 * 게시글 카드 컴포넌트
 * 
 * 메인 대시보드의 게시글 리스트에 표시되는 카드
 * AI 요약문을 상단에 배치하여 가독성 향상
 */

'use client';

import Link from 'next/link';
import { PostWithAuthor } from '@/types/post';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const summary = post.summary || [];
  const tags = Array.isArray(post.tags) ? post.tags : [];
  const createdDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
            <Badge variant="outline" className="shrink-0">
              {post.category === 'Development' && '개발'}
              {post.category === 'Study' && '스터디'}
              {post.category === 'Project' && '프로젝트'}
            </Badge>
          </div>
          
          {/* AI 요약문 (3줄) */}
          {summary.length > 0 && (
            <div className="space-y-1 mb-4">
              {summary.slice(0, 3).map((line, index) => (
                <p key={index} className="text-sm text-muted-foreground line-clamp-1">
                  {line}
                </p>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* 기술 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{tags.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* 작성자 정보 및 작성일시 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              <span className="truncate">
                {post.author?.username || '알 수 없음'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{createdDate}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
