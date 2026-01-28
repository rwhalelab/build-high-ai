/**
 * 인증 관련 라우트 그룹 레이아웃
 * 
 * 로그인 페이지 등 인증 관련 페이지의 공통 레이아웃
 * 대시보드 네비게이션 없이 깔끔한 레이아웃 제공
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}
