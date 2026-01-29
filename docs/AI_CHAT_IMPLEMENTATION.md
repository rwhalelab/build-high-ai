# AI 챗봇 기능 구현 가이드

## 개요

Google Gemini AI를 연동한 챗봇 기능을 구현했습니다. 비용 절감을 위해 응답 결과를 Supabase 데이터베이스에 저장하는 로직이 포함되어 있습니다.

## 구현된 기능

### 1. 데이터베이스 스키마
- **테이블**: `ai_responses`
- **마이그레이션 파일**: `supabase/migrations/20250129000009_create_ai_responses.sql`
- **저장 항목**:
  - `user_id`: 사용자 ID (선택)
  - `prompt`: 사용자 질문
  - `response`: AI 응답
  - `category`: 기능 카테고리 (예: 'chat', 'summary', 'tag_extraction')
  - `tokens_used`: 사용된 토큰 수 (비용 추적용)

### 2. AI 응답 생성 함수
- **파일**: `lib/ai/gemini.ts`
- **함수**: `generateAIResponse(prompt, category)`
- **비용 절감 설정**:
  - 모델: `gemini-3-flash-preview` (비용 효율적인 모델)
  - 최대 토큰: `maxOutputTokens: 1000` (프롬프트에 1000 토큰 제한 지시)
  - 토큰 사용량 로깅: 콘솔에 입력/출력 토큰 수 출력

### 3. AI 응답 저장 함수
- **파일**: `lib/ai/gemini.ts`
- **함수**: `saveAIResponse(params)`
- **특징**: 비동기 처리, 저장 실패해도 메인 로직에 영향 없음

### 4. API 라우트
- **경로**: `/api/chat`
- **메서드**: `POST`
- **프레임워크**: `@ai-sdk/react`의 `useChat` 훅과 호환되는 스트리밍 API
- **요청 본문**:
  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "사용자 질문"
      }
    ],
    "category": "chat" // 선택사항, 기본값: "chat"
  }
  ```
- **응답**: 스트리밍 응답 (UI 메시지 스트림 형식)
- **메시지 형식 지원**:
  - `content`: 직접 텍스트 문자열
  - `parts`: AI SDK 형식의 parts 배열 (텍스트 타입만 추출)
  - `text`: 대체 텍스트 속성

### 5. 프론트엔드 컴포넌트
- **컴포넌트**: `components/domain/ai/ai-chat.tsx`
- **페이지**: `app/(dashboard)/ai/chat/page.tsx`
- **기술 스택**: `@ai-sdk/react`의 `useChat` 훅 사용
- **기능**:
  - 실시간 스트리밍 채팅 UI
  - 마크다운 렌더링 지원 (ReactMarkdown)
  - 코드 블록 하이라이팅
  - 로딩 상태 표시
  - 에러 처리 및 사용자 알림
  - 중복 클릭 방지 (버튼 비활성화)
  - 입력 검증 (빈 메시지, 최대 5000자 제한)
  - 한글 IME 입력 지원 (Enter 키 처리)

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수가 설정되어 있어야 합니다:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

**참고**: 기존 코드는 `GEMINI_API_KEY`를 참조하지만, 새로운 기능은 `GOOGLE_GENERATIVE_AI_API_KEY`를 우선 사용합니다.

## 에러 처리

### 1. 할당량 초과 (Quota Exceeded)
- **에러 코드**: `QUOTA_EXCEEDED`
- **HTTP 상태**: `429`
- **사용자 메시지**: "잠시 후 다시 시도해 주세요. AI 서비스 사용량이 초과되었습니다."

### 2. API 키 없음
- **에러 코드**: `API_KEY_MISSING`
- **HTTP 상태**: `503`
- **사용자 메시지**: "AI 서비스 설정이 완료되지 않았습니다."

### 3. 기타 에러
- **에러 코드**: `AI_SERVICE_ERROR`
- **HTTP 상태**: `500`
- **사용자 메시지**: 에러 메시지 표시

## 사용 방법

### 1. 데이터베이스 마이그레이션 실행

```bash
# Supabase CLI를 사용하는 경우
supabase db push

# 또는 SQL 파일을 직접 실행
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20250129000009_create_ai_responses.sql
```

### 2. 환경 변수 설정 확인

`.env.local` 파일에 `GOOGLE_GENERATIVE_AI_API_KEY`가 설정되어 있는지 확인하세요.

### 3. AI 챗봇 페이지 접근

브라우저에서 `/ai/chat` 경로로 접근하거나, 컴포넌트를 다른 페이지에 임베드할 수 있습니다:

```tsx
import { AIChat } from '@/components/domain/ai/ai-chat';

