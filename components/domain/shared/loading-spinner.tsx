/**
 * 로딩 스피너 컴포넌트
 * 
 * 데이터 로딩 중 표시되는 스피너
 */

import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeStyles = {
  small: 'h-4 w-4 border-b',
  medium: 'h-8 w-8 border-b-2',
  large: 'h-12 w-12 border-b-4',
};

export function LoadingSpinner({ size = 'medium', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary',
          sizeStyles[size]
        )}
      />
    </div>
  );
}
