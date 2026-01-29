/**
 * API 에러 핸들링 유틸리티
 * 
 * Supabase 및 HTTP 에러를 사용자 친화적인 메시지로 변환
 */

interface ApiError {
  code?: string;
  message?: string;
  status?: number;
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 * 
 * @param error 에러 객체
 * @returns 사용자 친화적인 에러 메시지
 */
export function handleApiError(error: unknown): string {
  // Supabase 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as ApiError;
    
    // Supabase 에러 코드별 메시지 매핑
    switch (supabaseError.code) {
      case 'PGRST116':
        return '요청한 데이터를 찾을 수 없습니다.';
      case '23505':
        return '이미 존재하는 데이터입니다.';
      case '23503':
        return '관련된 데이터가 있어 작업을 수행할 수 없습니다.';
      case '42501':
        return '권한이 없습니다.';
      case '42P01':
        return '데이터베이스 오류가 발생했습니다.';
      default:
        return supabaseError.message || '데이터베이스 오류가 발생했습니다.';
    }
  }

  // HTTP 에러 처리
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as ApiError;
    
    switch (httpError.status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 로그인해주세요.';
      case 403:
        return '권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 503:
        return '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  }

  // 일반 에러 처리
  if (error instanceof Error) {
    // 네트워크 에러
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '네트워크 연결을 확인해주세요.';
    }
    
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 타입 구분
 */
export type ErrorType = 'network' | 'auth' | 'database' | 'validation' | 'unknown';

/**
 * 에러 타입 판별
 */
export function getErrorType(error: unknown): ErrorType {
  if (error && typeof error === 'object') {
    // 네트워크 에러
    if ('message' in error && typeof error.message === 'string') {
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'network';
      }
    }

    // 인증 에러
    if ('status' in error && error.status === 401) {
      return 'auth';
    }
    if ('code' in error && error.code === '42501') {
      return 'auth';
    }

    // 데이터베이스 에러
    if ('code' in error && typeof error.code === 'string' && error.code.startsWith('PGRST')) {
      return 'database';
    }

    // 유효성 검사 에러
    if ('status' in error && error.status === 400) {
      return 'validation';
    }
  }

  return 'unknown';
}
