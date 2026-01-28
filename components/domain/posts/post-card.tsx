/**
 * 게시글 카드 컴포넌트
 * 
 * 메인 대시보드의 게시글 리스트에 표시되는 카드
 * AI 요약문을 상단에 배치하여 가독성 향상
 */

import { Post } from '@/types/post';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // TODO: 카드 UI 구현
  // TODO: AI 요약문 표시
  // TODO: 기술 태그 뱃지 표시
  // TODO: 클릭 시 상세 페이지로 이동
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
      {/* AI 요약문 */}
      {/* 기술 태그 */}
      {/* 작성자 정보 */}
    </div>
  );
}
