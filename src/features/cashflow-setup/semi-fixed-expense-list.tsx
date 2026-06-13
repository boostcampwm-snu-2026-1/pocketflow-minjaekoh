"use client";

import {
  CircleDollarSign,
  Link2,
  RefreshCcw,
  ShoppingBasket
} from "lucide-react";
import type { SemiFixedExpenseItem } from "./cashflow-types";

type SemiFixedExpenseListProps = {
  items: SemiFixedExpenseItem[];
  selectedId: string;
  onSelect: (id: string) => void;
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

function getStatusTone(status: SemiFixedExpenseItem["status"]) {
  switch (status) {
    case "api-ready":
      return "border-sky-500/30 bg-sky-500/10 text-sky-500";
    case "watch":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    case "active":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

export function SemiFixedExpenseList({
  items,
  selectedId,
  onSelect
}: SemiFixedExpenseListProps) {
  const totalMonthly = items.reduce((sum, item) => sum + item.amount, 0);
  const apiLinkedCount = items.filter((item) => item.apiLinked || item.smartPricing).length;
  const dueSoonCount = items.filter((item) => getDaysRemaining(item.nextPaymentDate) <= 7).length;

  return (
    <section aria-labelledby="semi-fixed-expense-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Cashflow setup</p>
        <h2 id="semi-fixed-expense-heading" className="text-2xl font-bold">
          준고정비 주기적 생필품 리스트
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          장보기, 배달, 커피처럼 자주 나가지만 금액이 들쭉날쭉한 항목을 따로 모읍니다.
          항목을 누르면 오른쪽 상세 패널이 함께 바뀝니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="준고정비 월 환산"
          value={formatWon(totalMonthly)}
        />
        <MetricCard icon={Link2} label="API 연동 가능" value={`${apiLinkedCount}건`} />
        <MetricCard icon={RefreshCcw} label="7일 내 재확인" value={`${dueSoonCount}건`} />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>항목</span>
          <span className="text-right">금액</span>
          <span className="text-right">다음 확인</span>
        </div>

        <div className="divide-y divide-border">
          {items.map((item) => {
            const daysRemaining = getDaysRemaining(item.nextPaymentDate);
            const isSelected = item.id === selectedId;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={[
                  "grid w-full grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40",
                  isSelected ? "bg-secondary/30" : ""
                ].join(" ")}
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate font-medium text-foreground">{item.name}</span>
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        getStatusTone(item.status)
                      ].join(" ")}
                    >
                      {item.smartPricing ? "API 연동 가능" : "수동 관리"}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">{item.note}</p>
                </div>

                <div className="flex items-center justify-end text-sm font-medium text-foreground">
                  {formatWon(item.amount)}
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      daysRemaining <= 3
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : daysRemaining <= 7
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    ].join(" ")}
                  >
                    {daysRemaining <= 0 ? "오늘" : `D-${daysRemaining}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.nextPaymentDate)} · {item.billingCycle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
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
