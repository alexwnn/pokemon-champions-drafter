"use client";

import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/stores/appStore";

export function DegradedBanner() {
  const pika = useAppStore((s) => s.apiStatus.pikalytics);
  if (pika !== "down" && pika !== "degraded") return null;
  return (
    <div className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger-soft/40 px-3 py-2 text-xs text-text">
      <AlertTriangle size={14} className="text-danger mt-0.5 shrink-0" />
      <div>
        <strong className="font-medium">Pikalytics {pika}.</strong>{" "}
        Opponent prediction and meta scoring fall back to type-only heuristics
        until it comes back online.
      </div>
    </div>
  );
}
