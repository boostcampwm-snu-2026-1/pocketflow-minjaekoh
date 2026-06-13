"use client";

import { AlertTriangle, LoaderCircle, Sparkles, Wallet } from "lucide-react";
import { useCashflowStore } from "@/store/cashflow-store";
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
  currentPrice?: number;
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

function formatRatio(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short"
  });
}

function getVerdictLabel(verdict: AnalysisResult["verdict"]) {
  if (verdict === "buy") return "사기";
  if (verdict === "hold") return "참기";
  return "보류";
}

function getVerdictTone(verdict: AnalysisResult["verdict"]) {
  if (verdict === "buy") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (verdict === "hold") return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  return "border-destructive/30 bg-destructive/10 text-red-300";
}

function formatCompactWon(value: number) {
  const absoluteValue = Math.round(Math.abs(value));
  const suffix = value < 0 ? "-" : "";
  return `${suffix}${absoluteValue.toLocaleString("ko-KR")}원`;
}

function getDaysRemainingInMonth(date = new Date()) {
  const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const localToday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = nextMonthStart.getTime() - localToday.getTime();
  return Math.max(1, Math.ceil(diffMs / 86_400_000));
}

function getWeekStart(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const offset = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - offset);
  start.setHours(0, 0, 0, 0);
  return start;
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

