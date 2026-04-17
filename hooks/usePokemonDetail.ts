"use client";

import { useEffect, useState } from "react";
import { fetchPokemonDetail } from "@/lib/pokeapi";
import type { PokemonData } from "@/lib/types";
import { useAppStore } from "@/stores/appStore";

const inflight = new Map<string, Promise<PokemonData>>();

export function usePokemonDetail(slug: string | null): {
  data: PokemonData | null;
  loading: boolean;
  error: Error | null;
} {
  const cached = useAppStore((s) =>
    slug ? (s.pokemonCache.get(slug) ?? null) : null,
  );
  const cachePokemon = useAppStore((s) => s.cachePokemon);
  const setApiStatus = useAppStore((s) => s.setApiStatus);

  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug || cached) return;
    let cancelled = false;
    const ctrl = new AbortController();
    let p = inflight.get(slug);
    if (!p) {
      p = fetchPokemonDetail(slug, ctrl.signal);
      inflight.set(slug, p);
    }
    p.then((data) => {
      if (cancelled) return;
      cachePokemon(data);
      setApiStatus({ pokeapi: "ok" });
    })
      .catch((e: Error) => {
        if (cancelled || e.name === "AbortError") return;
        setError(e);
        setApiStatus({ pokeapi: "degraded" });
      })
      .finally(() => {
        inflight.delete(slug);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [slug, cached, cachePokemon, setApiStatus]);

  const loading = !!slug && !cached && !error;
  return { data: cached ?? null, loading, error };
}

export async function ensurePokemonDetail(
  slug: string,
): Promise<PokemonData> {
  const store = useAppStore.getState();
  const hit = store.pokemonCache.get(slug);
  if (hit) return hit;
  let p = inflight.get(slug);
  if (!p) {
    p = fetchPokemonDetail(slug);
    inflight.set(slug, p);
  }
  const data = await p.finally(() => inflight.delete(slug));
  useAppStore.getState().cachePokemon(data);
  return data;
}
