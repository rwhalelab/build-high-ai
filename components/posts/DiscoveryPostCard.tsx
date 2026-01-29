import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Discovery 리스트용 카드 표시 타입 (Post / PostWithAuthor와 호환) */
export interface DiscoveryPostItem {
  id: string;
  title: string;
  category: string;
  summaryLines: string[];
  techTags: string[];
  authorName: string;
  createdAt: string;
}

const CATEGORY_STYLE: Record<string, { label: string; className: string }> = {
  Development: {
    label: "Development",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  Study: {
    label: "Study",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  Project: {
    label: "Project",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

const getCategoryStyle = (category: string) =>
  CATEGORY_STYLE[category] ?? {
    label: category,
    className: "bg-primary/10 text-primary border-primary/20",
  };

export interface DiscoveryPostCardProps {
  post: DiscoveryPostItem;
}

export function DiscoveryPostCard({ post }: DiscoveryPostCardProps) {
  const category = getCategoryStyle(post.category);

  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="group relative flex h-full flex-col overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="outline" className={category.className}>
              {category.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {post.createdAt}
            </div>
          </div>
          <div className="mb-4 rounded-lg bg-secondary/50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              AI 요약
            </div>
            <ul className="space-y-1">
              {post.summaryLines.map((line, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <h3
            className={cn(
              "mb-3 line-clamp-2 text-lg font-semibold text-foreground",
              "transition-colors group-hover:text-primary"
            )}
          >
            {post.title}
          </h3>
          <div className="mt-auto flex flex-wrap gap-1.5">
            {post.techTags.map((tag) => (
              <Badge
                key={String(tag)}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {String(tag)}
              </Badge>
            ))}
          </div>
        </div>
        <div className="relative border-t border-border bg-secondary/30 px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary"
                aria-hidden
              >
                {post.authorName.charAt(0)}
              </span>
              <span className="text-sm text-muted-foreground">
                {post.authorName}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
