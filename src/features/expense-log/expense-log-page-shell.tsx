"use client";

import { useMemo, useState } from "react";
import { AiPurchaseSimulatorPanel } from "./ai-purchase-simulator-panel";
import { RecentExpenseList } from "./recent-expense-list";
import { ScheduledExpenseReviewPanel } from "./scheduled-expense-review-panel";
import {
  type RecentTransactionItem,
  useCashflowStore
} from "@/store/cashflow-store";

type PurchaseSimulationContext = {
  itemName: string;
  price: number | "";
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createRecentTransactionId(prefix: string) {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

function formatRecentTransaction(transaction: RecentTransactionItem) {
  return {
    ...transaction,
    date: transaction.date.slice(5).replace("-", "/")
  };
}

export function ExpenseLogPageShell() {
  const [simulationContext, setSimulationContext] = useState<PurchaseSimulationContext>({
    itemName: "",
    price: ""
  });

  const transactions = useCashflowStore((state) => state.recentTransactions);
  const confirmSemiFixedExpense = useCashflowStore((state) => state.confirmSemiFixedExpense);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const addRecentTransaction = useCashflowStore((state) => state.addRecentTransaction);
  const removeRecentTransaction = useCashflowStore((state) => state.removeRecentTransaction);

  const recentTransactions = useMemo(
    () => [...transactions].sort((left, right) => right.date.localeCompare(left.date)).map(formatRecentTransaction),
    [transactions]
  );

  function handleScheduledConfirm(item: { id: string; name: string; amount: number }) {
    const today = getToday();
    confirmSemiFixedExpense(item.id, today, item.amount);
    addRecentTransaction({
      id: createRecentTransactionId(`scheduled-${item.id}-${today}`),
      date: today,
      name: item.name,
      category: "중고정비",
      amount: item.amount,
      type: "expense"
    });
    setSimulationContext({ itemName: item.name, price: item.amount });
  }

  function handleBuyPurchase(purchase: {
    itemName: string;
    price: number;
    reason: string;
    verdict: "buy" | "hold" | "reject";
  }) {
    const today = getToday();
    const matchedItem = semiFixedExpenses.find(
      (item) => item.name === purchase.itemName && item.nextPaymentDate <= today
    );

    if (matchedItem) {
      confirmSemiFixedExpense(matchedItem.id, today, purchase.price);
    }

    addRecentTransaction({
      id: createRecentTransactionId(`purchase-${purchase.itemName}-${today}-${purchase.price}`),
      date: today,
      name: purchase.itemName,
      category: "변동비",
      amount: purchase.price,
      type: "expense"
    });
    setSimulationContext({ itemName: purchase.itemName, price: purchase.price });
  }

  function handleDeleteTransaction(id: string) {
    removeRecentTransaction(id);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-5 md:p-6">
        <p className="text-sm text-muted-foreground">Actual transactions</p>
        <h1 className="text-2xl font-bold text-foreground">가계부 기록</h1>
        <p className="mt-2 max-w-3xl whitespace-nowrap text-sm leading-6 text-muted-foreground">
          정기 지출과 예정 지출을 함께 확인하고, 그 외 비정기 지출도 실제 생활에 맞게 반영하는 화면입니다.
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
