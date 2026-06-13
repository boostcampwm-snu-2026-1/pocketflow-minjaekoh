"use client";

import { useMemo, useState } from "react";
import { AiPurchaseSimulatorPanel } from "./ai-purchase-simulator-panel";
import { ExpenseEntryForm } from "./expense-entry-form";
import { RecentExpenseList } from "./recent-expense-list";

type ExpenseItem = {
  date: string;
  name: string;
  category: string;
  amount: number;
};

const initialExpenses: ExpenseItem[] = [
  {
    date: "2026-06-06",
    name: "치킨 배달",
    category: "음식",
    amount: 12000
  },
  {
    date: "2026-06-06",
    name: "편의점 간식",
    category: "식비",
    amount: 4800
  },
  {
    date: "2026-06-05",
    name: "교통비",
    category: "교통비",
    amount: 3200
  }
];

type PurchaseSimulationContext = {
  itemName: string;
  price: number;
};

export function ExpenseLogPageShell() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [simulationContext, setSimulationContext] =
    useState<PurchaseSimulationContext>({
      itemName: "무선 이어폰",
      price: 129000
    });

  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((left, right) => right.date.localeCompare(left.date))
        .map((expense) => ({
          ...expense,
          date: expense.date.slice(5).replace("-", "/")
        })),
    [expenses]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="space-y-8">
        <ExpenseEntryForm
          onSubmitSimulationHint={(expense) => {
            setExpenses((current) => [expense, ...current]);
            setSimulationContext({
              itemName: expense.name,
              price: expense.amount
            });
          }}
        />
        <RecentExpenseList expenses={recentExpenses} />
      </div>

      <AiPurchaseSimulatorPanel
        currentItemName={simulationContext.itemName}
        currentPrice={simulationContext.price}
      />
    </div>
  );
}
