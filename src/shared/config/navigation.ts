import { CalendarClock, LayoutDashboard, Wallet } from "lucide-react";

export const navigationItems = [
  {
    label: "대시보드",
    href: "/",
    icon: LayoutDashboard
  },
  {
    label: "지출 관리",
    href: "/expense-log",
    icon: Wallet
  },
  {
    label: "정기 지출 설정",
    href: "/cashflow-setup",
    icon: CalendarClock
  }
] as const;
