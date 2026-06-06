import { DashboardKpiCards } from "@/features/dashboard/dashboard-kpi-cards";
import { DailyCashflowChart } from "@/features/dashboard/daily-cashflow-chart";
import { UpcomingCashflowImpactList } from "@/features/dashboard/upcoming-cashflow-impact-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <DashboardKpiCards />
      <DailyCashflowChart />
      <UpcomingCashflowImpactList />
    </div>
  );
}
