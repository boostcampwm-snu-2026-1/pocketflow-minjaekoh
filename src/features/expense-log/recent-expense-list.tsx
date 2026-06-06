import { CircleDollarSign, ReceiptText } from "lucide-react";

type RecentExpense = {
  date: string;
  name: string;
  category: string;
  amount: number;
};

type RecentExpenseListProps = {
  expenses?: RecentExpense[];
};

const defaultExpenses: RecentExpense[] = [
  {
    date: "06/06",
    name: "점심 식사",
    category: "식비",
    amount: 12000
  },
  {
    date: "06/06",
    name: "편의점 간식",
    category: "기타",
    amount: 4800
  },
  {
    date: "06/05",
    name: "대중교통",
    category: "교통비",
    amount: 3200
  },
  {
    date: "06/05",
    name: "세제 리필",
    category: "생활용품",
    amount: 15600
  },
  {
    date: "06/04",
    name: "아메리카노",
    category: "식비",
    amount: 4500
  }
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function getCategoryTone(category: string) {
  switch (category) {
    case "식비":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
    case "생활용품":
      return "border-sky-500/30 bg-sky-500/10 text-sky-500";
    case "교통비":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

export function RecentExpenseList({
  expenses = defaultExpenses
}: RecentExpenseListProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <section aria-labelledby="recent-expense-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Recent expenses</p>
          <h2 id="recent-expense-heading" className="text-xl font-semibold">
            최근 지출 내역
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            최근에 입력된 지출을 날짜, 카테고리, 금액 기준으로 빠르게 확인할 수 있습니다.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
          <CircleDollarSign className="h-3.5 w-3.5" />
          <span>{formatWon(total)} 지출</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="grid grid-cols-[72px_minmax(0,1.5fr)_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>날짜</span>
          <span>항목</span>
          <span className="text-right">금액</span>
        </div>

        <div className="divide-y divide-border">
          {expenses.map((expense, index) => (
            <article
              key={`${expense.date}-${expense.name}-${index}`}
              className="grid grid-cols-[72px_minmax(0,1.5fr)_auto] gap-4 px-5 py-4 transition-colors hover:bg-secondary/40"
            >
              <div className="text-sm font-medium text-foreground">
                {expense.date}
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate font-medium text-foreground">
                    {expense.name}
                  </span>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      getCategoryTone(expense.category)
                    ].join(" ")}
                  >
                    {expense.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  최근 지출 흐름에 즉시 반영될 항목입니다.
                </p>
              </div>

              <div className="flex items-center justify-end text-sm font-medium text-foreground">
                {formatWon(expense.amount)}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
