/**
 * AI 챗봇 컴포넌트
 * 
 * 사용자 질문을 입력받아 Gemini AI로 응답을 생성하고 DB에 저장
 * 비용 절감: gemini-3-flash-preview 사용, maxTokens: 1000 제한
 */

'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast-provider';
import { Loader2, Send, Bot, User, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import ReactMarkdown from 'react-markdown';
import { useRef, useEffect, useState } from 'react';

interface AIChatProps {
  category?: string;
  className?: string;
}

// 코드 블록 컴포넌트
function CodeBlock({ language, children }: { language: string; children: string }) {
  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border bg-[#1e1e1e]">
      {language && (
        <div className="px-4 py-2 bg-[#252526] border-b border-border/50">
          <span className="text-xs text-muted-foreground font-mono">{language}</span>
        </div>
      )}
      <pre className="p-4 m-0 overflow-x-auto">
        <code className="text-sm text-[#d4d4d4] font-mono leading-relaxed whitespace-pre">
          {children}
        </code>
      </pre>
    </div>
  );
}

export function AIChat({ category = 'chat', className }: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { success, error: showError } = useToast();
  const [input, setInput] = useState('');
  const [provider, setProvider] = useState<'google' | 'groq'>('google');

  const { messages, sendMessage, status, error } = useChat({
    onError: (error) => {
      console.error('AI 챗봇 오류:', error);
      const errorMsg = error.message || '네트워크 오류가 발생했습니다.';
      showError('오류 발생', errorMsg);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // 메시지 추가 시 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 입력 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  // 메시지 전송 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    // 메시지 전송 (body에 category와 provider 전달)
    await sendMessage(
      {
        text: trimmedInput,
      },
      {
        body: {
          category,
          provider,
        },
      }
    );

    // 입력 필드 초기화
    setInput('');
  };

  // Enter 키 처리 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 입력기(IME) 조합 중인지 확인
    if (e.nativeEvent.isComposing) {
      return; // IME 조합 중이면 무시
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 기본 동작 방지
      
      // 로딩 중이거나 입력이 비어있으면 무시
      if (isLoading || !input.trim()) {
        return;
      }
      
      handleSubmit(e);
    }
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 챗봇
          </CardTitle>
          
          {/* 모델 선택 UI */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              AI 모델 선택
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProvider('google')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                  provider === 'google'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <Sparkles className={cn(
                  'h-4 w-4',
                  provider === 'google' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Google Gemini</span>
                  <span className="text-xs opacity-70">gemini-3-flash-preview</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                  provider === 'groq'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <Zap className={cn(
                  'h-4 w-4',
                  provider === 'groq' ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">Groq</span>
                  <span className="text-xs opacity-70">llama-3.3-70b-versatile</span>
                </div>
              </button>
            </div>
          </div>
          
          <CardDescription>
            질문을 입력하시면 선택한 AI 모델이 답변해드립니다.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>질문을 입력해주세요.</p>
                <p className="text-sm mt-2">예: "Next.js에서 서버 컴포넌트는 무엇인가요?"</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-code:text-foreground prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border">
                        {message.parts && message.parts.length > 0 ? (
                          <ReactMarkdown
                            components={{
                              code({ node, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                const isInline = !className || !match;
                                return !isInline && language ? (
                                  <CodeBlock language={language}>
                                    {String(children)}
                                  </CodeBlock>
                                ) : (
                                  <code className="px-1.5 py-0.5 rounded bg-muted/70 text-foreground font-mono text-sm border border-border/50" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              p({ children }) {
                                return <p className="mb-2 last:mb-0 text-foreground">{children}</p>;
                              },
                              h1({ children }) {
                                return <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0 text-foreground">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0 text-foreground">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0 text-foreground">{children}</h3>;
                              },
                              ul({ children }) {
                                return <ul className="list-disc ml-6 mb-2 space-y-1.5 text-foreground">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal ml-6 mb-2 space-y-1.5 text-foreground">{children}</ol>;
                              },
                              li({ children }) {
                                return <li className="text-foreground">{children}</li>;
                              },
                              strong({ children }) {
                                return <strong className="font-semibold text-foreground">{children}</strong>;
                              },
                              em({ children }) {
                                return <em className="italic text-foreground">{children}</em>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2 text-muted-foreground">{children}</blockquote>;
                              },
                              a({ href, children }) {
                                return <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>;
                              },
                            }}
                          >
                            {message.parts
                              .filter((part) => part.type === 'text')
                              .map((part) => (part as any).text)
                              .join('')}
                          </ReactMarkdown>
                        ) : (
                          isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>답변 생성 중...</span>
                            </div>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.parts
                          ?.filter((part) => part.type === 'text')
                          .map((part) => (part as any).text)
                          .join('') || ''}
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error.message || '오류가 발생했습니다.'}</p>
          </div>
        )}

        {/* 입력 영역 */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="질문을 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            disabled={isLoading}
            className="min-h-[60px] resize-none"
            rows={2}
            maxLength={5000}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {input.length}/5000자
        </p>
      </CardContent>
    </Card>
  );
}
