"use client";

import { CalendarRange, ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import {
  buildForecastCashflowSeries,
  useCashflowStore,
  type ForecastCashflowPoint
} from "@/store/cashflow-store";

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

function sumSeries(points: ForecastCashflowPoint[], key: "incoming" | "outgoing") {
  return points.reduce((sum, point) => sum + point[key], 0);
}

export function DashboardKpiCards() {
  const currentBalance = useCashflowStore((state) => state.summary.currentBalance);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);

  const forecast = buildForecastCashflowSeries({
    startingBalance: currentBalance,
    recurringIncomes,
    fixedExpenses,
    semiFixedExpenses,
    horizonDays: 30
  });

  const totalIncoming = sumSeries(forecast, "incoming");
  const totalOutgoing = sumSeries(forecast, "outgoing");
  const finalBalance = forecast.at(-1)?.cash ?? currentBalance;

  const kpiCards: KpiCard[] = [
    {
      title: "현재 잔액",
      value: formatWon(currentBalance),
      description: "지금 당장 보이는 잔액입니다.",
      icon: Wallet,
      tone: "default"
    },
    {
      title: "30일 유입",
      value: formatWon(totalIncoming),
      description: "앞으로 30일 동안 들어올 돈입니다.",
      icon: ArrowUpRight,
      tone: "default"
    },
    {
      title: "30일 유출",
      value: formatWon(totalOutgoing),
      description: "앞으로 30일 동안 나갈 돈입니다.",
      icon: ArrowDownRight,
      tone: "default"
    },
    {
      title: "월말 잔액",
      value: formatWon(finalBalance),
      description:
        finalBalance < 0 ? "적자입니다. 지출을 바로 줄여야 합니다." : "현재 흐름이면 잔액이 남습니다.",
      icon: CalendarRange,
      tone: finalBalance < 0 ? "highlight" : "default"
    }
  ];

  return (
    <section aria-labelledby="dashboard-kpi-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Pocketflow</p>
          <h1 id="dashboard-kpi-heading" className="text-2xl font-semibold tracking-tight md:text-3xl">
            오늘의 현금 흐름
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            그래프와 같은 30일 예측 시리즈 기준으로 현재 잔액, 유입, 유출, 월말 잔액만
            보여줍니다.
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
