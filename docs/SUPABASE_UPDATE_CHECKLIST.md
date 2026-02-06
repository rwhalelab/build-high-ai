# Supabase 업데이트 체크리스트

## 📋 새로 추가된 마이그레이션

### `20250129000009_create_ai_responses.sql`
- **목적**: AI 챗봇 응답 저장 테이블 생성
- **테이블**: `ai_responses`
- **주요 기능**:
  - 사용자 질문 및 AI 응답 저장
  - 토큰 사용량 추적
  - 비용 절감을 위한 캐싱

## ✅ Supabase 업데이트 필요 사항

### 1. 마이그레이션 파일 실행

새로 생성된 마이그레이션 파일을 Supabase에 적용해야 합니다:

**파일**: `supabase/migrations/20250129000009_create_ai_responses.sql`

#### 실행 방법

**방법 1: Supabase Dashboard 사용 (권장)**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. **New Query** 클릭
5. `supabase/migrations/20250129000009_create_ai_responses.sql` 파일 내용 복사
6. SQL Editor에 붙여넣기
7. **Run** 버튼 클릭하여 실행

**방법 2: Supabase CLI 사용**
```bash
# Supabase 프로젝트에 연결
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

### 2. 마이그레이션 실행 순서 확인

다음 순서로 마이그레이션을 실행해야 합니다:

1. ✅ `20250129000000_create_profiles.sql` (이미 실행됨)
2. ✅ `20250129000001_create_posts.sql` (이미 실행됨)
3. ✅ `20250129000002_create_post_views.sql` (이미 실행됨)
4. ✅ `20250129000003_create_post_applications.sql` (이미 실행됨)
5. ✅ `20250129000004_create_user_activities.sql` (이미 실행됨)
6. ✅ `20250129000007_create_common_codes.sql` (이미 실행됨)
7. ✅ `20250129000008_update_contact_fields.sql` (이미 실행됨)
8. ⚠️ **`20250129000009_create_ai_responses.sql` (새로 추가됨 - 실행 필요)**
9. ✅ `20250129000005_create_triggers.sql` (이미 실행됨)
10. ✅ `20250129000006_setup_rls_policies.sql` (이미 실행됨)

**참고**: `20250129000009_create_ai_responses.sql` 파일에는 RLS 정책이 포함되어 있으므로, 별도로 RLS 정책 파일을 실행할 필요가 없습니다.

### 3. 마이그레이션 적용 확인

마이그레이션이 성공적으로 적용되었는지 확인하세요:

#### 테이블 생성 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'ai_responses';
```

결과가 나오면 테이블이 생성된 것입니다.

#### RLS 정책 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'ai_responses';
```

다음 정책들이 있어야 합니다:
- `Users can view own AI responses`
- `Authenticated users can create AI responses`
- `Users can delete own AI responses`

#### 인덱스 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'ai_responses';
```

다음 인덱스들이 있어야 합니다:
- `idx_ai_responses_user_id`
- `idx_ai_responses_category`
- `idx_ai_responses_created_at`
- `idx_ai_responses_prompt_hash`

### 4. 테스트

마이그레이션 적용 후 다음을 테스트하세요:

1. **AI 챗봇 페이지 접근**: `/ai/chat`
2. **질문 입력 및 응답 확인**
3. **데이터베이스에 저장 확인**:
   ```sql
   SELECT * FROM ai_responses ORDER BY created_at DESC LIMIT 5;
   ```

## ⚠️ 주의사항

1. **백업**: 프로덕션 환경에 적용하기 전에 반드시 데이터베이스 백업을 수행하세요.
2. **순서**: 마이그레이션 파일은 타임스탬프 순서대로 실행되어야 합니다.
3. **중복 실행**: 이미 실행된 마이그레이션은 다시 실행하지 마세요. (`CREATE IF NOT EXISTS` 구문으로 안전하게 처리되어 있지만, 불필요한 실행은 피하세요)
4. **RLS 정책**: 새 테이블의 RLS 정책이 올바르게 설정되었는지 확인하세요.

## 🔍 문제 해결

### 마이그레이션 실행 오류

**오류**: `relation "profiles" does not exist`
- **원인**: `profiles` 테이블이 아직 생성되지 않음
- **해결**: 먼저 `20250129000000_create_profiles.sql` 실행

**오류**: `function "update_updated_at_column" already exists`
- **원인**: 함수가 이미 존재함 (정상)
- **해결**: `CREATE OR REPLACE FUNCTION` 구문으로 안전하게 처리됨, 무시해도 됨

**오류**: `permission denied for table ai_responses`
- **원인**: RLS 정책이 올바르게 설정되지 않음
- **해결**: 마이그레이션 파일의 RLS 정책 부분을 다시 실행

### 테이블이 보이지 않는 경우

1. **스키마 확인**: `public` 스키마에 있는지 확인
2. **권한 확인**: 현재 사용자가 테이블을 볼 수 있는 권한이 있는지 확인
3. **새로고침**: Supabase Dashboard에서 테이블 목록 새로고침

## 📝 추가 정보

- 마이그레이션 파일 위치: `supabase/migrations/20250129000009_create_ai_responses.sql`
- 상세 문서: `docs/AI_CHAT_IMPLEMENTATION.md`
- 데이터베이스 스키마 문서: `docs/db-schema.md`
