"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  buildForecastCashflowSeries,
  useCashflowStore,
  type ForecastCashflowPoint
} from "@/store/cashflow-store";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function formatMonthDay(value: string) {
  return value.slice(5).replace("-", "/");
}

function formatKoreanMoneyUnit(value: number) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(Math.round(value));

  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.round((abs % 100_000_000) / 10_000);
    return `${sign}${eok}억${man > 0 ? ` ${man}만원` : ""}`;
  }

  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000)}만원`;
  }

  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)}천원`;
  }

  return `${sign}${abs}원`;
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function CustomTooltip({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload?: ForecastCashflowPoint }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3 shadow-lg">
      <p className="text-xs text-muted-foreground">{formatDate(point.date)}</p>
      <div className="mt-2 space-y-1 text-sm">
        <p className="font-medium text-foreground">예상 잔액 {formatWon(point.cash)}</p>
        <p className="text-muted-foreground">들어오는 돈 {formatWon(point.incoming)}</p>
        <p className="text-muted-foreground">나가는 돈 {formatWon(point.outgoing)}</p>
        <p className="text-muted-foreground">순변화 {formatWon(point.net)}</p>
      </div>
    </div>
  );
}

export function DailyCashflowChart() {
  const startingBalance = useCashflowStore((state) => state.summary.currentBalance);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const summary = useCashflowStore((state) => state.summary);

  const series = buildForecastCashflowSeries({
    startingBalance,
    recurringIncomes,
    fixedExpenses,
    semiFixedExpenses,
    horizonDays: 30
  });

  const totalIncoming = series.reduce((sum, point) => sum + point.incoming, 0);
  const totalOutgoing = series.reduce((sum, point) => sum + point.outgoing, 0);
  const finalBalance = series[series.length - 1]?.cash ?? startingBalance;
  const minCash = Math.min(summary.currentBalance, ...series.map((point) => point.cash));

  return (
    <section aria-labelledby="daily-cashflow-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Forecast cashflow</p>
        <h2 id="daily-cashflow-heading" className="text-xl font-semibold">
          30일 현금흐름 그래프
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          정기 수입과 정기 지출을 날짜별로 펼쳐서, 어느 날 돈이 들어오고 나가는지 한 번에
          볼 수 있게 보여줍니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-3 py-1">
            시작 잔액 {formatWon(summary.currentBalance)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            예상 유입 {formatWon(totalIncoming)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            예상 유출 {formatWon(totalOutgoing)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            30일 후 {formatWon(finalBalance)}
          </span>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={formatMonthDay}
              />
              <YAxis
                tickFormatter={(value) => formatKoreanMoneyUnit(Number(value))}
                tickLine={false}
                axisLine={false}
                width={72}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={0}
                stroke="var(--border)"
                strokeDasharray="3 3"
                label={{
                  value: "0원",
                  position: "insideLeft",
                  fill: "var(--muted-foreground)",
                  fontSize: 12
                }}
              />
              <ReferenceLine
                y={summary.currentBalance}
                stroke="var(--border)"
                strokeDasharray="3 3"
                label={{
                  value: "시작 잔액",
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 12
                }}
              />
              <ReferenceArea y1={minCash} y2={0} fill="#ef4444" fillOpacity={0.08} />
              <ReferenceLine x={getTodayKey()} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" />
              <Bar dataKey="outgoing" fill="rgb(245 158 11 / 0.4)" radius={[4, 4, 0, 0]} name="유출" />
              <Bar dataKey="incoming" fill="rgb(34 197 94 / 0.35)" radius={[4, 4, 0, 0]} name="유입" />
              <Line
                type="monotone"
                dataKey="cash"
                stroke="var(--primary)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                name="잔액"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
