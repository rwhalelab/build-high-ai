"use client";

/**
 * 마이페이지
 * 
 * - 사용자 프로필 정보 표시 및 수정
 * - 기술 스택 등록 및 수정
 * - 프로필 사진 업로드 (Phase 2)
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile } from "@/hooks/use-profile";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { User, Save, Loader2, Code, Mail } from "lucide-react";

// 기술 스택 옵션
const TECH_STACK_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "Express",
  "Prisma",
  "PostgreSQL",
  "MongoDB",
  "Tailwind CSS",
  "Git",
  "Docker",
  "AWS",
  "Vue.js",
  "Angular",
  "Java",
  "Spring",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Flutter",
  "React Native",
  "GraphQL",
  "Redis",
  "Kubernetes",
  "CI/CD",
];

export default function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 이메일 정보 가져오기
  useEffect(() => {
    const fetchUserEmail = async () => {
      const supabase = createClient();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } else {
        // 환경 변수 없을 때 기본값 설정
        setEmail("user@example.com");
      }
    };
    fetchUserEmail();
  }, []);

  // 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setSelectedTechs(profile.tech_stack || []);
    } else if (!loading && !error) {
      // 프로필이 없을 때 기본값 설정 (환경 변수 없을 때)
      setUsername("");
      setSelectedTechs([]);
    }
  }, [profile, loading, error]);

  const handleTechToggle = (tech: string) => {
    setSelectedTechs((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const supabase = createClient();
      if (!supabase) {
        // 환경 변수 없을 때는 로컬 상태만 업데이트
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsSaving(false);
        return;
      }

      await updateProfile({
        username,
        tech_stack: selectedTechs,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "프로필 업데이트 중 오류가 발생했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">프로필을 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">마이페이지</h1>
        <p className="text-muted-foreground">프로필 정보를 수정하고 기술 스택을 관리하세요.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* 기본 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
              <CardDescription>사용자 이름과 이메일 정보를 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input
                  id="username"
                  placeholder="사용자 이름을 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  이메일
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  이메일은 로그인 계정과 연동되어 변경할 수 없습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 기술 스택 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                보유 기술 스택
              </CardTitle>
              <CardDescription>
                자신이 보유한 기술 스택을 선택하세요. 여러 개 선택 가능합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {TECH_STACK_OPTIONS.map((tech) => {
                    const isSelected = selectedTechs.includes(tech);
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleTechToggle(tech)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
                {selectedTechs.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">선택된 기술 스택:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTechs.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 및 메시지 */}
          <div className="space-y-4">
            {saveError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
                프로필이 성공적으로 저장되었습니다.
              </div>
            )}
            <Button type="submit" disabled={isSaving} className="w-full" size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  저장하기
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
