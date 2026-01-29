# Supabase 데이터베이스 업데이트 가이드

## 📋 개요

이 문서는 이미 Supabase에 적용된 데이터베이스 스키마에 **공통 코드 테이블**을 추가하고 **posts 테이블의 연락처 필드를 세분화**하는 방법을 안내합니다.

**업데이트 대상:**
- ✅ `common_code_master` 테이블 (신규)
- ✅ `common_code_detail` 테이블 (신규)
- ✅ 공통 코드 테이블에 대한 RLS 정책 (신규)
- ✅ `posts` 테이블 연락처 필드 세분화 (`phone`, `email`, `contact_url` 추가)

---

## 🚀 업데이트 방법

### 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

가장 간단하고 안전한 방법입니다.

#### Step 1: 공통 코드 테이블 생성

1. **Supabase Dashboard** 접속
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New Query** 클릭하여 새 쿼리 생성
4. 아래 SQL을 복사하여 실행:

```sql
-- ============================================
-- Build-High Database Schema Migration
-- Table: common_code_master, common_code_detail
-- Description: 공통 코드 마스터 및 상세 코드 테이블
-- ============================================

-- 공통 코드 마스터 테이블 생성
CREATE TABLE IF NOT EXISTS common_code_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE, -- 마스터 코드 (예: BH_ST_APPLICATION)
  name VARCHAR(100) NOT NULL, -- 마스터 코드명 (예: 신청 상태)
  description TEXT, -- 설명
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공통 코드 상세 테이블 생성
CREATE TABLE IF NOT EXISTS common_code_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_code VARCHAR(50) NOT NULL REFERENCES common_code_master(code) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL, -- 상세 코드 (예: PENDING)
  name VARCHAR(100) NOT NULL, -- 상세 코드명 (예: 대기중)
  description TEXT, -- 설명
  sort_order INTEGER DEFAULT 0, -- 정렬 순서
  is_active BOOLEAN DEFAULT TRUE, -- 사용 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(master_code, code) -- 마스터 코드와 상세 코드 조합은 유일해야 함
);

-- common_code_master 테이블의 updated_at 트리거
CREATE TRIGGER update_common_code_master_updated_at
  BEFORE UPDATE ON common_code_master
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- common_code_detail 테이블의 updated_at 트리거
CREATE TRIGGER update_common_code_detail_updated_at
  BEFORE UPDATE ON common_code_detail
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_common_code_detail_master_code ON common_code_detail(master_code);
CREATE INDEX IF NOT EXISTS idx_common_code_detail_code ON common_code_detail(code);
CREATE INDEX IF NOT EXISTS idx_common_code_detail_is_active ON common_code_detail(is_active);
CREATE INDEX IF NOT EXISTS idx_common_code_detail_sort_order ON common_code_detail(master_code, sort_order);

-- 코멘트 추가
COMMENT ON TABLE common_code_master IS '공통 코드 마스터 테이블';
COMMENT ON COLUMN common_code_master.code IS '마스터 코드 (예: BH_ST_APPLICATION, BH_USER_ROLE)';
COMMENT ON COLUMN common_code_master.name IS '마스터 코드명 (예: 신청 상태, 유저 권한)';
COMMENT ON COLUMN common_code_master.description IS '마스터 코드 설명';

COMMENT ON TABLE common_code_detail IS '공통 코드 상세 테이블';
COMMENT ON COLUMN common_code_detail.master_code IS '마스터 코드 참조';
COMMENT ON COLUMN common_code_detail.code IS '상세 코드 (예: PENDING, APPROVED, REJECTED)';
COMMENT ON COLUMN common_code_detail.name IS '상세 코드명 (예: 대기중, 승인됨, 거절됨)';
COMMENT ON COLUMN common_code_detail.sort_order IS '정렬 순서 (낮을수록 먼저 표시)';
COMMENT ON COLUMN common_code_detail.is_active IS '사용 여부 (false인 경우 비활성화)';
```

5. **Run** 버튼 클릭하여 실행
6. ✅ 성공 메시지 확인

#### Step 2: RLS 정책 추가

1. 같은 SQL Editor에서 **New Query** 클릭
2. 아래 SQL을 복사하여 실행:

