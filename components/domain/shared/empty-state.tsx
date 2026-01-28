/**
 * 빈 상태 컴포넌트
 * 
 * 게시글이 없을 때 표시되는 빈 상태 UI
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = '첫 번째 프로젝트의 주인공이 되어보세요!',
  description,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  );
}
