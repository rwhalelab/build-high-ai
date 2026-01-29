"use client";

import { useState, useMemo } from "react";
import { DiscoveryStatCards } from "./DiscoveryStatCards";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { DiscoveryPostCard, type DiscoveryPostItem } from "./DiscoveryPostCard";
import { CtaBanner } from "./CtaBanner";
import { EmptyState } from "@/components/domain/shared/empty-state";
import { Button } from "@/components/ui/button";

/** Discovery용 목업 데이터 (실제로는 API/DB 연동) */
const MOCK_POSTS: DiscoveryPostItem[] = [
  {
    id: "1",
    title: "AI 기반 이커머스 플랫폼 개발",
    category: "Development",
    summaryLines: [
      "Next.js 기반 쇼핑 플랫폼 구축",
      "AI 상품 추천 시스템 적용",
      "프론트/백엔드 개발자 모집",
    ],
    techTags: ["Next.js", "TypeScript", "Prisma", "OpenAI", "Tailwind"],
    authorName: "Alex Kim",
    createdAt: "2일 전",
  },
  {
    id: "2",
    title: "딥러닝 스터디 - Transformer 아키텍처",
    category: "Study",
    summaryLines: [
      "Transformer 중심 주간 스터디",
      "논문 구현 from scratch",
      "ML 입문~중급 환영",
    ],
    techTags: ["Python", "PyTorch", "Transformers", "NLP"],
    authorName: "Sarah Lee",
    createdAt: "5시간 전",
  },
  {
    id: "3",
    title: "피트니스 트래킹 앱 (소셜 기능)",
    category: "Project",
    summaryLines: [
      "모바일 퍼스트 피트니스 트래커",
      "챌린지·그룹 운동 기능",
      "React Native 개발자 모집",
    ],
    techTags: ["React Native", "Firebase", "Node.js", "MongoDB"],
    authorName: "Mike Chen",
    createdAt: "1일 전",
  },
];

export function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showEmpty, setShowEmpty] = useState(false);

  const filteredPosts = useMemo(() => {
    if (showEmpty) return [];
    return MOCK_POSTS.filter((post) => {
      const matchCategory =
        activeCategory === "all" || post.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        post.title.toLowerCase().includes(q) ||
        post.techTags.some((t) => String(t).toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory, showEmpty]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DiscoveryStatCards />
      <DiscoveryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* 데모용: 빈 상태 토글 (개발 시 확인용, 추후 제거 가능) */}
      <div className="mb-6 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowEmpty((v) => !v)}
          className="text-xs text-muted-foreground"
        >
          {showEmpty ? "목록 보기" : "빈 상태 보기"}
        </Button>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState
          title="첫 번째 프로젝트의 주인공이 되어보세요!"
          description="첫 번째 모집글을 작성하고 팀 빌딩을 시작해보세요."
          actionLabel="팀원 모집하기"
          actionHref="/posts/new"
        />
      ) : (
        <section>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <DiscoveryPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <CtaBanner />
    </div>
  );
}
