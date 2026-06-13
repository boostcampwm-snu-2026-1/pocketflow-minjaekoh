"use client";

import {
  BadgeCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  billingCycleOptions,
  type BillingCycle,
  type SemiFixedExpenseItem
} from "./cashflow-types";

type DraftState = {
  amount: string;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  smartPricing: boolean;
};

type DetailSettingsPanelProps = {
  selectedItem?: SemiFixedExpenseItem;
  onSave: (item: SemiFixedExpenseItem) => void;
};

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function getStatusTone(smartPricing: boolean) {
  return smartPricing
    ? "border-sky-500/30 bg-sky-500/10 text-sky-500"
    : "border-border bg-secondary text-muted-foreground";
}

function createDraft(item: SemiFixedExpenseItem): DraftState {
  return {
    amount: String(item.amount),
    billingCycle: item.billingCycle,
    nextPaymentDate: item.nextPaymentDate,
    smartPricing: item.smartPricing
  };
}

export function DetailSettingsPanel({
  selectedItem,
  onSave
}: DetailSettingsPanelProps) {
  const [draft, setDraft] = useState<DraftState | null>(
    selectedItem ? createDraft(selectedItem) : null
  );
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setDraft(selectedItem ? createDraft(selectedItem) : null);
    setNotice(null);
  }, [selectedItem]);

  if (!selectedItem || !draft) {
    return (
      <aside className="rounded-xl border bg-background p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <BadgeCheck className="h-4 w-4 text-primary" />
          상세 설정
        </div>
        <div className="mt-4 rounded-lg border border-border/70 bg-secondary/40 px-4 py-4 text-sm leading-6 text-muted-foreground">
          항목을 선택하면 상세 설정을 볼 수 있습니다.
        </div>
      </aside>
    );
  }

  const save = () => {
    const nextAmount = Number(draft.amount);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setNotice("금액은 0보다 큰 숫자여야 합니다.");
      return;
    }

    onSave({
      ...selectedItem,
      amount: nextAmount,
      billingCycle: draft.billingCycle,
      nextPaymentDate: draft.nextPaymentDate,
      smartPricing: draft.smartPricing,
      apiLinked: draft.smartPricing ? true : selectedItem.apiLinked,
      status: draft.smartPricing ? "api-ready" : selectedItem.status
    });
    setNotice("수정 내용을 반영했습니다.");
  };

  return (
    <aside className="space-y-4 rounded-xl border bg-background p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <BadgeCheck className="h-4 w-4 text-primary" />
        상세 설정
      </div>

      <div className="rounded-lg border border-border/70 bg-card px-4 py-4">
        <p className="text-xs text-muted-foreground">선택된 항목</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{selectedItem.name}</span>
          <span
            className={[
              "rounded-full border px-2 py-0.5 text-[11px] font-medium",
              getStatusTone(draft.smartPricing)
            ].join(" ")}
          >
            {draft.smartPricing ? "연동 가능" : "수동 관리"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedItem.note}</p>
      </div>

      <div className="space-y-3">
        <Field label="금액">
          <input
            value={draft.amount}
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

        <Field label="주기">
          <select
            value={draft.billingCycle}
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
            value={draft.nextPaymentDate}
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

      <button
        type="button"
        onClick={() =>
          setDraft((current) =>
            current
              ? {
                  ...current,
                  smartPricing: !current.smartPricing
                }
              : current
          )
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
        onClick={save}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <SlidersHorizontal className="h-4 w-4" />
        변경사항 저장
      </button>

      {notice ? (
        <div className="rounded-lg border border-border/70 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          {notice}
        </div>
      ) : null}
    </aside>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
