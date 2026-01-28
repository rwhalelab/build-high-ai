/**
 * 로딩 스피너 컴포넌트
 * 
 * 데이터 로딩 중 표시되는 스피너
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
