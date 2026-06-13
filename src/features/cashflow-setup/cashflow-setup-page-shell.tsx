"use client";

import { useMemo, useState } from "react";
import { FixedExpenseList } from "./fixed-expense-list";
import { DetailSettingsPanel } from "./detail-settings-panel";
import {
  initialSemiFixedExpenses,
  type SemiFixedExpenseItem
} from "./cashflow-types";
import { SemiFixedExpenseList } from "./semi-fixed-expense-list";

export function CashflowSetupPageShell() {
  const [items, setItems] = useState<SemiFixedExpenseItem[]>(
    initialSemiFixedExpenses
  );
  const [selectedId, setSelectedId] = useState(initialSemiFixedExpenses[0].id);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0],
    [items, selectedId]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)_minmax(320px,0.9fr)]">
      <div className="space-y-8">
        <FixedExpenseList />
      </div>

      <div className="space-y-8">
        <SemiFixedExpenseList
          items={items}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <DetailSettingsPanel
        selectedItem={selectedItem}
        onSave={(nextItem) => {
          setItems((current) =>
            current.map((item) => (item.id === nextItem.id ? nextItem : item))
          );
        }}
      />
    </div>
  );
}
