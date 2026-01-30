/**
 * AI 챗봇 API Route
 * 
 * POST /api/chat
 * - 사용자 질문 수신
 * - 캐시 확인 (동일/유사 질문 검색)
 * - 캐시 미스 시 Gemini API 스트리밍 호출
 * - Supabase에 응답 저장 (비용 절감을 위한 캐싱)
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';

// streamText가 기대하는 메시지 타입 정의
type Message = {
  role: 'user' | 'assistant';
  content: string;
};
import { 
  saveAIResponseAsync, 
  getCachedAIResponse 
} from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Supabase 클라이언트가 없으면 (환경 변수 미설정) 에러 반환
    if (!supabase) {
      return Response.json(
        { error: 'Supabase 환경 변수가 설정되지 않았습니다.' },
        { status: 503 }
      );
    }
    
    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messages, category = 'chat', provider = 'google' } = body;

    // 유효성 검사
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    
    // useChat이 전송하는 메시지 형식 처리
    // 1. content 속성이 있는 경우 (직접 텍스트)
    // 2. parts 배열이 있는 경우 (AI SDK 형식)
    // 3. text 속성이 있는 경우
    let prompt = '';
    if (lastMessage?.content) {
      prompt = typeof lastMessage.content === 'string' 
        ? lastMessage.content.trim() 
        : '';
    } else if (lastMessage?.parts && Array.isArray(lastMessage.parts)) {
      // parts 배열에서 텍스트 추출
      prompt = lastMessage.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text || '')
        .join('')
        .trim();
    } else if (lastMessage?.text) {
      prompt = typeof lastMessage.text === 'string' 
        ? lastMessage.text.trim() 
        : '';
    }

    if (!prompt || prompt.length === 0) {
      return Response.json(
        { error: '질문을 입력해주세요.' },
        { status: 400 }
      );
    }

    if (prompt.length > 5000) {
      return Response.json(
        { error: '질문은 최대 5000자까지 입력 가능합니다.' },
        { status: 400 }
      );
    }

    // 캐시 확인
    const cachedResponse = await getCachedAIResponse(prompt, category, user.id);
    
    if (cachedResponse) {
      // 캐시 히트: 즉시 반환
      console.log('[AI] 캐시된 응답 반환');
      return Response.json(
        {
          data: {
            response: cachedResponse.response,
            tokensUsed: cachedResponse.tokensUsed,
            cached: true,
          }
        },
        { status: 200 }
      );
    }

    // 캐시 미스: 스트리밍 응답 생성
    try {
      let model: any;
      
      if (provider === 'groq') {
        // Groq 사용
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey) {
          return Response.json(
            { 
              error: 'API_KEY_MISSING',
              message: 'Groq API 키가 설정되지 않았습니다.' 
            },
            { status: 503 }
          );
        }

        const groq = createGroq({
          apiKey,
        });
        
        model = groq('llama-3.3-70b-versatile');
      } else {
        // Google Gemini 사용 (기본값)
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
          return Response.json(
            { 
              error: 'API_KEY_MISSING',
              message: 'AI 서비스 설정이 완료되지 않았습니다.' 
            },
            { status: 503 }
          );
        }

        const googleAI = createGoogleGenerativeAI({
          apiKey,
        });
        
        model = googleAI('gemini-3-flash-preview');
      }

      // useChat이 전송하는 메시지를 Message 형식으로 변환
      const formattedMessages: Message[] = messages.map((msg: any) => {
        // role을 명시적으로 'user' | 'assistant' 타입으로 지정
        const role: 'user' | 'assistant' = msg.role === 'user' ? 'user' : 'assistant';
        
        // content가 직접 있는 경우
        if (msg.content && typeof msg.content === 'string') {
          return {
            role,
            content: msg.content,
          };
        }
        
        // parts 배열이 있는 경우 (AI SDK 형식)
        if (msg.parts && Array.isArray(msg.parts)) {
          // parts에서 텍스트만 추출하여 content로 변환
          const textContent = msg.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text || '')
            .join('');
          
          return {
            role,
            content: textContent,
          };
        }
        
        // text 속성이 있는 경우
        if (msg.text && typeof msg.text === 'string') {
          return {
            role,
            content: msg.text,
          };
        }
        
        // 기본값: 빈 문자열
        return {
          role,
          content: '',
        };
      }).filter((msg): msg is Message => {
        // 타입 가드: content가 있는 메시지만 필터링
        return msg && 
               typeof msg === 'object' &&
               'role' in msg &&
               'content' in msg && 
               typeof msg.content === 'string' && 
               msg.content.trim().length > 0;
      });

      const result = streamText({
        model,
        messages: formattedMessages,
        maxOutputTokens: 300,
        temperature: 0.7,
        system: '사용자에게 직접적이고 명확한 답변을 제공하세요. 내부 노트나 시스템 메시지는 포함하지 마세요.',
        onFinish: async ({ text, usage }) => {
          // 스트리밍 완료 후 DB에 저장 (백그라운드, 논블로킹)
          if (text) {
            saveAIResponseAsync({
              userId: user.id,
              prompt,
              response: text,
              category,
              tokensUsed: usage?.totalTokens,
            });
          }
        },
      });

      // useChat 훅과 호환되는 UI 메시지 스트림 응답 반환
      return result.toUIMessageStreamResponse();
    } catch (error: any) {
      console.error('AI 스트리밍 응답 생성 오류:', error);
      
      // 할당량 초과 에러 처리
      if (error.message?.includes('quota') || error.message?.includes('Quota') || error.message?.includes('429')) {
        return Response.json(
          { 
            error: 'QUOTA_EXCEEDED',
            message: '잠시 후 다시 시도해 주세요. AI 서비스 사용량이 초과되었습니다.' 
          },
          { status: 429 }
        );
      }

      // API 키 없음 에러 처리
      if (error.message?.includes('GOOGLE_GENERATIVE_AI_API_KEY') || 
          error.message?.includes('GROQ_API_KEY') ||
          error.message?.includes('API key')) {
        return Response.json(
          { 
            error: 'API_KEY_MISSING',
            message: 'AI 서비스 설정이 완료되지 않았습니다.' 
          },
          { status: 503 }
        );
      }

      // 기타 에러
      return Response.json(
        { 
          error: 'AI_SERVICE_ERROR',
          message: error.message || 'AI 응답 생성 중 오류가 발생했습니다.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in AI chat API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
