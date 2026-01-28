/**
 * 게시글 작성 페이지 (Creation)
 * 
 * - 제목, 카테고리, 본문 입력 폼
 * - 우측 AI 가이드 영역 (작성 중 반응)
 * - 저장 버튼 클릭 시 AI 분석 결과 확인 팝업/사이드바
 * - AI 처리 후 DB 저장
 */

export default function NewPostPage() {
  // TODO: 게시글 작성 폼 컴포넌트 추가
  // TODO: AI 가이드 사이드바 컴포넌트 추가
  // TODO: AI 처리 로직 구현
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">새 게시글 작성</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 게시글 작성 폼 */}
        </div>
        <div className="lg:col-span-1">
          {/* AI 가이드 영역 */}
        </div>
      </div>
    </div>
  );
}
