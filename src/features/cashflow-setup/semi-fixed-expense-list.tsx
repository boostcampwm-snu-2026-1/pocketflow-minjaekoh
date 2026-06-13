"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  Link2,
  RefreshCcw,
  SlidersHorizontal,
  ShoppingBasket,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BillingCycle = "주 1회" | "2주 1회" | "주 2~3회" | "불규칙" | "매월";
type ExpenseStatus = "active" | "watch" | "api-ready";

type SemiFixedExpenseItem = {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  apiLinked: boolean;
  smartPricing: boolean;
  status: ExpenseStatus;
  note: string;
};

type DraftState = {
  amount: string;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  smartPricing: boolean;
};

const billingCycleOptions: BillingCycle[] = [
  "주 1회",
  "2주 1회",
  "주 2~3회",
  "불규칙",
  "매월"
];

const initialItems: SemiFixedExpenseItem[] = [
  {
    id: "groceries",
    name: "장보기",
    amount: 220000,
    billingCycle: "주 1회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "식비와 생필품 묶음"
  },
  {
    id: "cleaning",
    name: "세제/청소용품",
    amount: 38000,
    billingCycle: "2주 1회",
    nextPaymentDate: "2026-06-17",
    apiLinked: false,
    smartPricing: false,
    status: "watch",
    note: "소모 속도에 따라 변동"
  },
  {
    id: "delivery",
    name: "배달음식",
    amount: 96000,
    billingCycle: "불규칙",
    nextPaymentDate: "2026-06-15",
    apiLinked: false,
    smartPricing: false,
    status: "active",
    note: "충동 지출 경보 대상"
  },
  {
    id: "coffee",
    name: "커피/간식",
    amount: 54000,
    billingCycle: "주 2~3회",
    nextPaymentDate: "2026-06-14",
    apiLinked: true,
    smartPricing: true,
    status: "api-ready",
    note: "자잘하지만 누적이 빠름"
  }
];

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function getDaysRemaining(nextPaymentDate: string) {
  const target = new Date(`${nextPaymentDate}T00:00:00`);
  const today = new Date("2026-06-13T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function deriveStatus(item: SemiFixedExpenseItem, smartPricing: boolean): ExpenseStatus {
  if (smartPricing) {
    return "api-ready";
  }

  if (item.amount >= 80000) {
    return "active";
  }

  return item.apiLinked ? "watch" : "watch";
}

function getStatusTone(status: ExpenseStatus) {
  switch (status) {
    case "api-ready":
      return "border-sky-500/30 bg-sky-500/10 text-sky-500";
    case "watch":
      return "border-amber-500/30 bg-amber-500/10 text-amber-500";
    case "active":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

function createDraft(item: SemiFixedExpenseItem): DraftState {
  return {
    amount: String(item.amount),
    billingCycle: item.billingCycle,
    nextPaymentDate: item.nextPaymentDate,
    smartPricing: item.smartPricing
  };
}

export function SemiFixedExpenseList() {
  const [items, setItems] = useState<SemiFixedExpenseItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[0].id);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  );
  const [draft, setDraft] = useState<DraftState>(createDraft(initialItems[0]));
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (selectedItem) {
      setDraft(createDraft(selectedItem));
      setSavedNotice(null);
    }
  }, [selectedItem]);

  const totalMonthly = items.reduce((sum, item) => sum + item.amount, 0);
  const apiLinkedCount = items.filter((item) => item.apiLinked || item.smartPricing).length;
  const dueSoonCount = items.filter((item) => getDaysRemaining(item.nextPaymentDate) <= 7).length;
  const highest = [...items].sort((left, right) => right.amount - left.amount)[0];

  function saveDraft() {
    if (!selectedItem) {
      return;
    }

    const nextAmount = Number(draft.amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setSavedNotice("금액은 0보다 큰 숫자여야 합니다.");
      return;
    }

    const nextItem: SemiFixedExpenseItem = {
      ...selectedItem,
      amount: nextAmount,
      billingCycle: draft.billingCycle,
      nextPaymentDate: draft.nextPaymentDate,
      smartPricing: draft.smartPricing,
      apiLinked: draft.smartPricing ? true : selectedItem.apiLinked,
      status: deriveStatus(selectedItem, draft.smartPricing)
    };

    setItems((current) =>
      current.map((item) => (item.id === selectedItem.id ? nextItem : item))
    );
    setSavedNotice("수정 내용을 반영했습니다.");
  }

  return (
    <section aria-labelledby="semi-fixed-expense-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Cashflow setup</p>
        <h2 id="semi-fixed-expense-heading" className="text-2xl font-bold">
          준고정비 주기적 생필품 리스트
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          장보기, 배달, 커피처럼 자주 나가지만 금액이 들쭉날쭉한 항목을 따로 모읍니다.
          항목을 누르면 오른쪽에서 금액, 주기, 다음 결제일을 바로 조정할 수 있습니다.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={CircleDollarSign}
          label="준고정비 월 환산"
          value={formatWon(totalMonthly)}
        />
        <MetricCard icon={Link2} label="API 연동 가능" value={`${apiLinkedCount}건`} />
        <MetricCard icon={RefreshCcw} label="7일 내 재확인" value={`${dueSoonCount}건`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>항목</span>
            <span className="text-right">금액</span>
            <span className="text-right">다음 확인</span>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const daysRemaining = getDaysRemaining(item.nextPaymentDate);
              const isSelected = item.id === selectedId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={[
                    "grid w-full grid-cols-[minmax(0,1.2fr)_auto_auto] gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40",
                    isSelected ? "bg-secondary/30" : ""
                  ].join(" ")}
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate font-medium text-foreground">{item.name}</span>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          getStatusTone(item.status)
                        ].join(" ")}
                      >
                        {item.smartPricing ? "API 연동 가능" : "수동 관리"}
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">{item.note}</p>
                  </div>

                  <div className="flex items-center justify-end text-sm font-medium text-foreground">
                    {formatWon(item.amount)}
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <span
                      className={[
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        daysRemaining <= 3
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : daysRemaining <= 7
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      ].join(" ")}
                    >
                      {daysRemaining <= 0 ? "오늘" : `D-${daysRemaining}`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.nextPaymentDate)} · {item.billingCycle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 rounded-xl border bg-background p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            상세 설정
          </div>

          {selectedItem ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
                <p className="text-xs text-muted-foreground">선택된 항목</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{selectedItem.name}</span>
                  <span
                    className={[
                      "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                      getStatusTone(selectedItem.status)
                    ].join(" ")}
                  >
                    {selectedItem.smartPricing ? "연동 가능" : "수동 관리"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedItem.note}
                </p>
              </div>

              <div className="space-y-3">
                <Field label="금액">
                  <input
                    value={draft.amount}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        amount: event.target.value.replace(/[^\d]/g, "")
                      }))
                    }
                    inputMode="numeric"
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                  />
                </Field>

                <Field label="주기">
                  <select
                    value={draft.billingCycle}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        billingCycle: event.target.value as BillingCycle
                      }))
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
                    value={draft.nextPaymentDate}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        nextPaymentDate: event.target.value
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    smartPricing: !current.smartPricing
                  }))
                }
                className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-card px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">스마트 프라이싱</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    가격 조회 연동 대상인지 표시합니다.
                  </p>
                </div>
                {draft.smartPricing ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>

              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryRow
                  label="현재 다음 결제"
                  value={`${formatDate(selectedItem.nextPaymentDate)} · ${selectedItem.billingCycle}`}
                />
                <SummaryRow
                  label="편집 후 상태"
                  value={draft.smartPricing ? "API 연동 가능" : "수동 관리"}
                />
              </div>

              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <SlidersHorizontal className="h-4 w-4" />
                변경사항 저장
              </button>

              {savedNotice ? (
                <div className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                  {savedNotice}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-4 text-sm leading-6 text-muted-foreground">
              항목을 선택하면 상세 설정을 볼 수 있습니다.
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card px-4 py-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
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
