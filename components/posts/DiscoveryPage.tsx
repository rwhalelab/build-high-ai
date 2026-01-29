"use client";

import { useState, useMemo } from "react";
import { DiscoveryStatCards } from "./DiscoveryStatCards";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { DiscoveryPostCard, type DiscoveryPostItem } from "./DiscoveryPostCard";
import { CtaBanner } from "./CtaBanner";
import { EmptyState } from "@/components/domain/shared/empty-state";
import { usePosts } from "@/hooks/use-posts";
import { PostWithAuthor } from "@/types/post";
import { LoadingSpinner } from "@/components/domain/shared/loading-spinner";

// PostWithAuthor를 DiscoveryPostItem으로 변환하는 헬퍼 함수
function convertToDiscoveryPostItem(post: PostWithAuthor): DiscoveryPostItem {
  const summary = Array.isArray(post.summary) ? post.summary : [];
  const tags = Array.isArray(post.tags) ? post.tags : [];
  
  // 날짜를 상대 시간으로 변환 (예: "2일 전", "5시간 전")
  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return postDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  };

  return {
    id: post.id,
    title: post.title,
    category: post.category,
    summaryLines: summary.slice(0, 3),
    techTags: tags,
    authorName: post.author?.username || "알 수 없음",
    createdAt: formatRelativeTime(post.created_at),
  };
}

export function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Supabase에서 게시글 데이터 가져오기
  const categoryFilter = activeCategory === "all" 
    ? undefined 
    : (activeCategory as "Development" | "Study" | "Project");
  
  const { posts, loading, error } = usePosts({
    category: categoryFilter,
    pageSize: 50, // 충분히 많은 게시글 가져오기
  });

  // DiscoveryPostItem으로 변환
  const discoveryPosts = useMemo(() => {
    return posts.map(convertToDiscoveryPostItem);
  }, [posts]);

  // 클라이언트 사이드 필터링 (검색어)
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return discoveryPosts;
    
    const q = searchQuery.toLowerCase().trim();
    return discoveryPosts.filter((post) => {
      const matchSearch =
        post.title.toLowerCase().includes(q) ||
        post.techTags.some((t) => String(t).toLowerCase().includes(q));
      return matchSearch;
    });
  }, [discoveryPosts, searchQuery]);

  // 검색 실행 핸들러 (검색 버튼 클릭 또는 엔터 키)
  const handleSearchSubmit = () => {
    // 검색은 이미 실시간으로 동작하므로, 여기서는 추가 피드백 제공
    // 예: 검색 결과가 없을 때 스크롤 이동 등
    if (filteredPosts.length === 0 && searchQuery.trim()) {
      // 검색 결과가 없을 때는 이미 EmptyState가 표시됨
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DiscoveryStatCards />
      <DiscoveryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="text-center text-destructive py-8">
          <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          title={searchQuery.trim() ? "검색 결과가 없습니다" : "첫 번째 프로젝트의 주인공이 되어보세요!"}
          description={
            searchQuery.trim() 
              ? `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다. 다른 키워드로 검색해보세요.`
              : "첫 번째 모집글을 작성하고 팀 빌딩을 시작해보세요."
          }
          actionLabel={searchQuery.trim() ? "전체 게시글 보기" : "팀원 모집하기"}
          actionHref={searchQuery.trim() ? undefined : "/posts/new"}
          onAction={searchQuery.trim() ? () => setSearchQuery("") : undefined}
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
