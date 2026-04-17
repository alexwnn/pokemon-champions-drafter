"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { TypePill } from "@/components/ui/TypePill";
import { ALL_TYPES, type TypeName } from "@/lib/types";
import { RecommendationCard } from "./RecommendationCard";
import { useAppStore } from "@/stores/appStore";

export function RecommendationPanel() {
  const [filter, setFilter] = useState<TypeName | null>(null);
  const { picks, loading } = useRecommendations(filter);
  const myPool = useAppStore((s) => s.myPool);
  const oppPool = useAppStore((s) => s.oppPool);
  const myFull = !myPool.some((p) => p === null);
  const empty = !myPool.some((p) => p) && !oppPool.some((p) => p);

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-1">
          <Sparkles size={14} className="text-primary" /> Next-pick recommendations
        </h3>
        {filter && (
          <button
            type="button"
            onClick={() => setFilter(null)}
            className="text-[11px] text-muted hover:text-text"
          >
            Clear filter
          </button>
        )}
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {ALL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(filter === t ? null : t)}
            className={`transition-opacity ${
              filter && filter !== t ? "opacity-40" : "opacity-100"
            }`}
          >
            <TypePill type={t} size="xs" />
          </button>
        ))}
      </div>
      {empty && (
        <p className="text-xs text-muted">
          Add at least one Pokémon to start getting recommendations.
        </p>
      )}
      {!empty && myFull && (
        <p className="text-xs text-muted">
          Your pool is full. Remove one to unlock new recommendations.
        </p>
      )}
      {!empty && !myFull && picks.length === 0 && (
        <p className="text-xs text-muted">
          {loading
            ? "Loading candidates…"
            : filter
              ? `No ${filter}-type candidates in top meta list.`
              : "No candidates yet."}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {picks.map((p) => (
          <RecommendationCard key={p.pokemon.slug} rec={p} />
        ))}
      </div>
    </div>
  );
}
