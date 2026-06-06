import { ExpenseEntryForm } from "@/features/expense-log/expense-entry-form";
import { AiPurchaseSimulatorPanel } from "@/features/expense-log/ai-purchase-simulator-panel";

export default function ExpenseLogPage() {
  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <ExpenseEntryForm />
      <AiPurchaseSimulatorPanel />
    </div>
  );
}
