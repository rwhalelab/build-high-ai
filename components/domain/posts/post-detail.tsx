/**
 * 게시글 상세 컴포넌트
 * 
 * 상세 페이지에서 사용되는 게시글 표시 컴포넌트
 */

import { Post } from '@/types/post';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  // TODO: 본문 내용 렌더링 (마크다운 지원)
  // TODO: 기술 태그 뱃지 표시
  // TODO: 작성자 프로필 카드
  
  return (
    <article>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {/* 작성자 정보 */}
      {/* 본문 내용 */}
      {/* 기술 태그 */}
      {/* 연락처 버튼 */}
    </article>
  );
}
