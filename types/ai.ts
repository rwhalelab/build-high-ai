/**
 * AI 응답 관련 타입 정의
 */

export interface AIGenerationResult {
  summary: string[];
  tags: string[];
}

export interface AIGenerationRequest {
  content: string;
}

export interface AIGenerationResponse {
  success: boolean;
  data?: AIGenerationResult;
  error?: string;
}
