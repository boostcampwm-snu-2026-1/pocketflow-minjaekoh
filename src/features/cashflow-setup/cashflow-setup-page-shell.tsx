"use client";

import { useEffect, useMemo, useState } from "react";
import { BudgetRulesPanel } from "./budget-rules-panel";
import { DetailSettingsPanel } from "./detail-settings-panel";
import { SemiFixedExpenseList } from "./semi-fixed-expense-list";
import { useCashflowStore } from "@/store/cashflow-store";

export function CashflowSetupPageShell() {
  const startingBalance = useCashflowStore((state) => state.startingBalance);
  const setStartingBalance = useCashflowStore((state) => state.setStartingBalance);
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const recurringIncomes = useCashflowStore((state) => state.recurringIncomes);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const selectedId = useCashflowStore((state) => state.selectedSemiFixedExpenseId);
  const selectSemiFixedExpense = useCashflowStore((state) => state.selectSemiFixedExpense);
  const addFixedExpense = useCashflowStore((state) => state.addFixedExpense);
  const removeFixedExpense = useCashflowStore((state) => state.removeFixedExpense);
  const addRecurringIncome = useCashflowStore((state) => state.addRecurringIncome);
  const removeRecurringIncome = useCashflowStore((state) => state.removeRecurringIncome);
  const addSemiFixedExpense = useCashflowStore((state) => state.addSemiFixedExpense);
  const removeSemiFixedExpense = useCashflowStore((state) => state.removeSemiFixedExpense);
  const updateFixedExpense = useCashflowStore((state) => state.updateFixedExpense);
  const updateRecurringIncome = useCashflowStore((state) => state.updateRecurringIncome);
  const updateSemiFixedExpense = useCashflowStore((state) => state.updateSemiFixedExpense);
  const [startingBalanceDraft, setStartingBalanceDraft] = useState(String(startingBalance));

  useEffect(() => {
    setStartingBalanceDraft(String(startingBalance));
  }, [startingBalance]);

  const upsertSemiFixedExpense = (item: Parameters<typeof updateSemiFixedExpense>[0]) => {
    const exists = semiFixedExpenses.some((current) => current.id === item.id);
    if (exists) {
      updateSemiFixedExpense(item);
      return;
    }

    addSemiFixedExpense(item);
    selectSemiFixedExpense(item.id);
  };

  const selectedItem = useMemo(
    () => semiFixedExpenses.find((item) => item.id === selectedId) ?? semiFixedExpenses[0],
    [semiFixedExpenses, selectedId]
  );

  const handleApplyStartingBalance = () => {
    const parsed = Number(startingBalanceDraft.replace(/[^\d]/g, ""));
    if (!Number.isFinite(parsed) || parsed < 0) {
      return;
    }

    const nextValue = Math.round(parsed);
    setStartingBalance(nextValue);
    setStartingBalanceDraft(String(nextValue));
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-5 md:p-6">
        <p className="text-sm text-muted-foreground">Budget system</p>
        <h1 className="text-2xl font-bold text-foreground">정기 지출 시스템</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground md:whitespace-nowrap">
          매달 들어가는 고정비와 정기 수입, 개별 항목을 관리하는 곳입니다.
        </p>
      </div>



      <div className="rounded-xl border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">초기 기준값</p>
            <h2 className="text-xl font-semibold text-foreground">최초 잔액</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              대시보드, 30일 예측, AI 소비 판정기의 출발점이 되는 금액입니다.
            </p>
          </div>

          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              value={startingBalanceDraft}
              onChange={(event) =>
                setStartingBalanceDraft(event.target.value.replace(/[^\d]/g, ""))
              }
              inputMode="numeric"
              placeholder="예: 842000"
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
            />
            <button
              type="button"
              onClick={handleApplyStartingBalance}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              적용
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.15fr)_minmax(380px,1fr)]">
        <BudgetRulesPanel
          fixedExpenses={fixedExpenses}
          recurringIncomes={recurringIncomes}
          onAddFixedExpense={addFixedExpense}
          onUpdateFixedExpense={updateFixedExpense}
          onRemoveFixedExpense={removeFixedExpense}
          onAddRecurringIncome={addRecurringIncome}
          onUpdateRecurringIncome={updateRecurringIncome}
          onRemoveRecurringIncome={removeRecurringIncome}
        />

        <div className="space-y-8">
          <SemiFixedExpenseList
            items={semiFixedExpenses}
            selectedId={selectedId}
            onSelect={selectSemiFixedExpense}
            onRemoveItem={removeSemiFixedExpense}
          />
        </div>

        <DetailSettingsPanel
          selectedItem={selectedItem}
          onSave={upsertSemiFixedExpense}
        />
      </div>
    </div>
  );
}