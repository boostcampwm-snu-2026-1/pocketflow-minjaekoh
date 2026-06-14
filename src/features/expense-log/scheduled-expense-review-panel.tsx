"use client";

import { CheckCircle2, Clock3, PencilLine, Repeat2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

function parseAmount(value: string) {
  const nextAmount = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(nextAmount) && nextAmount > 0 ? Math.round(nextAmount) : null;
}

function ScheduledExpenseCard({
  item,
  onSaveAmount,
  onConfirm
}: {
  item: SemiFixedExpenseItem;
  onSaveAmount: (item: SemiFixedExpenseItem, amount: number) => void;
  onConfirm: (item: SemiFixedExpenseItem, amount: number) => void;
}) {
  const [draftAmount, setDraftAmount] = useState(String(item.amount));
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraftAmount(String(item.amount));
    setNotice(null);
  }, [item.amount, item.id]);

  const parsedAmount = useMemo(() => parseAmount(draftAmount), [draftAmount]);

  return (
    <article className="rounded-xl border border-border/70 bg-background p-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2">
              <PencilLine className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">금액</span>
              <input
                type="text"
                inputMode="numeric"
                value={draftAmount}
                onChange={(event) => {
                  setDraftAmount(event.target.value.replace(/[^\d]/g, ""));
                  setNotice(null);
                }}
                className="w-28 bg-transparent text-sm font-medium text-foreground outline-none"
                aria-label={`${item.name} 금액`}
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (parsedAmount === null) {
                  setNotice("금액을 숫자로 입력해 주세요.");
                  return;
                }

                onSaveAmount(item, parsedAmount);
                setNotice(`금액을 ${formatWon(parsedAmount)}로 저장했습니다.`);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Save className="h-4 w-4" />
              금액 수정
            </button>
          </div>

          {notice ? (
            <p className="text-xs text-muted-foreground">{notice}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{formatWon(item.amount)}</span>
          <button
            type="button"
            onClick={() => {
              const nextAmount = parsedAmount ?? item.amount;
              onConfirm(item, nextAmount);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            결제 완료
          </button>
        </div>
      </div>
    </article>
  );
}

export function ScheduledExpenseReviewPanel({
  onConfirm
}: ScheduledExpenseReviewPanelProps) {
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const updateSemiFixedExpense = useCashflowStore((state) => state.updateSemiFixedExpense);
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
              정기 지출이 도래한 항목들을 결제 전에 확인하고, 금액이 바뀌었으면 여기서 바로 반영할 수 있습니다.
            </p>
          </div>

          <div className="rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground">
            오늘 처리할 항목 {dueItems.length}개 / {formatWon(totalAmount)}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {dueItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
              오늘 확인할 예정 항목이 없습니다.
            </div>
          ) : (
            dueItems.map((item) => (
              <ScheduledExpenseCard
                key={item.id}
                item={item}
                onSaveAmount={(nextItem, amount) => {
                  updateSemiFixedExpense({
                    ...nextItem,
                    amount
                  });
                }}
                onConfirm={(nextItem, amount) => {
                  const confirmedItem = {
                    ...nextItem,
                    amount
                  };
                  confirmSemiFixedExpense(nextItem.id, getToday(), amount);
                  onConfirm(confirmedItem);
                }}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
