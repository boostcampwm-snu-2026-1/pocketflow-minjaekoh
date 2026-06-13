"use client";

import {
  BadgePercent,
  CalendarRange,
  Landmark,
  Wallet
} from "lucide-react";
import { useCashflowStore } from "@/store/cashflow-store";

type KpiCard = {
  title: string;
  value: string;
  description: string;
  icon: typeof Wallet;
  tone: "highlight" | "default";
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function DashboardKpiCards() {
  const summary = useCashflowStore((state) => state.summary);

  const kpiCards: KpiCard[] = [
    {
      title: "오늘 사용 가능 금액",
      value: formatWon(summary.availableCash),
      description: `현재 잔액 ${formatWon(summary.currentBalance)} - 예정 지출 ${formatWon(summary.upcomingSpend)}`,
      icon: Wallet,
      tone: "highlight"
    },
    {
      title: "예상 월말 잔액",
      value: formatWon(summary.forecastMonthEndBalance),
      description: "이번 달 예정 지출을 반영한 월말 기준 잔액",
      icon: Landmark,
      tone: "default"
    },
    {
      title: "예산 사용률",
      value: `${summary.budgetUsage}%`,
      description: "이번 달 설정 예산 대비 현재 사용 비중",
      icon: BadgePercent,
      tone: "default"
    },
    {
      title: "이번 달 예정 지출",
      value: formatWon(summary.plannedExpensesThisMonth),
      description: "고정비와 준고정비를 합친 이번 달 예상 지출",
      icon: CalendarRange,
      tone: "default"
    }
  ];

  return (
    <section aria-labelledby="dashboard-kpi-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Pocketflow</p>
          <h1
            id="dashboard-kpi-heading"
            className="text-2xl font-semibold tracking-tight md:text-3xl"
          >
            오늘 기준 가용 현금
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            현재 잔액과 예정 지출을 한 화면에서 같이 보면서, 지금 당장 쓸 수 있는
            금액을 먼저 확인합니다.
          </p>
        </div>
        <div className="rounded-full border border-border/80 bg-secondary px-3 py-1 text-xs text-muted-foreground">
          Issue #15
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className={[
                "relative overflow-hidden rounded-xl border p-5 transition-colors",
                card.tone === "highlight"
                  ? "border-primary/40 bg-primary/10"
                  : "bg-card hover:border-primary/30"
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{card.title}</span>
                  </div>
                  <div className="text-2xl font-semibold tracking-tight text-foreground md:text-[1.9rem]">
                    {card.value}
                  </div>
                </div>
              </div>

              <p className="mt-4 min-h-10 text-sm leading-6 text-muted-foreground">
                {card.description}
              </p>

              {card.tone === "highlight" ? (
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-background/70">
                  <div className="h-full w-[72%] rounded-full bg-primary" />
                </div>
              ) : (
                <div className="mt-4 h-1.5 w-full rounded-full bg-secondary" />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
