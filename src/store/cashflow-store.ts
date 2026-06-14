"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  initialSemiFixedExpenses,
  type BillingCycle,
  type SemiFixedExpenseItem
} from "@/features/cashflow-setup/cashflow-types";

export type FixedExpenseItem = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextPaymentDate: string;
  note: string;
};

export type RecurringIncomeItem = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextPaymentDate: string;
  note: string;
  autoInclude: boolean;
};

export type UpcomingExpenseItem = {
  title: string;
  dueInDays: number;
  amount: number;
  category: string;
};

export type RecentTransactionItem = {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  type: "expense" | "income";
};

export type CashflowEvent = {
  day: number;
  cash: number;
  outgoing: number;
};

export type CashflowSummary = {
  currentBalance: number;
  upcomingSpend: number;
  recurringIncomeThisMonth: number;
  availableCash: number;
  forecastMonthEndBalance: number;
  budgetUsage: number;
  plannedExpensesThisMonth: number;
};

const initialStartingBalance = 842000;
const monthlyBudgetLimit = 781250;
const storageKey = "pocketflow-cashflow-store";

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
    note: "공과금/세대비 포함"
  },
  {
    id: "phone",
    name: "통신비",
    amount: 55000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-15",
    note: "기본 요금"
  },
  {
    id: "internet",
    name: "인터넷",
    amount: 33000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-20",
    note: "집 고정 인터넷 비용"
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

const initialRecurringIncomes: RecurringIncomeItem[] = [
  {
    id: "part-time",
    name: "아르바이트",
    amount: 420000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-25",
    note: "매월 정해진 수입",
    autoInclude: true
  },
  {
    id: "allowance",
    name: "용돈",
    amount: 100000,
    billingCycle: "매월",
    nextPaymentDate: "2026-06-20",
    note: "정기적으로 받는 생활비",
    autoInclude: true
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

const initialRecentTransactions: RecentTransactionItem[] = [
  {
    id: "transport-2026-06-06",
    date: "2026-06-06",
    name: "출근 교통비",
    category: "교통비",
    amount: 12000,
    type: "expense"
  },
  {
    id: "parttime-2026-06-06",
    date: "2026-06-06",
    name: "아르바이트 급여",
    category: "수입",
    amount: 48000,
    type: "income"
  },
  {
    id: "transport-2026-06-05",
    date: "2026-06-05",
    name: "교통비",
    category: "교통비",
    amount: 3200,
    type: "expense"
  },
  {
    id: "allowance-2026-06-05",
    date: "2026-06-05",
    name: "용돈",
    category: "기타 수입",
    amount: 15600,
    type: "income"
  },
  {
    id: "america-2026-06-04",
    date: "2026-06-04",
    name: "아메리카노",
    category: "식비",
    amount: 4500,
    type: "expense"
  }
];

function getRecentTransactionNet(transactions: RecentTransactionItem[]) {
  return transactions.reduce((sum, transaction) => {
    return transaction.type === "income" ? sum + transaction.amount : sum - transaction.amount;
  }, 0);
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isLastDayOfMonth(date: Date) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return date.getDate() === lastDay;
}

function addCalendarMonths(date: Date, months: number) {
  const next = new Date(date);
  const isEndOfMonth = isLastDayOfMonth(next);
  const originalDay = next.getDate();

  next.setDate(1);
  next.setMonth(next.getMonth() + months);

  const lastDayOfTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(isEndOfMonth ? lastDayOfTargetMonth : Math.min(originalDay, lastDayOfTargetMonth));

  return next;
}

function normalizeBillingCycle(value: string): BillingCycle {
  switch (value) {
    case "주1":
      return "주 1회";
    case "2주":
      return "2주 1회";
    default:
      return value as BillingCycle;
  }
}

function advanceByBillingCycle(date: Date, billingCycle: string) {
  const next = new Date(date);
  const normalizedBillingCycle = normalizeBillingCycle(billingCycle);

  switch (normalizedBillingCycle) {
    case "매일":
      next.setDate(next.getDate() + 1);
      return next;
    case "주2~3회":
      next.setDate(next.getDate() + 3);
      return next;
    case "주 1회":
      next.setDate(next.getDate() + 7);
      return next;
    case "2주 1회":
      next.setDate(next.getDate() + 14);
      return next;
    case "매월":
      return addCalendarMonths(next, 1);
    case "두달":
      return addCalendarMonths(next, 2);
    default:
      return next;
  }
}

function advanceToNextDueDate(nextPaymentDate: string, billingCycle: string, today: string) {
  const normalizedBillingCycle = normalizeBillingCycle(billingCycle);

  if (normalizedBillingCycle === "비정기") {
    return nextPaymentDate;
  }

  let nextDate = parseLocalDate(nextPaymentDate);
  const todayDate = parseLocalDate(today);

  while (nextDate <= todayDate) {
    const advanced = advanceByBillingCycle(nextDate, normalizedBillingCycle);
    if (advanced.getTime() === nextDate.getTime()) {
      break;
    }

    nextDate = advanced;
  }

  return formatLocalDate(nextDate);
}

function syncRecurringDates<T extends { billingCycle: string; nextPaymentDate: string }>(
  items: T[],
  today: string
) {
  return items.map((item) => ({
    ...item,
    nextPaymentDate: advanceToNextDueDate(item.nextPaymentDate, item.billingCycle, today)
  }));
}

function buildCashflowSummary(
  baseBalance: number,
  upcomingExpenses: UpcomingExpenseItem[],
  recurringIncomes: RecurringIncomeItem[],
  fixedExpenses: FixedExpenseItem[],
  semiFixedExpenses: SemiFixedExpenseItem[],
  recentTransactions: RecentTransactionItem[]
): CashflowSummary {
  const actualBalance = baseBalance + getRecentTransactionNet(recentTransactions);
  const upcomingSpend = 0;
  const recurringIncomeThisMonth = recurringIncomes
    .filter((income) => income.autoInclude)
    .reduce((sum, income) => sum + income.amount, 0);
  const plannedExpensesThisMonth =
    fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
    semiFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const availableCash = actualBalance;
  const forecastMonthEndBalance = actualBalance + recurringIncomeThisMonth - plannedExpensesThisMonth;
  const budgetUsage = Math.round((plannedExpensesThisMonth / monthlyBudgetLimit) * 100);

  return {
    currentBalance: actualBalance,
    upcomingSpend,
    recurringIncomeThisMonth,
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

type ScheduledCashflowItem = {
  name: string;
  amount: number;
  billingCycle: string;
  nextPaymentDate: string;
  kind: "income" | "expense";
};

export type ForecastCashflowPoint = {
  day: number;
  date: string;
  incoming: number;
  outgoing: number;
  net: number;
  cash: number;
};

export type RollingCashflowMetrics = {
  forecastSeries: ForecastCashflowPoint[];
  totalIncoming: number;
  totalOutgoing: number;
  plannedOutgoing: number;
  forecastBalanceAfter30Days: number;
  minimumBalanceAfter30Days: number;
  minimumBalanceDay: number;
  safeAvailableAmount: number;
};

export function buildForecastCashflowSeries({
  startingBalance,
  recurringIncomes,
  fixedExpenses,
  semiFixedExpenses,
  horizonDays = 30,
  startDate = getLocalDateString()
}: {
  startingBalance: number;
  recurringIncomes: RecurringIncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  horizonDays?: number;
  startDate?: string;
}): ForecastCashflowPoint[] {
  const endDate = parseLocalDate(startDate);
  endDate.setDate(endDate.getDate() + horizonDays - 1);

  const dailyIncoming = new Map<number, number>();
  const dailyOutgoing = new Map<number, number>();
  const items: ScheduledCashflowItem[] = [
    ...recurringIncomes.map((item) => ({ ...item, kind: "income" as const })),
    ...fixedExpenses.map((item) => ({ ...item, kind: "expense" as const })),
    ...semiFixedExpenses.map((item) => ({ ...item, kind: "expense" as const }))
  ];

  for (const item of items) {
    let currentDate = parseLocalDate(item.nextPaymentDate);

    while (currentDate <= endDate) {
      if (currentDate >= parseLocalDate(startDate)) {
        const dayIndex =
          Math.floor((currentDate.getTime() - parseLocalDate(startDate).getTime()) / 86400000) + 1;

        if (dayIndex >= 1 && dayIndex <= horizonDays) {
          if (item.kind === "income") {
            dailyIncoming.set(dayIndex, (dailyIncoming.get(dayIndex) ?? 0) + item.amount);
          } else {
            dailyOutgoing.set(dayIndex, (dailyOutgoing.get(dayIndex) ?? 0) + item.amount);
          }
        }
      }

      const advanced = advanceByBillingCycle(currentDate, item.billingCycle);
      if (advanced.getTime() === currentDate.getTime()) {
        break;
      }

      currentDate = advanced;
    }
  }

  let runningCash = startingBalance;
  const series: ForecastCashflowPoint[] = [];
  const startDateObject = parseLocalDate(startDate);

  for (let day = 1; day <= horizonDays; day += 1) {
    const incoming = dailyIncoming.get(day) ?? 0;
    const outgoing = dailyOutgoing.get(day) ?? 0;
    const net = incoming - outgoing;
    runningCash += net;

    const pointDate = new Date(startDateObject);
    pointDate.setDate(pointDate.getDate() + day - 1);

    series.push({
      day,
      date: formatLocalDate(pointDate),
      incoming,
      outgoing,
      net,
      cash: runningCash
    });
  }

  return series;
}

export function buildRollingCashflowSeries({
  startingBalance,
  recurringIncomes,
  fixedExpenses,
  semiFixedExpenses,
  horizonDays = 30,
  startDate = getLocalDateString()
}: {
  startingBalance: number;
  recurringIncomes: RecurringIncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  horizonDays?: number;
  startDate?: string;
}): ForecastCashflowPoint[] {
  const endDate = parseLocalDate(startDate);
  endDate.setDate(endDate.getDate() + horizonDays - 1);

  const dailyIncoming = new Map<number, number>();
  const dailyOutgoing = new Map<number, number>();
  const startDateObject = parseLocalDate(startDate);
  const scheduledItems: ScheduledCashflowItem[] = [
    ...recurringIncomes.map((item) => ({ ...item, kind: "income" as const })),
    ...fixedExpenses.map((item) => ({ ...item, kind: "expense" as const })),
    ...semiFixedExpenses.map((item) => ({ ...item, kind: "expense" as const }))
  ];

  for (const item of scheduledItems) {
    let currentDate = parseLocalDate(item.nextPaymentDate);

    while (currentDate <= endDate) {
      if (currentDate >= startDateObject) {
        const dayIndex =
          Math.floor((currentDate.getTime() - startDateObject.getTime()) / 86400000) + 1;

        if (dayIndex >= 1 && dayIndex <= horizonDays) {
          if (item.kind === "income") {
            dailyIncoming.set(dayIndex, (dailyIncoming.get(dayIndex) ?? 0) + item.amount);
          } else {
            dailyOutgoing.set(dayIndex, (dailyOutgoing.get(dayIndex) ?? 0) + item.amount);
          }
        }
      }

      const advanced = advanceByBillingCycle(currentDate, item.billingCycle);
      if (advanced.getTime() === currentDate.getTime()) {
        break;
      }

      currentDate = advanced;
    }
  }

  let runningCash = startingBalance;
  const series: ForecastCashflowPoint[] = [];

  for (let day = 1; day <= horizonDays; day += 1) {
    const incoming = dailyIncoming.get(day) ?? 0;
    const outgoing = dailyOutgoing.get(day) ?? 0;
    const net = incoming - outgoing;
    runningCash += net;

    const pointDate = new Date(startDateObject);
    pointDate.setDate(pointDate.getDate() + day - 1);

    series.push({
      day,
      date: formatLocalDate(pointDate),
      incoming,
      outgoing,
      net,
      cash: runningCash
    });
  }

  return series;
}

export function buildRollingCashflowMetrics({
  startingBalance,
  recurringIncomes,
  fixedExpenses,
  semiFixedExpenses,
  horizonDays = 30,
  startDate = getLocalDateString()
}: {
  startingBalance: number;
  recurringIncomes: RecurringIncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  horizonDays?: number;
  startDate?: string;
}): RollingCashflowMetrics {
  const forecastSeries = buildRollingCashflowSeries({
    startingBalance,
    recurringIncomes,
    fixedExpenses,
    semiFixedExpenses,
    horizonDays,
    startDate
  });
  const lastPoint = forecastSeries.at(-1);
  const totalIncoming = forecastSeries.reduce((sum, point) => sum + point.incoming, 0);
  const totalOutgoing = forecastSeries.reduce((sum, point) => sum + point.outgoing, 0);
  const plannedOutgoing = totalOutgoing;
  const minimumPoint =
    forecastSeries.reduce<ForecastCashflowPoint | null>(
      (lowest, point) => (lowest === null || point.cash < lowest.cash ? point : lowest),
      null
    ) ?? {
      day: 0,
      date: startDate,
      incoming: 0,
      outgoing: 0,
      net: 0,
      cash: startingBalance
    };

  return {
    forecastSeries,
    totalIncoming,
    totalOutgoing,
    plannedOutgoing,
    forecastBalanceAfter30Days: lastPoint?.cash ?? startingBalance,
    minimumBalanceAfter30Days: minimumPoint.cash,
    minimumBalanceDay: minimumPoint.day,
    safeAvailableAmount: Math.max(0, minimumPoint.cash)
  };
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

function buildDerivedState(state: {
  startingBalance: number;
  upcomingExpenses: UpcomingExpenseItem[];
  recurringIncomes: RecurringIncomeItem[];
  fixedExpenses: FixedExpenseItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  recentTransactions: RecentTransactionItem[];
}) {
  const summary = buildCashflowSummary(
    state.startingBalance,
    state.upcomingExpenses,
    state.recurringIncomes,
    state.fixedExpenses,
    state.semiFixedExpenses,
    state.recentTransactions
  );
  const cashflowSeries = buildCashflowSeries(state.upcomingExpenses, summary.availableCash);
  const upcomingImpactRows = buildUpcomingImpactRows(state.upcomingExpenses, summary.availableCash);

  return {
    summary,
    cashflowSeries,
    upcomingImpactRows
  };
}

type CashflowStoreState = {
  startingBalance: number;
  lastCheckedDate: string;
  fixedExpenses: FixedExpenseItem[];
  recurringIncomes: RecurringIncomeItem[];
  semiFixedExpenses: SemiFixedExpenseItem[];
  recentTransactions: RecentTransactionItem[];
  selectedSemiFixedExpenseId: string;
  upcomingExpenses: UpcomingExpenseItem[];
  summary: CashflowSummary;
  cashflowSeries: CashflowEvent[];
  upcomingImpactRows: Array<UpcomingExpenseItem & { remainingCash: number }>;
  syncScheduledItems: (today?: string) => void;
  selectSemiFixedExpense: (id: string) => void;
  addRecentTransaction: (nextItem: RecentTransactionItem) => void;
  removeRecentTransaction: (id: string) => void;
  addFixedExpense: (nextItem: FixedExpenseItem) => void;
  removeFixedExpense: (id: string) => void;
  addRecurringIncome: (nextItem: RecurringIncomeItem) => void;
  removeRecurringIncome: (id: string) => void;
  addSemiFixedExpense: (nextItem: SemiFixedExpenseItem) => void;
  removeSemiFixedExpense: (id: string) => void;
  updateFixedExpense: (nextItem: FixedExpenseItem) => void;
  updateRecurringIncome: (nextItem: RecurringIncomeItem) => void;
  updateSemiFixedExpense: (nextItem: SemiFixedExpenseItem) => void;
  setStartingBalance: (startingBalance: number) => void;
  confirmSemiFixedExpense: (
    id: string,
    confirmedAt?: string,
    actualAmount?: number
  ) => void;
};

export const useCashflowStore = create<CashflowStoreState>()(
  persist(
    (set, get) => {
      const semiFixedExpenses = initialSemiFixedExpenses;
      const recurringIncomes = initialRecurringIncomes;
      const derived = buildDerivedState({
        startingBalance: initialStartingBalance,
        upcomingExpenses: initialUpcomingExpenses,
        recurringIncomes,
        fixedExpenses: initialFixedExpenses,
        semiFixedExpenses,
        recentTransactions: initialRecentTransactions
      });

      return {
        startingBalance: initialStartingBalance,
        lastCheckedDate: getLocalDateString(),
        fixedExpenses: initialFixedExpenses,
        recurringIncomes,
        semiFixedExpenses,
        recentTransactions: initialRecentTransactions,
        selectedSemiFixedExpenseId: semiFixedExpenses[0].id,
        upcomingExpenses: initialUpcomingExpenses,
        summary: derived.summary,
        cashflowSeries: derived.cashflowSeries,
        upcomingImpactRows: derived.upcomingImpactRows,
        syncScheduledItems: (today = getLocalDateString()) =>
          set((state) => {
            if (state.lastCheckedDate === today) {
              return state;
            }

            const nextFixedExpenses = syncRecurringDates(state.fixedExpenses, today);
            const nextRecurringIncomes = syncRecurringDates(state.recurringIncomes, today);
            const nextDerived = buildDerivedState({
              startingBalance: state.startingBalance,
              upcomingExpenses: state.upcomingExpenses,
              recurringIncomes: nextRecurringIncomes,
              fixedExpenses: nextFixedExpenses,
              semiFixedExpenses: state.semiFixedExpenses,
              recentTransactions: state.recentTransactions
            });

            return {
              ...state,
              lastCheckedDate: today,
              fixedExpenses: nextFixedExpenses,
              recurringIncomes: nextRecurringIncomes,
              summary: nextDerived.summary,
              cashflowSeries: nextDerived.cashflowSeries,
              upcomingImpactRows: nextDerived.upcomingImpactRows
            };
          }),
    selectSemiFixedExpense: (id) =>
      set((state) => ({
        ...state,
        selectedSemiFixedExpenseId: id
      })),
    addRecentTransaction: (nextItem) =>
      set((state) => {
        const nextRecentTransactions = [nextItem, ...state.recentTransactions];
        const nextDerived = buildDerivedState({
          startingBalance: state.startingBalance,
          upcomingExpenses: state.upcomingExpenses,
          recurringIncomes: state.recurringIncomes,
          fixedExpenses: state.fixedExpenses,
          semiFixedExpenses: state.semiFixedExpenses,
          recentTransactions: nextRecentTransactions
        });

        return {
          ...state,
          recentTransactions: nextRecentTransactions,
          summary: nextDerived.summary,
          cashflowSeries: nextDerived.cashflowSeries,
          upcomingImpactRows: nextDerived.upcomingImpactRows
        };
      }),
    removeRecentTransaction: (id) =>
      set((state) => {
        const nextRecentTransactions = state.recentTransactions.filter((item) => item.id !== id);
        const nextDerived = buildDerivedState({
          startingBalance: state.startingBalance,
          upcomingExpenses: state.upcomingExpenses,
          recurringIncomes: state.recurringIncomes,
          fixedExpenses: state.fixedExpenses,
          semiFixedExpenses: state.semiFixedExpenses,
          recentTransactions: nextRecentTransactions
        });

        return {
          ...state,
          recentTransactions: nextRecentTransactions,
          summary: nextDerived.summary,
          cashflowSeries: nextDerived.cashflowSeries,
          upcomingImpactRows: nextDerived.upcomingImpactRows
        };
      }),
    addFixedExpense: (nextItem) =>
      set((state) => {
        const nextFixedExpenses = [...state.fixedExpenses, nextItem];
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          state.recurringIncomes,
          nextFixedExpenses,
          state.semiFixedExpenses,
          state.recentTransactions
        );
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
          fixedExpenses: nextFixedExpenses,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      }),
    removeFixedExpense: (id) =>
      set((state) => {
        const nextFixedExpenses = state.fixedExpenses.filter((item) => item.id !== id);
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          state.recurringIncomes,
          nextFixedExpenses,
          state.semiFixedExpenses,
          state.recentTransactions
        );
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
          fixedExpenses: nextFixedExpenses,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      }),
    addRecurringIncome: (nextItem) =>
      set((state) => {
        const nextRecurringIncomes = [...state.recurringIncomes, nextItem];
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          nextRecurringIncomes,
          state.fixedExpenses,
          state.semiFixedExpenses,
          state.recentTransactions
        );
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
          recurringIncomes: nextRecurringIncomes,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      }),
    removeRecurringIncome: (id) =>
      set((state) => {
        const nextRecurringIncomes = state.recurringIncomes.filter((item) => item.id !== id);
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          nextRecurringIncomes,
          state.fixedExpenses,
          state.semiFixedExpenses,
          state.recentTransactions
        );
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
          recurringIncomes: nextRecurringIncomes,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      }),
    addSemiFixedExpense: (nextItem) =>
      set((state) => {
        const nextSemiFixedExpenses = [...state.semiFixedExpenses, nextItem];
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          state.recurringIncomes,
          state.fixedExpenses,
          nextSemiFixedExpenses,
          state.recentTransactions
        );
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
      }),
    removeSemiFixedExpense: (id) =>
      set((state) => {
        const nextSemiFixedExpenses = state.semiFixedExpenses.filter((item) => item.id !== id);
        const nextSelectedId =
          state.selectedSemiFixedExpenseId === id
            ? nextSemiFixedExpenses[0]?.id ?? ""
            : state.selectedSemiFixedExpenseId;
        const nextSummary = buildCashflowSummary(
          state.startingBalance,
          state.upcomingExpenses,
          state.recurringIncomes,
          state.fixedExpenses,
          nextSemiFixedExpenses,
          state.recentTransactions
        );
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
          selectedSemiFixedExpenseId: nextSelectedId,
          summary: nextSummary,
          cashflowSeries: nextCashflowSeries,
          upcomingImpactRows: nextUpcomingImpactRows
        };
      }),
        updateFixedExpense: (nextItem) =>
          set((state) => {
            const nextFixedExpenses = state.fixedExpenses.map((item) =>
              item.id === nextItem.id ? nextItem : item
            );
            const nextSummary = buildCashflowSummary(
              state.startingBalance,
              state.upcomingExpenses,
              state.recurringIncomes,
              nextFixedExpenses,
              state.semiFixedExpenses,
              state.recentTransactions
            );
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
              fixedExpenses: nextFixedExpenses,
              summary: nextSummary,
              cashflowSeries: nextCashflowSeries,
              upcomingImpactRows: nextUpcomingImpactRows
            };
          }),
        updateRecurringIncome: (nextItem) =>
          set((state) => {
            const nextRecurringIncomes = state.recurringIncomes.map((item) =>
              item.id === nextItem.id ? nextItem : item
            );
            const nextDerived = buildDerivedState({
              startingBalance: state.startingBalance,
              upcomingExpenses: state.upcomingExpenses,
              recurringIncomes: nextRecurringIncomes,
              fixedExpenses: state.fixedExpenses,
              semiFixedExpenses: state.semiFixedExpenses,
              recentTransactions: state.recentTransactions
            });

            return {
              ...state,
              recurringIncomes: nextRecurringIncomes,
              summary: nextDerived.summary,
              cashflowSeries: nextDerived.cashflowSeries,
              upcomingImpactRows: nextDerived.upcomingImpactRows
            };
          }),
        updateSemiFixedExpense: (nextItem) =>
          set((state) => {
            const nextSemiFixedExpenses = state.semiFixedExpenses.map((item) =>
              item.id === nextItem.id ? nextItem : item
            );
            const nextDerived = buildDerivedState({
              startingBalance: state.startingBalance,
              upcomingExpenses: state.upcomingExpenses,
              recurringIncomes: state.recurringIncomes,
              fixedExpenses: state.fixedExpenses,
              semiFixedExpenses: nextSemiFixedExpenses,
              recentTransactions: state.recentTransactions
            });

            return {
              ...state,
              semiFixedExpenses: nextSemiFixedExpenses,
              summary: nextDerived.summary,
              cashflowSeries: nextDerived.cashflowSeries,
              upcomingImpactRows: nextDerived.upcomingImpactRows
            };
          }),
        setStartingBalance: (startingBalance) =>
          set((state) => {
            const nextDerived = buildDerivedState({
              startingBalance,
              upcomingExpenses: state.upcomingExpenses,
              recurringIncomes: state.recurringIncomes,
              fixedExpenses: state.fixedExpenses,
              semiFixedExpenses: state.semiFixedExpenses,
              recentTransactions: state.recentTransactions
            });

            return {
              ...state,
              startingBalance,
              summary: nextDerived.summary,
              cashflowSeries: nextDerived.cashflowSeries,
              upcomingImpactRows: nextDerived.upcomingImpactRows
            };
          }),
        confirmSemiFixedExpense: (id, confirmedAt = getLocalDateString(), actualAmount) =>
          set((state) => {
            const nextSemiFixedExpenses = state.semiFixedExpenses.map((item) => {
              if (item.id !== id) {
                return item;
              }

              return {
                ...item,
                amount: typeof actualAmount === "number" ? actualAmount : item.amount,
                nextPaymentDate: advanceToNextDueDate(
                  item.nextPaymentDate,
                  item.billingCycle,
                  confirmedAt
                )
              };
            });
            const nextDerived = buildDerivedState({
              startingBalance: state.startingBalance,
              upcomingExpenses: state.upcomingExpenses,
              recurringIncomes: state.recurringIncomes,
              fixedExpenses: state.fixedExpenses,
              semiFixedExpenses: nextSemiFixedExpenses,
              recentTransactions: state.recentTransactions
            });

            return {
              ...state,
              semiFixedExpenses: nextSemiFixedExpenses,
              summary: nextDerived.summary,
              cashflowSeries: nextDerived.cashflowSeries,
              upcomingImpactRows: nextDerived.upcomingImpactRows
            };
          })
      };
    },
    {
      name: storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        startingBalance: state.startingBalance,
        lastCheckedDate: state.lastCheckedDate,
        fixedExpenses: state.fixedExpenses,
        recurringIncomes: state.recurringIncomes,
        semiFixedExpenses: state.semiFixedExpenses,
        recentTransactions: state.recentTransactions,
        selectedSemiFixedExpenseId: state.selectedSemiFixedExpenseId,
        upcomingExpenses: state.upcomingExpenses
      }),
      merge: (persistedState, currentState) => {
        const normalizedPersistedState: Partial<CashflowStoreState> = persistedState
          ? {
              ...(persistedState as Partial<CashflowStoreState>),
              fixedExpenses: (persistedState as Partial<CashflowStoreState>).fixedExpenses?.map(
                (item) => ({
                  ...item,
                  billingCycle: normalizeBillingCycle(item.billingCycle)
                })
              ),
              recurringIncomes: (persistedState as Partial<CashflowStoreState>).recurringIncomes?.map(
                (item) => ({
                  ...item,
                  billingCycle: normalizeBillingCycle(item.billingCycle)
                })
              ),
              semiFixedExpenses: (persistedState as Partial<CashflowStoreState>).semiFixedExpenses?.map(
                (item) => ({
                  ...item,
                  billingCycle: normalizeBillingCycle(item.billingCycle)
                })
              )
            }
          : {};
        const merged = {
          ...currentState,
          ...normalizedPersistedState
        };
        const derived = buildDerivedState(merged);

        return {
          ...merged,
          summary: derived.summary,
          cashflowSeries: derived.cashflowSeries,
          upcomingImpactRows: derived.upcomingImpactRows
        };
      }
    }
  )
);

export function getCashflowSummary(state = useCashflowStore.getState()) {
  return state.summary;
}

export function getCashflowSeries(state = useCashflowStore.getState()) {
  return state.cashflowSeries;
}

export function getUpcomingImpactRows(state = useCashflowStore.getState()) {
  return state.upcomingImpactRows;
}

