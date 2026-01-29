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
