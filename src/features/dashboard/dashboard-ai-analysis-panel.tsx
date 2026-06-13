"use client";

import { ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import {
  buildForecastCashflowSeries,
  useCashflowStore,
  type ForecastCashflowPoint
} from "@/store/cashflow-store";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatMonthDay(value: string) {
  return value.slice(5).replace("-", "/");
}

function getDeficitPoint(points: ForecastCashflowPoint[]) {
  return points.find((point) => point.cash < 0);
}

export function DashboardAiAnalysisPanel() {
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

  const finalBalance = forecast.at(-1)?.cash ?? currentBalance;
  const deficitPoint = getDeficitPoint(forecast);
  const isCritical = finalBalance <= 0 || Boolean(deficitPoint);

  const statusLabel = isCritical ? "위기" : "여유";
  const statusTone = isCritical
    ? "border-red-500/30 bg-red-500/10 text-red-300"
    : "border-primary/30 bg-primary/10 text-primary";

  return (
    <section aria-labelledby="ai-analysis-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI analysis</p>
        <h2 id="ai-analysis-heading" className="text-xl font-semibold">
          AI 소비분석 요약
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          그래프와 같은 30일 예측 시리즈 기준으로, 지금 흐름이 버티는지 바로 보여줍니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>현재 상태</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{statusLabel}</p>
          </div>

          <div className={`rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}>
            {isCritical ? "즉시 확인" : "정상"}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusBar
            label="월말 현금 흐름"
            value={isCritical ? "버티기 어려움" : "버틸 수 있음"}
            accentClassName={isCritical ? "bg-red-500" : "bg-primary"}
          />
          <StatusBar
            label="최초 적자 시점"
            value={deficitPoint ? `${formatMonthDay(deficitPoint.date)}부터` : "없음"}
            accentClassName={isCritical ? "bg-destructive" : "bg-foreground/70"}
          />
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span>AI 메모</span>
          </div>
          <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              {isCritical
                ? "지금 흐름을 그대로 두면 30일 안에 적자 구간이 생깁니다. 지출을 바로 줄이거나 보류해야 합니다."
                : "현재 흐름은 아직 버틸 수 있습니다."}
            </p>
            <p>
              {deficitPoint
                ? `${formatMonthDay(deficitPoint.date)}부터 적자가 시작됩니다.`
                : "30일 안에는 적자 구간이 보이지 않습니다."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/70 bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span>그래프와 같은 예측 시리즈를 기준으로 월말 잔액을 같이 봅니다.</span>
        </div>
      </div>
    </section>
  );
}

function StatusBar({
  label,
  value,
  accentClassName
}: {
  label: string;
  value: string;
  accentClassName: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full w-[72%] rounded-full ${accentClassName}`} />
      </div>
    </div>
  );
}
