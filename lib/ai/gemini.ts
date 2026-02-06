/**
 * AI API 연동 (Groq & Google Gemini)
 * 
 * 게시글 본문 분석: Groq llama-3.3-70b-versatile 모델 사용
 * - 게시글 본문을 분석하여 요약문(3줄)과 기술 태그(5개)를 생성
 * 
 * AI 챗봇 기능: Google Gemini API 사용
 * - 사용자 질문에 대한 응답 생성 및 DB 저장
 */

interface AIGenerationResult {
  summary: string[];
  tags: string[];
}

interface AIResponseResult {
  response: string;
  tokensUsed?: number;
}

interface SaveAIResponseParams {
  userId?: string;
  prompt: string;
  response: string;
  category: string;
  tokensUsed?: number;
}

/**
 * AI 응답에서 내부 노트 및 시스템 메시지 제거
 * 
 * @param text 원본 AI 응답 텍스트
 * @returns 정제된 응답 텍스트
 */
function cleanAIResponse(text: string): string {
  let cleaned = text;
  
  // 응답 시작 부분의 내부 노트 패턴 제거
  // "(Self-Correction during drafting):" 또는 "(Self-Correction during drafting)""
  cleaned = cleaned.replace(/^\(Self-Correction during drafting\)[":\s]*/gim, '');
  
  // 따옴표로 시작하는 내부 지시사항 제거 (응답 시작 부분에만)
  // 예: "(Self-Correction during drafting)": "Make sure to..."
  cleaned = cleaned.replace(/^\(Self-Correction during drafting\)["\s]*:\s*["']Make sure to[^"']*["']\s*/gim, '');
  
  // 괄호로 감싸진 내부 노트 제거 (응답 시작 부분)
  cleaned = cleaned.replace(/^\(Note:[^)]*\)\s*/gim, '');
  cleaned = cleaned.replace(/^\(Internal:[^)]*\)\s*/gim, '');
  cleaned = cleaned.replace(/^\[System:[^\]]*\]\s*/gim, '');
  cleaned = cleaned.replace(/^\[Note:[^\]]*\]\s*/gim, '');
  
  // 따옴표로 감싸진 내부 지시사항 제거 (응답 시작 부분)
  cleaned = cleaned.replace(/^["']Make sure to[^"']*["']\s*/gim, '');
  cleaned = cleaned.replace(/^["']Note:[^"']*["']\s*/gim, '');
  
  // 불필요한 따옴표 제거 (응답 시작/끝)
  cleaned = cleaned.replace(/^["']+|["']+$/g, '');
  
  // 여러 공백을 하나로 정리 (줄바꿈은 유지)
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n'); // 3개 이상의 연속 줄바꿈을 2개로
  
  // 빈 괄호나 대괄호 제거
  cleaned = cleaned.replace(/\(\s*\)/g, '');
  cleaned = cleaned.replace(/\[\s*\]/g, '');
  
  return cleaned.trim();
}

/**
 * 게시글 본문을 분석하여 요약문과 기술 태그를 생성
 * 
 * @param content 게시글 본문 내용
 * @returns 요약문 배열(3개)과 기술 태그 배열(5개)
 */
export async function generateSummaryAndTags(
  content: string
): Promise<AIGenerationResult> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn('GROQ_API_KEY가 설정되지 않았습니다. 기본값을 사용합니다.');
      // API 키가 없을 때 기본값 반환
      return {
        summary: ['요약을 생성할 수 없습니다.', '', ''],
        tags: [],
      };
    }

    // Groq API 호출 (llama-3.3-70b-versatile 모델 사용)
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: '당신은 게시글을 분석하여 요약과 기술 태그를 추출하는 전문가입니다. 응답은 반드시 유효한 JSON 형식으로만 제공하세요.',
            },
            {
              role: 'user',
              content: `다음 게시글을 분석하여 JSON 형식으로 응답해주세요:
{
  "summary": ["요약문 1줄", "요약문 2줄", "요약문 3줄"],
  "tags": ["기술1", "기술2", "기술3", "기술4", "기술5"]
}

요구사항:
- summary: 게시글의 핵심 내용을 3줄로 요약 (각 줄은 독립적인 문장, 50자 이내)
- tags: 게시글에서 언급된 기술 스택이나 도구를 5개 추출 (프로그래밍 언어, 프레임워크, 라이브러리, 도구 등)
- 응답은 반드시 JSON 형식만 제공하고, 추가 설명이나 마크다운 코드 블록 없이 순수 JSON만 반환하세요.

게시글 내용:
${content.substring(0, 5000)}`, // 토큰 제한 고려
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }, // JSON 모드 강제
        }),
      }
    );

    if (!response.ok) {
      // 실제 에러 응답 본문 확인 (근본 원인 파악을 위해)
      let errorData: any = {};
      let errorText = '';
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        console.error('[Groq API] 에러 응답 파싱 실패:', parseError);
        console.error('[Groq API] 원본 에러 응답:', errorText);
      }
      
      // 상세한 에러 정보 로깅
      console.error('[Groq API] HTTP 상태:', response.status);
      console.error('[Groq API] 에러 응답:', errorData);
      console.error('[Groq API] 원본 응답 텍스트:', errorText);
      
      const errorMessage = errorData.error?.message || errorData.message || `Groq API 오류: ${response.status}`;
      
      // 할당량 초과 에러 처리
      if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('429') || response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      // 503 오류의 경우 더 자세한 정보 포함
      if (response.status === 503) {
        const detailedError = errorData.error 
          ? `Groq API 서비스 일시 중단 (503): ${errorData.error.message || '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'}`
          : `Groq API 서비스 일시 중단 (503): ${errorText || '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'}`;
        throw new Error(detailedError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Groq API 응답 파싱
    const choice = data.choices?.[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error('AI 응답 구조가 올바르지 않습니다.');
    }
    
    let text = choice.message.content.trim();
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다.');
    }
    
    // Groq API는 response_format: { type: 'json_object' }를 사용하면 JSON 형식으로 반환됨
    // 먼저 직접 JSON 파싱 시도
    let summary: string[] = [];
    let tags: string[] = [];

    try {
      // 직접 JSON 파싱 시도 (Groq API는 JSON 형식으로 반환)
      let parsed: any = null;
      try {
        parsed = JSON.parse(text);
      } catch (directParseError) {
        // 직접 파싱 실패 시 JSON 객체 추출 시도
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }
      
      if (parsed) {
        // JSON 파싱 성공
        summary = Array.isArray(parsed.summary) ? parsed.summary : 
                  parsed.summary ? [parsed.summary] : [];
        tags = Array.isArray(parsed.tags) ? parsed.tags : 
               parsed.tags ? [parsed.tags] : [];
      } else {
        // JSON 파싱 실패 시 텍스트 형식 응답 파싱
        // 내부 노트 및 시스템 메시지 제거
        text = cleanAIResponse(text);
        // 텍스트 형식 응답 파싱
        // 요약문 추출 (번호나 줄바꿈으로 구분)
        const summaryLines = text
          .split(/\n+/)
          .filter((line: string) => {
            const trimmed = line.trim();
            return trimmed && (
              trimmed.match(/^\d+[\.\)]\s/) || // "1. " 또는 "1) "
              trimmed.match(/^[-*]\s/) || // "- " 또는 "* "
              trimmed.length > 20 // 긴 문장
            );
          })
          .slice(0, 3)
          .map((line: string) => line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim())
          .filter((line: string) => line.length > 0);

        summary = summaryLines.length > 0 ? summaryLines : [];

        // 태그 추출 (기술 스택 키워드 찾기)
        const techKeywords = [
          'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Svelte',
          'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
          'Node.js', 'Express', 'NestJS', 'FastAPI', 'Django', 'Spring',
          'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
          'Tailwind', 'CSS', 'SCSS', 'Styled Components',
          'GraphQL', 'REST', 'gRPC',
        ];

        const foundTags = techKeywords.filter((keyword) =>
          text.toLowerCase().includes(keyword.toLowerCase())
        );

        tags = foundTags.slice(0, 5);
      }
    } catch (parseError) {
      console.error('[Groq API] 응답 파싱 오류:', parseError);
      console.error('[Groq API] 원본 응답:', text);
      // 파싱 실패 시 기본값 사용
    }

    // 최종 검증 및 기본값 설정
    if (summary.length === 0) {
      summary = ['요약을 생성할 수 없습니다.', '', ''];
    } else if (summary.length < 3) {
      // 3줄 미만이면 빈 줄로 채움
      while (summary.length < 3) {
        summary.push('');
      }
    } else {
      summary = summary.slice(0, 3);
    }

    if (tags.length === 0) {
      tags = [];
    } else {
      tags = tags.slice(0, 5);
    }

    return { summary, tags };
  } catch (error) {
    console.error('[Groq API] AI 생성 오류:', error);
    // 에러 발생 시 기본값 반환
    return {
      summary: ['요약을 생성할 수 없습니다.', '', ''],
      tags: [],
    };
  }
}

