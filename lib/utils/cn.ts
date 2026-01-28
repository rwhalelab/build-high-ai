/**
 * className 유틸리티 함수
 * 
 * clsx와 tailwind-merge를 결합하여 클래스명을 병합
 * Tailwind CSS 클래스 충돌 방지
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
