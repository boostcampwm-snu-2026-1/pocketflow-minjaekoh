import { DashboardKpiCards } from "@/features/dashboard/dashboard-kpi-cards";
import { UpcomingCashflowImpactList } from "@/features/dashboard/upcoming-cashflow-impact-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <DashboardKpiCards />
      <UpcomingCashflowImpactList />
    </div>
  );
}
