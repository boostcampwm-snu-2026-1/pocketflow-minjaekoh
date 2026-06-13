"use client";

import { useMemo, useState } from "react";
import { AiPurchaseSimulatorPanel } from "./ai-purchase-simulator-panel";
import { RecentExpenseList } from "./recent-expense-list";
import { ScheduledExpenseReviewPanel } from "./scheduled-expense-review-panel";
import { useCashflowStore } from "@/store/cashflow-store";

type TransactionItem = {
  date: string;
  name: string;
  category: string;
  amount: number;
  type: "expense" | "income";
};

const initialTransactions: TransactionItem[] = [
  {
    date: "2026-06-06",
    name: "치킨 배달",
    category: "식비",
    amount: 12000,
    type: "expense"
  },
  {
    date: "2026-06-06",
    name: "아르바이트 입금",
    category: "용돈",
    amount: 48000,
    type: "income"
  },
  {
    date: "2026-06-05",
    name: "교통비",
    category: "교통비",
    amount: 3200,
    type: "expense"
  }
];

type PurchaseSimulationContext = {
  itemName: string;
  price: number;
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ExpenseLogPageShell() {
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [simulationContext, setSimulationContext] = useState<PurchaseSimulationContext>({
    itemName: "무선 이어폰",
    price: 129000
  });

  const confirmSemiFixedExpense = useCashflowStore(
    (state) => state.confirmSemiFixedExpense
  );
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((left, right) => right.date.localeCompare(left.date))
        .map((transaction) => ({
          ...transaction,
          date: transaction.date.slice(5).replace("-", "/")
        })),
    [transactions]
  );

  function handleScheduledConfirm(item: { id: string; name: string; amount: number }) {
    const today = getToday();
    confirmSemiFixedExpense(item.id, today, item.amount);
    setTransactions((current) => [
      {
        date: today,
        name: item.name,
        category: "준고정비",
        amount: item.amount,
        type: "expense"
      },
      ...current
    ]);
    setSimulationContext({ itemName: item.name, price: item.amount });
  }

  function handleBuyPurchase(purchase: {
    itemName: string;
    price: number;
    reason: string;
    verdict: "buy" | "hold" | "reject";
  }) {
    const matchedItem = semiFixedExpenses.find(
      (item) => item.name === purchase.itemName && item.nextPaymentDate <= getToday()
    );

    if (matchedItem) {
      confirmSemiFixedExpense(matchedItem.id, getToday(), purchase.price);
    }

    setTransactions((current) => [
      {
        date: getToday(),
        name: purchase.itemName,
        category: "변동비",
        amount: purchase.price,
        type: "expense"
      },
      ...current
    ]);
    setSimulationContext({ itemName: purchase.itemName, price: purchase.price });
  }

  function handleDeleteTransaction(index: number) {
    setTransactions((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-5 md:p-6">
        <p className="text-sm text-muted-foreground">Actual transactions</p>
        <h1 className="text-2xl font-bold text-foreground">가계부 기록</h1>
        <p className="mt-2 max-w-3xl whitespace-nowrap text-sm leading-6 text-muted-foreground">
          정기지출은 예정된 지출 확인 항목에서 처리하고, 그 외 비정기 지출은 소비 판정실의 판정을 거쳐
          사용자의 최종 선택으로 반영됩니다.
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-8">
          <ScheduledExpenseReviewPanel onConfirm={handleScheduledConfirm} />
          <RecentExpenseList expenses={recentTransactions} onDelete={handleDeleteTransaction} />
        </div>

        <AiPurchaseSimulatorPanel
          currentItemName={simulationContext.itemName}
          currentPrice={simulationContext.price}
          onBuy={handleBuyPurchase}
        />
      </div>
    </div>
  );
}
