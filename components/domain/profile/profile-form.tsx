/**
 * 프로필 편집 폼 컴포넌트
 * 
 * 사용자 프로필 정보 수정 폼
 */

'use client';

import { useState } from 'react';

export function ProfileForm() {
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 프로필 업데이트 API 호출
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 사용자 이름 입력 */}
      {/* 프로필 사진 업로드 (Phase 2) */}
      {/* 저장 버튼 */}
    </form>
  );
}
