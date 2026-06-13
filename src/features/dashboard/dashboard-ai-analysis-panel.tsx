"use client";

import { ShieldAlert, Sparkles, TrendingDown, Wallet } from "lucide-react";
import { useCashflowStore } from "@/store/cashflow-store";

type InsightRow = {
  label: string;
  value: string;
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function DashboardAiAnalysisPanel() {
  const summary = useCashflowStore((state) => state.summary);
  const upcomingCount = useCashflowStore((state) => state.upcomingExpenses.length);

  const insights: InsightRow[] = [
    {
      label: "가까운 지출",
      value: `${upcomingCount}건`
    },
    {
      label: "예상 월말 잔액",
      value: formatWon(summary.forecastMonthEndBalance)
    },
    {
      label: "오늘 기준 가용 현금",
      value: formatWon(summary.availableCash)
    }
  ];

  return (
    <section aria-labelledby="ai-analysis-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI analysis</p>
        <h2 id="ai-analysis-heading" className="text-xl font-semibold">
          AI 소비분석 요약
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          전역 상태의 잔액과 예정 지출을 기준으로, 오늘 소비를 어디까지 버틸 수 있는지
          바로 보여줍니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>현재 상태</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              소비 여유 있음
            </p>
          </div>

          <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            안정
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusBar
            label="예정 지출 반영 사용률"
            value={`${summary.budgetUsage}%`}
            accentClassName="bg-primary"
          />
          <StatusBar
            label="예상 월말 잔액 여유"
            value={summary.forecastMonthEndBalance > 0 ? "있음" : "주의"}
            accentClassName="bg-foreground/70"
          />
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span>AI 메모</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            전역 상태에서 계산된 예정 지출이 오늘 기준 가용 현금보다 적습니다. 지금은
            큰 구매만 한 번 더 걸러보면 됩니다.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {insights.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span>{row.label}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/70 bg-secondary px-4 py-3 text-sm text-muted-foreground">
          <TrendingDown className="h-4 w-4 text-primary" />
          <span>지출이 늘면 다음 계산값은 store 기준으로 즉시 다시 맞춰집니다.</span>
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