export function AiPurchaseSimulatorPanel({
  currentItemName = "무선 이어폰",
  currentPrice = 129000,
  onBuy
}: AiPurchaseSimulatorPanelProps) {
  const summary = useCashflowStore((state) => state.summary);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);

  const [itemName, setItemName] = useState(currentItemName);
  const [price, setPrice] = useState(String(currentPrice));
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
    setPrice(String(currentPrice));
  }, [currentPrice]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

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

  const availableCash = summary.availableCash;
  const daysRemainingInMonth = useMemo(() => getDaysRemainingInMonth(), []);
  const fixedExpenseTotal = useMemo(
    () => fixedExpenses.reduce((sum, item) => sum + item.amount, 0),
    [fixedExpenses]
  );

  const liveAnalysis = useMemo(() => {
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return null;
    }

    const remainingCash = availableCash - parsedPrice;
    const fixedExpenseShare = fixedExpenseTotal > 0 ? parsedPrice / fixedExpenseTotal : 0;
    const plannedExpenseShare =
      summary.plannedExpensesThisMonth > 0
        ? parsedPrice / summary.plannedExpensesThisMonth
        : 0;
    const monthEndBalanceAfterPurchase = summary.forecastMonthEndBalance - parsedPrice;
    const dailyBufferAfterPurchase = remainingCash / daysRemainingInMonth;

    return {
      parsedPrice,
      remainingCash,
      fixedExpenseShare,
      plannedExpenseShare,
      monthEndBalanceAfterPurchase,
      dailyBufferAfterPurchase
    };
  }, [
    availableCash,
    daysRemainingInMonth,
    fixedExpenseTotal,
    price,
    summary.forecastMonthEndBalance,
    summary.plannedExpensesThisMonth
  ]);

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
                plannedExpensesThisMonth: summary.plannedExpensesThisMonth,
                forecastMonthEndBalance: summary.forecastMonthEndBalance,
                daysRemainingInMonth,
                dailyBufferAfterPurchase: liveAnalysis.dailyBufferAfterPurchase,
                fixedExpenseTotal,
                fixedExpenseShare: liveAnalysis.fixedExpenseShare,
                plannedExpenseShare: liveAnalysis.plannedExpenseShare
              }
            : null
        })
      });

      const payload = (await response.json()) as { result: string } | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "AI 판정 요청이 실패했습니다.");
      }

      if (!("result" in payload)) {
        throw new Error("AI 판정 결과가 비어 있습니다.");
      }

      setResult(parseAnalysisResponse(payload.result));
    } catch (exception) {
      setError(
        exception instanceof Error ? exception.message : "AI 판정 중 알 수 없는 오류가 발생했습니다."
      );
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
          소비 판정실
        </h2>
        <p className="mt-2 max-w-2xl whitespace-nowrap text-sm leading-6 text-muted-foreground">
          소비하고자 하는 항목을 입력하여 AI의 판정을 받습니다. 이후 사용자가 소비 여부를 선택합니다.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-5 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">구매 후보</span>
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
            <span className="text-sm font-medium text-foreground">구매 이유</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="예: 출퇴근용, 오래 쓸 예정"
              className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="예정 지출 제외 잔액" value={formatWon(availableCash)} />
            <Stat
              label="이번 달 계획 지출 대비"
              value={liveAnalysis ? formatRatio(liveAnalysis.plannedExpenseShare) : "가격 입력 후 확인"}
            />
            <Stat
              label="고정 지출 평균 대비"
              value={
                liveAnalysis
                  ? formatRatio(
                      fixedExpenses.length > 0
                        ? liveAnalysis.parsedPrice / (fixedExpenseTotal / fixedExpenses.length)
                        : 0
                    )
                  : "가격 입력 후 확인"
              }
            />
          </div>

          <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Wallet className="h-4 w-4 text-primary" />
              <span>현금흐름 미리보기</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InsightCard
                label="구매 후 남는 현금"
                value={liveAnalysis ? formatCompactWon(liveAnalysis.remainingCash) : "-"}
              />
              <InsightCard
                label="월말 예상 잔액 변화"
                value={
                  liveAnalysis
                    ? `${formatCompactWon(summary.forecastMonthEndBalance)} → ${formatCompactWon(
                        liveAnalysis.monthEndBalanceAfterPurchase
                      )}`
                    : "-"
                }
              />
              <InsightCard
                label="하루 여유"
                value={liveAnalysis ? formatCompactWon(liveAnalysis.dailyBufferAfterPurchase) : "-"}
              />
              <InsightCard
                label="고정 지출 충격"
                value={liveAnalysis ? formatRatio(liveAnalysis.fixedExpenseShare) : "-"}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>하루 여유: {formatCompactWon(summary.availableCash / daysRemainingInMonth)}</span>
              </span>
              <span className="text-border">·</span>
              <span>이유 길이: {reason.trim().length}자</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              판정받기
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
                  className={["rounded-full border px-3 py-1 text-xs font-medium", getVerdictTone(result.verdict)].join(" ")}
                >
                  {getVerdictLabel(result.verdict)}
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
              <div className="space-y-4">
                <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs text-muted-foreground">판정관 한마디</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">{result.judgeNote}</p>
                </div>

                <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs text-muted-foreground">최종 판단</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{result.advice}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Stat label="남은 현금" value={formatWon(result.remainingCash)} />
                  <Stat
                    label="판정"
                    value={`승인 ${result.memberVotes.approve} / 보류 ${result.memberVotes.hold} / 반려 ${result.memberVotes.reject}`}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    사기
                  </button>
                  <button
                    type="button"
                    onClick={handleHold}
                    disabled={savingRecord}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingRecord ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    참기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>아직 판정된 항목이 없습니다.</span>
            </div>
            <p className="mt-2 leading-6">
              가격과 이유를 넣고 판정을 받으면, AI 요약과 현금흐름 영향, 무지출 기록을
              바로 볼 수 있습니다.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">무지출 방어 기록장</p>
              <p className="mt-1 text-xs text-muted-foreground">
                최근 7일 동안 참아낸 항목과 절약 총액을 저장합니다.
              </p>
            </div>
            <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              이번 주 절약 {formatWon(thisWeekSavedTotal)}
            </div>
          </div>

        <div
          className={[
            "mt-4 space-y-3",
            thisWeekRecords.length >= 5 ? "max-h-[360px] overflow-y-auto pr-1" : ""
          ].join(" ")}
        >
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
                        {record.verdict === "reject" ? "반려" : "보류"}
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
                아직 기록된 무지출 승리가 없습니다. 참기를 누르면 쌓입니다.
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

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
