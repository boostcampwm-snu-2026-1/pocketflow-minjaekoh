"use client";

import { AlertTriangle, ArrowDownRight, CalendarDays } from "lucide-react";
import {
  buildRollingCashflowSeries,
  useCashflowStore,
  type ForecastCashflowPoint
} from "@/store/cashflow-store";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

export function UpcomingCashflowImpactList() {
  const currentBalance = useCashflowStore((state) => state.summary.currentBalance);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);

  const forecast = buildRollingCashflowSeries({
    startingBalance: currentBalance,
    recurringIncomes,
    fixedExpenses,
    semiFixedExpenses,
    horizonDays: 30
  });

  const impactRows = forecast
    .filter((point) => point.incoming > 0 || point.outgoing > 0)
    .slice(0, 10);

  return (
    <section aria-labelledby="upcoming-impact-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Upcoming cashflow</p>
          <h2 id="upcoming-impact-heading" className="text-xl font-semibold">
            다가오는 현금흐름 영향
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            앞으로 30일 안에 실제로 들어오고 나갈 항목만 묶어서 보여줍니다.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>현재 잔액 {formatWon(currentBalance)}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="divide-y divide-border">
          {impactRows.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              앞으로 30일 안에 예정된 항목이 없습니다.
            </div>
          ) : (
            impactRows.map((point) => (
              <ImpactRow key={point.date} point={point} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ImpactRow({ point }: { point: ForecastCashflowPoint }) {
  const isUrgent = point.outgoing > point.incoming && point.outgoing > 0;

  return (
    <article className={["px-5 py-4 transition-colors", isUrgent ? "bg-destructive/5" : "bg-transparent"].join(" ")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{formatDate(point.date)}</span>
            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
              예정
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {isUrgent ? (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            <span>
              {point.incoming > 0 && point.outgoing > 0
                ? "유입과 유출이 동시에 잡혀 있습니다"
                : point.outgoing > 0
                  ? "지출이 예정되어 있습니다"
                  : "수입이 예정되어 있습니다"}
            </span>
          </p>
        </div>

        <div
          className={[
            "shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
            isUrgent
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : "border-border bg-secondary text-muted-foreground"
          ].join(" ")}
        >
          {point.net < 0 ? "감소" : "증가"}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="들어오는 돈" value={formatWon(point.incoming)} />
        <Stat
          label="나가는 돈"
          value={`- ${formatWon(point.outgoing)}`}
          tone={isUrgent ? "danger" : "default"}
        />
        <Stat label="예상 잔액" value={formatWon(point.cash)} />
      </div>
    </article>
  );
}

type StatProps = {
  label: string;
  value: string;
  tone?: "default" | "danger";
};

function Stat({ label, value, tone = "default" }: StatProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={[
          "mt-1 text-sm font-medium",
          tone === "danger" ? "text-destructive" : "text-foreground"
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
