/**
 * 대시보드 라우트 그룹 레이아웃
 * 
 * 메인 대시보드, 게시글 상세, 작성 페이지 등의 공통 레이아웃
 * 네비게이션 바, 사이드바 등 포함
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* TODO: 네비게이션 바 추가 */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Build-High</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
