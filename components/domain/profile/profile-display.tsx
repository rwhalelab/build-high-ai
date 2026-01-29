/**
 * 프로필 표시 컴포넌트
 * 
 * Server Component에서 사용하는 프로필 표시 컴포넌트
 * userId를 받아서 해당 프로필을 조회하여 표시
 */

import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface ProfileDisplayProps {
  userId: string;
}

/**
 * 프로필 표시 컴포넌트
 * 
 * @param userId 프로필을 조회할 사용자 ID
 */
export async function ProfileDisplay({ userId }: ProfileDisplayProps) {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">사용자</p>
          <p className="text-xs text-muted-foreground">프로필을 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">알 수 없음</p>
          <p className="text-xs text-muted-foreground">프로필을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  const displayName = profile.username || '사용자';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{displayName}</p>
        {profile.tech_stack && profile.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {profile.tech_stack.slice(0, 3).map((tech: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {profile.tech_stack.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{profile.tech_stack.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
