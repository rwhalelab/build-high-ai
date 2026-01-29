/**
 * URL 유틸리티 함수
 * 
 * 개발 환경과 운영 환경을 자동으로 구분하여 올바른 Base URL을 반환
 */

import type { NextRequest } from 'next/server';

/**
 * 클라이언트 사이드에서 Base URL을 가져오는 함수
 * 로컬 환경: 항상 현재 origin 사용 (localhost:3000)
 * 운영 환경: 환경변수가 있으면 사용, 없으면 현재 origin 사용
 */
export function getClientBaseUrl(): string {
  if (typeof window === 'undefined') {
    throw new Error('getClientBaseUrl은 클라이언트 사이드에서만 사용할 수 있습니다.');
  }

  // 현재 호스트가 localhost이면 항상 현재 origin 사용 (로컬 개발 환경)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.startsWith('192.168.') ||
                      window.location.hostname.startsWith('10.') ||
                      window.location.hostname.startsWith('172.');
  
  if (isLocalhost) {
    // 로컬 환경에서는 환경변수를 무시하고 항상 현재 origin 사용
    return window.location.origin;
  }

  // 운영 환경: 환경변수가 있고 빈 값이 아니면 사용, 없으면 현재 origin 사용
  const envBaseUrl = process.env.NEXT_PUBLIC_NEXTAUTH_URL;
  if (envBaseUrl && envBaseUrl.trim() !== '') {
    return envBaseUrl;
  }
  return window.location.origin;
}

/**
 * 서버 사이드에서 Base URL을 가져오는 함수
 * 로컬 환경: request headers에서 호스트 정보 추출 (localhost 지원)
 * 운영 환경: 환경변수 우선, 없으면 request에서 호스트 정보 추출
 * 
 * @param request NextRequest 객체 (선택적)
 */
export function getServerBaseUrl(request?: NextRequest): string {
  // request가 있으면 호스트 정보 확인
  if (request) {
    const host = request.headers.get('host');
    
    // 호스트가 localhost이면 항상 현재 origin 사용 (로컬 개발 환경)
    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      return `${protocol}://${host}`;
    }

    // request.url에서 호스트 정보 추출
    if (request.url) {
      const url = new URL(request.url);
      // localhost 체크
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return `${url.protocol}//${url.host}`;
      }
    }
  }

  // 환경변수 확인
  const envBaseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_NEXTAUTH_URL;
  
  // 환경변수가 빈 값이거나 localhost를 포함하면 무시 (로컬 개발 환경)
  if (!envBaseUrl || envBaseUrl.trim() === '' || envBaseUrl.includes('localhost')) {
    // request가 있으면 request에서 추출, 없으면 localhost 기본값
    if (request) {
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      return `${protocol}://${host}`;
    }
    return 'http://localhost:3000';
  }

  // 운영 환경: 환경변수가 있으면 사용
  return envBaseUrl;
}
