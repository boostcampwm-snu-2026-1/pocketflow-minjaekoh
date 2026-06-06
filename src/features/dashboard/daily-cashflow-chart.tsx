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

type UpcomingExpense = {
  dueDay: number;
  amount: number;
};

type CashflowPoint = {
  day: number;
  cash: number;
  outgoing: number;
};

const startingCash = 557000;

const upcomingExpenses: UpcomingExpense[] = [
  { dueDay: 2, amount: 55000 },
  { dueDay: 4, amount: 78000 },
  { dueDay: 6, amount: 64000 },
  { dueDay: 9, amount: 38000 },
  { dueDay: 15, amount: 124000 },
  { dueDay: 23, amount: 86000 }
];

const totalUpcomingOutgoings = upcomingExpenses.reduce(
  (total, expense) => total + expense.amount,
  0
);

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function buildCashflowSeries() {
  const dailyOutgoing = new Map<number, number>();

  for (const expense of upcomingExpenses) {
    dailyOutgoing.set(
      expense.dueDay,
      (dailyOutgoing.get(expense.dueDay) ?? 0) + expense.amount
    );
  }

  let runningCash = startingCash;
  const series: CashflowPoint[] = [];

  for (let day = 1; day <= 30; day += 1) {
    const outgoing = dailyOutgoing.get(day) ?? 0;
    runningCash -= outgoing;

    series.push({
      day,
      cash: runningCash,
      outgoing
    });
  }

  return series;
}

const series = buildCashflowSeries();

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
  return (
    <section aria-labelledby="daily-cashflow-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Daily cashflow</p>
        <h2 id="daily-cashflow-heading" className="text-xl font-semibold">
          일별 가용 현금 흐름
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          오늘 기준 가용 현금에서 예정 지출이 빠지는 흐름을 1일부터 30일까지 보여줍니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 md:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-3 py-1">
            시작 가용 현금 {formatWon(startingCash)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            총 예정 지출 {formatWon(totalUpcomingOutgoings)}
          </span>
          <span className="rounded-full border border-border bg-background px-3 py-1">
            월말 예상 잔액 {formatWon(series[series.length - 1]?.cash ?? 0)}
          </span>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={series}
              margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
            >
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
                y={startingCash}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
                label={{
                  value: "시작 잔액",
                  position: "insideTopRight",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey="cash"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 2.5, strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
