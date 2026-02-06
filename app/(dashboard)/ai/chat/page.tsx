/**
 * AI 챗봇 페이지
 * 
 * 사용자가 AI와 대화할 수 있는 페이지
 */

import { AIChat } from '@/components/domain/ai/ai-chat';

export default function AIChatPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI 챗봇</h1>
          <p className="text-muted-foreground">
            질문을 입력하시면 AI가 답변해드립니다. 모든 대화는 데이터베이스에 저장되어 비용 절감에 도움이 됩니다.
          </p>
        </div>
        <AIChat category="chat" className="h-[calc(100vh-250px)] min-h-[700px]" />
      </div>
    </div>
  );
}
