"use client";

import { useState } from "react";
import { Plus, ReceiptText, Trash2 } from "lucide-react";
import { billingCycleOptions } from "./cashflow-types";
import type { FixedExpenseItem } from "@/store/cashflow-store";

type FixedExpenseListProps = {
  items: FixedExpenseItem[];
  onAddItem: (item: FixedExpenseItem) => void;
  onRemoveItem: (id: string) => void;
};

type DraftState = {
  name: string;
  amount: string;
  billingCycle: FixedExpenseItem["billingCycle"];
  nextPaymentDate: string;
  note: string;
};

const initialDraft: DraftState = {
  name: "",
  amount: "",
  billingCycle: "매월",
  nextPaymentDate: "2026-06-25",
  note: ""
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDaysRemaining(nextPaymentDate: string, today = getLocalDateString()) {
  const target = new Date(`${nextPaymentDate}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  return Math.ceil((target.getTime() - current.getTime()) / 86400000);
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function FixedExpenseList({ items, onAddItem, onRemoveItem }: FixedExpenseListProps) {
  const [draft, setDraft] = useState<DraftState>(initialDraft);

  const addItem = () => {
    const amount = Number(draft.amount.replace(/[^\d]/g, ""));
    if (!draft.name.trim() || !Number.isFinite(amount) || amount <= 0 || !draft.nextPaymentDate) {
      return;
    }

    onAddItem({
      id: createId("fixed"),
      name: draft.name.trim(),
      amount: Math.round(amount),
      billingCycle: draft.billingCycle,
      nextPaymentDate: draft.nextPaymentDate,
      note: draft.note.trim() || "메모 없음"
    });
    setDraft(initialDraft);
  };

  return (
    <section aria-labelledby="fixed-expense-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Budget system</p>
        <h2 id="fixed-expense-heading" className="text-2xl font-bold">
          고정비 설정
        </h2>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          <span>고정비 추가</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="항목명"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <input
            value={draft.amount}
            onChange={(event) =>
              setDraft((current) => ({ ...current, amount: event.target.value.replace(/[^\d]/g, "") }))
            }
            inputMode="numeric"
            placeholder="금액"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <select
            value={draft.billingCycle}
            onChange={(event) =>
              setDraft((current) => ({ ...current, billingCycle: event.target.value as DraftState["billingCycle"] }))
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          >
            {billingCycleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={draft.nextPaymentDate}
            onChange={(event) =>
              setDraft((current) => ({ ...current, nextPaymentDate: event.target.value }))
            }
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <input
            value={draft.note}
            onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
            placeholder="메모"
            className="h-10 md:col-span-2 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
        >
          <Plus className="h-4 w-4" />
          추가
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const daysRemaining = getDaysRemaining(item.nextPaymentDate);

          return (
            <article key={item.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.billingCycle} · {formatDate(item.nextPaymentDate)}
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:min-w-52 sm:flex-col sm:items-end">
                  <div className="text-sm font-medium text-foreground">
                    {formatWon(item.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {daysRemaining <= 0 ? "오늘" : `D-${daysRemaining}`}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
