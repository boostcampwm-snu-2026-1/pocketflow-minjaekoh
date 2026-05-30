"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Expense {
  id: string;
  date: Date;
  name: string;
  amount: number;
  category: string;
}

interface RecentExpensesProps {
  expenses: Expense[];
}

const categoryLabels: Record<string, string> = {
  food: "식비",
  transport: "교통비",
  living: "생활용품",
  entertainment: "유흥",
  subscription: "구독료",
  etc: "기타",
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount) + "원";
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold text-card-foreground">
        최근 지출 내역
      </h2>

      <div className="flex flex-col gap-3">
        {expenses.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            아직 등록된 지출이 없습니다.
          </p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {expense.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {categoryLabels[expense.category] || expense.category}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="text-xs text-muted-foreground">
                    {format(expense.date, "M월 d일", { locale: ko })}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatAmount(expense.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
