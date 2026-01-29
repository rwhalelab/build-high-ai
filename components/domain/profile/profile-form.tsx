/**
 * 프로필 편집 폼 컴포넌트
 * 
 * 사용자 프로필 정보 수정 폼
 * useProfile 훅으로 현재 프로필 로드 및 업데이트
 */

'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

export function ProfileForm() {
  const { profile, loading, updateProfile } = useProfile();
  const { success, error: showError } = useToast();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로필 로드 시 폼 초기화
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatar_url || '');
      setTechStack(profile.tech_stack || []);
    }
  }, [profile]);

  const handleAddTech = () => {
    const trimmed = newTech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
      setNewTech('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await updateProfile({
        username: username || null,
        avatar_url: avatarUrl || null,
        tech_stack: techStack.length > 0 ? techStack : null,
      });

      success('프로필 업데이트 완료', '프로필이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('프로필 업데이트 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '프로필 업데이트에 실패했습니다.';
      setError(errorMessage);
      showError('프로필 업데이트 실패', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">프로필을 불러오는 중...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* 사용자 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="username">사용자 이름</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 프로필 사진 URL 입력 */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">프로필 사진 URL</Label>
            <Input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              프로필 사진 이미지 URL을 입력하세요.
            </p>
          </div>

          {/* 기술 스택 */}
          <div className="space-y-2">
            <Label>기술 스택</Label>
            <div className="flex gap-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTech();
                  }
                }}
                placeholder="기술 스택 추가 (예: React, TypeScript)"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTech}
                disabled={isSubmitting || !newTech.trim()}
              >
                추가
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(tech)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : '프로필 저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