```sql
-- ============================================
-- common_code_master 테이블 RLS 정책
-- ============================================

ALTER TABLE common_code_master ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 공통 코드 마스터 조회 가능 (읽기 전용)
DROP POLICY IF EXISTS "Authenticated users can view common code masters" ON common_code_master;
CREATE POLICY "Authenticated users can view common code masters"
  ON common_code_master
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- common_code_detail 테이블 RLS 정책
-- ============================================

ALTER TABLE common_code_detail ENABLE ROW LEVEL SECURITY;

-- 정책 1: 모든 인증된 사용자는 공통 코드 상세 조회 가능 (읽기 전용)
DROP POLICY IF EXISTS "Authenticated users can view common code details" ON common_code_detail;
CREATE POLICY "Authenticated users can view common code details"
  ON common_code_detail
  FOR SELECT
  TO authenticated
  USING (true);
```

3. **Run** 버튼 클릭하여 실행
4. ✅ 성공 메시지 확인

#### Step 3: 시드 데이터 삽입 (선택사항)

초기 데이터를 삽입하려면:

1. **SQL Editor**에서 **New Query** 클릭
2. `docs/seed_data.sql` 파일의 **공통 코드 관련 부분**만 복사하여 실행:

```sql
-- ============================================
-- 공통 코드 마스터 데이터 삽입
-- ============================================

-- 신청 상태 마스터 코드
INSERT INTO common_code_master (code, name, description)
VALUES 
  ('BH_ST_APPLICATION', '신청 상태', '프로젝트/스터디 신청 상태를 나타내는 코드')
ON CONFLICT (code) DO NOTHING;

-- 유저 권한 마스터 코드
INSERT INTO common_code_master (code, name, description)
VALUES 
  ('BH_USER_ROLE', '유저 권한', '시스템 내 유저의 권한 레벨을 나타내는 코드')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 공통 코드 상세 데이터 삽입
-- ============================================

-- 신청 상태 상세 코드 (BH_ST_APPLICATION)
INSERT INTO common_code_detail (master_code, code, name, description, sort_order)
VALUES 
  ('BH_ST_APPLICATION', 'PENDING', '대기중', '신청이 접수되어 검토 대기 중인 상태', 1),
  ('BH_ST_APPLICATION', 'APPROVED', '승인됨', '신청이 승인되어 매칭이 완료된 상태', 2),
  ('BH_ST_APPLICATION', 'REJECTED', '거절됨', '신청이 거절된 상태', 3),
  ('BH_ST_APPLICATION', 'WITHDRAWN', '철회됨', '신청자가 신청을 철회한 상태', 4)
ON CONFLICT (master_code, code) DO NOTHING;

-- 유저 권한 상세 코드 (BH_USER_ROLE)
INSERT INTO common_code_detail (master_code, code, name, description, sort_order)
VALUES 
  ('BH_USER_ROLE', 'ADMIN', '관리자', '시스템 전체 관리 권한을 가진 관리자', 1),
  ('BH_USER_ROLE', 'MEMBER', '일반 회원', '일반적인 서비스 이용 권한을 가진 회원', 2),
  ('BH_USER_ROLE', 'GUEST', '게스트', '제한된 권한을 가진 게스트 사용자', 3),
  ('BH_USER_ROLE', 'PREMIUM', '프리미엄 회원', '추가 기능을 이용할 수 있는 프리미엄 회원', 4)
ON CONFLICT (master_code, code) DO NOTHING;
```

3. **Run** 버튼 클릭하여 실행
4. ✅ 성공 메시지 확인

#### Step 4: posts 테이블 연락처 필드 세분화

1. **SQL Editor**에서 **New Query** 클릭
2. 아래 SQL을 복사하여 실행:

