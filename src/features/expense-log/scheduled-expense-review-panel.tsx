"use client";

import { CheckCircle2, Clock3, Repeat2 } from "lucide-react";
import { useMemo } from "react";
import { useCashflowStore } from "@/store/cashflow-store";
import type { SemiFixedExpenseItem } from "@/features/cashflow-setup/cashflow-types";

type ScheduledExpenseReviewPanelProps = {
  onConfirm: (item: SemiFixedExpenseItem) => void;
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

export function ScheduledExpenseReviewPanel({
  onConfirm
}: ScheduledExpenseReviewPanelProps) {
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const confirmSemiFixedExpense = useCashflowStore(
    (state) => state.confirmSemiFixedExpense
  );

  const dueItems = useMemo(() => {
    const today = getToday();

    return [...semiFixedExpenses]
      .filter((item) => item.nextPaymentDate <= today)
      .sort((left, right) => left.nextPaymentDate.localeCompare(right.nextPaymentDate));
  }, [semiFixedExpenses]);

  const totalAmount = dueItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section aria-labelledby="scheduled-expense-review-heading" className="space-y-4">
      <div className="rounded-xl border bg-card p-5 md:p-6">
        <p className="text-sm text-muted-foreground">Scheduled expense review</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="scheduled-expense-review-heading" className="text-xl font-semibold">
              예정된 지출 확인
            </h2>
            <p className="mt-2 max-w-2xl whitespace-nowrap text-sm leading-6 text-muted-foreground">
              정기 지출 시스템에서 설정한 항목의 지출 여부를 확정합니다.
            </p>
          </div>

          <div className="rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground">
            오늘 처리할 항목 {dueItems.length}건 / {formatWon(totalAmount)}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {dueItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
              오늘 확인할 예정 항목이 없습니다.
            </div>
          ) : (
            dueItems.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-border/70 bg-background p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-foreground">{item.name}</span>
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                        {item.billingCycle}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        다음 결제일 {formatDate(item.nextPaymentDate)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Repeat2 className="h-3.5 w-3.5" />
                        {item.note}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatWon(item.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        confirmSemiFixedExpense(item.id, getToday());
                        onConfirm(item);
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      결제 완료
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
