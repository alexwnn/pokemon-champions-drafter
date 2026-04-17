"use client";

import { useEffect, useState } from "react";
import { fetchPokemonList } from "@/lib/pokeapi";
import type { PokemonListItem } from "@/lib/types";
import { useAppStore } from "@/stores/appStore";

let cached: PokemonListItem[] | null = null;
let inflight: Promise<PokemonListItem[]> | null = null;

export function usePokemonList(): {
  list: PokemonListItem[];
  loading: boolean;
  error: Error | null;
} {
  const [list, setList] = useState<PokemonListItem[]>(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);
  const setApiStatus = useAppStore((s) => s.setApiStatus);

  useEffect(() => {
    if (cached) return;
    const ctrl = new AbortController();
    if (!inflight) {
      inflight = fetchPokemonList(ctrl.signal);
    }
    inflight
      .then((data) => {
        cached = data;
        setList(data);
        setApiStatus({ pokeapi: "ok" });
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") {
          setError(e);
          setApiStatus({ pokeapi: "down" });
        }
      })
      .finally(() => {
        setLoading(false);
        inflight = null;
      });
    return () => ctrl.abort();
  }, [setApiStatus]);

  return { list, loading, error };
}