```sql
-- ============================================
-- Build-High Database Schema Migration
-- Update: posts 테이블 연락처 필드 세분화
-- Description: contact 필드를 phone, email, contact_url로 분리
-- ============================================

-- 기존 contact 컬럼을 백업용으로 유지하면서 새 컬럼 추가
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS contact_url TEXT;

-- 기존 contact 데이터를 contact_url로 마이그레이션 (URL 형식인 경우)
-- 이메일 형식은 email로, 전화번호 형식은 phone으로 분류
UPDATE posts 
SET 
  contact_url = CASE 
    WHEN contact IS NOT NULL AND (contact LIKE 'http://%' OR contact LIKE 'https://%' OR contact LIKE 'discord.gg/%' OR contact LIKE 't.me/%' OR contact LIKE 'www.%') 
    THEN CASE 
      WHEN contact LIKE 'http://%' OR contact LIKE 'https://%' THEN contact
      WHEN contact LIKE 'discord.gg/%' THEN 'https://' || contact
      WHEN contact LIKE 't.me/%' THEN 'https://' || contact
      WHEN contact LIKE 'www.%' THEN 'https://' || contact
      ELSE 'https://' || contact
    END
    ELSE NULL
  END,
  email = CASE 
    WHEN contact IS NOT NULL AND contact LIKE '%@%' AND contact NOT LIKE 'http://%' AND contact NOT LIKE 'https://%'
    THEN contact
    ELSE NULL
  END,
  phone = CASE 
    WHEN contact IS NOT NULL 
      AND contact NOT LIKE '%@%' 
      AND contact NOT LIKE 'http://%' 
      AND contact NOT LIKE 'https://%'
      AND contact NOT LIKE 'discord.gg/%'
      AND contact NOT LIKE 't.me/%'
      AND contact NOT LIKE 'www.%'
      AND (contact ~ '^[0-9+\-() ]+$' OR contact ~ '^\+?[0-9]{10,}$')
    THEN contact
    ELSE NULL
  END
WHERE contact IS NOT NULL;

-- 코멘트 추가
COMMENT ON COLUMN posts.phone IS '전화번호 (선택)';
COMMENT ON COLUMN posts.email IS '이메일 주소 (선택)';
COMMENT ON COLUMN posts.contact_url IS '연락처 URL (Discord, Telegram 등, 선택)';

-- 기존 contact 컬럼은 나중에 제거할 수 있도록 주석 처리
-- ALTER TABLE posts DROP COLUMN contact;
```

3. **Run** 버튼 클릭하여 실행
4. ✅ 성공 메시지 확인

**참고**: 기존 `contact` 컬럼은 하위 호환성을 위해 유지됩니다. 향후 모든 데이터가 새 필드로 마이그레이션되면 제거할 수 있습니다.

---

### 방법 2: Supabase CLI 사용 (로컬 개발 환경)

로컬 개발 환경에서 Supabase CLI를 사용하는 경우:

```bash
# 프로젝트 디렉토리로 이동
cd build-high-ai

# Supabase 프로젝트에 연결 (이미 연결되어 있다면 생략)
supabase link --project-ref <your-project-ref>

# 특정 마이그레이션 파일만 적용
supabase db push --include-all

# 또는 특정 파일만 선택적으로 적용하려면
# SQL Editor에서 직접 실행하는 방법 1을 사용하세요
```

**주의**: CLI를 사용할 경우 모든 마이그레이션이 적용될 수 있으므로, 이미 적용된 마이그레이션과 충돌할 수 있습니다. **방법 1을 권장합니다.**

---

## ✅ 업데이트 검증

업데이트가 성공적으로 완료되었는지 확인하세요:

### 1. 테이블 생성 확인

Supabase Dashboard → **Table Editor**에서 다음 테이블이 보이는지 확인:
- ✅ `common_code_master`
- ✅ `common_code_detail`

### 1-1. posts 테이블 컬럼 확인

Supabase Dashboard → **Table Editor** → `posts` 테이블에서 다음 컬럼이 추가되었는지 확인:
- ✅ `phone` (TEXT, nullable)
- ✅ `email` (TEXT, nullable)
- ✅ `contact_url` (TEXT, nullable)

### 2. SQL로 확인

SQL Editor에서 다음 쿼리를 실행하여 테이블 구조 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('common_code_master', 'common_code_detail');

-- 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'common_code_master'
ORDER BY ordinal_position;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'common_code_detail'
ORDER BY ordinal_position;
```

### 3. RLS 정책 확인

```sql
-- RLS 활성화 여부 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('common_code_master', 'common_code_detail');

-- RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('common_code_master', 'common_code_detail');
```

### 4. 시드 데이터 확인 (시드 데이터를 삽입한 경우)

```sql
-- 마스터 코드 확인
SELECT * FROM common_code_master;

