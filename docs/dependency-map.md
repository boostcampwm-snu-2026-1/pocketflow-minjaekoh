# Pocketflow 의존성 맵

이 문서는 현재 코드 기준으로 프로젝트의 구조와 import 의존성을 정리한 것이다.

기준:
- `app`는 라우트 진입점이다.
- `features`는 화면 단위 기능이다.
- `store`는 전역 상태와 파생 계산의 중심이다.
- `shared`는 공통 레이아웃, 유틸, 설정을 담는다.
- `entities`는 현재 대부분 비어 있는 예약 영역이다.

## 1) 폴더/파일 트리

아래 트리는 `src` 기준의 실제 파일 구조를 반영한다.

```text
src
|-- app
|   |-- api
|   |   |-- ai-purchase-simulator
|   |   |   `-- route.ts
|   |   `-- shopping-price-search
|   |       `-- route.ts
|   |-- cashflow-setup
|   |   |-- .gitkeep
|   |   `-- page.tsx
|   |-- expense-log
|   |   |-- .gitkeep
|   |   `-- page.tsx
|   |-- globals.css
|   |-- home
|   |   `-- .gitkeep
|   |-- layout.tsx
|   |-- page.tsx
|   `-- routes
|       `-- .gitkeep
|-- entities
|   |-- cashflow
|   |   `-- .gitkeep
|   |-- subscription
|   |   `-- .gitkeep
|   `-- transaction
|       `-- .gitkeep
|-- features
|   |-- cashflow-setup
|   |   |-- .gitkeep
|   |   |-- budget-rules-panel.tsx
|   |   |-- cashflow-setup-page-shell.tsx
|   |   |-- cashflow-types.ts
|   |   |-- detail-settings-panel.tsx
|   |   |-- fixed-expense-list.tsx
|   |   |-- recurring-income-list.tsx
|   |   `-- semi-fixed-expense-list.tsx
|   |-- dashboard
|   |   |-- .gitkeep
|   |   |-- daily-cashflow-chart.tsx
|   |   |-- dashboard-ai-analysis-panel.tsx
|   |   |-- dashboard-kpi-cards.tsx
|   |   `-- upcoming-cashflow-impact-list.tsx
|   |-- expense-log
|   |   |-- .gitkeep
|   |   |-- ai-purchase-simulator-panel.tsx
|   |   |-- expense-entry-form.tsx
|   |   |-- expense-log-page-shell.tsx
|   |   |-- recent-expense-list.tsx
|   |   `-- scheduled-expense-review-panel.tsx
|   |-- forecasting
|   |   `-- .gitkeep
|   |-- purchase-simulator
|   |   `-- .gitkeep
|   `-- smart-pricing
|       `-- .gitkeep
|-- shared
|   |-- config
|   |   |-- .gitkeep
|   |   `-- navigation.ts
|   |-- layout
|   |   |-- .gitkeep
|   |   |-- app-shell.tsx
|   |   |-- cashflow-bootstrap.tsx
|   |   |-- page-placeholder.tsx
|   |   |-- sidebar.tsx
|   |   `-- top-header.tsx
|   |-- lib
|   |   |-- .gitkeep
|   |   `-- utils.ts
|   |-- types
|   |   `-- .gitkeep
|   `-- ui
|       `-- .gitkeep
`-- store
    |-- .gitkeep
    `-- cashflow-store.ts
```

## 2) 의존성 맵

이 맵은 "누가 누구를 import 하는가"를 기준으로 한 방향 그래프다.

```text
app/layout.tsx
  -> shared/layout/app-shell.tsx
  -> app/globals.css

app/page.tsx
  -> features/dashboard/dashboard-kpi-cards.tsx
  -> features/dashboard/daily-cashflow-chart.tsx
  -> features/dashboard/dashboard-ai-analysis-panel.tsx

app/cashflow-setup/page.tsx
  -> features/cashflow-setup/cashflow-setup-page-shell.tsx

app/expense-log/page.tsx
  -> features/expense-log/expense-log-page-shell.tsx

shared/layout/app-shell.tsx
  -> shared/layout/cashflow-bootstrap.tsx
  -> shared/layout/sidebar.tsx
  -> shared/layout/top-header.tsx

