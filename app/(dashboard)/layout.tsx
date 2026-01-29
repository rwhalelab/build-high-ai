/**
 * 대시보드 라우트 그룹 레이아웃
 *
 * 메인 대시보드, 게시글 상세, 작성 페이지 등의 공통 레이아웃
 * GNB/Footer는 root layout(Header, Footer)에서 제공
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
