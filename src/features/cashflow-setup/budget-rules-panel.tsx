"use client";

import { useMemo, useState } from "react";
import { PencilLine, Plus, ReceiptText, Trash2 } from "lucide-react";
import { billingCycleOptions } from "./cashflow-types";
import type { FixedExpenseItem, RecurringIncomeItem } from "@/store/cashflow-store";

type RuleKind = "expense" | "income";

type BudgetRuleItem = {
  id: string;
  kind: RuleKind;
  name: string;
  amount: number;
  billingCycle: string;
  nextPaymentDate: string;
  note: string;
  autoInclude?: boolean;
};

type DraftState = {
  id: string | null;
  kind: RuleKind;
  name: string;
  amount: string;
  billingCycle: string;
  nextPaymentDate: string;
  note: string;
  autoInclude: boolean;
};

type BudgetRulesPanelProps = {
  fixedExpenses: FixedExpenseItem[];
  recurringIncomes: RecurringIncomeItem[];
  onAddFixedExpense: (item: FixedExpenseItem) => void;
  onUpdateFixedExpense: (item: FixedExpenseItem) => void;
  onRemoveFixedExpense: (id: string) => void;
  onAddRecurringIncome: (item: RecurringIncomeItem) => void;
  onUpdateRecurringIncome: (item: RecurringIncomeItem) => void;
  onRemoveRecurringIncome: (id: string) => void;
};

const initialDraft: DraftState = {
  id: null,
  kind: "expense",
  name: "",
  amount: "",
  billingCycle: "매월",
  nextPaymentDate: "2026-06-25",
  note: "",
  autoInclude: true
};

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string) {
  return value.slice(5).replace("-", "/");
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function BudgetRulesPanel({
  fixedExpenses,
  recurringIncomes,
  onAddFixedExpense,
  onUpdateFixedExpense,
  onRemoveFixedExpense,
  onAddRecurringIncome,
  onUpdateRecurringIncome,
  onRemoveRecurringIncome
}: BudgetRulesPanelProps) {
  const [draft, setDraft] = useState<DraftState>(initialDraft);

  const expenseItems = useMemo(
    () =>
      fixedExpenses
        .map((item) => ({ ...item, kind: "expense" as const }))
        .sort((left, right) => {
        const dateOrder = right.nextPaymentDate.localeCompare(left.nextPaymentDate);
        if (dateOrder !== 0) {
          return dateOrder;
        }

        return left.name.localeCompare(right.name);
      }),
    [fixedExpenses]
  );

  const incomeItems = useMemo(
    () =>
      recurringIncomes
        .map((item) => ({ ...item, kind: "income" as const }))
        .sort((left, right) => {
        const dateOrder = right.nextPaymentDate.localeCompare(left.nextPaymentDate);
        if (dateOrder !== 0) {
          return dateOrder;
        }

        return left.name.localeCompare(right.name);
      }),
    [recurringIncomes]
  );

  const submitLabel = draft.id ? "변경 저장" : "추가";
  const panelTitle = draft.kind === "expense" ? "고정비 / 지출 추가" : "정기 수입 추가";
  const typeLabel = draft.kind === "expense" ? "지출" : "수입";
  const isEditing = Boolean(draft.id);

  const startEdit = (item: BudgetRuleItem) => {
    setDraft({
      id: item.id,
      kind: item.kind,
      name: item.name,
      amount: String(item.amount),
      billingCycle: item.billingCycle,
      nextPaymentDate: item.nextPaymentDate,
      note: item.note,
      autoInclude: item.kind === "income" ? Boolean(item.autoInclude) : true
    });
  };

  const resetDraft = () => setDraft(initialDraft);

  const handleSubmit = () => {
    const amount = Number(draft.amount.replace(/[^\d]/g, ""));
    if (!draft.name.trim() || !Number.isFinite(amount) || amount <= 0 || !draft.nextPaymentDate) {
      return;
    }

    if (draft.kind === "expense") {
      const nextItem: FixedExpenseItem = {
        id: draft.id ?? createId("fixed"),
        name: draft.name.trim(),
        amount: Math.round(amount),
        billingCycle: draft.billingCycle,
        nextPaymentDate: draft.nextPaymentDate,
        note: draft.note.trim() || "메모 없음"
      };

      if (draft.id) {
        onUpdateFixedExpense(nextItem);
      } else {
        onAddFixedExpense(nextItem);
      }
    } else {
      const nextItem: RecurringIncomeItem = {
        id: draft.id ?? createId("income"),
        name: draft.name.trim(),
        amount: Math.round(amount),
        billingCycle: draft.billingCycle,
        nextPaymentDate: draft.nextPaymentDate,
        note: draft.note.trim() || "메모 없음",
        autoInclude: draft.autoInclude
      };

      if (draft.id) {
        onUpdateRecurringIncome(nextItem);
      } else {
        onAddRecurringIncome(nextItem);
      }
    }

    resetDraft();
  };

  const toggleKind = (kind: RuleKind) => {
    setDraft((current) => ({
      ...current,
      kind,
      id: null,
      amount: "",
      name: "",
      note: "",
      autoInclude: kind === "income"
    }));
  };

  return (
    <section aria-labelledby="budget-rules-heading" className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Budget system</p>
        <h2 id="budget-rules-heading" className="text-2xl font-bold">
          고정비 / 정기수입 설정
        </h2>
      </div>

      <div
        className={[
          "rounded-xl border p-4 space-y-4 transition-colors",
          isEditing ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_rgba(234,179,8,0.15)]" : "bg-card"
        ].join(" ")}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          <span>{panelTitle}</span>
          {isEditing ? (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              수정 중
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toggleKind("expense")}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              draft.kind === "expense"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            ].join(" ")}
          >
            지출
          </button>
          <button
            type="button"
            onClick={() => toggleKind("income")}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              draft.kind === "income"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            ].join(" ")}
          >
            수입
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder={`${typeLabel} 항목명`}
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
              setDraft((current) => ({ ...current, billingCycle: event.target.value }))
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

          {draft.kind === "income" ? (
            <label className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground md:col-span-2">
              <input
                type="checkbox"
                checked={draft.autoInclude}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, autoInclude: event.target.checked }))
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              자동 포함
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <Plus className="h-4 w-4" />
            {submitLabel}
          </button>
          {draft.id ? (
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              취소
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <RuleSection
          title="비용"
          items={expenseItems}
          tone="expense"
          onSelect={startEdit}
          onRemoveFixedExpense={onRemoveFixedExpense}
          onRemoveRecurringIncome={onRemoveRecurringIncome}
          selectedId={draft.id}
        />
        <RuleSection
          title="수입"
          items={incomeItems}
          tone="income"
          onSelect={startEdit}
          onRemoveFixedExpense={onRemoveFixedExpense}
          onRemoveRecurringIncome={onRemoveRecurringIncome}
          selectedId={draft.id}
        />
      </div>
    </section>
  );
}

