"use client";

import clsx from "clsx";
import { useAppStore } from "@/stores/appStore";
import type { ApiStatus } from "@/lib/types";

const COLOR: Record<ApiStatus, string> = {
  ok: "bg-success",
  degraded: "bg-gold",
  down: "bg-danger",
  unknown: "bg-muted",
};

const LABEL: Record<ApiStatus, string> = {
  ok: "OK",
  degraded: "Degraded",
  down: "Down",
  unknown: "Pending",
};

export function APIStatusDot() {
  const status = useAppStore((s) => s.apiStatus);
  return (
    <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
      <Dot name="PokeAPI" s={status.pokeapi} />
      <Dot name="Pikalytics" s={status.pikalytics} />
    </div>
  );
}

function Dot({ name, s }: { name: string; s: ApiStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      title={`${name}: ${LABEL[s]}`}
    >
      <span className={clsx("h-2 w-2 rounded-full", COLOR[s])} />
      <span className="hidden md:inline">{name}</span>
    </span>
  );
}
