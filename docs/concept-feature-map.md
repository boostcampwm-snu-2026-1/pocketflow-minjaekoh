# Pocketflow 컨셉맵 / 피쳐맵

현재 `src` 구조를 기준으로 다시 정리한 문서다.

- `컨셉맵`은 "이 프로젝트가 무엇을 중심으로 움직이는가"를 보여준다.
- `피쳐맵`은 "실제 폴더와 파일이 어떻게 나뉘어 있는가"를 보여준다.

## 1) 컨셉맵

```text
Pocketflow
|-- Core
|   |-- shared/layout
|   |   |-- app-shell
|   |   |-- cashflow-bootstrap
|   |   |-- sidebar
|   |   `-- top-header
|   |-- shared/config
|   |   `-- navigation
|   |-- shared/lib
|   |   `-- utils
|   `-- store/cashflow-store
|       |-- current balance
|       |-- fixed expenses
|       |-- recurring incomes
|       |-- semi-fixed expenses
|       |-- recent transactions
|       `-- derived cashflow metrics
|
|-- Planning
|   `-- features/cashflow-setup
|       |-- budget rules
|       |-- recurring income setup
|       |-- fixed expense setup
|       |-- semi-fixed expense setup
|       `-- item detail editing + price lookup
|
|-- Tracking
|   `-- features/expense-log
|       |-- scheduled expense review
|       |-- recent transaction list
|       `-- AI purchase simulation
|
|-- Forecasting / Analysis
|   `-- features/dashboard
|       |-- KPI cards
|       |-- 30-day cashflow chart
|       |-- AI risk analysis
|       `-- upcoming impact list (currently unused)
|
|-- Entry Points
|   |-- app/page
|   |-- app/cashflow-setup/page
|   |-- app/expense-log/page
|   `-- app/layout
|
`-- External Services
    |-- app/api/ai-purchase-simulator -> Gemini API
    `-- app/api/shopping-price-search -> Naver Shopping API
```

### 컨셉맵 해석

- 이 프로젝트의 중심축은 `store/cashflow-store.ts`다.
- `dashboard`는 현재 상태를 요약하고 미래 30일을 보여준다.
- `cashflow-setup`은 앞으로의 고정 패턴을 편집하는 곳이다.
- `expense-log`는 실제 지출과 확정 처리, AI 판단을 기록하는 곳이다.
- `shared/layout`은 모든 화면을 감싸는 공통 껍데기다.
- `app/api/*`는 외부 서비스와 통신하는 경계다.

즉, 구조는 "라우트가 여러 개"지만, 실제 개념은 아래 한 줄로 모인다.

```text
설정된 현금흐름 -> store -> dashboard / expense-log / cashflow-setup
```

## 2) 피쳐맵

### `src` 전체 구조

```text
src
|-- app
|   |-- api
|   |   |-- ai-purchase-simulator/route.ts
|   |   `-- shopping-price-search/route.ts
|   |-- cashflow-setup/page.tsx
|   |-- expense-log/page.tsx
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|
|-- features
|   |-- dashboard
|   |   |-- daily-cashflow-chart.tsx
|   |   |-- dashboard-ai-analysis-panel.tsx
|   |   |-- dashboard-kpi-cards.tsx
|   |   `-- upcoming-cashflow-impact-list.tsx
|   |
|   |-- cashflow-setup
|   |   |-- budget-rules-panel.tsx
|   |   |-- cashflow-setup-page-shell.tsx
|   |   |-- cashflow-types.ts
|   |   |-- detail-settings-panel.tsx
|   |   |-- fixed-expense-list.tsx
|   |   |-- recurring-income-list.tsx
|   |   `-- semi-fixed-expense-list.tsx
|   |
|   |-- expense-log
|   |   |-- ai-purchase-simulator-panel.tsx
|   |   |-- expense-entry-form.tsx
|   |   |-- expense-log-page-shell.tsx
|   |   |-- recent-expense-list.tsx
|   |   `-- scheduled-expense-review-panel.tsx
|   |
|   |-- forecasting
|   |   `-- .gitkeep
|   |-- purchase-simulator
|   |   `-- .gitkeep
|   `-- smart-pricing
|       `-- .gitkeep
|
|-- shared
|   |-- config/navigation.ts
|   |-- layout
|   |   |-- app-shell.tsx
|   |   |-- cashflow-bootstrap.tsx
|   |   |-- page-placeholder.tsx
|   |   |-- sidebar.tsx
|   |   `-- top-header.tsx
|   |-- lib/utils.ts
|   |-- types/.gitkeep
|   `-- ui/.gitkeep
|
|-- store
|   `-- cashflow-store.ts
|
`-- entities
    |-- cashflow/.gitkeep
    |-- subscription/.gitkeep
    `-- transaction/.gitkeep
```

### 피쳐별 역할

- `features/dashboard`
  - 현재 잔액, 30일 시뮬레이션, 위험 구간을 보여준다.
  - 화면은 읽기 전용 성격이 강하다.
  - `upcoming-cashflow-impact-list.tsx`는 아직 본 흐름에 연결되지 않았다.

- `features/cashflow-setup`
  - 고정비, 정기 수입, 반고정비를 추가/수정/삭제한다.
  - `detail-settings-panel.tsx`는 가격 조회 API를 붙여 보정값을 넣는 역할도 한다.
  - 이 폴더가 사실상 월간 현금흐름의 규칙 편집기다.

- `features/expense-log`
  - 당일 정산 대상 지출을 확인하고 확정한다.
  - 최근 거래 내역을 보여준다.
  - AI 구매 시뮬레이터로 `buy / hold / reject` 판단을 받는다.
  - `expense-entry-form.tsx`는 현재 구조상 독립 파일로 남아 있다.

- `shared/layout`
  - 공통 레이아웃, 사이드바, 헤더, bootstrap 동기화를 담당한다.
  - 페이지가 바뀌어도 같은 앱 프레임을 유지한다.

- `store`
  - 현금흐름의 단일 소스다.
  - 데이터 원본과 파생 계산을 함께 관리한다.

- `app/api`
  - 외부 API를 직접 감싸는 서버 경계다.
  - 프론트는 이 경계를 통해서만 Gemini와 Naver Shopping을 사용한다.

## 3) 실제 연결 흐름

```text
app/layout
  -> shared/layout/app-shell
  -> shared/layout/cashflow-bootstrap
  -> store/cashflow-store

app/page
  -> features/dashboard/*
  -> store/cashflow-store

app/cashflow-setup/page
  -> features/cashflow-setup/*
  -> store/cashflow-store
  -> app/api/shopping-price-search

app/expense-log/page
  -> features/expense-log/*
  -> store/cashflow-store
  -> app/api/ai-purchase-simulator
```

## 4) 현재 구조에서 읽어야 할 포인트

1. `app`은 라우트 진입점만 가진다.
2. `features`는 실제 화면 블록이다.
3. `store`는 상태와 계산을 함께 가진다.
4. `shared`는 앱 전체에서 재사용되는 공통 레이어다.
5. `entities`는 아직 실사용 코드가 없는 예약 공간이다.

## 5) 현재 비워 둔 피쳐 폴더

```text
features/forecasting
features/purchase-simulator
features/smart-pricing
```

이 폴더들은 현재 구조상 예약된 자리다.  
아직 화면에 연결된 구현은 없고, 나중에 기능이 늘어날 때 들어갈 확장 지점으로 보면 된다.

## 6) 한 줄 요약

```text
app -> features -> store -> api/external service
```

이 흐름이 지금 프로젝트 구조의 핵심이다.
