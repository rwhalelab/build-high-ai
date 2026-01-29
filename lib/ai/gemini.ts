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
                  text: `다음 게시글을 분석하여 JSON 형식으로 응답해주세요:
{
  "summary": ["요약문 1줄", "요약문 2줄", "요약문 3줄"],
  "tags": ["기술1", "기술2", "기술3", "기술4", "기술5"]
}

요구사항:
- summary: 게시글의 핵심 내용을 3줄로 요약 (각 줄은 독립적인 문장, 50자 이내)
- tags: 게시글에서 언급된 기술 스택이나 도구를 5개 추출 (프로그래밍 언어, 프레임워크, 라이브러리, 도구 등)

게시글 내용:
${content.substring(0, 5000)}`, // Gemini API 토큰 제한 고려
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // 응답 파싱
    // Gemini API 응답 구조: data.candidates[0].content.parts[0].text
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!text) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // JSON 형식으로 파싱 시도
    let summary: string[] = [];
    let tags: string[] = [];

    try {
      // JSON 형식 응답 파싱 시도
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = Array.isArray(parsed.summary) ? parsed.summary : 
                  parsed.summary ? [parsed.summary] : [];
        tags = Array.isArray(parsed.tags) ? parsed.tags : 
               parsed.tags ? [parsed.tags] : [];
      } else {
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
      console.error('응답 파싱 오류:', parseError);
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
    console.error('AI 생성 오류:', error);
    // 에러 발생 시 기본값 반환
    return {
      summary: ['요약을 생성할 수 없습니다.', '', ''],
      tags: [],
    };
  }
}