export default function MyPage() {
  return (
    <div>
      <AIChat category="chat" />
    </div>
  );
}
```

## 비용 절감 전략

1. **경량 모델 사용**: `gemini-3-flash-preview` 모델 사용 (비용 효율적)
2. **토큰 제한**: 최대 1000 토큰만 생성하도록 제한 (프롬프트에 1000 토큰 이하로 답변하도록 지시)
3. **DB 캐싱**: 모든 응답을 DB에 저장하여 향후 동일 질문에 대한 재사용 가능
4. **토큰 추적**: 사용된 토큰 수를 로깅하여 비용 모니터링

## 토큰 사용량 로깅

콘솔에 다음과 같은 로그가 출력됩니다:

```
[AI] 입력 토큰 수 (추정): ~120 tokens
[AI] 출력 토큰 수 (추정): ~80 tokens
[AI] 총 토큰 수 (추정): ~200 tokens
[AI] 사용된 토큰 수: 150
[AI] 응답이 DB에 저장되었습니다. ID: xxx-xxx-xxx
```

## 기술적 구현 상세

### 메시지 형식 변환 로직

`useChat` 훅이 전송하는 다양한 메시지 형식을 `streamText`가 기대하는 `ModelMessage[]` 형식으로 변환합니다:

```typescript
type Message = {
  role: 'user' | 'assistant';
  content: string;
};
```

**지원하는 입력 형식**:
1. `{ role: 'user', content: '텍스트' }` - 직접 텍스트
2. `{ role: 'user', parts: [{ type: 'text', text: '텍스트' }] }` - AI SDK parts 형식
3. `{ role: 'user', text: '텍스트' }` - 대체 텍스트 속성

**변환 과정**:
- 각 메시지의 `role`을 명시적으로 `'user' | 'assistant'` 타입으로 지정
- `content`, `parts`, `text` 중 하나에서 텍스트 추출
- 빈 메시지는 필터링하여 제거
- TypeScript 타입 가드를 사용하여 타입 안정성 보장

### 프롬프트 추출 로직

사용자 질문을 추출하기 위해 마지막 메시지에서 다음 순서로 확인:
1. `content` 속성 (문자열)
2. `parts` 배열 (텍스트 타입만 추출)
3. `text` 속성

### 스트리밍 응답 처리

- `streamText`의 `toUIMessageStreamResponse()` 메서드 사용
- 실시간으로 응답이 스트리밍되어 UI에 표시
- 응답 완료 후 `onFinish` 콜백에서 DB에 저장 (비동기, 논블로킹)

## 향후 개선 사항

1. ✅ **캐시 조회**: 동일 질문에 대해 DB에서 기존 응답 조회 (구현 완료)
2. ✅ **스트리밍 응답**: 실시간 스트리밍으로 응답 표시 (구현 완료)
3. **응답 히스토리**: 사용자별 대화 히스토리 조회 기능
4. **통계 대시보드**: 토큰 사용량 통계 표시
5. **유사 질문 매칭**: 의미적으로 유사한 질문에 대한 캐시 활용

## 파일 구조

```
build-high-ai/
├── supabase/
│   └── migrations/
│       └── 20250129000009_create_ai_responses.sql  # DB 스키마
├── lib/
│   └── ai/
│       └── gemini.ts  # AI 응답 생성 및 저장 함수
├── app/
│   └── api/
│       └── chat/
│           └── route.ts  # API 라우트 (useChat 호환)
├── components/
│   └── domain/
│       └── ai/
│           └── ai-chat.tsx  # 챗봇 UI 컴포넌트
└── app/
    └── (dashboard)/
        └── ai/
            └── chat/
                └── page.tsx  # 챗봇 페이지
```

## 테스트

1. **API 테스트**:
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{
       "messages": [
         {
           "role": "user",
           "content": "Next.js란 무엇인가요?"
         }
       ],
       "category": "chat"
     }'
   ```

2. **UI 테스트**:
   - `/ai/chat` 페이지 접근
   - 질문 입력 및 스트리밍 응답 확인
   - 마크다운 렌더링 확인 (코드 블록, 리스트 등)
   - 에러 상황 테스트 (API 키 제거, 네트워크 오류 등)
   - 빈 메시지 전송 방지 확인
   - 한글 입력 시 Enter 키 동작 확인

## 최근 변경 사항 (2025-01-30)

### 버그 수정 및 개선

1. **메시지 형식 처리 개선**
   - 문제: `useChat` 훅이 전송하는 다양한 메시지 형식을 처리하지 못해 "질문을 입력해주세요" 에러 발생
   - 해결: `content`, `parts`, `text` 형식을 모두 지원하도록 메시지 추출 로직 개선

2. **TypeScript 타입 에러 수정**
   - 문제: `ModelMessage[]` 스키마와 호환되지 않는 타입 에러
   - 해결: `Message` 타입을 직접 정의하고 명시적 타입 변환 로직 추가
   - 타입 가드를 사용하여 타입 안정성 보장

3. **스트리밍 응답 형식 변환**
   - 문제: `streamText`에 전달하는 메시지 형식이 올바르지 않음
   - 해결: 모든 메시지를 `{ role: 'user' | 'assistant', content: string }` 형식으로 변환
   - 빈 메시지 자동 필터링

## 주의사항

1. **API 키 보안**: `.env.local` 파일은 Git에 커밋하지 마세요.
2. **할당량 관리**: Google Gemini API의 할당량을 모니터링하세요.
3. **에러 처리**: 네트워크 오류나 API 오류에 대한 적절한 처리가 필요합니다.
4. **RLS 정책**: 데이터베이스 RLS 정책이 올바르게 설정되어 있는지 확인하세요.
5. **메시지 형식**: `useChat` 훅은 다양한 형식으로 메시지를 전송할 수 있으므로, API 라우트에서 모든 형식을 처리할 수 있어야 합니다.
