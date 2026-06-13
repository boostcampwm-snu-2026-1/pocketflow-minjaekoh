# Pocketflow 폴더 구조 설계

## 1. 설계 기준
- `issues_backlog.md`의 개발 순서를 그대로 따라갈 수 있어야 한다.
- `WORKFLOW.md`의 의존성 방향을 지킨다.
- 폴더명만 봐도 어떤 기능을 담당하는지 알 수 있어야 한다.
- 화면 조립, 기능 로직, 도메인 데이터, 공통 요소를 분리한다.
- Vercel AI 생성 코드는 실제 구현 코드와 분리해서 보관한다.

## 2. 추천 폴더 구조

```text
pocketflow
├─ docs
│  └─ references
│     ├─ assignment
│     └─ ui-images
├─ references
│  └─ vercel-ai
├─ public
├─ src
│  ├─ app
│  │  ├─ home
│  │  ├─ expense-log
│  │  ├─ cashflow-setup
│  │  └─ routes
│  ├─ features
│  │  ├─ dashboard
│  │  ├─ expense-log
│  │  ├─ cashflow-setup
│  │  ├─ forecasting
│  │  ├─ purchase-simulator
│  │  └─ smart-pricing
│  ├─ entities
│  │  ├─ transaction
│  │  ├─ subscription
│  │  └─ cashflow
│  ├─ shared
│  │  ├─ ui
│  │  ├─ layout
│  │  ├─ lib
│  │  ├─ config
│  │  └─ types
│  └─ store
└─ README.md
```

## 3. 폴더별 책임

### `docs`
프로젝트 문서와 참고 자료를 둔다.

- `docs/references/ui-images`: 메인 대시보드, 지출 관리, 정기 지출 설정 참고 이미지
- `docs/references/assignment`: 과제 요구사항 PDF

### `references`
실제 앱 코드가 아닌 참고용 산출물을 둔다.

- `references/vercel-ai`: Vercel AI로 생성한 화면 코드 원본

이 폴더의 코드는 바로 `src`로 복사하지 않고, 필요한 구조와 스타일만 선별해서 가져온다.

### `src/app`
페이지 조립과 라우팅을 담당한다.

- `home`: 메인 대시보드 페이지
- `expense-log`: 지출 관리 페이지
- `cashflow-setup`: 정기 지출 설정 페이지
- `routes`: React Router 또는 Next.js 라우팅 설정

`app`은 화면을 조립하는 곳이고, 계산 로직이나 상태 변경 로직을 직접 많이 갖지 않는다.

### `src/features`
사용자가 실제로 사용하는 기능 단위를 담당한다.

- `dashboard`: KPI 카드, 다가오는 지출, 대시보드 패널
- `expense-log`: 지출 입력 폼, 최근 지출 리스트
- `cashflow-setup`: 고정비 리스트, 준고정비 리스트, 상세 설정 패널
- `forecasting`: 예상 현금흐름 차트와 계산 결과 표시
- `purchase-simulator`: AI 소비 시뮬레이터
- `smart-pricing`: 네이버 쇼핑 API 기반 가격 예측 기능

feature는 화면에 가까운 기능을 담되, 도메인 타입과 핵심 계산은 `entities` 또는 `store`로 분리한다.

### `src/entities`
프로젝트의 핵심 도메인 데이터를 담당한다.

- `transaction`: 변동 지출 데이터
- `subscription`: 고정비, 준고정비 데이터
- `cashflow`: 잔액, 예측 결과, 월말 예상 잔액 데이터

이 영역은 UI와 독립적으로 유지한다.

### `src/shared`
여러 화면과 기능에서 함께 쓰는 요소를 둔다.

- `ui`: 버튼, 카드, 입력창 같은 공통 UI 컴포넌트
- `layout`: 사이드바, 상단 헤더, 페이지 셸
- `lib`: 날짜, 금액 포맷, 계산 보조 함수
- `config`: 메뉴, 라우트, 환경 설정
- `types`: 공통 타입

### `src/store`
Zustand 전역 상태를 둔다.

- 지출 목록
- 고정비와 준고정비 목록
- 현재 잔액과 예측 결과
- AI 분석 결과 상태

## 4. 의존성 방향

```text
src/app
-> src/features
-> src/entities
-> src/shared
```

허용되는 방향:

- `app`은 `features`, `shared`를 사용할 수 있다.
- `features`는 `entities`, `shared`, `store`를 사용할 수 있다.
- `store`는 `entities`, `shared/lib`를 사용할 수 있다.
- `entities`는 `shared/types`나 `shared/lib` 정도만 사용할 수 있다.

피해야 할 방향:

- `entities`가 `features`를 참조하는 구조
- `shared`가 특정 화면이나 feature를 참조하는 구조
- 화면 컴포넌트 안에 현금흐름 계산 로직이 직접 들어가는 구조

## 5. 이슈별 매핑

```text
Issue #1  -> src 기본 구조, shared/config, shared/ui
Issue #2  -> src/shared/layout, src/app/routes
Issue #3  -> src/features/dashboard
Issue #4  -> src/features/dashboard
Issue #5  -> src/features/forecasting
Issue #6  -> src/app/home
Issue #7  -> src/features/expense-log
Issue #8  -> src/features/expense-log
Issue #9  -> src/features/purchase-simulator
Issue #10 -> src/app/expense-log, src/store
Issue #11 -> src/features/cashflow-setup, src/entities/subscription
Issue #12 -> src/features/cashflow-setup, src/features/smart-pricing
Issue #13 -> src/features/cashflow-setup
Issue #14 -> src/app/cashflow-setup
Issue #15 -> src/store, src/entities/cashflow
```

## 6. 초기 생성 우선순위

1. `references/vercel-ai`
2. `docs/references/ui-images`
3. `src/shared/layout`
4. `src/shared/ui`
5. `src/app/routes`
6. `src/app/home`
7. `src/features/dashboard`
8. `src/entities`
9. `src/store`

처음부터 모든 폴더를 비워둔 채 만들기보다는, 해당 이슈를 시작할 때 필요한 폴더부터 생성한다.
