"use client";

import { AlertTriangle, LoaderCircle, Sparkles } from "lucide-react";
import { buildRollingCashflowMetrics, useCashflowStore } from "@/store/cashflow-store";
import { useEffect, useMemo, useState } from "react";

type Persona = "spicy";

type AnalysisResult = {
  roomTitle: string;
  verdict: "buy" | "hold" | "reject";
  headline: string;
  summary: string;
  remainingCash: number;
  advice: string;
  judgeNote: string;
  memberVotes: {
    approve: number;
    hold: number;
    reject: number;
  };
};

type NoSpendRecord = {
  id: string;
  itemName: string;
  price: number;
  persona: Persona;
  verdict: Exclude<AnalysisResult["verdict"], "buy">;
  reason: string;
  savedAt: string;
};

type AiPurchaseSimulatorPanelProps = {
  currentItemName?: string;
  currentPrice?: number | "";
  onBuy?: (purchase: {
    itemName: string;
    price: number;
    reason: string;
    verdict: AnalysisResult["verdict"];
  }) => void;
};

const STORAGE_KEY = "pocketflow.no-spend-records";

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatCompactWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

function getVerdictLabel(verdict: AnalysisResult["verdict"]) {
  if (verdict === "buy") return "구매";
  if (verdict === "hold") return "보류";
  return "거절";
}

function getVerdictTone(verdict: AnalysisResult["verdict"]) {
  if (verdict === "buy") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (verdict === "hold") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  return "border-destructive/30 bg-destructive/10 text-red-300";
}

function getStorageId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseAnalysisResponse(raw: string): AnalysisResult {
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as Partial<AnalysisResult>;

  if (
    !parsed ||
    !["buy", "hold", "reject"].includes(parsed.verdict ?? "") ||
    typeof parsed.roomTitle !== "string" ||
    typeof parsed.headline !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.remainingCash !== "number" ||
    typeof parsed.advice !== "string" ||
    typeof parsed.judgeNote !== "string" ||
    !parsed.memberVotes ||
    typeof parsed.memberVotes.approve !== "number" ||
    typeof parsed.memberVotes.hold !== "number" ||
    typeof parsed.memberVotes.reject !== "number" ||
    parsed.roomTitle.trim().length === 0
  ) {
    throw new Error("AI 응답 형식이 올바르지 않습니다.");
  }

  return parsed as AnalysisResult;
}

