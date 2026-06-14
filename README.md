# Pocketflow

Pocketflow는 개인 현금흐름을 관리하기 위한 Next.js 기반 웹 애플리케이션입니다.

구현된 기능은 다음 세 가지입니다.

- 대시보드에서 현재 잔액과 30일 현금흐름 확인
- 정기 지출 설정에서 고정비, 정기 수입, 준고정비 관리
- 지출 로그에서 실제 지출 기록 및 AI 구매 판단 실행

## 주요 기능

### 대시보드

- 현재 잔액, 30일 예상 수입, 30일 예상 지출, 30일 최저 잔액을 카드로 표시
- 30일 현금흐름 그래프 제공
- AI 분석 패널에서 30일 기준 위험 구간을 간단히 확인

### 정기 지출 설정

- 고정비 등록, 수정, 삭제
- 정기 수입 등록, 수정, 삭제
- 준고정비 항목 선택 및 상세 설정
- 항목별 다음 결제일과 금액 관리
- 설정 데이터는 로컬 저장소에 저장되어 새로고침 후에도 유지

### 지출 로그

- 예정된 준고정비를 확인하고 실제 지출로 확정
- 최근 거래 내역 추가 및 삭제
- 구매 항목을 입력하면 AI가 `buy / hold / reject` 형태의 판단을 반환
- 실제 지출 확정 시 거래 내역과 현금흐름에 반영

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Zustand
- Recharts
- Tailwind CSS 4

## 라우팅

- `/` - 대시보드
- `/expense-log` - 지출 로그
- `/cashflow-setup` - 정기 지출 설정

## 상태 관리

- 현금흐름 데이터는 [`src/store/cashflow-store.ts`](./src/store/cashflow-store.ts)에 모여 있습니다.
- 초기 데이터에는 현재 잔액, 고정비, 정기 수입, 준고정비, 최근 거래 내역이 포함되어 있습니다.
- 일부 상태는 `localStorage`에 저장되어 페이지를 다시 열어도 유지됩니다.

## 외부 API

### `POST /api/ai-purchase-simulator`

- Gemini API를 사용해 구매 판단 결과를 생성합니다.
- 필요 환경변수:
  - `GEMINI_API_KEY`
  - 또는 `GOOGLE_API_KEY`

### `GET /api/shopping-price-search`

- Naver Shopping API로 상품 가격 검색을 수행합니다.
- 필요 환경변수:
  - `NAVER_CLIENT_ID`
  - `NAVER_CLIENT_SECRET`

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - 린트 실행
- `npm run typecheck` - TypeScript 타입 검사

## 참고 문서

- [`PRD.md`](./PRD.md)
- [`WORKFLOW.md`](./WORKFLOW.md)
- [`FOLDER_STRUCTURE.md`](./FOLDER_STRUCTURE.md)
- [`issues_backlog.md`](./issues_backlog.md)



