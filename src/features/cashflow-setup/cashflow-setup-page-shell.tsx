"use client";

import { useMemo } from "react";
import { DetailSettingsPanel } from "./detail-settings-panel";
import { FixedExpenseList } from "./fixed-expense-list";
import { SemiFixedExpenseList } from "./semi-fixed-expense-list";
import { useCashflowStore } from "@/store/cashflow-store";

export function CashflowSetupPageShell() {
  const fixedExpenses = useCashflowStore((state) => state.fixedExpenses);
  const semiFixedExpenses = useCashflowStore((state) => state.semiFixedExpenses);
  const selectedId = useCashflowStore((state) => state.selectedSemiFixedExpenseId);
  const selectSemiFixedExpense = useCashflowStore((state) => state.selectSemiFixedExpense);
  const updateSemiFixedExpense = useCashflowStore((state) => state.updateSemiFixedExpense);

  const selectedItem = useMemo(
    () => semiFixedExpenses.find((item) => item.id === selectedId) ?? semiFixedExpenses[0],
    [semiFixedExpenses, selectedId]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="space-y-8">
        <FixedExpenseList items={fixedExpenses} />
      </div>

      <div className="space-y-8">
        <SemiFixedExpenseList
          items={semiFixedExpenses}
          selectedId={selectedId}
          onSelect={selectSemiFixedExpense}
        />
      </div>

      <DetailSettingsPanel
        selectedItem={selectedItem}
        onSave={updateSemiFixedExpense}
      />
    </div>
  );
}
