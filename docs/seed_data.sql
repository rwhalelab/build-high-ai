-- ============================================
-- Build-High Database Seed Data
-- Description: 초기 데이터 세팅 (Seeding) - 공통 코드 및 테스트용 유저/게시글 데이터
-- Usage: Supabase SQL Editor에서 실행
-- ============================================
--
-- ⚠️ 중요 사항:
-- 1. profiles 테이블은 auth.users와 연동되어 있습니다.
--    테스트용 유저 데이터를 삽입하기 전에 Supabase Auth에 먼저 유저를 생성해야 합니다.
--    또는 테스트용으로 auth.users에 직접 INSERT할 수 있습니다 (개발 환경에서만).
--
-- 2. 공통 코드 테이블(common_code_master, common_code_detail)이 이미 존재하는 경우,
--    테이블 생성 부분은 건너뛰고 데이터 삽입 부분만 실행할 수 있습니다.
--
-- 3. 모든 INSERT 구문은 ON CONFLICT DO NOTHING을 사용하여 중복 삽입을 방지합니다.
--
-- 4. 실행 순서:
--    a) 공통 코드 마스터 삽입
--    b) 공통 코드 상세 삽입
--    c) 유저 프로필 삽입 (auth.users에 유저가 있어야 함)
--    d) 게시글 삽입
--    e) 게시글 신청/조회 데이터 삽입 (선택사항)
-- ============================================

-- ============================================
-- 1. 공통 코드 테이블 생성 (없는 경우를 대비)
-- ============================================

-- 공통 코드 마스터 테이블
CREATE TABLE IF NOT EXISTS common_code_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE, -- 마스터 코드 (예: BH_ST_APPLICATION)
  name VARCHAR(100) NOT NULL, -- 마스터 코드명 (예: 신청 상태)
  description TEXT, -- 설명
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 공통 코드 상세 테이블
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_common_code_detail_master_code ON common_code_detail(master_code);
CREATE INDEX IF NOT EXISTS idx_common_code_detail_code ON common_code_detail(code);

-- 코멘트 추가
COMMENT ON TABLE common_code_master IS '공통 코드 마스터 테이블';
COMMENT ON TABLE common_code_detail IS '공통 코드 상세 테이블';

-- ============================================
-- 2. 공통 코드 마스터 데이터 삽입
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
-- 3. 공통 코드 상세 데이터 삽입
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

-- ============================================
-- 4. 테스트용 유저 프로필 데이터 삽입
-- 주의: profiles 테이블은 auth.users와 연동되므로, 실제 Supabase Auth에 유저가 있어야 합니다.
-- 여기서는 테스트용 UUID를 사용하며, 실제 환경에서는 auth.users에 먼저 유저를 생성해야 합니다.
-- ============================================

