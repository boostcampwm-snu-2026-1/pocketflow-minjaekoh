import { CalendarClock, LayoutDashboard, Wallet } from "lucide-react";

export const navigationItems = [
  {
    label: "대시보드",
    href: "/",
    icon: LayoutDashboard
  },
  {
    label: "가계부 기록",
    href: "/expense-log",
    icon: Wallet
  },
  {
    label: "정기 지출 시스템",
    href: "/cashflow-setup",
    icon: CalendarClock
  }
] as const;
