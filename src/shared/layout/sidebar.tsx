"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/shared/config/navigation";
import { cn } from "@/shared/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-52 shrink-0 border-r bg-[#0d0d0d] md:flex md:flex-col">
      <div className="flex h-20 items-center px-5">
        <span className="text-lg font-bold text-foreground">POCKETFLOW</span>
      </div>
      <nav className="flex flex-col gap-2 px-3">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary",
                !isActive && "hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
