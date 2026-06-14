# Pocketflow Architecture Diagrams

현재 프로젝트 구조를 기준으로 한 ASCII 아키텍처 다이어그램 모음이다.

## 1) 컴포넌트 중심

```text
┌──────────────────────────────────────────────────────────────────────┐
│                              Browser UI                              │
│                                                                      │
│  app/page                  app/cashflow-setup/page                   │
│  app/expense-log/page      app/layout                                │
└───────────────┬──────────────────────────────┬───────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           Shared App Shell                           │
│                                                                      │
│  shared/layout/app-shell.tsx                                         │
│  ├─ shared/layout/cashflow-bootstrap.tsx                             │
│  ├─ shared/layout/sidebar.tsx                                        │
│  └─ shared/layout/top-header.tsx                                     │
└───────────────┬──────────────────────────────┬───────────────────────┘
                │                              │
                ▼                              ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Feature Layer                                   │
│                                                                           │
│  Dashboard                    Cashflow Setup          Expense Log         │
│  ├─ KPI cards                 ├─ budget rules         ├─ scheduled review |
│  ├─ 30-day chart              ├─ detail settings      ├─ recent list      |
│  ├─ AI analysis               ├─ fixed income/expense └─ AI simulator     |
│  └─ impact list (unused)      └─ semi-fixed list                          │
└───────────────┬──────────────────────────────┬────────────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                           State / Logic Layer                        │
│                                                                      │
│  store/cashflow-store.ts                                             │
│  ├─ source of truth                                                  │
│  ├─ derived cashflow summary                                         │
│  ├─ rolling forecast series                                          │
│  ├─ upcoming impact rows                                             │
│  └─ actions: add/update/remove/sync/confirm                          │
└───────────────┬──────────────────────────────┬───────────────────────┘
                │                              │
                ▼                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Server API / External I/O                      │
│                                                                      │
│  app/api/ai-purchase-simulator/route.ts                              │
│  └─ Gemini API                                                       │
│                                                                      │
│  app/api/shopping-price-search/route.ts                              │
│  └─ Naver Shopping API                                               │
└──────────────────────────────────────────────────────────────────────┘
```

## 2) 데이터 흐름 중심

```text
                        ┌──────────────────────┐
                        │   User Interaction   │
                        │  click / edit / view │
                        └──────────┬───────────┘
                                   │
                                   ▼
                     ┌─────────────────────────────┐
                     │   Feature Component Layer   │
                     │                             │
                     │ dashboard                   │
                     │ cashflow-setup              │
                     │ expense-log                 │
                     └──────────┬──────────────────┘
                                │
                  ┌─────────────┼─────────────┐
                  │             │             │
                  ▼             ▼             ▼
     ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
     │   Read state     │ │  Mutate state    │ │  Request server  │
     │ useCashflowStore │ │ store actions    │ │ fetch /api/*     │
     └──────────┬───────┘ └──────────┬───────┘ └──────────┬───────┘
                │                    │                    │
                ▼                    ▼                    ▼
     ┌────────────────────────────────────────────────────────────┐
     │                  store/cashflow-store.ts                   │
     │                                                            │
     │  - base state                                              │
     │  - derived summary                                         │
     │  - forecast series                                         │
     │  - upcoming impact rows                                    │
     └──────────┬─────────────────────────────────────────────────┘
                │
                ▼
     ┌────────────────────────────────────────────────────────────┐
     │                    Persisted local storage                 │
     │      zustand persist + JSON storage in browser             │
     └────────────────────────────────────────────────────────────┘
```

## 3) 레이어 분리도

```text
┌──────────────────────────────────────────────────────────────────────┐
│ L1. Routing Layer                                                    │
│                                                                      │
│  app/layout.tsx                                                      │
│  app/page.tsx                                                        │
│  app/cashflow-setup/page.tsx                                         │
│  app/expense-log/page.tsx                                            │
│  app/api/*                                                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ L2. Presentation Layer                                               │
│                                                                      │
│  shared/layout/*                                                     │
│  features/dashboard/*                                                │
│  features/cashflow-setup/*                                           │
│  features/expense-log/*                                              │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ L3. State / Domain Logic Layer                                       │
│                                                                      │
│  store/cashflow-store.ts                                             │
│  features/cashflow-setup/cashflow-types.ts                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│ L4. Infrastructure Layer                                             │
│                                                                      │
│  app/api/ai-purchase-simulator/route.ts                              │
│  app/api/shopping-price-search/route.ts                              │
│  external services: Gemini, Naver Shopping                           │
└──────────────────────────────────────────────────────────────────────┘

Shared utilities:
- `shared/config/navigation.ts`
- `shared/lib/utils.ts`

Reserved domains:
- `entities/*`
- `features/forecasting/*`
- `features/purchase-simulator/*`
- `features/smart-pricing/*`
```

## 4) 핵심 요약

```text
app -> features -> store -> api -> external services
```

이 프로젝트는 위 흐름을 기준으로 구성되어 있다.  
화면은 여러 개지만, 실제 중심은 `store/cashflow-store.ts` 하나로 모인다.
