import { Bell, Settings } from "lucide-react";

export function TopHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b px-6">
      <div className="flex items-center gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-full border bg-secondary text-sm font-semibold">
          JD
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Welcome Back!</p>
          <p className="font-semibold">John Doe</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="알림"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="설정"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
