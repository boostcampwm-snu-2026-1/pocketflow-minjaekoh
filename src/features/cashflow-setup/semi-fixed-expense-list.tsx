"use client";

import { useMemo } from "react";
import type { ComponentType } from "react";
import { CircleDollarSign, Link2, PencilLine, RefreshCcw, ShoppingBasket, Trash2 } from "lucide-react";
import { buildRollingCashflowMetrics } from "@/store/cashflow-store";
import type { BillingCycle, SemiFixedExpenseItem } from "./cashflow-types";

type SemiFixedExpenseListProps = {
  items: SemiFixedExpenseItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRemoveItem: (id: string) => void;
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function getDaysRemaining(nextPaymentDate: string) {
  const target = new Date(`${nextPaymentDate}T00:00:00`);
  const today = new Date("2026-06-13T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

const cycleRank: Record<BillingCycle, number> = {
  매일: 0,
  "주2~3회": 1,
  "주 1회": 2,
  "2주 1회": 3,
  매월: 4,
  두달: 5,
  비정기: 6
};

function sortByCycleThenDate(left: SemiFixedExpenseItem, right: SemiFixedExpenseItem) {
  const leftRank = cycleRank[left.billingCycle];
  const rightRank = cycleRank[right.billingCycle];
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const leftDate = new Date(`${left.nextPaymentDate}T00:00:00`).getTime();
  const rightDate = new Date(`${right.nextPaymentDate}T00:00:00`).getTime();
  if (leftDate !== rightDate) {
    return leftDate - rightDate;
  }

  return right.amount - left.amount;
}

export function SemiFixedExpenseList({
  items,
  selectedId,
  onSelect,
  onRemoveItem
}: SemiFixedExpenseListProps) {
  const rolling = useMemo(
    () =>
      buildRollingCashflowMetrics({
        startingBalance: 0,
        recurringIncomes: [],
        fixedExpenses: [],
        semiFixedExpenses: items,
        horizonDays: 30
      }),
    [items]
  );

  const dueSoonCount = items.filter((item) => getDaysRemaining(item.nextPaymentDate) <= 7).length;
  const sortedItems = useMemo(() => [...items].sort(sortByCycleThenDate), [items]);
  const shouldScroll = sortedItems.length >= 5;

  return (
    <section aria-labelledby="semi-fixed-expense-heading" className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Budget system</p>
        <h2 id="semi-fixed-expense-heading" className="text-2xl font-bold">
          개별 생필품 내역
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard icon={CircleDollarSign} label="30일 예상 지출" value={formatWon(rolling.totalOutgoing)} />
        <MetricCard icon={RefreshCcw} label="7일 내 결제" value={`${dueSoonCount}건`} />
      </div>

      <div
        className={[
          "space-y-5",
          shouldScroll ? "max-h-[640px] overflow-y-auto pr-1" : ""
        ].join(" ")}
      >
        {sortedItems.map((item) => {
          const daysRemaining = getDaysRemaining(item.nextPaymentDate);
          const isSelected = item.id === selectedId;

          return (
            <article
              key={item.id}
              className={[
                "overflow-hidden rounded-xl border bg-card px-4 py-5 transition-colors",
                isSelected ? "ring-1 ring-primary/30" : ""
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium">
                      {item.billingCycle}
                    </span>
                    <span>{formatDate(item.nextPaymentDate)}</span>
                  </div>
                </button>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:min-w-56 sm:flex-col sm:items-end">
                  <div className="text-sm font-medium text-foreground">{formatWon(item.amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    {daysRemaining <= 0 ? "오늘" : `D-${daysRemaining}`}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      <PencilLine className="h-4 w-4" />
                      선택
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
