"use client";

import { AlertTriangle, ArrowDownRight, CalendarDays } from "lucide-react";
import { useCashflowStore } from "@/store/cashflow-store";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function UpcomingCashflowImpactList() {
  const availableCash = useCashflowStore((state) => state.summary.availableCash);
  const upcomingRows = useCashflowStore((state) => state.upcomingImpactRows);

  return (
    <section aria-labelledby="upcoming-impact-heading" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Upcoming expenses</p>
          <h2 id="upcoming-impact-heading" className="text-xl font-semibold">
            다가오는 지출이 가용 현금에 미치는 영향
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            store에 들어있는 예정 지출 순서대로 남은 현금을 다시 계산해 보여줍니다.
          </p>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-muted-foreground md:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>기준 현금 {formatWon(availableCash)}</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="divide-y divide-border">
          {upcomingRows.map((expense) => {
            const isUrgent = expense.dueInDays <= 3;

            return (
              <article
                key={expense.title}
                className={[
                  "px-5 py-4 transition-colors",
                  isUrgent ? "bg-destructive/5" : "bg-transparent"
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{expense.title}</span>
                      <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                        {expense.category}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      {isUrgent ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isUrgent
                          ? `D-${expense.dueInDays} 내 즉시 반영`
                          : `D-${expense.dueInDays} 예정`}
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
                    D-{expense.dueInDays}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Stat label="예정일" value={`D-${expense.dueInDays}`} />
                  <Stat
                    label="반영 금액"
                    value={`- ${formatWon(expense.amount)}`}
                    tone={isUrgent ? "danger" : "default"}
                  />
                  <Stat
                    label="반영 후 잔액"
                    value={formatWon(expense.remainingCash)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
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
