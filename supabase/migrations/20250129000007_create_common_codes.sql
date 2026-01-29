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