/**
 * AI 챗봇 응답 생성 (비용 절감: gemini-3-flash-preview 사용, maxTokens: 1000)
 * 
 * @param prompt 사용자 질문
 * @param category 기능 카테고리 (예: 'chat', 'summary', 'tag_extraction')
 * @returns AI 응답 및 사용된 토큰 수
 */
export async function generateAIResponse(
  prompt: string,
  category: string = 'chat'
): Promise<AIResponseResult> {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY가 설정되지 않았습니다.');
    }

    // 입력 토큰 수 대략 계산 (한글 기준: 1자 ≈ 1토큰, 영문: 1단어 ≈ 1.3토큰)
    const estimatedInputTokens = Math.ceil(prompt.length * 1.2);
    console.log(`[AI] 입력 토큰 수 (추정): ~${estimatedInputTokens} tokens`);

    // 프롬프트 최적화: 사용자 질문만 사용 (지시사항은 systemInstruction에만 포함)
    // 이렇게 하면 입력 토큰 수가 줄어들어 API 호출 시간 단축

    // 비용 절감: gemini-3-flash-preview 모델 사용, maxTokens: 1000 제한
    // v1beta API 사용 (최신 모델 지원), API 키는 헤더로 전달
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt, // 최적화: 원본 프롬프트만 사용
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 1000, // 비용 절감: 최대 1000 토큰만 생성
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
          systemInstruction: {
            parts: [
              {
                text: '사용자에게 직접적이고 명확한 답변을 제공하세요. 내부 노트나 시스템 메시지는 포함하지 마세요. 답변은 간결하게 작성하세요.',
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      // 실제 에러 응답 본문 확인 (근본 원인 파악을 위해)
      let errorData: any = {};
      let errorText = '';
      
      try {
        errorText = await response.text();
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        console.error('[Gemini API] 에러 응답 파싱 실패:', parseError);
        console.error('[Gemini API] 원본 에러 응답:', errorText);
      }
      
      // 상세한 에러 정보 로깅
      console.error('[Gemini API] HTTP 상태:', response.status);
      console.error('[Gemini API] 에러 응답:', errorData);
      console.error('[Gemini API] 원본 응답 텍스트:', errorText);
      
      const errorMessage = errorData.error?.message || errorData.message || `Gemini API 오류: ${response.status}`;
      
      // 할당량 초과 에러 처리
      if (errorMessage.includes('quota') || errorMessage.includes('Quota') || errorMessage.includes('429') || response.status === 429) {
        throw new Error('QUOTA_EXCEEDED');
      }
      
      // 503 오류의 경우 더 자세한 정보 포함
      if (response.status === 503) {
        const detailedError = errorData.error 
          ? `Gemini API 서비스 일시 중단 (503): ${errorData.error.message || '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'}`
          : `Gemini API 서비스 일시 중단 (503): ${errorText || '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.'}`;
        throw new Error(detailedError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // 응답 파싱 - 모든 parts에서 텍스트 추출
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('AI 응답 구조가 올바르지 않습니다.');
    }
    
    // 모든 parts의 텍스트를 합치기
    let text = candidate.content.parts
      .map((part: any) => part.text || '')
      .join('')
      .trim();
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다.');
    }
    
    // 내부 노트 및 시스템 메시지 제거
    text = cleanAIResponse(text);

    // 사용된 토큰 수 추출 (API 응답에 포함된 경우)
    const tokensUsed = data.usageMetadata?.totalTokenCount || 
                      Math.ceil(text.length * 1.2); // 대략적인 출력 토큰 수 추정
    
    console.log(`[AI] 출력 토큰 수 (추정): ~${Math.ceil(text.length * 1.2)} tokens`);
    console.log(`[AI] 총 토큰 수 (추정): ~${estimatedInputTokens + Math.ceil(text.length * 1.2)} tokens`);

    return {
      response: text,
      tokensUsed,
    };
  } catch (error) {
    console.error('AI 응답 생성 오류:', error);
    throw error;
  }
}

/**
 * AI 응답을 Supabase에 저장 (최적화: 백그라운드 처리, 재시도 로직)
 * 
 * @param params 저장할 데이터
 * @param retries 재시도 횟수 (기본값: 2)
 * @returns 저장된 레코드 ID (비동기, 논블로킹)
 */
export async function saveAIResponse(
  params: SaveAIResponseParams,
  retries: number = 2
): Promise<string | null> {
  try {
    // 동적 import로 순환 참조 방지
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    if (!supabase) {
      console.warn('Supabase 클라이언트를 초기화할 수 없습니다. AI 응답 저장을 건너뜁니다.');
      return null;
    }

    // 최적화: select 제거 (id만 필요한 경우), 단일 쿼리로 최적화
    const { data, error } = await supabase
      .from('ai_responses')
      .insert({
        user_id: params.userId || null,
        prompt: params.prompt,
        response: params.response,
        category: params.category,
        tokens_used: params.tokensUsed || null,
      })
      .select('id')
      .single();

    if (error) {
      // 재시도 로직: 네트워크 오류나 일시적 오류인 경우 재시도
      if (retries > 0 && (
        error.code === 'PGRST116' || // 네트워크 오류
        error.message.includes('timeout') ||
        error.message.includes('network')
      )) {
        console.warn(`[AI] 저장 실패, ${retries}회 남음. 재시도 중...`, error.message);
        // 지수 백오프: 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, 2 - retries) * 100));
        return saveAIResponse(params, retries - 1);
      }
      
      console.error('AI 응답 저장 오류:', error);
      return null;
    }

    // 성공 로그는 개발 환경에서만 출력 (프로덕션 성능 최적화)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AI] 응답이 DB에 저장되었습니다. ID: ${data.id}`);
    }
    return data.id;
  } catch (error) {
    // 재시도 로직: 예외 발생 시에도 재시도
    if (retries > 0) {
      console.warn(`[AI] 저장 중 예외 발생, ${retries}회 남음. 재시도 중...`, error);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, 2 - retries) * 100));
      return saveAIResponse(params, retries - 1);
    }
    
    console.error('AI 응답 저장 중 예외 발생:', error);
    return null;
  }
}

