/**
 * AI 요약 미리보기 컴포넌트
 * 
 * 게시글 작성 중 우측에 표시되는 AI 가이드 영역
 * 저장 버튼 클릭 시 AI 분석 결과를 미리보기로 표시
 */

interface AISummaryPreviewProps {
  summary?: string[];
  tags?: string[];
  isLoading?: boolean;
}

export function AISummaryPreview({
  isLoading,
}: AISummaryPreviewProps) {
  // TODO: AI 처리 중 로딩 상태 표시
  // TODO: 요약문 표시
  // TODO: 기술 태그 뱃지 표시
  
  if (isLoading) {
    return (
      <div className="border rounded-lg p-4">
        <p>AI가 분석 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">AI 분석 결과</h3>
      {/* 요약문 */}
      {/* 기술 태그 */}
    </div>
  );
}