function RuleSection({
  title,
  items,
  tone,
  onSelect,
  onRemoveFixedExpense,
  onRemoveRecurringIncome,
  selectedId
}: {
  title: string;
  items: BudgetRuleItem[];
  tone: RuleKind;
  onSelect: (item: BudgetRuleItem) => void;
  onRemoveFixedExpense: (id: string) => void;
  onRemoveRecurringIncome: (id: string) => void;
  selectedId: string | null;
}) {
  const emptyMessage = tone === "expense" ? "저장된 고정비가 없습니다." : "저장된 정기 수입이 없습니다.";
  const shouldScroll = items.length > 2;

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length}건</span>
      </div>

      <div
        className={[
          "space-y-3 pr-1",
          shouldScroll ? "max-h-[280px] overflow-y-auto" : ""
        ].join(" ")}
      >
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-background px-4 py-6 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => {
            const isSelected = item.id === selectedId;

            return (
              <article
                key={item.id}
                className={[
                  "rounded-xl border p-4 transition-colors",
                  tone === "expense"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-sky-500/20 bg-sky-500/5",
                  isSelected ? "ring-1 ring-primary/30" : ""
                ].join(" ")}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.note}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          tone === "expense"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-400"
                        ].join(" ")}
                      >
                        {tone === "expense" ? "지출" : "수입"}
                      </span>
                      <span>
                        {item.billingCycle} · {formatDate(item.nextPaymentDate)}
                      </span>
                      {tone === "income" ? (
                        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-500">
                          {item.autoInclude ? "자동 포함" : "수동 반영"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:min-w-52 sm:flex-col sm:items-end">
                    <div
                      className={[
                        "text-sm font-medium",
                        tone === "expense" ? "text-amber-300" : "text-sky-300"
                      ].join(" ")}
                    >
                      {formatWon(item.amount)}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                      >
                        <PencilLine className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          tone === "expense" ? onRemoveFixedExpense(item.id) : onRemoveRecurringIncome(item.id)
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
