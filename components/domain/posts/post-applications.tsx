/**
 * 게시글 지원 UI 컴포넌트
 * 
 * 게시글 상세 페이지에서 사용되는 지원 관련 UI
 * - 지원하기 버튼
 * - 지원자 목록 (작성자에게만 표시)
 * - 상태 변경 버튼 (승인/거절/철회)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, UserMinus, Users, Clock, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCommonCodes, getCodeName } from '@/hooks/use-common-codes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast-provider';

interface Application {
  id: string;
  post_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  applicant: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    tech_stack: string[] | null;
  };
}

interface PostApplicationsProps {
  postId: string;
  authorId: string;
}

export function PostApplications({ postId, authorId }: PostApplicationsProps) {
  const { user } = useAuth();
  const { codes: statusCodes } = useCommonCodes('BH_ST_APPLICATION');
  const { success, error: showError } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const isAuthor = user?.id === authorId;
  const hasApplied = applications.some((app) => app.applicant_id === user?.id);

  // 지원 상태별 스타일 및 아이콘
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          className: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
          icon: CheckCircle2,
          label: '승인됨',
        };
      case 'rejected':
        return {
          className: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
          icon: XCircle,
          label: '거절됨',
        };
      case 'withdrawn':
        return {
          className: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
          icon: MinusCircle,
          label: '철회됨',
        };
      case 'pending':
      default:
        return {
          className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: Clock,
          label: '대기 중',
        };
    }
  };

  // 지원 목록 조회
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}/applications`);

      if (!response.ok) {
        throw new Error('지원 목록을 불러오는데 실패했습니다.');
      }

      const { data } = await response.json();
      setApplications(data || []);
    } catch (err) {
      console.error('지원 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, user]);

  // 지원하기
  const handleApply = async () => {
    if (!user) {
      showError('로그인 필요', '로그인이 필요합니다.');
      return;
    }

    setIsApplying(true);

    try {
      const response = await fetch(`/api/posts/${postId}/applications`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '지원에 실패했습니다.');
      }

      success('지원 완료', '지원이 완료되었습니다. 작성자의 승인을 기다려주세요.');
      await fetchApplications();
    } catch (err) {
      console.error('지원 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '지원에 실패했습니다.';
      showError('지원 실패', errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  // 상태 변경
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(applicationId);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '상태 변경에 실패했습니다.');
      }

      const statusMessages: Record<string, string> = {
        accepted: '승인되었습니다.',
        rejected: '거절되었습니다.',
        withdrawn: '철회되었습니다.',
      };

      const message = statusMessages[newStatus] || '상태가 변경되었습니다.';
      success('상태 변경 완료', message);
      
      await fetchApplications();
    } catch (err) {
      console.error('상태 변경 오류:', err);
      const errorMessage = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
      showError('상태 변경 실패', errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!user) {
    return null;
  }

  // 작성자가 아닌 경우: 지원하기 버튼만 표시
  if (!isAuthor) {
    if (hasApplied) {
      const myApplication = applications.find((app) => app.applicant_id === user.id);
      const statusName = getCodeName(statusCodes, myApplication?.status || 'pending');

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              지원 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium mb-2">지원 상태</p>
                  {(() => {
                    const statusStyle = getStatusStyle(myApplication?.status || 'pending');
                    const StatusIcon = statusStyle.icon;
                    return (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border-2",
                          statusStyle.className
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusName}
                      </Badge>
                    );
                  })()}
                </div>
                {myApplication?.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(myApplication.id, 'withdrawn')}
                    disabled={updatingStatus === myApplication.id}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    {updatingStatus === myApplication.id ? '철회 중...' : '지원 철회'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full"
            size="lg"
          >
            {isApplying ? '지원 중...' : '지원하기'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 작성자인 경우: 지원자 목록 표시
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          지원자 목록 ({applications.length}명)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            지원 목록을 불러오는 중...
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            아직 지원자가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const statusName = getCodeName(statusCodes, application.status);
              const applicant = application.applicant;
              const initials = (applicant.username || 'U')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar>
                      <AvatarImage src={applicant.avatar_url || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {applicant.username || '익명'}
                      </p>
                      {applicant.tech_stack && applicant.tech_stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applicant.tech_stack.slice(0, 3).map((tech: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {(() => {
                      const statusStyle = getStatusStyle(application.status);
                      const StatusIcon = statusStyle.icon;
                      return (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border-2 shrink-0",
                            statusStyle.className
                          )}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {statusName}
                        </Badge>
                      );
                    })()}
                  </div>
                  {application.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                        disabled={updatingStatus === application.id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        disabled={updatingStatus === application.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
