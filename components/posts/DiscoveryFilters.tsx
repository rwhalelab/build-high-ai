"use client";

import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

/** FLOW.md: Category Tabs - Study, Project, Development */
const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "Development", label: "Development" },
  { id: "Study", label: "Study" },
  { id: "Project", label: "Project" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"] | string;

export interface DiscoveryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void; // 검색 제출 핸들러 (선택적)
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}

export function DiscoveryFilters({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  activeCategory,
  onCategoryChange,
}: DiscoveryFiltersProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit?.();
    }
  };

  const handleSearchClick = () => {
    onSearchSubmit?.();
  };

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="프로젝트 또는 기술 스택 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
            />
          </div>
          <Button 
            variant="default" 
            size="icon" 
            type="button" 
            onClick={handleSearchClick}
            aria-label="검색"
            className="shrink-0"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" type="button" aria-label="필터">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
