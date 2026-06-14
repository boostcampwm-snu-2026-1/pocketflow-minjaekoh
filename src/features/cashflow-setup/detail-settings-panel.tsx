"use client";

import {
  BadgeCheck,
  Check,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  billingCycleOptions,
  type BillingCycle,
  type SemiFixedExpenseItem
} from "./cashflow-types";

type DraftState = {
  id?: string;
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  note: string;
};

function createBlankDraft(): DraftState {
  return {
    name: "",
    amount: "",
    billingCycle: billingCycleOptions[0],
    nextPaymentDate: "2026-06-14",
    note: ""
  };
}

type ShoppingSearchItem = {
  title: string;
  link: string;
  image: string | null;
  price: number;
  mallName: string;
  productId: string;
  brand: string | null;
  maker: string | null;
  categoryPath: string[];
};

type ShoppingSearchSummary = {
  minPrice: number;
  medianPrice: number;
  maxPrice: number;
  averagePrice: number;
  recommendedPrice: number;
  pricedItemCount: number;
  rawPricedItemCount: number;
  discardedItemCount: number;
  priceFloor: number;
};

type ShoppingSearchResponse = {
  provider: "naver-shopping";
  query: string;
  fetchedAt: string;
  total: number;
  summary: ShoppingSearchSummary;
  items: ShoppingSearchItem[];
};

