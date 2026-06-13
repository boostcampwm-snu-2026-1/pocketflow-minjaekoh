"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "대시보드",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "지출 관리",
    href: "/expenses",
    icon: Wallet,
  },
  {
    label: "정기 지출 설정",
    href: "/recurring",
    icon: CalendarClock,
  },
];

export function PocketflowSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[220px] flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
          POCKETFLOW
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