function getWeekStart(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const offset = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function AiPurchaseSimulatorPanel({
  currentItemName = "",
  currentPrice = "",
  onBuy
}: AiPurchaseSimulatorPanelProps) {
  const summary = useCashflowStore((state) => state.summary);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);

  const [itemName, setItemName] = useState(currentItemName);
  const [price, setPrice] = useState(currentPrice === "" ? "" : String(currentPrice));
  const [reason, setReason] = useState("");
  const [persona] = useState<Persona>("spicy");
  const [loading, setLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [noSpendRecords, setNoSpendRecords] = useState<NoSpendRecord[]>([]);

  useEffect(() => {
    setItemName(currentItemName);
  }, [currentItemName]);

  useEffect(() => {
    setPrice(currentPrice === "" ? "" : String(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as NoSpendRecord[];
      if (Array.isArray(parsed)) {
        setNoSpendRecords(parsed);
      }
    } catch {
      setNoSpendRecords([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(noSpendRecords));
    } catch {
      // ignore
    }
  }, [noSpendRecords]);

  const rolling = useMemo(
    () =>
      buildRollingCashflowMetrics({
        startingBalance: summary.currentBalance,
        recurringIncomes,
        fixedExpenses,
        semiFixedExpenses,
        horizonDays: 30
      }),
    [fixedExpenses, recurringIncomes, semiFixedExpenses, summary.currentBalance]
  );

  const availableCash = summary.currentBalance;
  const parsedPrice = Number(price);

  const liveAnalysis = useMemo(() => {
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return null;
    }

    const remainingCash = availableCash - parsedPrice;
    const minimumBalanceAfter30Days = rolling.minimumBalanceAfter30Days - parsedPrice;
    const safeAvailableAmount = rolling.safeAvailableAmount;
    const safeUsageRatio = safeAvailableAmount > 0 ? parsedPrice / safeAvailableAmount : Infinity;

    return {
      parsedPrice,
      remainingCash,
      minimumBalanceAfter30Days,
      safeAvailableAmount,
      safeUsageRatio,
      rejectNow: minimumBalanceAfter30Days < 0,
      holdNow: minimumBalanceAfter30Days >= 0 && safeUsageRatio >= 0.7
    };
  }, [availableCash, parsedPrice, rolling.minimumBalanceAfter30Days, rolling.safeAvailableAmount]);

  const weekStart = useMemo(() => getWeekStart(), []);
  const thisWeekSavedTotal = useMemo(
    () =>
      noSpendRecords
        .filter((record) => new Date(record.savedAt) >= weekStart)
        .reduce((sum, record) => sum + record.price, 0),
    [noSpendRecords, weekStart]
  );
  const thisWeekRecords = useMemo(
    () => noSpendRecords.filter((record) => new Date(record.savedAt) >= weekStart),
    [noSpendRecords, weekStart]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-purchase-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: itemName.trim(),
          price: Number(price),
          reason: reason.trim(),
          persona,
          availableCash,
          cashflowContext: liveAnalysis
            ? {
                currentBalance: summary.currentBalance,
                thirtyDayMinimumBalanceAfterPurchase: liveAnalysis.minimumBalanceAfter30Days,
                safeAvailableAmount: rolling.safeAvailableAmount
              }
            : null
        })
      });

      const payload = (await response.json()) as { result: string } | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "AI 판정 요청에 실패했습니다.");
      }

      if (!("result" in payload)) {
        throw new Error("AI 판정 결과가 비어 있습니다.");
      }

      setResult(parseAnalysisResponse(payload.result));
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "AI 판정 중 오류가 발생했습니다.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleHold() {
    if (!result) {
      return;
    }

    setSavingRecord(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 200));

      const nextRecord: NoSpendRecord = {
        id: getStorageId(),
        itemName: itemName.trim() || currentItemName,
        price: Number(price),
        persona,
        verdict: result.verdict === "buy" ? "hold" : result.verdict,
        reason: reason.trim(),
        savedAt: new Date().toISOString()
      };

      setNoSpendRecords((current) => [nextRecord, ...current].slice(0, 24));
    } finally {
      setSavingRecord(false);
    }
  }

  function handleBuy() {
    if (!result) {
      return;
    }

    onBuy?.({
      itemName: itemName.trim() || currentItemName,
      price: Number(price),
      reason: reason.trim(),
      verdict: result.verdict
    });
  }

  return (
    <section aria-labelledby="purchase-simulator-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">AI fact bomber</p>
        <h2 id="purchase-simulator-heading" className="text-xl font-semibold">
          AI 소비 판정기
        </h2>
      </div>

      <div className="rounded-xl border bg-card p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">구매 항목</span>
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
                onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="예: 129000"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">구매 사유</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="예: 출퇴근용 / 업무용 / 대체재 없음"
              className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Stat label="현재 잔액" value={formatWon(summary.currentBalance)} />
            <Stat
              label="구매 후 남는 현금"
              value={liveAnalysis ? formatWon(liveAnalysis.remainingCash) : formatWon(availableCash)}
            />
            <Stat
              label="구매 후 30일 이내 최저 잔액"
              value={formatWon(rolling.minimumBalanceAfter30Days)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              판정하기
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
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/70 bg-background px-4 py-4">
              <div className="min-w-0">
                <div className="text-sm font-medium text-muted-foreground">{result.roomTitle}</div>
                <p className="mt-2 text-xl font-semibold text-foreground">{result.headline}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{result.summary}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    getVerdictTone(result.verdict)
                  ].join(" ")}
                >
                  {getVerdictLabel(result.verdict)}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs text-muted-foreground">판정 코멘트</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">{result.judgeNote}</p>
                </div>

                <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs text-muted-foreground">최종 조언</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{result.advice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Stat label="판정 후 남는 현금" value={formatWon(result.remainingCash)} />
                  <Stat
                    label="판정 결과"
                    value={`찬성 ${result.memberVotes.approve} / 보류 ${result.memberVotes.hold} / 거절 ${result.memberVotes.reject}`}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    구매
                  </button>
                  <button
                    type="button"
                    onClick={handleHold}
                    disabled={savingRecord}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingRecord ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    보류 기록
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>아직 판정 결과가 없습니다.</span>
            </div>
            <p className="mt-2 leading-6">
              가격과 사유를 넣고 판정하기를 누르면 AI가 구매 후 30일 흐름을 기준으로 판단합니다.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">보류 기록</p>
              <p className="mt-1 text-xs text-muted-foreground">최근 7일 동안 저장한 판정 기록입니다.</p>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              이번 주 보류 합계 {formatWon(thisWeekSavedTotal)}
            </div>
          </div>

          <div className={[ "mt-4 space-y-3", thisWeekRecords.length >= 5 ? "max-h-[360px] overflow-y-auto pr-1" : "" ].join(" ")}>
            {thisWeekRecords.length > 0 ? (
              thisWeekRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{record.itemName}</p>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          record.verdict === "reject"
                            ? "border-destructive/30 bg-destructive/10 text-red-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                        ].join(" ")}
                      >
                        {record.verdict === "reject" ? "거절" : "보류"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatShortDate(record.savedAt)}
                      {record.reason ? ` · ${record.reason}` : ""}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">{formatWon(record.price)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
                아직 저장된 보류 기록이 없습니다. 보류를 누르면 여기 쌓입니다.
              </div>
            )}
          </div>
        </div>
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