type DetailSettingsPanelProps = {
  selectedItem?: SemiFixedExpenseItem;
  onSave: (item: SemiFixedExpenseItem) => void;
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function createDraft(item: SemiFixedExpenseItem): DraftState {
  return {
    name: item.name,
    amount: String(item.amount),
    billingCycle: item.billingCycle,
    nextPaymentDate: item.nextPaymentDate,
    note: item.note
  };
}

function normalizeTitle(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatCompactWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function clampDisplay(value: number | null) {
  if (!Number.isFinite(value ?? NaN)) {
    return 12;
  }

  return Math.min(100, Math.max(1, Math.trunc(value ?? 12)));
}

export function DetailSettingsPanel({ selectedItem, onSave }: DetailSettingsPanelProps) {
  const [draft, setDraft] = useState<DraftState | null>(selectedItem ? createDraft(selectedItem) : createBlankDraft());
  const [notice, setNotice] = useState<string | null>(null);
  const [isCreatingNew, setCreatingNew] = useState(false);
  const [isLookupOpen, setLookupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(selectedItem?.name ?? "");
  const [searchResult, setSearchResult] = useState<ShoppingSearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(selectedItem ? createDraft(selectedItem) : createBlankDraft());
    setNotice(null);
    setSearchError(null);
    setSearchResult(null);
    setSearchQuery(selectedItem?.name ?? "");
    setLookupOpen(false);
    setCreatingNew(false);
  }, [selectedItem]);

  const summaryCards = useMemo(() => {
    if (!searchResult) {
      return [];
    }

    return [
      { label: "최저가", value: formatCompactWon(searchResult.summary.minPrice) },
      { label: "중간가", value: formatCompactWon(searchResult.summary.medianPrice) },
      { label: "평균가", value: formatCompactWon(searchResult.summary.averagePrice) },
      { label: "추천가", value: formatCompactWon(searchResult.summary.recommendedPrice) }
    ];
  }, [searchResult]);

  const save = () => {
    if (!draft) {
      return;
    }

    const nextAmount = Number(draft.amount);
    if (!draft.name.trim() || !Number.isFinite(nextAmount) || nextAmount <= 0) {
      setNotice("항목명과 금액을 확인해주세요.");
      return;
    }

    onSave({
      id:
        isCreatingNew || !selectedItem
          ? `semi-fixed-${Date.now()}-${Math.random().toString(16).slice(2)}`
          : selectedItem.id,
      name: draft.name.trim(),
      amount: Math.round(nextAmount),
      billingCycle: draft.billingCycle,
      nextPaymentDate: draft.nextPaymentDate,
      note: draft.note.trim() || "메모 없음",
      apiLinked: selectedItem?.apiLinked ?? true,
      smartPricing: selectedItem?.smartPricing ?? false,
      status: selectedItem?.status ?? "watch"
    });
    setNotice("수정 내용이 반영되었습니다.");
    setCreatingNew(false);
  };

  const applyPrice = (price: number, label: "평균가" | "추천가" | "항목가" = "항목가") => {
    setDraft((current) =>
      current
        ? {
            ...current,
            amount: String(price)
          }
        : current
    );
    setNotice(`${label} ${formatWon(price)}를 금액에 반영했습니다.`);
  };

  const handleSearch = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchError("검색어를 입력해주세요.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/shopping-price-search?query=${encodeURIComponent(trimmed)}&display=${clampDisplay(12)}`,
        { method: "GET" }
      );

      const payload = (await response.json()) as ShoppingSearchResponse | { error: string };

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "가격 조회에 실패했습니다.");
      }

      if (!("items" in payload) || !Array.isArray(payload.items)) {
        throw new Error("가격 조회 응답이 비어 있습니다.");
      }

      setSearchResult({
        ...payload,
        items: payload.items.map((item) => ({
          ...item,
          title: normalizeTitle(item.title)
        }))
      });
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "가격 조회 중 오류가 발생했습니다.");
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <>
      <aside className="h-fit self-start space-y-5 rounded-xl border bg-background p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BadgeCheck className="h-4 w-4 text-primary" />
          개별 생필품 추가
        </div>

        <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground">{isCreatingNew ? "새 항목" : "선택된 항목"}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{draft?.name || "새 항목을 입력하세요"}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {draft?.note || "메모를 입력하면 항목을 더 쉽게 구분할 수 있습니다."}
          </p>
        </div>

        <div className="space-y-4">
          <Field label="항목명">
            <input
              value={draft?.name ?? ""}
              onChange={(event) =>
                setDraft((current) => (current ? { ...current, name: event.target.value } : current))
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>

          <Field label="금액">
            <input
              value={draft?.amount ?? ""}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        amount: event.target.value.replace(/[^\d]/g, "")
                      }
                    : current
                )
              }
              inputMode="numeric"
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>

          <Field label="메모">
            <input
              value={draft?.note ?? ""}
              onChange={(event) =>
                setDraft((current) => (current ? { ...current, note: event.target.value } : current))
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>

          <Field label="주기">
            <select
              value={draft?.billingCycle ?? billingCycleOptions[0]}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        billingCycle: event.target.value as BillingCycle
                      }
                    : current
                )
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            >
              {billingCycleOptions.map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
          </Field>

          <Field label="다음 결제일">
            <input
              type="date"
              value={draft?.nextPaymentDate ?? "2026-06-14"}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        nextPaymentDate: event.target.value
                      }
                    : current
                )
              }
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-1">
          <SummaryRow
            label="다음 결제"
            value={`${formatDate(draft?.nextPaymentDate ?? "2026-06-14")} · ${draft?.billingCycle ?? billingCycleOptions[0]}`}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setCreatingNew(true);
              setDraft(createBlankDraft());
              setNotice(null);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40 sm:w-[140px]"
          >
            <Plus className="h-4 w-4" />
            새 항목
          </button>
          <button
            type="button"
            onClick={() => setLookupOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15 sm:w-[140px]"
          >
            <Search className="h-4 w-4" />
            시세 조회
          </button>
          <button
            type="button"
            onClick={save}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isCreatingNew ? "추가" : "저장"}
          </button>
        </div>

        {notice ? (
          <div className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
            {notice}
          </div>
        ) : null}
      </aside>

      {isLookupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-3xl rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-sm text-muted-foreground">시세 조회</p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{draft?.name || "새 항목"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setLookupOpen(false)}
                className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary/40"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-5">
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  검색어를 넣고 조회하면 시세 카드가 표시됩니다. 평균가와 추천가를 현재 금액에 바로 반영할 수 있습니다.
                </p>

                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="예: 닭가슴살 2kg, 계란 30구"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {searchLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    조회
                  </button>
                </div>

                {searchError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {searchError}
                  </div>
                ) : null}

                {searchResult ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {summaryCards.map((card) => (
                        <SummaryRow key={card.label} label={card.label} value={card.value} />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPrice(searchResult.summary.averagePrice, "평균가")}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/15"
                      >
                        <Check className="h-4 w-4" />
                        평균가 반영
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPrice(searchResult.summary.recommendedPrice, "추천가")}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
                      >
                        <Check className="h-4 w-4" />
                        추천가 반영
                      </button>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">조회 결과</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {searchResult.query} · {searchResult.summary.pricedItemCount}개 항목
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatShortDate(searchResult.fetchedAt)}</p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {searchResult.items.slice(0, 5).map((item) => (
                          <div
                            key={item.productId || `${item.title}-${item.price}`}
                            className="rounded-lg border border-border/70 bg-background px-4 py-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.mallName}
                                  {item.brand ? ` · ${item.brand}` : ""}
                                  {item.categoryPath.length > 0 ? ` · ${item.categoryPath.join(" > ")}` : ""}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{formatWon(item.price)}</p>
                                <button
                                  type="button"
                                  onClick={() => applyPrice(item.price, "항목가")}
                                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  반영
                                </button>
                              </div>
                            </div>

                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex text-xs text-muted-foreground underline-offset-4 hover:underline"
                              >
                                상품 보기
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>조회한 시세는 평균가와 추천가 계산에만 사용됩니다.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/80 px-4 py-6 text-sm text-muted-foreground">
                    검색어를 넣고 조회하면 시세 카드가 표시됩니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
