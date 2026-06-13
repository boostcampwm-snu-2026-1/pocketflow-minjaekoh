"use client";

import { useMemo } from "react";
import { BudgetRulesPanel } from "./budget-rules-panel";
import { DetailSettingsPanel } from "./detail-settings-panel";
import { SemiFixedExpenseList } from "./semi-fixed-expense-list";
import { useCashflowStore } from "@/store/cashflow-store";

export function CashflowSetupPageShell() {
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

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-card p-5 md:p-6">
        <p className="text-sm text-muted-foreground">Budget system</p>
        <h1 className="text-2xl font-bold text-foreground">정기 지출 시스템</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground md:whitespace-nowrap">
          매달 움직이는 고정비, 정기 수입, 개별 생필품을 관리하는 곳입니다.
        </p>
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
