"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import type { Recommendation } from "@/lib/analysis";
import { toLightPokemon } from "@/lib/pokeapi";
import { ensurePokemonDetail } from "@/hooks/usePokemonDetail";
import { TypePill } from "@/components/ui/TypePill";
import { ScoreBar } from "./ScoreBar";
import { useAppStore } from "@/stores/appStore";

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  const myPool = useAppStore((s) => s.myPool);
  const setSlot = useAppStore((s) => s.setSlot);
  const slotOpen = myPool.findIndex((p) => p === null);

  async function addToTeam() {
    if (slotOpen === -1) return;
    try {
      const data = await ensurePokemonDetail(rec.pokemon.slug);
      setSlot("my", slotOpen, toLightPokemon(data));
    } catch {
      // swallow — user can retry
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3 flex gap-3">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Image
          src={rec.pokemon.spriteUrl}
          alt={rec.pokemon.name}
          width={56}
          height={56}
          className="h-14 w-14 [image-rendering:pixelated]"
          unoptimized
        />
        <div className="flex gap-1 flex-wrap justify-center">
          {rec.pokemon.types.map((t) => (
            <TypePill key={t} type={t} size="xs" />
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {rec.pokemon.name}
            </div>
            <div className="text-[11px] text-muted">{rec.reason}</div>
          </div>
          <button
            type="button"
            onClick={addToTeam}
            disabled={slotOpen === -1}
            className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <ScoreBar label="Off" value={rec.breakdown.offense} color="danger" />
          <ScoreBar label="Def" value={rec.breakdown.defense} color="primary" />
          <ScoreBar label="Meta" value={rec.breakdown.meta} color="gold" />
          <ScoreBar
            label="Synergy"
            value={rec.breakdown.synergy}
            color="success"
          />
        </div>
      </div>
    </div>
  );
}
