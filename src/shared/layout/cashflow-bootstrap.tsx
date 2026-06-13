"use client";

import { useEffect } from "react";
import { useCashflowStore } from "@/store/cashflow-store";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CashflowBootstrap() {
  const syncScheduledItems = useCashflowStore((state) => state.syncScheduledItems);

  useEffect(() => {
    const sync = () => syncScheduledItems(getToday());

    sync();

    const handleFocus = () => sync();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncScheduledItems]);

  return null;
}
