import { FixedExpenseList } from "@/features/cashflow-setup/fixed-expense-list";
import { SemiFixedExpenseList } from "@/features/cashflow-setup/semi-fixed-expense-list";

export default function CashflowSetupPage() {
  return (
    <div className="space-y-10">
      <FixedExpenseList />
      <SemiFixedExpenseList />
    </div>
  );
}
