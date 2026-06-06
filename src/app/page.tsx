import { DashboardKpiCards } from "@/features/dashboard/dashboard-kpi-cards";
import { DashboardAiAnalysisPanel } from "@/features/dashboard/dashboard-ai-analysis-panel";
import { DailyCashflowChart } from "@/features/dashboard/daily-cashflow-chart";
import { UpcomingCashflowImpactList } from "@/features/dashboard/upcoming-cashflow-impact-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <DashboardKpiCards />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)]">
        <div className="space-y-8">
          <DailyCashflowChart />
          <UpcomingCashflowImpactList />
        </div>

        <div className="xl:sticky xl:top-8 xl:self-start">
          <DashboardAiAnalysisPanel />
        </div>
      </div>
    </div>
  );
}
