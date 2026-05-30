# Pocketflow Project Specification (PRD)

## 1. Project Overview
- **Name:** Pocketflow
- **Target Audience:** 1인 가구
- **Core Concept:** 단순 과거 지출 기록을 넘어, 일별 예상 잔액 및 미래 현금흐름(Cash Flow)을 예측하여 합리적인 소비 의사결정을 돕는 재무관리 플랫폼.
- **Design Concept:** 다크 모드 기반의 미니멀하고 직관적인 UI (블랙/화이트 톤)

## 2. Tech Stack
- **Frontend:** React (또는 Next.js), Tailwind CSS
- **UI Components:** shadcn/ui
- **Data Visualization:** Recharts
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL 기반)
- **External APIs:** 네이버 쇼핑 검색 API (최저가 크롤링), Gemini API (자연어 소비 패턴 분석)

## 3. Core Features & Business Logic
1. **일별 현금흐름 예측 (Cashflow Forecasting)**
   - 현재 잔고, 고정비, 준고정비, 변동비를 종합하여 월말까지의 일별 예상 잔액 추이 계산.
2. **지출 성격별 분리 (Expense Categorization)**
   - **고정비:** 매월 특정 날짜에 고정된 금액이 출금됨 (예: 원룸 월세, 통신비, 관리비).
   - **준고정비:** 결제일이 유동적이나 주기적으로 발생하는 필수 지출 (예: 닭가슴살 3주 주기, 디퓨저 2개월 주기 등).
   - **변동비:** 일상적인 식비, 쇼핑 등.
3. **AI 소비 시뮬레이터 (Purchase Simulator)**
   - 특정 물품과 가격 입력 시, 구매 후 월말 예상 잔액 변화와 재무적 위험도를 텍스트로 분석하여 제공.
4. **스마트 예측 (Smart Pricing)**
   - 준고정비 항목의 경우 네이버 쇼핑 API를 통해 실시간 최저가를 반영하여 다음 달 예산에 자동 할당.

## 4. Screen Specifications (UI/UX)

### [Page 1] 메인 대시보드 (Home)
- **Top KPI Cards:**
  - 오늘 사용 가능 금액
  - 예상 월말 잔액
  - 예산 사용률 (%)
  - 이번 달 예정 지출 금액
- **Main Chart:** Recharts를 활용한 일별 예상 현금흐름 꺾은선 차트. (Tooltips로 특정 일자의 예상 잔액 표시)
- **Side Panel (Right):** - 다가오는 지출 (D-Day 표기, 예: D-2 통신비 55,000원)
  - AI 소비분석 요약 상태바

### [Page 2] 지출 관리 (Expense Log)
- **새로운 지출 추가 (Form):** 날짜, 항목명, 금액, 카테고리 입력 및 추가 버튼.
- **최근 지출 내역 (List):** 항목명, 카테고리, 결제일, 금액 리스트 출력.
- **AI 소비 시뮬레이터 (Right Panel):** "이거 사도 될까?" 입력창(아이템명, 가격) 및 분석 결과 출력 영역.

### [Page 3] 정기 지출 설정 (Cashflow Setup)
- **고정비 List (Left):** 월세, 관리비 등 항목 추가 및 관리 (+ 버튼).
- **준고정비 List (Center):** 주기적 생필품 항목 추가 (+ 버튼). API 연동 뱃지 표기.
- **상세 설정 패널 (Right):** 좌측/중앙 목록에서 선택한 항목의 상세 정보 편집 및 API 스마트 예측 설정 영역.

## 5. Data Models (Draft)
- `Transaction`: id, amount, date, category, type (fixed/variable), name
- `Subscription` (준고정비/고정비): id, name, amount, billing_cycle, next_billing_date, is_api_linked