-- 테스트용 유저 프로필 (5명)
INSERT INTO profiles (id, username, avatar_url, tech_stack, created_at)
VALUES 
  -- 유저 1: 프론트엔드 개발자
  (
    'BH_00000000-0000-0000-0000-000000000001'::UUID,
    '김개발',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=kimdev',
    ARRAY['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Zustand'],
    NOW() - INTERVAL '30 days'
  ),
  -- 유저 2: 백엔드 개발자
  (
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    '이서버',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=iserver',
    ARRAY['Node.js', 'PostgreSQL', 'Supabase', 'Express', 'JWT'],
    NOW() - INTERVAL '25 days'
  ),
  -- 유저 3: 풀스택 개발자
  (
    'BH_00000000-0000-0000-0000-000000000003'::UUID,
    '박풀스택',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=parkfull',
    ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    NOW() - INTERVAL '20 days'
  ),
  -- 유저 4: 모바일 개발자
  (
    'BH_00000000-0000-0000-0000-000000000004'::UUID,
    '최모바일',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=choimobile',
    ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    NOW() - INTERVAL '15 days'
  ),
  -- 유저 5: AI/ML 개발자
  (
    'BH_00000000-0000-0000-0000-000000000005'::UUID,
    '정AI',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=jungai',
    ARRAY['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'LangChain'],
    NOW() - INTERVAL '10 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. 테스트용 게시글 데이터 삽입
-- ============================================

-- 유저 1의 게시글들
INSERT INTO posts (id, author_id, title, category, content, summary, tags, contact, created_at)
VALUES 
  (
    'BH_POST_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_00000000-0000-0000-0000-000000000001'::UUID,
    'Next.js 14와 App Router로 모던 웹앱 만들기 프로젝트',
    'Project',
    E'# 프로젝트 소개\n\nNext.js 14의 최신 기능인 App Router를 활용하여 성능 최적화된 웹 애플리케이션을 함께 개발할 팀원을 모집합니다.\n\n## 프로젝트 목표\n\n- Next.js 14 App Router의 Server Components 활용\n- React Server Components와 Client Components의 최적 조합\n- SEO 최적화 및 성능 개선\n- 실시간 데이터 동기화 구현\n\n## 기술 스택\n\n- **프론트엔드**: Next.js 14, React 18, TypeScript\n- **스타일링**: Tailwind CSS, shadcn/ui\n- **상태 관리**: Zustand\n- **데이터베이스**: Supabase (PostgreSQL)\n- **배포**: Vercel\n\n## 모집 인원\n\n- 프론트엔드 개발자 2명\n- UI/UX 디자이너 1명\n\n## 일정\n\n- 프로젝트 기간: 3개월\n- 주 2회 온라인 미팅\n- 일일 스크럼 (비동기)\n\n## 지원 방법\n\n관심 있으신 분들은 아래 링크로 지원해주세요!',
    ARRAY[
      'Next.js 14 App Router를 활용한 모던 웹 애플리케이션 개발 프로젝트',
      'Server Components와 Client Components의 최적 조합으로 성능 개선',
      '프론트엔드 개발자 2명, UI/UX 디자이너 1명 모집 (3개월 프로젝트)'
    ],
    ARRAY['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    'https://forms.gle/example1',
    NOW() - INTERVAL '5 days'
  ),
  (
    'BH_POST_00000000-0000-0000-0000-000000000002'::UUID,
    'BH_00000000-0000-0000-0000-000000000001'::UUID,
    'React 상태 관리 라이브러리 비교 스터디',
    'Study',
    E'# 스터디 목표\n\n현재 React 생태계에서 사용되는 다양한 상태 관리 라이브러리들을 비교 분석하고, 각각의 장단점을 파악하는 스터디입니다.\n\n## 다룰 주제\n\n1. **Zustand**: 가벼운 상태 관리 라이브러리\n2. **Jotai**: 원자 기반 상태 관리\n3. **Recoil**: Facebook의 실험적 상태 관리\n4. **Redux Toolkit**: 전통적인 Redux의 현대적 접근\n5. **Valtio**: 프록시 기반 상태 관리\n\n## 스터디 방식\n\n- 주 1회 온라인 모임 (2시간)\n- 각 라이브러리별 발표 및 실습\n- 실제 프로젝트에 적용해보기\n- 최종 비교 리포트 작성\n\n## 기간\n\n- 총 6주 과정\n- 매주 화요일 저녁 8시\n\n## 참여 조건\n\n- React 기본 지식 필수\n- TypeScript 경험 우대\n- 실제 프로젝트 경험이 있는 분 환영',
    ARRAY[
      'React 상태 관리 라이브러리 비교 분석 스터디 (Zustand, Jotai, Recoil 등)',
      '주 1회 온라인 모임으로 각 라이브러리 실습 및 비교',
      '6주 과정, React 기본 지식 필수'
    ],
    ARRAY['React', 'TypeScript', 'Zustand', 'State Management'],
    NULL,
    NOW() - INTERVAL '3 days'
  );

-- 유저 2의 게시글들
INSERT INTO posts (id, author_id, title, category, content, summary, tags, contact, created_at)
VALUES 
  (
    'BH_POST_00000000-0000-0000-0000-000000000003'::UUID,
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    'Supabase와 PostgreSQL을 활용한 백엔드 개발 프로젝트',
    'Project',
    E'# 프로젝트 개요\n\nSupabase의 강력한 기능들을 활용하여 확장 가능한 백엔드 시스템을 구축하는 프로젝트입니다.\n\n## 주요 기능\n\n- **인증 시스템**: Supabase Auth를 활용한 소셜 로그인\n- **데이터베이스**: PostgreSQL의 고급 기능 활용 (RLS, 트리거, 함수)\n- **실시간 기능**: Supabase Realtime을 활용한 실시간 업데이트\n- **파일 스토리지**: Supabase Storage를 활용한 이미지/파일 관리\n- **API 설계**: RESTful API 및 GraphQL 고려\n\n## 기술 스택\n\n- **백엔드**: Node.js, Express.js\n- **데이터베이스**: PostgreSQL (Supabase)\n- **인증**: Supabase Auth\n- **실시간**: Supabase Realtime\n- **스토리지**: Supabase Storage\n- **배포**: Railway 또는 Render\n\n## 모집 인원\n\n- 백엔드 개발자 2명\n- 데이터베이스 설계 경험이 있는 분 우대\n\n## 프로젝트 일정\n\n- 기간: 2개월\n- 주 3회 온라인 미팅\n- 코드 리뷰 및 페어 프로그래밍\n\n## 지원 방법\n\n포트폴리오와 함께 지원해주시면 검토 후 연락드리겠습니다.',
    ARRAY[
      'Supabase와 PostgreSQL을 활용한 확장 가능한 백엔드 시스템 구축',
      '인증, 실시간 기능, 파일 스토리지 등 Supabase의 핵심 기능 활용',
      '백엔드 개발자 2명 모집 (2개월 프로젝트)'
    ],
    ARRAY['Node.js', 'PostgreSQL', 'Supabase', 'Express', 'Backend'],
    'https://forms.gle/example2',
    NOW() - INTERVAL '4 days'
  ),
  (
    'BH_POST_00000000-0000-0000-0000-000000000004'::UUID,
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    'PostgreSQL 고급 기능 학습 스터디',
    'Study',
    E'# 스터디 소개\n\nPostgreSQL의 고급 기능들을 깊이 있게 학습하고 실무에 적용하는 스터디입니다.\n\n## 학습 내용\n\n1. **인덱스 최적화**: B-tree, GIN, GiST 인덱스 활용\n2. **트리거와 함수**: PL/pgSQL을 활용한 비즈니스 로직 구현\n3. **윈도우 함수**: 복잡한 분석 쿼리 작성\n4. **JSON/JSONB**: NoSQL처럼 사용하기\n5. **Full-Text Search**: 텍스트 검색 최적화\n6. **Partitioning**: 대용량 데이터 관리\n7. **Replication**: 고가용성 구축\n\n## 스터디 방식\n\n- 주 2회 온라인 모임 (각 1.5시간)\n- 이론 학습 + 실습 문제 풀이\n- 실제 프로젝트 케이스 스터디\n- 최종 프로젝트: PostgreSQL 기반 시스템 설계\n\n## 기간\n\n- 총 8주 과정\n- 화요일, 목요일 저녁 7시\n\n## 참여 조건\n\n- SQL 기본 지식 필수\n- 데이터베이스 경험 1년 이상 우대',
    ARRAY[
      'PostgreSQL 고급 기능 학습 스터디 (인덱스, 트리거, 윈도우 함수 등)',
      '주 2회 온라인 모임으로 이론과 실습 병행',
      '8주 과정, SQL 기본 지식 필수'
    ],
    ARRAY['PostgreSQL', 'Database', 'SQL', 'Backend'],
    NULL,
    NOW() - INTERVAL '2 days'
  );

-- 유저 3의 게시글들
INSERT INTO posts (id, author_id, title, category, content, summary, tags, contact, created_at)
VALUES 
  (
    'BH_POST_00000000-0000-0000-0000-000000000005'::UUID,
    'BH_00000000-0000-0000-0000-000000000003'::UUID,
    '풀스택 웹 애플리케이션 개발 프로젝트 (Next.js + Supabase)',
    'Project',
    E'# 프로젝트 설명\n\nNext.js와 Supabase를 활용하여 처음부터 끝까지 완성하는 풀스택 웹 애플리케이션 개발 프로젝트입니다.\n\n## 프로젝트 특징\n\n- **프론트엔드**: Next.js 14 App Router, React Server Components\n- **백엔드**: Supabase (PostgreSQL, Auth, Storage, Realtime)\n- **스타일링**: Tailwind CSS + shadcn/ui\n- **타입 안정성**: TypeScript 엄격 모드\n- **배포**: Vercel (Frontend) + Supabase (Backend)\n\n## 개발할 기능\n\n1. 사용자 인증 및 프로필 관리\n2. CRUD 기능이 있는 메인 기능\n3. 실시간 업데이트\n4. 파일 업로드 및 관리\n5. 관리자 대시보드\n\n## 모집 인원\n\n- 풀스택 개발자 3명\n- 프론트엔드 개발자 1명\n- 백엔드 개발자 1명\n- UI/UX 디자이너 1명 (선택)\n\n## 프로젝트 일정\n\n- 기간: 4개월\n- 주 2회 온라인 미팅\n- 일일 스탠드업 (비동기)\n- 2주 단위 스프린트\n\n## 지원 방법\n\nGitHub 프로필과 포트폴리오를 함께 보내주세요.',
    ARRAY[
      'Next.js와 Supabase를 활용한 풀스택 웹 애플리케이션 개발 프로젝트',
      '인증, CRUD, 실시간 업데이트, 파일 관리 등 완전한 기능 구현',
      '풀스택/프론트엔드/백엔드 개발자 모집 (4개월 프로젝트)'
    ],
    ARRAY['Next.js', 'Supabase', 'TypeScript', 'Full Stack', 'React'],
    'https://forms.gle/example3',
    NOW() - INTERVAL '6 days'
  ),
  (
    'BH_POST_00000000-0000-0000-0000-000000000006'::UUID,
    'BH_00000000-0000-0000-0000-000000000003'::UUID,
    'TypeScript 고급 타입 시스템 스터디',
    'Study',
    E'# 스터디 목표\n\nTypeScript의 고급 타입 시스템을 마스터하여 더 안전하고 유지보수하기 좋은 코드를 작성하는 방법을 학습합니다.\n\n## 다룰 주제\n\n1. **조건부 타입 (Conditional Types)**: 타입 레벨에서의 조건문\n2. **템플릿 리터럴 타입**: 문자열 타입 조작\n3. **매핑된 타입 (Mapped Types)**: 타입 변환\n4. **재귀 타입**: 복잡한 데이터 구조 타입 정의\n5. **브랜드 타입**: 명목적 타이핑\n6. **타입 가드와 타입 단언**: 런타임 타입 체크\n7. **유틸리티 타입 심화**: Partial, Required, Pick, Omit 등\n\n## 스터디 방식\n\n- 주 1회 온라인 모임 (2시간)\n- 각 주제별 발표 및 실습\n- 타입 챌린지 문제 풀이\n- 실제 프로젝트에 적용해보기\n\n## 기간\n\n- 총 6주 과정\n- 매주 수요일 저녁 8시\n\n## 참여 조건\n\n- TypeScript 기본 지식 필수\n- JavaScript 고급 문법 이해\n- 실제 프로젝트에서 TypeScript 사용 경험 우대',
    ARRAY[
      'TypeScript 고급 타입 시스템 마스터 스터디 (조건부 타입, 매핑된 타입 등)',
      '주 1회 온라인 모임으로 이론 학습 및 실습 병행',
      '6주 과정, TypeScript 기본 지식 필수'
    ],
    ARRAY['TypeScript', 'Programming', 'Study'],
    NULL,
    NOW() - INTERVAL '1 day'
  );

-- 유저 4의 게시글들
INSERT INTO posts (id, author_id, title, category, content, summary, tags, contact, created_at)
VALUES 
  (
    'BH_POST_00000000-0000-0000-0000-000000000007'::UUID,
    'BH_00000000-0000-0000-0000-000000000004'::UUID,
    'React Native로 크로스 플랫폼 모바일 앱 개발 프로젝트',
    'Project',
    E'# 프로젝트 개요\n\nReact Native를 활용하여 iOS와 Android를 동시에 지원하는 모바일 애플리케이션을 개발합니다.\n\n## 프로젝트 목표\n\n- React Native로 네이티브 수준의 성능 구현\n- iOS와 Android 동시 개발 및 배포\n- 실시간 데이터 동기화\n- 푸시 알림 구현\n- 오프라인 모드 지원\n\n## 기술 스택\n\n- **프레임워크**: React Native (최신 버전)\n- **상태 관리**: Zustand 또는 Redux Toolkit\n- **네비게이션**: React Navigation\n- **백엔드**: Supabase 또는 Firebase\n- **스타일링**: React Native StyleSheet + styled-components\n- **테스팅**: Jest + React Native Testing Library\n\n## 모집 인원\n\n- React Native 개발자 2명\n- iOS/Android 네이티브 개발 경험자 1명 (선택)\n- UI/UX 디자이너 1명\n\n## 프로젝트 일정\n\n- 기간: 3개월\n- 주 2회 온라인 미팅\n- 2주 단위 마일스톤\n\n## 지원 방법\n\nReact Native 프로젝트 경험을 포함한 포트폴리오를 보내주세요.',
    ARRAY[
      'React Native로 iOS/Android 동시 지원 모바일 앱 개발 프로젝트',
      '실시간 동기화, 푸시 알림, 오프라인 모드 등 완전한 기능 구현',
      'React Native 개발자 2명, UI/UX 디자이너 1명 모집 (3개월 프로젝트)'
    ],
    ARRAY['React Native', 'Mobile', 'iOS', 'Android', 'Cross Platform'],
    'https://forms.gle/example4',
    NOW() - INTERVAL '7 days'
  );

-- 유저 5의 게시글들
INSERT INTO posts (id, author_id, title, category, content, summary, tags, contact, created_at)
VALUES 
  (
    'BH_POST_00000000-0000-0000-0000-000000000008'::UUID,
    'BH_00000000-0000-0000-0000-000000000005'::UUID,
    'LangChain과 OpenAI를 활용한 AI 챗봇 개발 프로젝트',
    'Project',
    E'# 프로젝트 소개\n\nLangChain과 OpenAI API를 활용하여 지능형 챗봇을 개발하는 프로젝트입니다.\n\n## 프로젝트 목표\n\n- LangChain을 활용한 RAG (Retrieval-Augmented Generation) 구현\n- 벡터 데이터베이스를 활용한 컨텍스트 관리\n- 멀티모달 AI 기능 구현 (텍스트 + 이미지)\n- 사용자 맞춤형 대화 경험 제공\n- 대화 히스토리 관리 및 학습\n\n## 기술 스택\n\n- **AI 프레임워크**: LangChain, LangGraph\n- **LLM**: OpenAI GPT-4, GPT-3.5-turbo\n- **임베딩**: OpenAI Embeddings\n- **벡터 DB**: Pinecone 또는 Supabase Vector\n- **백엔드**: Python (FastAPI) 또는 Node.js\n- **프론트엔드**: React 또는 Next.js\n\n## 모집 인원\n\n- AI/ML 개발자 2명\n- 백엔드 개발자 1명\n- 프론트엔드 개발자 1명 (선택)\n\n## 프로젝트 일정\n\n- 기간: 4개월\n- 주 2회 온라인 미팅\n- 주간 진행 상황 공유\n\n## 지원 방법\n\nAI/ML 프로젝트 경험과 포트폴리오를 함께 보내주세요.',
    ARRAY[
      'LangChain과 OpenAI를 활용한 지능형 챗봇 개발 프로젝트',
      'RAG 구현, 벡터 DB 활용, 멀티모달 AI 기능 등 고급 AI 기능 구현',
      'AI/ML 개발자 2명, 백엔드 개발자 1명 모집 (4개월 프로젝트)'
    ],
    ARRAY['LangChain', 'OpenAI', 'AI', 'Machine Learning', 'Python'],
    'https://forms.gle/example5',
    NOW() - INTERVAL '8 days'
  ),
  (
    'BH_POST_00000000-0000-0000-0000-000000000009'::UUID,
    'BH_00000000-0000-0000-0000-000000000005'::UUID,
    '머신러닝 기초부터 실전까지 스터디',
    'Study',
    E'# 스터디 목표\n\n머신러닝의 기초 이론부터 실전 프로젝트까지 단계적으로 학습하는 스터디입니다.\n\n## 학습 내용\n\n### 1-2주: 기초 이론\n- 머신러닝 개요 및 분류\n- 선형 회귀, 로지스틱 회귀\n- 의사결정 트리, 랜덤 포레스트\n\n### 3-4주: 딥러닝 기초\n- 신경망 구조 이해\n- TensorFlow/Keras 기초\n- 이미지 분류 프로젝트 (MNIST)\n\n### 5-6주: 고급 주제\n- CNN (합성곱 신경망)\n- RNN, LSTM\n- 자연어 처리 기초\n\n### 7-8주: 실전 프로젝트\n- 실제 데이터셋으로 프로젝트 진행\n- 모델 최적화 및 하이퍼파라미터 튜닝\n- 배포 및 서빙 방법\n\n## 스터디 방식\n\n- 주 2회 온라인 모임 (각 2시간)\n- 이론 강의 + 실습\n- 주간 과제 및 코드 리뷰\n- 최종 프로젝트 발표\n\n## 기간\n\n- 총 8주 과정\n- 화요일, 금요일 저녁 7시\n\n## 참여 조건\n\n- Python 기본 지식 필수\n- 수학 기초 지식 (선형대수, 미적분) 권장\n- 데이터 분석 경험 우대',
    ARRAY[
      '머신러닝 기초 이론부터 실전 프로젝트까지 단계적 학습 스터디',
      '주 2회 온라인 모임으로 이론과 실습 병행, 최종 프로젝트 발표',
      '8주 과정, Python 기본 지식 필수'
    ],
    ARRAY['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning'],
    NULL,
    NOW() - INTERVAL '9 days'
  );

-- ============================================
-- 6. 테스트용 게시글 신청 데이터 삽입 (선택사항)
-- ============================================

-- 유저 2가 유저 1의 프로젝트에 신청
INSERT INTO post_applications (id, post_id, applicant_id, status, message, created_at)
VALUES 
  (
    'BH_APP_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_POST_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    'pending',
    '안녕하세요! 백엔드 개발 경험이 있어서 프로젝트에 도움이 될 수 있을 것 같습니다. 함께 작업하고 싶습니다!',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT DO NOTHING;

-- 유저 3이 유저 1의 프로젝트에 신청
INSERT INTO post_applications (id, post_id, applicant_id, status, message, created_at)
VALUES 
  (
    'BH_APP_00000000-0000-0000-0000-000000000002'::UUID,
    'BH_POST_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_00000000-0000-0000-0000-000000000003'::UUID,
    'approved',
    '풀스택 개발자로서 프론트엔드와 백엔드 모두 경험이 있습니다. 프로젝트에 참여하고 싶습니다!',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- 유저 4가 유저 2의 프로젝트에 신청
INSERT INTO post_applications (id, post_id, applicant_id, status, message, created_at)
VALUES 
  (
    'BH_APP_00000000-0000-0000-0000-000000000003'::UUID,
    'BH_POST_00000000-0000-0000-0000-000000000003'::UUID,
    'BH_00000000-0000-0000-0000-000000000004'::UUID,
    'pending',
    '모바일 개발자이지만 백엔드에도 관심이 많습니다. 학습하는 자세로 참여하고 싶습니다!',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. 테스트용 게시글 조회 데이터 삽입 (선택사항)
-- ============================================

-- 유저 2가 여러 게시글 조회
INSERT INTO post_views (id, post_id, user_id, ip_address, viewed_at)
VALUES 
  (
    'BH_VIEW_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_POST_00000000-0000-0000-0000-000000000001'::UUID,
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    '192.168.1.100',
    NOW() - INTERVAL '2 days'
  ),
  (
    'BH_VIEW_00000000-0000-0000-0000-000000000002'::UUID,
    'BH_POST_00000000-0000-0000-0000-000000000005'::UUID,
    'BH_00000000-0000-0000-0000-000000000002'::UUID,
    '192.168.1.100',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- 완료 메시지
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Seed data insertion completed successfully!';
  RAISE NOTICE 'Common Code Masters: 2';
  RAISE NOTICE 'Common Code Details: 8';
  RAISE NOTICE 'User Profiles: 5';
  RAISE NOTICE 'Posts: 9';
  RAISE NOTICE 'Post Applications: 3';
  RAISE NOTICE 'Post Views: 2';
END $$;
