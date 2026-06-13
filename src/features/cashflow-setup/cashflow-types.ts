export type BillingCycle = "주 1회" | "2주 1회" | "주 2~3회" | "불규칙" | "매월";

export type ExpenseStatus = "active" | "watch" | "api-ready";

export type SemiFixedExpenseItem = {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  apiLinked: boolean;
  smartPricing: boolean;
  status: ExpenseStatus;
  note: string;
};

export const billingCycleOptions: BillingCycle[] = [
  "주 1회",
  "2주 1회",
  "주 2~3회",
  "불규칙",
  "매월"
];

export const initialSemiFixedExpenses: SemiFixedExpenseItem[] = [
  {
    id: "groceries",
    name: "장보기",
    amount: 220000,
    billingCycle: "주 1회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "식비와 생필품 묶음"
  },
  {
    id: "cleaning",
    name: "세제/청소용품",
    amount: 38000,
    billingCycle: "2주 1회",
    nextPaymentDate: "2026-06-17",
    apiLinked: false,
    smartPricing: false,
    status: "watch",
    note: "소모 속도에 따라 변동"
  },
  {
    id: "delivery",
    name: "배달음식",
    amount: 96000,
    billingCycle: "불규칙",
    nextPaymentDate: "2026-06-15",
    apiLinked: false,
    smartPricing: false,
    status: "active",
    note: "충동 지출 경보 대상"
  },
  {
    id: "coffee",
    name: "커피/간식",
    amount: 54000,
    billingCycle: "주 2~3회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "자잘하지만 누적이 빠름"
  }
];

