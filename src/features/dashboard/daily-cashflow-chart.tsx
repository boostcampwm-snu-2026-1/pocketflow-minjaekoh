"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { buildCashflowSeries, useCashflowStore } from "@/store/cashflow-store";

type CashflowPoint = {
  day: number;
  cash: number;
  outgoing: number;
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function CustomTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: CashflowPoint }>;
  label?: number;
}) {
  if (!active || !payload?.length || typeof label !== "number") {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
      <p className="text-xs text-muted-foreground">Day {label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">
        예상 잔액 {formatWon(point.cash)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        당일 지출 {formatWon(point.outgoing)}
      </p>
    </div>
  );
}

export function DailyCashflowChart() {
  const upcomingExpenses = useCashflowStore((state) => state.upcomingExpenses);
  const summary = useCashflowStore((state) => state.summary);
  const series = buildCashflowSeries(upcomingExpenses, summary.availableCash);

  return (
    <section aria-labelledby="daily-cashflow-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Daily cashflow</p>
        <h2 id="daily-cashflow-heading" className="text-xl font-semibold">
          일별 가용 현금 흐름
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          전역 상태에 들어있는 예정 지출을 기준으로 1일차부터 30일차까지 현금 흐름을
          다시 그립니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-3 py-1">
            시작 가용 현금 {formatWon(summary.availableCash)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            예정 지출 {formatWon(summary.upcomingSpend)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            월말 예상 잔액 {formatWon(summary.forecastMonthEndBalance)}
          </span>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                tickLine={false}
                axisLine={false}
                width={56}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={summary.availableCash}
                stroke="var(--border)"
                strokeDasharray="3 3"
                label={{
                  value: "시작 잔액",
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey="cash"
                stroke="var(--primary)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 3, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
