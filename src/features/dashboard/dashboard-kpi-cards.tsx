"use client";

import { ArrowDownRight, ArrowUpRight, CalendarRange, Wallet } from "lucide-react";
import { buildRollingCashflowMetrics, useCashflowStore } from "@/store/cashflow-store";

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
  const currentBalance = useCashflowStore((state) => state.summary.currentBalance);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);

  const rolling = buildRollingCashflowMetrics({
    startingBalance: currentBalance,
    recurringIncomes,
    fixedExpenses,
    semiFixedExpenses,
    horizonDays: 30
  });
  const minimumBalanceDate = rolling.forecastSeries[rolling.minimumBalanceDay - 1]?.date;

  const kpiCards: KpiCard[] = [
    {
      title: "현재 잔액",
      value: formatWon(currentBalance),
      description: "지금 시점 기준으로 반영된 실제 잔액입니다.",
      icon: Wallet,
      tone: "default"
    },
    {
      title: "30일 예상 수입",
      value: formatWon(rolling.totalIncoming),
      description: "당일부터 30일 동안 들어올 것으로 잡힌 수입입니다.",
      icon: ArrowUpRight,
      tone: "default"
    },
    {
      title: "30일 예상 지출",
      value: formatWon(rolling.plannedOutgoing),
      description: "정기지출과 개별 생필품 기준으로 앞으로 30일 동안 나갈 돈입니다.",
      icon: ArrowDownRight,
      tone: "default"
    },
    {
      title: "30일 이내 최저 잔액",
      value: formatWon(rolling.minimumBalanceAfter30Days),
      description:
        rolling.minimumBalanceAfter30Days < 0
          ? `30일 안에 마이너스 구간이 생깁니다${minimumBalanceDate ? ` · ${minimumBalanceDate.slice(5).replace("-", "/")}` : ""}.`
          : `30일 동안 가장 낮아지는 시점의 잔액입니다${minimumBalanceDate ? ` · ${minimumBalanceDate.slice(5).replace("-", "/")}` : ""}.`,
      icon: CalendarRange,
      tone: rolling.minimumBalanceAfter30Days < 0 ? "highlight" : "default"
    }
  ];

  return (
    <section aria-labelledby="dashboard-kpi-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Pocketflow</p>
          <h1 id="dashboard-kpi-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">
            30일 현금흐름
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            월말이 아니라 당일부터 30일 롤링 타임라인으로 잔액, 수입, 지출, 최저점을 봅니다.
          </p>
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
                  ? "border-destructive/35 bg-destructive/10"
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
                  <div className="h-full w-[72%] rounded-full bg-destructive" />
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