shared/layout/cashflow-bootstrap.tsx
  -> store/cashflow-store.ts

shared/layout/sidebar.tsx
  -> shared/config/navigation.ts
  -> shared/lib/utils.ts

shared/config/navigation.ts
  -> lucide-react

shared/lib/utils.ts
  -> clsx
  -> tailwind-merge

store/cashflow-store.ts
  -> zustand
  -> zustand/middleware
  -> features/cashflow-setup/cashflow-types.ts

features/dashboard/dashboard-kpi-cards.tsx
  -> store/cashflow-store.ts
  -> lucide-react

features/dashboard/daily-cashflow-chart.tsx
  -> store/cashflow-store.ts
  -> recharts
  -> lucide-react

features/dashboard/dashboard-ai-analysis-panel.tsx
  -> store/cashflow-store.ts
  -> lucide-react

features/cashflow-setup/cashflow-setup-page-shell.tsx
  -> store/cashflow-store.ts
  -> features/cashflow-setup/budget-rules-panel.tsx
  -> features/cashflow-setup/detail-settings-panel.tsx
  -> features/cashflow-setup/semi-fixed-expense-list.tsx

features/cashflow-setup/budget-rules-panel.tsx
  -> features/cashflow-setup/cashflow-types.ts
  -> store/cashflow-store.ts (types only)
  -> lucide-react

features/cashflow-setup/detail-settings-panel.tsx
  -> features/cashflow-setup/cashflow-types.ts
  -> /api/shopping-price-search (runtime fetch, not import)
  -> lucide-react

features/cashflow-setup/fixed-expense-list.tsx
  -> features/cashflow-setup/cashflow-types.ts
  -> store/cashflow-store.ts (types only)
  -> lucide-react

features/cashflow-setup/recurring-income-list.tsx
  -> features/cashflow-setup/cashflow-types.ts
  -> store/cashflow-store.ts (types only)
  -> lucide-react

features/cashflow-setup/semi-fixed-expense-list.tsx
  -> features/cashflow-setup/cashflow-types.ts
  -> store/cashflow-store.ts
  -> lucide-react

features/expense-log/expense-log-page-shell.tsx
  -> store/cashflow-store.ts
  -> features/expense-log/ai-purchase-simulator-panel.tsx
  -> features/expense-log/recent-expense-list.tsx
  -> features/expense-log/scheduled-expense-review-panel.tsx

features/expense-log/ai-purchase-simulator-panel.tsx
  -> store/cashflow-store.ts
  -> /api/ai-purchase-simulator (runtime fetch, not import)
  -> lucide-react

features/expense-log/scheduled-expense-review-panel.tsx
  -> store/cashflow-store.ts
  -> features/cashflow-setup/cashflow-types.ts
  -> lucide-react

features/expense-log/recent-expense-list.tsx
  -> lucide-react

app/api/ai-purchase-simulator/route.ts
  -> Next.js server runtime
  -> Gemini API (external HTTP)

app/api/shopping-price-search/route.ts
  -> Next.js server runtime
  -> Naver Shopping API (external HTTP)
