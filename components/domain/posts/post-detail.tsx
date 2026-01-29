/**
 * 게시글 상세 컴포넌트
 * 
 * 상세 페이지에서 사용되는 게시글 표시 컴포넌트
 */

import { Post } from '@/types/post';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PostDetailProps {
  post: Post & {
    author?: {
      id: string;
      username: string | null;
      avatar_url: string | null;
    };
  };
}

export function PostDetail({ post }: PostDetailProps) {
  const tags = Array.isArray(post.tags) ? post.tags : 
               typeof post.tags === 'string' ? JSON.parse(post.tags) : 
               [];
  
  const authorName = post.author?.username || '익명';
  const authorInitial = authorName.charAt(0).toUpperCase();
  
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {post.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(post.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground">{post.title}</h1>
      </div>

      {/* 본문 내용 */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-invert max-w-none">
            {post.content.split('\n').map((paragraph, i) => {
              if (!paragraph.trim()) return <br key={i} />;
              return (
                <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 기술 태그 */}
      {tags.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">기술 태그</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string, i: number) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {String(tag)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 작성자 정보 및 연락처 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 작성자 프로필 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              작성자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary"
                aria-hidden
              >
                {authorInitial}
              </span>
              <div>
                <p className="font-semibold text-foreground">{authorName}</p>
                {post.author?.avatar_url && (
                  <p className="text-xs text-muted-foreground">프로필 사진</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 버튼 */}
        {post.contact && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연락하기</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={post.contact}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <ExternalLink className="h-4 w-4" />
                연락처 열기
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
