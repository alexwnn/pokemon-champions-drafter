"use client";

import Image from "next/image";
import type { Threat } from "@/lib/analysis";
import { multiplierLabel } from "@/lib/theme";

export function ThreatChip({ threat }: { threat: Threat }) {
  return (
    <div className="flex items-center gap-2 rounded border border-border bg-surface-2 px-2 py-1">
      <Image
        src={threat.pokemon.spriteUrl}
        alt={threat.pokemon.name}
        width={32}
        height={32}
        className="h-8 w-8 [image-rendering:pixelated]"
        unoptimized
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">
          {threat.pokemon.name}
        </div>
        <div className="font-mono text-[10px] text-muted truncate">
          {threat.breakdown
            .filter((b) => b.multiplier >= 2)
            .map((b) => `${b.target.name} ${multiplierLabel(b.multiplier)}`)
            .join(" · ") || "even"}
        </div>
      </div>
      <span className="font-mono text-[11px] text-danger">
        {threat.pressure.toFixed(1)}
      </span>
    </div>
  );
}
