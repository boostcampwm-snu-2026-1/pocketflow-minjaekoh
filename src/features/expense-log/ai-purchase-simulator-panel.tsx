"use client";

import {
  AlertTriangle,
  LoaderCircle,
  MessageSquareText,
  Sparkles,
  Users,
  Wallet
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RoomMessage = {
  speaker: string;
  tone: "info" | "warn" | "deny" | "approve";
  text: string;
};

type AnalysisResult = {
  roomTitle: string;
  verdict: "buy" | "hold" | "reject";
  headline: string;
  summary: string;
  remainingCash: number;
  advice: string;
  memberVotes: {
    approve: number;
    hold: number;
    reject: number;
  };
  roomMessages: RoomMessage[];
};

const availableCash = 557000;

type AiPurchaseSimulatorPanelProps = {
  currentItemName?: string;
  currentPrice?: number;
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
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
    !parsed.memberVotes ||
    typeof parsed.memberVotes.approve !== "number" ||
    typeof parsed.memberVotes.hold !== "number" ||
    typeof parsed.memberVotes.reject !== "number" ||
    !Array.isArray(parsed.roomMessages)
  ) {
    throw new Error("AI 응답 형식이 맞지 않습니다.");
  }

  return parsed as AnalysisResult;
}

export function AiPurchaseSimulatorPanel({
  currentItemName = "치킨 한 마리",
  currentPrice = 129000
}: AiPurchaseSimulatorPanelProps) {
  const [itemName, setItemName] = useState(currentItemName);
  const [price, setPrice] = useState(String(currentPrice));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    setItemName(currentItemName);
  }, [currentItemName]);

  useEffect(() => {
    setPrice(String(currentPrice));
  }, [currentPrice]);

  const liveRemainingCash = useMemo(() => {
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice)) {
      return availableCash;
    }
    return availableCash - parsedPrice;
  }, [price]);

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
        throw new Error("error" in payload ? payload.error : "거지방 판정 요청에 실패했습니다.");
      }

      if (!("result" in payload)) {
        throw new Error("거지방 판정 결과가 비어 있습니다.");
      }

      setResult(parseAnalysisResponse(payload.result));
    } catch (exception) {
      setError(
        exception instanceof Error
          ? exception.message
          : "거지방 판정 중 알 수 없는 오류가 발생했습니다."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="purchase-simulator-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Goblin room simulator</p>
        <h2 id="purchase-simulator-heading" className="text-xl font-semibold">
          거지방 판정실
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          구매 후보를 올리면 방원들이 먼저 한마디 하고, 마지막에 사도 되는지 아닌지
          판정합니다. 숫자는 냉정하게, 말투는 거지방답게 갑니다.
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
              <span>오늘 버틸 현금: {formatWon(availableCash)}</span>
              <span className="text-border">·</span>
              <span>입력 기준 잔액: {formatWon(liveRemainingCash)}</span>
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
              방에 올리기
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{result.roomTitle}</span>
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
                  result.verdict === "buy"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : result.verdict === "hold"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                ].join(" ")}
              >
                {result.verdict === "buy"
                  ? "가능"
                  : result.verdict === "hold"
                    ? "보류"
                    : "반려"}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
              <div className="rounded-lg border border-border/70 bg-background">
                <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3 text-sm font-medium text-foreground">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  방 채팅
                </div>
                <div className="space-y-3 px-4 py-4">
                  {result.roomMessages.map((message, index) => (
                    <MessageBubble key={`${message.speaker}-${index}`} message={message} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <Stat
                    label="남은 현금"
                    value={formatWon(result.remainingCash)}
                  />
                  <Stat
                    label="방원 판정"
                    value={`찬성 ${result.memberVotes.approve} / 보류 ${result.memberVotes.hold} / 반대 ${result.memberVotes.reject}`}
                  />
                </div>

                <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
                  <p className="text-xs text-muted-foreground">최종 한마디</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {result.advice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-border/70 bg-background px-4 py-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span>아직 방에 올린 항목이 없습니다.</span>
            </div>
            <p className="mt-2 leading-6">
              가격과 구매 후보를 넣고 방에 올리면, 거지방식 판정과 코멘트를 바로
              보여줍니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: RoomMessage }) {
  const toneStyles = {
    info: "border-border bg-secondary text-foreground",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    deny: "border-destructive/30 bg-destructive/10 text-red-100",
    approve: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
  } as const;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{message.speaker}</p>
      <div className={`max-w-2xl rounded-2xl border px-4 py-3 text-sm leading-6 ${toneStyles[message.tone]}`}>
        {message.text}
      </div>
    </div>
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