```

## 3) 레이어별 해석

### `app`
라우트 진입점만 가진다.
- `app/layout.tsx`는 전체 앱 껍데기와 글로벌 스타일을 묶는다.
- `app/page.tsx`는 대시보드 화면 조립만 한다.
- `app/cashflow-setup/page.tsx`, `app/expense-log/page.tsx`는 각 feature shell을 그대로 렌더링한다.
- API route는 서버 전용 경계다. UI에서 `fetch`로 호출하고, 직접 import해서 쓰지 않는다.

### `shared`
앱 전반에서 재사용되는 최소 공통부다.
- `shared/layout/app-shell.tsx`는 전체 구조의 뼈대다.
- `shared/layout/cashflow-bootstrap.tsx`는 앱 시작 시 전역 상태를 동기화한다.
- `shared/layout/sidebar.tsx`는 네비게이션과 스타일 유틸만 쓴다.
- `shared/lib/utils.ts`는 className 조합용 유틸이다.
- `shared/config/navigation.ts`는 메뉴 데이터만 제공한다.

### `store`
이 프로젝트의 상태와 계산 로직의 중심이다.
- 초기 잔액, 고정비, 정기수입, 반고정비, 최근 거래를 보관한다.
- `buildRollingCashflowMetrics`, `buildRollingCashflowSeries` 같은 파생 계산을 제공한다.
- UI는 대부분 store를 직접 읽고, store가 다시 summary/series/impact row를 계산해서 돌려준다.

### `features/dashboard`
대시보드 시각화는 store에서 파생된 숫자를 읽기만 한다.
- KPI 카드, 30일 차트, AI 분석 패널이 모두 같은 store 데이터를 공유한다.
- 그래서 하나의 결제/수입 변경이 세 컴포넌트에 동시에 반영된다.

### `features/cashflow-setup`
고정비, 정기수입, 반고정비를 편집하는 설정 영역이다.
- `BudgetRulesPanel`은 고정비/정기수입 CRUD를 담당한다.
- `SemiFixedExpenseList`는 반고정비 목록과 정렬, 만기 상태를 보여준다.
- `DetailSettingsPanel`은 선택된 항목의 상세 편집과 가격 조회를 담당한다.
- 이 영역은 store와 결합도가 가장 높다.

### `features/expense-log`
실제 거래 기록과 지출 시뮬레이션 영역이다.
- `ScheduledExpenseReviewPanel`은 당일 처리 대상 반고정비를 확인/확정한다.
- `RecentExpenseList`는 최근 거래를 보여준다.
- `AiPurchaseSimulatorPanel`은 AI 판정을 요청하고, 그 결과를 기록한다.
- 페이지 shell은 이 셋을 묶어서 사용 흐름을 만든다.

### `entities`
현재는 구조 예약만 있고 실제 구현 파일은 없다.
- 나중에 `transaction`, `subscription`, `cashflow` 같은 도메인 모델이 들어갈 자리다.
- 지금 상태에서는 의존성 그래프에 실질적인 영향이 없다.

## 4) 흐름 요약

핵심 흐름은 아래와 같다.

```text
앱 시작
  -> app/layout.tsx
  -> shared/layout/app-shell.tsx
  -> shared/layout/cashflow-bootstrap.tsx
  -> store/cashflow-store.ts

대시보드
  -> app/page.tsx
  -> features/dashboard/*
  -> store/cashflow-store.ts

지출/거래 기록
  -> app/expense-log/page.tsx
  -> features/expense-log/*
  -> store/cashflow-store.ts
  -> /api/ai-purchase-simulator

지출 설정
  -> app/cashflow-setup/page.tsx
  -> features/cashflow-setup/*
  -> store/cashflow-store.ts
  -> /api/shopping-price-search
```

즉, 화면은 여러 개지만 데이터 중심축은 하나다.  
UI는 거의 모두 `store`를 통해 연결되고, 외부 API는 `feature -> route -> external service` 구조로 분리되어 있다.

## 5) 현재 미연결 파일

아래 파일들은 존재하지만 현재 import 그래프에서는 사용되지 않는다.

```text
features/dashboard/upcoming-cashflow-impact-list.tsx
features/expense-log/expense-entry-form.tsx
shared/layout/page-placeholder.tsx
```

이 파일들은 보관용이거나 다음 단계 작업을 위한 재료로 보인다.  
실제 렌더 경로에 넣으려면 각 페이지 shell 또는 상위 feature에서 명시적으로 import해야 한다.

## 6) 읽는 법

- 화살표 `A -> B`는 `A`가 `B`를 의존한다는 뜻이다.
- `types only`는 런타임 기능이 아니라 타입 참조만 한다는 뜻이다.
- `runtime fetch`는 정적 import가 아니라 브라우저/서버 실행 시 HTTP 호출로 연결된다는 뜻이다.

## 7) 한 줄 결론

이 프로젝트는 `store/cashflow-store.ts`를 중심으로 `dashboard`, `cashflow-setup`, `expense-log`가 뻗는 형태이고,  
`shared/layout`은 그 위에 공통 껍데기를 제공하는 구조다.
