"use client";

import { ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { buildRollingCashflowMetrics, useCashflowStore } from "@/store/cashflow-store";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatMonthDay(value: string) {
  return value.slice(5).replace("-", "/");
}

export function DashboardAiAnalysisPanel() {
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

  const isCritical = rolling.minimumBalanceAfter30Days <= 0;
  const minimumBalanceDate = rolling.forecastSeries[rolling.minimumBalanceDay - 1]?.date;
  const statusLabel = isCritical ? "보릿고개 위험" : "생존";
  const statusTone = isCritical
    ? "border-red-500/30 bg-red-500/10 text-red-300"
    : "border-primary/30 bg-primary/10 text-primary";

  return (
    <section aria-labelledby="ai-analysis-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI analysis</p>
        <h2 id="ai-analysis-heading" className="text-xl font-semibold">
          AI 소비 판정 예고
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          오늘부터 30일 롤링 타임라인 기준으로 최저 잔액과 그 발생일을 먼저 확인합니다.
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
            label="30일 내 최저 잔액"
            value={formatWon(rolling.minimumBalanceAfter30Days)}
            accentClassName={isCritical ? "bg-red-500" : "bg-primary"}
          />
          <StatusBar
            label="최저 잔액 발생일"
            value={minimumBalanceDate ? formatMonthDay(minimumBalanceDate) : "없음"}
            accentClassName={isCritical ? "bg-destructive" : "bg-foreground/70"}
          />
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span>판정 메모</span>
          </div>
          <div className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              {isCritical
                ? "30일 내 최저 잔액이 0 아래로 떨어집니다. 이 구간은 반려 기준입니다."
                : "30일 내 최저 잔액이 0 이상이라 기본 생존 구간은 지납니다."}
            </p>
            <p>
              {minimumBalanceDate
                ? `${formatMonthDay(minimumBalanceDate)}에 최저 잔액이 발생합니다.`
                : "최저 잔액 발생일을 계산할 수 없습니다."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/70 bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span>대시보드와 소비 판정기는 같은 30일 롤링 시리즈를 기준으로 계산합니다.</span>
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
