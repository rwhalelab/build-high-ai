# 🌊 Build-High 서비스 흐름도

# 서비스 아키텍처 및 페이지 구조 (Flowchart)
graph TD
    A[Login Page / Google Auth] -->|Auth Success| B[Main Dashboard]
    
    subgraph "Main Dashboard (Discovery)"
        B --> B1[Stat Cards: Total Posts, Users]
        B --> B2[Category Tabs: Study, Project, Contest]
        B --> B3[AI Summary Post Cards]
    end

    B -->|Click FAB/Button| C[Post Editor]
    B -->|Click Card| D[Detail Page]

    subgraph "Post Editor (Creation)"
        C --> C1[Input Form: Markdown Editor]
        C1 --> C2{AI Analyzing...}
        C2 -->|Save| B
    end

    subgraph "Detail Page (Deep Dive)"
        D --> D1[Author Profile Card]
        D --> D2[AI Recommended Tech Badges]
        D --> D3[Contact Floating Action Button]
    end


# 사용자 여정 및 로직 흐름 (Sequence Diagram)
sequenceDiagram
    autonumber
    actor User as 사용자
    participant Frontend as v0 Frontend (Next.js)
    participant AI as AI Engine (Gemini/OpenAI)
    participant DB as Supabase (PostgreSQL)

    User->>Frontend: 모집글 작성 (제목, 본문, 카테고리)
    User->>Frontend: [저장] 버튼 클릭
    
    rect rgb(240, 240, 255)
    Note over Frontend, AI: AI Pre-processing (Phase 1 핵심)
    Frontend->>AI: 본문 데이터 전달 (요약 및 태그 추출 요청)
    AI-->>Frontend: 3줄 요약 & 기술 태그(JSON) 반환
    end

    Frontend->>DB: 원문 + AI 가공 데이터(summary, tags) 저장
    DB-->>Frontend: 저장 완료 응답

