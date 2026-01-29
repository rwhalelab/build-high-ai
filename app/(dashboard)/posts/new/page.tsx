"use client";

/**
 * 게시글 작성 페이지 (Creation)
 * 
 * - 제목, 카테고리, 본문 입력 폼
 * - 우측 AI 가이드 영역 (작성 중 반응)
 * - 저장 버튼 클릭 시 AI 분석 결과 확인 팝업/사이드바
 * - AI 처리 후 DB 저장
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/toast-provider";
import {
  Sparkles,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Code,
  BookOpen,
  Rocket,
  Link as LinkIcon,
  Save,
  Phone,
  Mail,
  Globe,
} from "lucide-react";

const categories = [
  { value: "development", label: "Development", icon: Code },
  { value: "study", label: "Study", icon: BookOpen },
  { value: "project", label: "Project", icon: Rocket },
];

const aiTips = [
  "모집하고자 하는 기술 스택을 구체적으로 명시하세요",
  "예상 기간과 참여 수준을 언급하세요",
  "프로젝트의 목표와 비전을 명확히 설명하세요",
  "팀 문화나 작업 스타일에 대한 정보를 포함하세요",
];

export default function NewPostPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "ready" | "analyzing">("idle");
  const [titleError, setTitleError] = useState("");

  // Update AI status based on content length
  useEffect(() => {
    if (content.length > 50) {
      setAiStatus("ready");
    } else {
      setAiStatus("idle");
    }
  }, [content]);

  // Validate title
  useEffect(() => {
    if (title.length > 0 && title.length < 5) {
      setTitleError("제목은 최소 5자 이상이어야 합니다");
    } else {
      setTitleError("");
    }
  }, [title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.length < 5) {
      setTitleError("제목은 최소 5자 이상이어야 합니다");
      return;
    }

    if (!category) {
      return;
    }

    setIsSubmitting(true);
    setAiStatus("analyzing");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          content,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          contact_url: contactUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "게시글 생성 실패");
      }

      // 성공 토스트 표시
      success("게시글 작성 완료", "게시글이 성공적으로 작성되었습니다.");
      
      // 성공 시 대시보드로 리다이렉트
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMessage = error instanceof Error ? error.message : "게시글 생성 중 오류가 발생했습니다";
      showError("게시글 작성 실패", errorMessage);
    } finally {
      setIsSubmitting(false);
      setAiStatus("ready");
    }
  };

  const isFormValid = category && title.length >= 5 && content.length > 50 && (phone.trim() || email.trim() || contactUrl.trim());

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">새 게시글 작성</h1>
        <p className="mt-2 text-muted-foreground">
          프로젝트 상세 정보를 작성하고 AI가 완벽한 팀원을 찾도록 도와드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <div className="flex gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:bg-accent"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    제목
                    <span className="ml-1 text-xs text-muted-foreground">(최소 5자 이상)</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="프로젝트 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(titleError && "border-destructive")}
                  />
                  {titleError && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="content">
                    본문
                    <span className="ml-1 text-xs text-muted-foreground">(마크다운 지원)</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder={`프로젝트 상세 정보를 입력하세요:

- 어떤 프로젝트인가요?
- 어떤 기술 스택이 필요한가요?
- 예상 기간은 얼마나 되나요?
- 팀 문화나 작업 스타일은 어떤가요?`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px] resize-none font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{content.length}자</span>
                    <span>
                      {content.length >= 50 ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          AI 분석 준비 완료
                        </span>
                      ) : (
                        <span>AI 분석을 위해 최소 50자 이상 입력하세요</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="space-y-4">
                  <Label>연락처 정보</Label>
                  
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm text-muted-foreground">
                      전화번호 (선택)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-muted-foreground">
                      이메일 (선택)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Contact URL */}
                  <div className="space-y-2">
                    <Label htmlFor="contactUrl" className="text-sm text-muted-foreground">
                      연락처 URL (선택)
                    </Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="contactUrl"
                        type="url"
                        placeholder="https://discord.gg/... 또는 https://t.me/..."
                        value={contactUrl}
                        onChange={(e) => setContactUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Discord, Telegram, 카카오톡 오픈채팅 등
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      저장 및 게시
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* AI Guide Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* AI Status Card */}
            <Card>
              <div className="border-b border-border bg-primary/5 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      aiStatus === "analyzing"
                        ? "bg-primary animate-pulse"
                        : aiStatus === "ready"
                          ? "bg-green-500/20"
                          : "bg-secondary"
                    )}
                  >
                    <Sparkles
                      className={cn(
                        "h-4 w-4",
                        aiStatus === "analyzing"
                          ? "text-primary-foreground"
                          : aiStatus === "ready"
                            ? "text-green-400"
                            : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI 가이드</h3>
                    <p className="text-xs text-muted-foreground">
                      {aiStatus === "analyzing"
                        ? "내용 분석 중..."
                        : aiStatus === "ready"
                          ? "분석 준비 완료"
                          : "내용 입력 대기 중..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="mb-4 text-sm text-muted-foreground">
                  게시글을 저장하면 AI가 자동으로:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">
                      3줄 요약을 생성하여 빠른 개요 제공
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">
                      핵심 기술 스택 태그 5개 추출
                    </span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Writing Tips */}
            <Card className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                <h3 className="font-semibold text-foreground">작성 팁</h3>
              </div>
              <ul className="space-y-3">
                {aiTips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
