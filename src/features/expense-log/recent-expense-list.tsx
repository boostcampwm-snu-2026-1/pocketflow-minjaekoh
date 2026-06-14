import { CircleDollarSign, ReceiptText, Trash2 } from "lucide-react";

type RecentExpense = {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  type: "expense" | "income";
};

type RecentExpenseListProps = {
  expenses?: RecentExpense[];
  onDelete?: (id: string) => void;
};

const defaultExpenses: RecentExpense[] = [
  {
    id: "transport-2026-06-06",
    date: "06/06",
    name: "출근 교통비",
    category: "교통비",
    amount: 12000,
    type: "expense"
  },
  {
    id: "parttime-2026-06-06",
    date: "06/06",
    name: "아르바이트 급여",
    category: "수입",
    amount: 48000,
    type: "income"
  },
  {
    id: "transport-2026-06-05",
    date: "06/05",
    name: "교통비",
    category: "교통비",
    amount: 3200,
    type: "expense"
  },
  {
    id: "allowance-2026-06-05",
    date: "06/05",
    name: "용돈",
    category: "기타수입",
    amount: 15600,
    type: "income"
  },
  {
    id: "america-2026-06-04",
    date: "06/04",
    name: "아메리카노",
    category: "식비",
    amount: 4500,
    type: "expense"
  }
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getCategoryTone(category: string, type: RecentExpense["type"]) {
  if (type === "income") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-500";
  }

  switch (category) {
    case "교통비":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
    case "수입":
      return "border-sky-500/30 bg-sky-500/10 text-sky-500";
    case "변동비":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

export function RecentExpenseList({
  expenses = defaultExpenses,
  onDelete
}: RecentExpenseListProps) {
  const total = expenses.reduce((sum, expense) => {
    return expense.type === "income" ? sum + expense.amount : sum - expense.amount;
  }, 0);

  return (
    <section aria-labelledby="recent-expense-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Recent transactions</p>
          <h2 id="recent-expense-heading" className="text-xl font-semibold">
            최근 수입 / 지출 내역
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            수입과 지출의 실제 발생 내역을 한눈에 보여줍니다.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>순합계 {formatWon(total)}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[72px_minmax(0,1.5fr)_auto_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>날짜</span>
          <span>항목</span>
          <span className="text-right">금액</span>
          <span className="text-right">삭제</span>
        </div>

        <div className="max-h-[520px] overflow-y-auto divide-y divide-border">
          {expenses.map((expense) => (
            <article
              key={expense.id}
              className="group grid grid-cols-[72px_minmax(0,1.5fr)_auto_auto] gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
            >
              <div className="text-sm font-medium text-foreground">{expense.date}</div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">{expense.name}</span>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      getCategoryTone(expense.category, expense.type)
                    ].join(" ")}
                  >
                    {expense.type === "income" ? "수입" : expense.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {expense.type === "income"
                    ? "수입으로 기록된 항목입니다."
                    : "지출로 기록된 항목입니다."}
                </p>
              </div>

              <div
                className={[
                  "flex items-center justify-end text-sm font-medium",
                  expense.type === "income" ? "text-sky-500" : "text-foreground"
                ].join(" ")}
              >
                {expense.type === "income" ? "+" : "-"} {formatWon(expense.amount)}
              </div>

              <div className="flex items-start justify-end">
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(expense.id)}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-border/70 bg-background px-3 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:border-destructive/40 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                    aria-label={`${expense.name} 삭제`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
