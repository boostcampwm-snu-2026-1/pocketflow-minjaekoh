# Pocketflow Workflow

이 문서는 Pocketflow를 개발할 때 따르는 작업 순서와 구조 원칙을 정리한 문서입니다.
현재 구현된 코드 기준으로 작성했습니다.

## 1. 목적

Pocketflow는 개인 현금흐름을 다음 3가지 화면으로 다루는 애플리케이션입니다.

- 대시보드: 현재 잔액, 30일 현금흐름, AI 분석
- 정기 지출 설정: 고정비, 정기 수입, 준고정비 관리
- 지출 로그: 실제 지출 기록, 준고정비 확정, AI 구매 판단

작업의 목표는 UI를 먼저 크게 만들기보다, 상태와 계산 규칙을 먼저 안정적으로 정의하고 화면을 얹는 것입니다.

## 2. 작업 원칙

- 화면보다 데이터 구조를 먼저 정리한다.
- 계산 로직은 `store`에 두고, 화면은 읽기/조작만 담당하게 한다.
- 공통 UI와 레이아웃은 `shared`에 둔다.
- 기능 단위 코드는 `features`에 모은다.
- 외부 API 호출은 `app/api`를 통해 프록시한다.
- 저장은 가능한 한 `Zustand + localStorage` 조합으로 유지한다.

## 3. 현재 구조

```text
src
|-- app
|   |-- api
|   |   |-- ai-purchase-simulator/route.ts
|   |   `-- shopping-price-search/route.ts
|   |-- cashflow-setup/page.tsx
|   |-- expense-log/page.tsx
|   |-- layout.tsx
|   `-- page.tsx
|
|-- features
|   |-- dashboard
|   |-- cashflow-setup
|   |-- expense-log
|   |-- forecasting
|   |-- purchase-simulator
|   `-- smart-pricing
|
|-- shared
|   |-- layout
|   |-- config
|   `-- lib
|
|-- store
|   `-- cashflow-store.ts
|
`-- entities
```

## 4. 역할 분담

### `app`

- 라우트 진입점만 둔다.
- 각 페이지는 해당 `features/*`의 페이지 쉘을 호출한다.
- API route도 여기에서 관리한다.

### `features`

- 실제 화면과 기능 단위를 둔다.
- 대시보드, 지출 로그, 정기 지출 설정처럼 사용자에게 보이는 단위로 나눈다.
- 아직 연결되지 않은 `forecasting`, `purchase-simulator`, `smart-pricing`은 확장용 폴더다.

### `store`

- 현금흐름 원본 상태와 파생 계산을 관리한다.
- 현재 잔액, 고정비, 정기 수입, 준고정비, 최근 거래, 요약 수치, 30일 시계열을 포함한다.
- 거래 추가/삭제나 항목 수정이 생기면 파생값도 같이 다시 계산한다.

### `shared`

- 공통 레이아웃, 네비게이션, 유틸리티를 둔다.
- 페이지와 무관하게 재사용되는 요소만 넣는다.

### `entities`

- 도메인별 타입과 경계가 자리잡을 수 있도록 남겨둔 영역이다.
- 현재는 일부만 사용하고, 실제 로직은 `store`와 `features`에 더 가깝게 묶여 있다.

## 5. 구현 흐름

새 기능을 추가할 때는 다음 순서를 따른다.

1. 필요한 데이터 구조를 `store` 또는 도메인 타입으로 정의한다.
2. 계산 규칙과 파생값을 먼저 만든다.
3. `features`에 화면 단위를 만든다.
4. 필요한 경우 `app/api` route를 추가한다.
5. `app` 페이지에서 해당 feature를 연결한다.
6. 마지막에 UI 세부를 다듬는다.

## 6. 실제 데이터 흐름

```text
사용자 입력
-> feature 컴포넌트
-> zustand store 업데이트
-> 파생 계산 재실행
-> 대시보드 / 지출 로그 / 정기 지출 설정 반영
```

예시:

```text
정기 수입 수정
-> store의 recurringIncomes 갱신
-> summary, cashflowSeries, upcomingImpactRows 재계산
-> 대시보드 카드와 차트 즉시 반영
```

```text
지출 로그에서 실제 지출 확정
-> 준고정비 확정 처리
-> recentTransactions 추가
-> 현금흐름 요약과 30일 예측 재계산
```

```text
구매 판단 요청
-> 현재 잔액과 현금흐름 컨텍스트 생성
-> /api/ai-purchase-simulator 호출
-> Gemini 응답 수신
-> buy / hold / reject 결과 표시
```

## 7. API 사용 원칙

- `app/api/ai-purchase-simulator`
  - Gemini API를 호출한다.
  - 구매 판단 결과를 JSON 형태로 돌려준다.

- `app/api/shopping-price-search`
  - Naver Shopping API를 호출한다.
  - 상품 가격 탐색과 추천 가격 계산에 사용된다.

- 환경변수는 코드에 직접 넣지 않는다.
  - `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`

## 8. 브랜치 작업 방식

현재 작업은 기능 단위 브랜치로 진행한다.

- `main`: 안정화된 기준
- `feature/*`: 개별 작업 브랜치

권장 흐름:

```powershell
git checkout main
git pull origin main
git checkout -b feature/issue-123-short-title
```

작업 후:

```powershell
git status
git add .
git commit -m "feat: short summary"
git push -u origin feature/issue-123-short-title
```

PR을 만들 때는 변경 목적, 검증 방법, 영향 범위를 짧게 적는다.

## 9. 코드 작성 기준

- 문자열과 문서 파일은 UTF-8로 유지한다.
- 공통 계산은 중복 작성하지 않는다.
- UI는 기능 컴포넌트 안에서만 필요한 만큼만 만든다.
- 불필요한 추상화는 피한다.
- 아직 연결되지 않은 폴더를 억지로 쓰지 않는다.

## 10. 완료 기준

작업이 끝났다면 아래를 확인한다.

- 기능이 의도한 화면에서 동작하는가
- 상태 변경 시 파생 계산이 맞게 갱신되는가
- API 연동이 실패해도 사용자에게 의미 있는 오류가 보이는가
- 문서와 실제 구현이 어긋나지 않는가
- 타입 검사 또는 빌드에서 새 오류가 생기지 않는가

## 11. 문서 우선순위

개발 중 참고할 문서는 다음 순서로 본다.

1. `README.md`
2. `WORKFLOW.md`
3. `FOLDER_STRUCTURE.md`
4. `issues_backlog.md`
5. `PRD.md`는 필요할 때만 참고한다

