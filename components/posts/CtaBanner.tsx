import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * FLOW.md: "Click FAB/Button → Post Editor"
 * 팀원 모집하기 클릭 시 /posts/new 로 이동
 */
const CTA_HREF = "/posts/new";

export function CtaBanner() {
  return (
    <section className="mt-12 mb-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#5EEAD4] p-8 sm:p-10">
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              지금 바로 시작해보세요
            </h3>
            <p className="text-sm text-white/90 sm:text-base">
              당신의 아이디어를 함께 실현할 팀원이 기다리고 있어요
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-white px-6 py-5 font-semibold text-[#7C3AED] shadow-lg transition-transform hover:scale-105 hover:bg-white/90"
          >
            <Link href={CTA_HREF} className="gap-2">
              팀원 모집하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      </div>
    </section>
  );
}
