/**
 * Google 로그인 버튼 컴포넌트
 * 
 * Supabase Auth를 사용한 Google OAuth 로그인 처리
 */

'use client';

export function GoogleSignInButton() {
  // TODO: Supabase Google OAuth 연동 구현
  
  const handleSignIn = async () => {
    // TODO: Google 로그인 로직
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      {/* Google 아이콘 */}
      <span>Google로 로그인</span>
    </button>
  );
}
