/**
 * Google Gemini API 연동
 * 
 * 게시글 본문을 분석하여 요약문(3줄)과 기술 태그(5개)를 생성
 */

interface AIGenerationResult {
  summary: string[];
  tags: string[];
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
  // TODO: Gemini API 호출 구현
  // TODO: 프롬프트 엔지니어링으로 요약 및 태그 추출
  // TODO: 에러 처리 및 재시도 로직
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    // 임시 구현 (실제 API 연동 필요)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `다음 게시글을 분석하여:
1. 3줄 요약문을 생성하세요 (각 줄은 독립적인 문장)
2. 사용된 기술 스택 태그를 5개 추출하세요

게시글 내용:
${content}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    // TODO: 응답 파싱하여 summary와 tags 추출
    // 임시 반환값
    return {
      summary: ['요약 1', '요약 2', '요약 3'],
      tags: ['React', 'TypeScript', 'Next.js', 'Supabase', 'Tailwind'],
    };
  } catch (error) {
    console.error('AI 생성 오류:', error);
    // 에러 발생 시 기본값 반환
    return {
      summary: ['요약을 생성할 수 없습니다.', '', ''],
      tags: [],
    };
  }
}
