export type BillingCycle = "매일" | "주1회" | "2주1회" | "주2~3회" | "비정기" | "매월";

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

export const billingCycleOptions: BillingCycle[] = ["매일", "주1회", "2주1회", "주2~3회", "비정기", "매월"];

export const initialSemiFixedExpenses: SemiFixedExpenseItem[] = [
  {
    id: "chicken-breast",
    name: "닭가슴살 2kg",
    amount: 32000,
    billingCycle: "주1회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "단백질 식재료"
  },
  {
    id: "eggs",
    name: "계란 30구",
    amount: 8900,
    billingCycle: "주1회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "주간 보충"
  },
  {
    id: "milk",
    name: "우유 2L",
    amount: 6200,
    billingCycle: "주1회",
    nextPaymentDate: "2026-06-14",
    apiLinked: false,
    smartPricing: false,
    status: "watch",
    note: "아침용"
  },
  {
    id: "detergent",
    name: "세제",
    amount: 21000,
    billingCycle: "2주1회",
    nextPaymentDate: "2026-06-17",
    apiLinked: false,
    smartPricing: false,
    status: "watch",
    note: "생활용품 보충"
  },
  {
    id: "delivery",
    name: "배달음식",
    amount: 96000,
    billingCycle: "비정기",
    nextPaymentDate: "2026-06-15",
    apiLinked: false,
    smartPricing: false,
    status: "active",
    note: "변동성이 큰 식비 예산"
  },
  {
    id: "cleaning-paper",
    name: "청소용품",
    amount: 17000,
    billingCycle: "2주1회",
    nextPaymentDate: "2026-06-17",
    apiLinked: false,
    smartPricing: false,
    status: "watch",
    note: "화장실/주방 청소"
  },
  {
    id: "coffee",
    name: "커피",
    amount: 24000,
    billingCycle: "매일",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "작지만 잦은 소비"
  }
];
