/**
 * 게시글 상세 컴포넌트
 * 
 * 상세 페이지에서 사용되는 게시글 표시 컴포넌트
 * 마운트 시 조회수 추적 API 호출
 */

'use client';

import { useEffect } from 'react';
import * as React from 'react';
import { PostWithAuthor } from '@/types/post';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ExternalLink, Users, Phone, Mail, Globe } from 'lucide-react';
import { PostActions } from './post-actions';
import { PostApplications } from './post-applications';

interface PostDetailProps {
  post: PostWithAuthor & {
    applicationCount?: number;
  };
}

export function PostDetail({ post }: PostDetailProps) {
  // 조회수 추적 (마운트 시 한 번만 실행)
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/posts/${post.id}/view`, {
          method: 'POST',
        });
      } catch (err) {
        // 조회수 추적 실패는 무시 (논블로킹)
        console.error('조회수 추적 오류:', err);
      }
    };

    trackView();
  }, [post.id]);
  const tags = Array.isArray(post.tags) ? post.tags : 
               typeof post.tags === 'string' ? JSON.parse(post.tags) : 
               [];
  
  const authorName = post.author?.username || '익명';
  const authorInitial = authorName.charAt(0).toUpperCase();
  
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
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
          <PostActions post={post} />
        </div>
        <h1 className="text-4xl font-bold text-foreground">{post.title}</h1>
      </div>

      {/* 본문 내용 */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-invert max-w-none whitespace-pre-wrap">
            {post.content.split('\n').map((paragraph, i) => {
              if (!paragraph.trim()) return <br key={i} />;
              
              // 마크다운 헤더 처리 (# ## ###)
              if (paragraph.match(/^#{1,3}\s/)) {
                const level = paragraph.match(/^#+/)?.[0].length || 1;
                const text = paragraph.replace(/^#+\s/, '');
                const HeadingTag = `h${Math.min(level, 6)}` as keyof React.JSX.IntrinsicElements;
                return React.createElement(
                  HeadingTag,
                  {
                    key: i,
                    className: `mb-4 font-bold text-foreground ${
                      level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'
                    }`,
                  },
                  text
                );
              }
              
              // 리스트 항목 처리 (- *)
              if (paragraph.match(/^[-*]\s/)) {
                const text = paragraph.replace(/^[-*]\s/, '');
                return (
                  <li key={i} className="mb-2 ml-4 text-muted-foreground">
                    {text}
                  </li>
                );
              }
              
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
                {post.applicationCount !== undefined && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>지원자 {post.applicationCount}명</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 연락처 정보 */}
        {(post.phone || post.email || post.contact_url) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연락하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 전화번호 */}
              {post.phone && (
                <a
                  href={`tel:${post.phone}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{post.phone}</span>
                </a>
              )}

              {/* 이메일 */}
              {post.email && (
                <a
                  href={`mailto:${post.email}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{post.email}</span>
                </a>
              )}

              {/* 연락처 URL */}
              {post.contact_url && (() => {
                // URL 형식 검증 및 보정
                const normalizeContactUrl = (url: string): string => {
                  const trimmed = url.trim();
                  
                  // 이미 완전한 URL인 경우 그대로 반환
                  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                    return trimmed;
                  }
                  
                  // 상대 경로나 도메인만 있는 경우 https:// 추가
                  if (trimmed.includes('.') || trimmed.includes('/')) {
                    return `https://${trimmed}`;
                  }
                  
                  // 기본값: https:// 추가
                  return `https://${trimmed}`;
                };

                const contactUrl = normalizeContactUrl(post.contact_url);

                return (
                  <a
                    href={contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="flex-1 truncate">{post.contact_url}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 지원 섹션 */}
      <PostApplications postId={post.id} authorId={post.author_id} />
    </div>
  );
}
