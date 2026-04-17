"use client";

import { useEffect, useMemo } from "react";
import type { MonContext } from "@/lib/analysis";
import { recommendNext, type Recommendation } from "@/lib/analysis";
import { toLightPokemon } from "@/lib/pokeapi";
import type { TypeName } from "@/lib/types";
import { useAppStore } from "@/stores/appStore";
import { useTopList } from "./useTopList";
import { ensurePokemonDetail } from "./usePokemonDetail";
import { ensureUsage } from "./useUsage";

const PREFETCH_LIMIT = 20;

export function useRecommendations(typeFilter?: TypeName | null): {
  picks: Recommendation[];
  loading: boolean;
} {
  const format = useAppStore((s) => s.format);
  const myPool = useAppStore((s) => s.myPool);
  const oppPool = useAppStore((s) => s.oppPool);
  const myBattle = useAppStore((s) => s.myBattle);
  const oppBattle = useAppStore((s) => s.oppBattle);
  const pokemonCache = useAppStore((s) => s.pokemonCache);
  const usageCache = useAppStore((s) => s.usageCache);
  const { data: topList } = useTopList(format);

  useEffect(() => {
    if (!topList) return;
    const picked = new Set<string>();
    myPool.forEach((p) => p && picked.add(p.slug));
    oppPool.forEach((p) => p && picked.add(p.slug));
    const toPrefetch = topList.entries
      .filter((e) => !picked.has(e.slug))
      .slice(0, PREFETCH_LIMIT);
    toPrefetch.forEach((e) => {
      ensurePokemonDetail(e.slug).catch(() => {});
      ensureUsage(format, e.slug);
    });
  }, [topList, format, myPool, oppPool]);

  return useMemo(() => {
    if (!topList) return { picks: [], loading: true };
    const picked = new Set<string>();
    myPool.forEach((p) => p && picked.add(p.slug));
    oppPool.forEach((p) => p && picked.add(p.slug));

    const mineIdx = myBattle.length > 0 ? myBattle : myPool.map((_, i) => i);
    const oppsIdx = oppBattle.length > 0 ? oppBattle : oppPool.map((_, i) => i);

    const mine: MonContext[] = mineIdx
      .map((i) => myPool[i])
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        pokemon: p,
        usage: usageCache.get(`${format}:${p.slug}`) ?? null,
      }));
    const opps: MonContext[] = oppsIdx
      .map((i) => oppPool[i])
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({
        pokemon: p,
        usage: usageCache.get(`${format}:${p.slug}`) ?? null,
      }));

    const candidates = topList.entries
      .filter((e) => !picked.has(e.slug))
      .map((e) => {
        const detail = pokemonCache.get(e.slug);
        if (!detail) return null;
        if (typeFilter && !detail.types.includes(typeFilter)) return null;
        return {
          pokemon: toLightPokemon(detail),
          usage: usageCache.get(`${format}:${e.slug}`) ?? null,
          usagePct: e.usagePct,
        };
      })
      .filter((c): c is NonNullable<typeof c> => !!c);

    return {
      picks: recommendNext(mine, opps, candidates, 3),
      loading: candidates.length < 6,
    };
  }, [
    topList,
    myPool,
    oppPool,
    myBattle,
    oppBattle,
    pokemonCache,
    usageCache,
    format,
    typeFilter,
  ]);
}
