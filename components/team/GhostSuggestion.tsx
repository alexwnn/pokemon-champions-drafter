"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { spriteUrl, toLightPokemon } from "@/lib/pokeapi";
import { ensurePokemonDetail } from "@/hooks/usePokemonDetail";
import { useEffect, useState } from "react";
import { useAppStore } from "@/stores/appStore";
import type { Suggestion } from "@/hooks/useOpponentSuggestions";

export function GhostSuggestion({
  suggestion,
  slotIdx,
}: {
  suggestion: Suggestion;
  slotIdx: number;
}) {
  const setSlot = useAppStore((s) => s.setSlot);
  const [busy, setBusy] = useState(false);

  async function accept() {
    if (busy) return;
    setBusy(true);
    try {
      const data = await ensurePokemonDetail(suggestion.slug);
      setSlot("opp", slotIdx, toLightPokemon(data));
    } catch {
      // leave ghost in place on failure
    } finally {
      setBusy(false);
    }
  }

  // Best-effort: try to infer sprite id from topList entry using PokeAPI detail cache, else fall back to a numbered guess via cache
  // We don't have id here; use ensurePokemonDetail to hydrate on click — for display, use a silhouette from the slug's first letter
  return (
    <button
      type="button"
      onClick={accept}
      disabled={busy}
      className="group absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-2/20 text-muted hover:text-text hover:bg-surface-2/60 transition-colors"
      title={
        suggestion.reason === "teammate"
          ? `Paired with ${suggestion.boostedBy} in ${suggestion.usagePct}% of teams`
          : `${suggestion.usagePct}% of teams run this`
      }
    >
      <div className="relative">
        <GhostSprite slug={suggestion.slug} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-bg">
          <Plus size={10} />
        </span>
      </div>
      <span className="truncate max-w-full text-[10px] font-medium">
        {suggestion.displayName}
      </span>
      <span className="font-mono text-[9px] text-muted">
        {suggestion.usagePct.toFixed(1)}%
        {suggestion.reason === "teammate" && (
          <span className="ml-1 text-primary">★</span>
        )}
      </span>
    </button>
  );
}

function GhostSprite({ slug }: { slug: string }) {
  const cached = useAppStore((s) => s.pokemonCache.get(slug));
  useEffect(() => {
    if (!cached) {
      ensurePokemonDetail(slug).catch(() => {});
    }
  }, [slug, cached]);
  if (cached) {
    return (
      <Image
        src={spriteUrl(cached.id)}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 [image-rendering:pixelated] opacity-60 group-hover:opacity-100 transition-opacity"
        unoptimized
      />
    );
  }
  return (
    <div className="h-14 w-14 flex items-center justify-center rounded bg-surface/40 text-[18px] font-bold uppercase opacity-50 group-hover:opacity-80">
      {slug[0]}
    </div>
  );
}
