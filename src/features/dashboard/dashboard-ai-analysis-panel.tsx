import { ShieldAlert, Sparkles, TrendingDown, Wallet } from "lucide-react";

type InsightRow = {
  label: string;
  value: string;
};

const insights: InsightRow[] = [
  {
    label: "다가오는 지출",
    value: "4건"
  },
  {
    label: "월말 예상 잔액",
    value: "342,000원"
  },
  {
    label: "오늘 가용 현금",
    value: "557,000원"
  }
];

export function DashboardAiAnalysisPanel() {
  return (
    <section aria-labelledby="ai-analysis-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI analysis</p>
        <h2 id="ai-analysis-heading" className="text-xl font-semibold">
          AI 소비분석 요약
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          현재 잔액과 예정 지출을 기준으로, 오늘 소비가 얼마나 여유 있는지 빠르게 보여줍니다.
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
            안전
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusBar
            label="예정 지출 반영 후 여유"
            value="72%"
            accentClassName="bg-primary"
          />
          <StatusBar
            label="월말 잔액 전망"
            value="중간 수준"
            accentClassName="bg-foreground/70"
          />
        </div>

        <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            <span>AI 메모</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            오늘 기준 가용 현금은 충분하지만, D-3 이내 예정 지출이 먼저 빠집니다.
            이번 주는 큰 변동비보다 고정비 대응이 우선입니다.
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
          <span>지출이 늘면 차트와 가용 현금 수치가 즉시 내려가도록 연결될 예정입니다.</span>
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
