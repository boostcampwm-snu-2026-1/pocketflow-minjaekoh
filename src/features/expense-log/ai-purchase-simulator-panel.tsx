"use client";

import {
  AlertTriangle,
  LoaderCircle,
  Sparkles,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { useState } from "react";

type AnalysisResult = {
  riskLevel: "safe" | "watch" | "danger";
  headline: string;
  summary: string;
  remainingCash: number;
  advice: string;
};

const availableCash = 557000;

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function parseAnalysisResponse(raw: string): AnalysisResult {
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as AnalysisResult;

  if (
    !parsed ||
    !["safe", "watch", "danger"].includes(parsed.riskLevel) ||
    typeof parsed.headline !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.remainingCash !== "number" ||
    typeof parsed.advice !== "string"
  ) {
    throw new Error("Invalid AI response shape.");
  }

  return parsed;
}

export function AiPurchaseSimulatorPanel() {
  const [itemName, setItemName] = useState("무선 이어폰");
  const [price, setPrice] = useState("129000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-purchase-simulator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemName: itemName.trim(),
          price: Number(price),
          availableCash
        })
      });

      const payload = (await response.json()) as
        | { result: string }
        | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "분석 요청에 실패했습니다.");
      }

      if (!("result" in payload)) {
        throw new Error("분석 결과 형식이 올바르지 않습니다.");
      }

      setResult(parseAnalysisResponse(payload.result));
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "분석 요청 중 알 수 없는 오류가 발생했습니다."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="purchase-simulator-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Purchase simulator</p>
        <h2 id="purchase-simulator-heading" className="text-xl font-semibold">
          AI 소비 시뮬레이터
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          구매할 물건과 가격을 넣으면, 오늘 기준 가용 현금에 어떤 영향을 주는지 Gemini가 분석합니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">구매 희망 물건</span>
              <input
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                placeholder="예: 무선 이어폰"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">가격</span>
              <input
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value.replace(/[^\d]/g, ""))
                }
                inputMode="numeric"
                placeholder="예: 129000"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span>오늘 기준 가용 현금: {formatWon(availableCash)}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              분석 요청
            </button>
          </div>
        </form>

        {error ? (
          <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 bg-background px-4 py-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>분석 결과</span>
                </div>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {result.headline}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {result.summary}
                </p>
              </div>

              <div
                className={[
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  result.riskLevel === "safe"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : result.riskLevel === "watch"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                ].join(" ")}
              >
                {result.riskLevel === "safe"
                  ? "안전"
                  : result.riskLevel === "watch"
                    ? "주의"
                    : "위험"}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="분석 후 예상 잔액" value={formatWon(result.remainingCash)} />
              <Stat label="추천 메시지" value={result.advice} />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>아직 분석 결과가 없습니다.</span>
            </div>
            <p className="mt-2 leading-6">
              물건과 가격을 입력한 뒤 분석 요청을 누르면 결과가 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
