/**
 * 게시글 작성 에디터 컴포넌트
 * 
 * 제목, 카테고리, 본문 입력 폼
 * 저장 시 AI 처리 로직 포함
 */

'use client';

import { useState } from 'react';

export function PostEditor() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Development' | 'Study' | 'Project'>('Development');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: API Route 호출하여 게시글 생성
      // TODO: AI 처리 결과 표시
      // TODO: 성공 시 대시보드로 리다이렉트
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 제목 입력 */}
      {/* 카테고리 선택 */}
      {/* 본문 입력 (텍스트에어리어 또는 마크다운 에디터) */}
      {/* 연락처 입력 */}
      {/* 저장 버튼 */}
    </form>
  );
}