/**
 * AI 응답을 백그라운드에서 저장 (논블로킹, 최적화)
 * 
 * @param params 저장할 데이터
 * @returns Promise (결과를 기다리지 않음)
 */
export function saveAIResponseAsync(params: SaveAIResponseParams): void {
  // 즉시 반환하고 백그라운드에서 저장 (논블로킹)
  saveAIResponse(params).catch((error) => {
    // 최종 실패 시에만 로그 출력
    console.error('[AI] 백그라운드 저장 최종 실패:', error);
  });
}

/**
 * 유사도 계산 함수 (Levenshtein distance 기반)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // 정규화된 유사도 (0-1)
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance 계산
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 캐시된 AI 응답 검색
 * 
 * @param prompt 사용자 질문
 * @param category 카테고리
 * @param userId 사용자 ID (선택사항)
 * @returns 캐시된 응답 또는 null
 */
export async function getCachedAIResponse(
  prompt: string,
  category: string = 'chat',
  userId?: string
): Promise<AIResponseResult | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    if (!supabase) {
      return null;
    }

    const trimmedPrompt = prompt.trim().toLowerCase();
    
    // 최근 30일 이내의 응답만 검색 (성능 최적화)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 정확히 일치하는 질문 검색
    let query = supabase
      .from('ai_responses')
      .select('prompt, response, tokens_used, created_at')
      .eq('category', category)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100); // 최근 100개만 검색 (성능 최적화)
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    // 정확히 일치하는 질문 찾기
    const exactMatch = data.find(
      (item) => item.prompt.trim().toLowerCase() === trimmedPrompt
    );
    
    if (exactMatch) {
      console.log('[AI] 캐시 히트: 정확히 일치하는 질문 발견');
      return {
        response: exactMatch.response,
        tokensUsed: exactMatch.tokens_used || undefined,
      };
    }
    
    // 유사도 기반 매칭 (유사도 85% 이상)
    const similarityThreshold = 0.85;
    for (const item of data) {
      const similarity = calculateSimilarity(
        trimmedPrompt,
        item.prompt.trim().toLowerCase()
      );
      
      if (similarity >= similarityThreshold) {
        console.log(`[AI] 캐시 히트: 유사도 ${(similarity * 100).toFixed(1)}% 매칭`);
        return {
          response: item.response,
          tokensUsed: item.tokens_used || undefined,
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('캐시 검색 오류:', error);
    return null;
  }
}

