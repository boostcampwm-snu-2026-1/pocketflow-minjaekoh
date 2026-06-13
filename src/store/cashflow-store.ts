"use client";

import { create } from "zustand";
import { initialSemiFixedExpenses, type SemiFixedExpenseItem } from "@/features/cashflow-setup/cashflow-types";

export type FixedExpenseItem = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextPaymentDate: string;
  note: string;
};

export type UpcomingExpenseItem = {
  title: string;
  dueInDays: number;
  amount: number;
  category: string;
};

export type CashflowEvent = {
  day: number;
  cash: number;
  outgoing: number;
};

export type CashflowSummary = {
  currentBalance: number;
  upcomingSpend: number;
  availableCash: number;
  forecastMonthEndBalance: number;
  budgetUsage: number;
  plannedExpensesThisMonth: number;
};

const startingBalance = 842000;
const monthlyBudgetLimit = 781250;

const initialFixedExpenses: FixedExpenseItem[] = [
  {
    id: "rent",
    name: "월세",
    amount: 450000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-25",
    note: "가장 큰 고정지출"
  },
  {
    id: "maintenance",
    name: "관리비",
    amount: 82000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-18",
    note: "전기/수도 포함"
  },
  {
    id: "phone",
    name: "통신비",
    amount: 55000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-15",
    note: "기본 요금제"
  },
  {
    id: "internet",
    name: "인터넷",
    amount: 33000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-20",
    note: "집 고정 네트워크 비용"
  },
  {
    id: "insurance",
    name: "보험료",
    amount: 68000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-28",
    note: "자동이체"
  }
];

const initialUpcomingExpenses: UpcomingExpenseItem[] = [
  {
    title: "통신비",
    dueInDays: 2,
    amount: 55000,
    category: "고정비"
  },
  {
    title: "관리비",
    dueInDays: 4,
    amount: 78000,
    category: "고정비"
  },
  {
    title: "주방 생필품",
    dueInDays: 6,
    amount: 64000,
    category: "준고정비"
  },
  {
    title: "생활용품",
    dueInDays: 9,
    amount: 38000,
    category: "변동비"
  },
  {
    title: "보험료",
    dueInDays: 15,
    amount: 50000,
    category: "고정비"
  }
];

function buildCashflowSummary(
  baseBalance: number,
  upcomingExpenses: UpcomingExpenseItem[]
): CashflowSummary {
  const upcomingSpend = upcomingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const plannedExpensesThisMonth = 500000;
  const availableCash = baseBalance - upcomingSpend;
  const forecastMonthEndBalance = baseBalance - plannedExpensesThisMonth;
  const budgetUsage = Math.round((plannedExpensesThisMonth / monthlyBudgetLimit) * 100);

  return {
    currentBalance: baseBalance,
    upcomingSpend,
    availableCash,
    forecastMonthEndBalance,
    budgetUsage,
    plannedExpensesThisMonth
  };
}

export function buildCashflowSeries(
  upcomingExpenses: UpcomingExpenseItem[],
  baseCash = 557000
): CashflowEvent[] {
  const dailyOutgoing = new Map<number, number>();

  for (const expense of upcomingExpenses) {
    dailyOutgoing.set(
      expense.dueInDays,
      (dailyOutgoing.get(expense.dueInDays) ?? 0) + expense.amount
    );
  }

  let runningCash = baseCash;
  const series: CashflowEvent[] = [];

  for (let day = 1; day <= 30; day += 1) {
    const outgoing = dailyOutgoing.get(day) ?? 0;
    runningCash -= outgoing;

    series.push({
      day,
      cash: runningCash,
      outgoing
    });
  }

  return series;
}

function buildUpcomingImpactRows(
  upcomingExpenses: UpcomingExpenseItem[],
  baseCash = 557000
) {
  let remainingCash = baseCash;

  return upcomingExpenses.map((expense) => {
    remainingCash -= expense.amount;

    return {
      ...expense,
      remainingCash
    };
  });
}

type CashflowStoreState = {
  startingBalance: number;
  fixedExpenses: FixedExpenseItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  selectedSemiFixedExpenseId: string;
  upcomingExpenses: UpcomingExpenseItem[];
  summary: CashflowSummary;
  cashflowSeries: CashflowEvent[];
  upcomingImpactRows: Array<UpcomingExpenseItem & { remainingCash: number }>;
  selectSemiFixedExpense: (id: string) => void;
  updateSemiFixedExpense: (nextItem: SemiFixedExpenseItem) => void;
};

export const useCashflowStore = create<CashflowStoreState>((set, get) => {
  const semiFixedExpenses = initialSemiFixedExpenses;
  const summary = buildCashflowSummary(startingBalance, initialUpcomingExpenses);
  const cashflowSeries = buildCashflowSeries(initialUpcomingExpenses, summary.availableCash);
  const upcomingImpactRows = buildUpcomingImpactRows(
    initialUpcomingExpenses,
    summary.availableCash
  );

  return {
    startingBalance,
    fixedExpenses: initialFixedExpenses,
    semiFixedExpenses,
    selectedSemiFixedExpenseId: semiFixedExpenses[0].id,
    upcomingExpenses: initialUpcomingExpenses,
    summary,
    cashflowSeries,
    upcomingImpactRows,
    selectSemiFixedExpense: (id) =>
      set((state) => {
        const nextState = { ...state, selectedSemiFixedExpenseId: id };
        return nextState;
      }),
    updateSemiFixedExpense: (nextItem) =>
      set((state) => {
        const nextSemiFixedExpenses = state.semiFixedExpenses.map((item) =>
          item.id === nextItem.id ? nextItem : item
        );
        const nextSummary = buildCashflowSummary(state.startingBalance, state.upcomingExpenses);
        const nextCashflowSeries = buildCashflowSeries(
          state.upcomingExpenses,
          nextSummary.availableCash
        );
        const nextUpcomingImpactRows = buildUpcomingImpactRows(
          state.upcomingExpenses,
          nextSummary.availableCash
        );

        return {
          ...state,
          semiFixedExpenses: nextSemiFixedExpenses,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      })
  };
});

export function getCashflowSummary(state = useCashflowStore.getState()) {
  return state.summary;
}

export function getCashflowSeries(state = useCashflowStore.getState()) {
  return state.cashflowSeries;
}

export function getUpcomingImpactRows(state = useCashflowStore.getState()) {
  return state.upcomingImpactRows;
}

