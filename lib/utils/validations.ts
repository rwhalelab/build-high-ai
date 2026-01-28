/**
 * 폼 유효성 검사 함수
 * 
 * 클라이언트 및 서버 양쪽에서 사용 가능한 검증 함수
 */

/**
 * 게시글 제목 유효성 검사
 */
export function validatePostTitle(title: string): {
  valid: boolean;
  error?: string;
} {
  if (!title || title.trim().length === 0) {
    return { valid: false, error: '제목을 입력해주세요.' };
  }
  if (title.length < 5) {
    return { valid: false, error: '제목은 최소 5자 이상이어야 합니다.' };
  }
  if (title.length > 100) {
    return { valid: false, error: '제목은 최대 100자까지 입력 가능합니다.' };
  }
  return { valid: true };
}

/**
 * 게시글 본문 유효성 검사
 */
export function validatePostContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: '본문을 입력해주세요.' };
  }
  if (content.length < 10) {
    return { valid: false, error: '본문은 최소 10자 이상이어야 합니다.' };
  }
  return { valid: true };
}

/**
 * 카테고리 유효성 검사
 */
export function validateCategory(
  category: string
): category is 'Development' | 'Study' | 'Project' {
  return ['Development', 'Study', 'Project'].includes(category);
}