-- 상세 코드 확인
SELECT 
  ccd.*,
  ccm.name as master_name
FROM common_code_detail ccd
JOIN common_code_master ccm ON ccd.master_code = ccm.code
ORDER BY ccd.master_code, ccd.sort_order;
```

### 5. posts 테이블 연락처 필드 마이그레이션 확인

```sql
-- 연락처 필드 분류 결과 확인
SELECT 
  id,
  title,
  contact as old_contact,
  phone,
  email,
  contact_url
FROM posts
WHERE contact IS NOT NULL
LIMIT 10;

-- 각 필드별 데이터 개수 확인
SELECT 
  COUNT(*) FILTER (WHERE phone IS NOT NULL) as phone_count,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as email_count,
  COUNT(*) FILTER (WHERE contact_url IS NOT NULL) as contact_url_count,
  COUNT(*) FILTER (WHERE contact IS NOT NULL) as old_contact_count
FROM posts;
```

---

## ⚠️ 주의사항

1. **백업 권장**: 프로덕션 환경인 경우 업데이트 전에 데이터베이스 백업을 수행하세요.
   - Supabase Dashboard → Settings → Database → Backups

2. **기존 데이터 보호**: `CREATE TABLE IF NOT EXISTS`를 사용하므로 기존 테이블이 있으면 건너뜁니다.
   - 이미 테이블이 있는 경우 에러 없이 진행됩니다.

3. **RLS 정책**: RLS 정책은 `DROP POLICY IF EXISTS`를 사용하므로 기존 정책이 있어도 안전하게 업데이트됩니다.

4. **트리거 함수**: `update_updated_at_column()` 함수가 이미 존재해야 합니다.
   - 기존 마이그레이션에서 이미 생성되어 있을 것입니다.
   - 없다면 다음을 먼저 실행하세요:
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

5. **타입 재생성**: 업데이트 후 TypeScript 타입을 재생성하는 것을 권장합니다:
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.ts
   ```

---

## 🔄 롤백 방법

만약 업데이트를 되돌려야 하는 경우:

### 공통 코드 테이블 롤백

```sql
-- RLS 정책 삭제
DROP POLICY IF EXISTS "Authenticated users can view common code masters" ON common_code_master;
DROP POLICY IF EXISTS "Authenticated users can view common code details" ON common_code_detail;

-- 테이블 삭제 (주의: 모든 데이터가 삭제됩니다!)
DROP TABLE IF EXISTS common_code_detail CASCADE;
DROP TABLE IF EXISTS common_code_master CASCADE;
```

### posts 테이블 연락처 필드 롤백

```sql
-- 새로 추가된 컬럼 삭제 (주의: 해당 필드의 데이터가 모두 삭제됩니다!)
ALTER TABLE posts 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS contact_url;
```

**⚠️ 주의**: 테이블/컬럼 삭제 시 모든 데이터가 영구적으로 삭제됩니다. 신중하게 진행하세요.

---

## 📞 문제 해결

### 에러: "function update_updated_at_column() does not exist"

**해결 방법**: 먼저 트리거 함수를 생성하세요.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 에러: "relation already exists"

**원인**: 테이블이 이미 존재합니다.

**해결 방법**: `CREATE TABLE IF NOT EXISTS`를 사용했으므로 에러가 발생하지 않아야 합니다. 만약 발생한다면 테이블을 확인하세요:

```sql
SELECT * FROM information_schema.tables 
WHERE table_name IN ('common_code_master', 'common_code_detail');
```

### RLS 정책이 적용되지 않음

**해결 방법**: RLS가 활성화되어 있는지 확인하고, 정책을 다시 생성하세요:

```sql
ALTER TABLE common_code_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE common_code_detail ENABLE ROW LEVEL SECURITY;
```

---

## 📚 관련 문서

- [데이터베이스 스키마 설계서](./db-schema-final.md)
- [시드 데이터 파일](./seed_data.sql)
- [마이그레이션 가이드](../supabase/migrations/README.md)

---

**작성일**: 2025-01-29  
**버전**: 1.1.0  
**마지막 업데이트**: 2025-01-29 (posts 테이블 연락처 필드 세분화 추가)
