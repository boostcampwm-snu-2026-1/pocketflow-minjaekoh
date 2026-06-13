import { CashflowBootstrap } from "./cashflow-bootstrap";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CashflowBootstrap />
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader />
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
