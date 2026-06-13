"use client";

import {
  Banknote,
  CalendarDays,
  CircleAlert,
  Clock3,
  ReceiptText
} from "lucide-react";
import type { FixedExpenseItem } from "@/store/cashflow-store";

type FixedExpenseListProps = {
  items: FixedExpenseItem[];
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

function getDueTone(daysRemaining: number) {
  if (daysRemaining <= 3) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (daysRemaining <= 7) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-500";
  }

  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
}

export function FixedExpenseList({ items }: FixedExpenseListProps) {
  const totalMonthly = items.reduce((sum, item) => sum + item.amount, 0);
  const nextDue = [...items].sort(
    (left, right) =>
      new Date(left.nextPaymentDate).getTime() - new Date(right.nextPaymentDate).getTime()
  )[0];
  const urgentCount = items.filter((item) => getDaysRemaining(item.nextPaymentDate) <= 7).length;
  const highest = [...items].sort((left, right) => right.amount - left.amount)[0];

  return (
    <section aria-labelledby="fixed-expense-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Cashflow setup</p>
        <h2 id="fixed-expense-heading" className="text-2xl font-bold">
          고정비 매월 리스트
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          월세, 관리비, 통신비처럼 매달 빠져나가는 항목을 먼저 정리합니다. 다음 결제일과
          금액을 같이 보면 이번 달 방어선이 바로 보입니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard icon={Banknote} label="월 고정비 합계" value={formatWon(totalMonthly)} />
        <MetricCard
          icon={CalendarDays}
          label="가장 먼저 나갈 돈"
          value={`${nextDue.name} · ${formatDate(nextDue.nextPaymentDate)}`}
        />
        <MetricCard icon={CircleAlert} label="7일 내 결제" value={`${urgentCount}건`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>항목</span>
            <span className="text-right">금액</span>
            <span className="text-right">다음 결제</span>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const daysRemaining = getDaysRemaining(item.nextPaymentDate);

              return (
                <article
                  key={item.id}
                  className="grid grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReceiptText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">{item.name}</span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {item.billingCycle}
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
                        getDueTone(daysRemaining)
                      ].join(" ")}
                    >
                      {daysRemaining <= 0 ? "오늘" : `D-${daysRemaining}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.nextPaymentDate)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border bg-background p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock3 className="h-4 w-4 text-primary" />
            이번 달 방어선
          </div>

          <div className="space-y-3">
            <SummaryRow label="월 고정비 합계" value={formatWon(totalMonthly)} />
            <SummaryRow label="가장 큰 항목" value={`${highest.name} · ${formatWon(highest.amount)}`} />
            <SummaryRow label="다음 결제일" value={`${nextDue.name} · ${formatDate(nextDue.nextPaymentDate)}`} />
          </div>

          <div className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-4 text-sm leading-6 text-muted-foreground">
            고정비는 여기서 먼저 잠그고, 다음 단계에서 준고정비와 세부 설정을 붙입니다.
            지금 화면은 “이번 달에 꼭 나갈 돈”만 보이게 만든 상태입니다.
          </div>
        </aside>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
