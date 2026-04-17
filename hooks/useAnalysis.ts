"use client";

import { useMemo } from "react";
import type { MonContext } from "@/lib/analysis";
import {
  buildCoverageMatrix,
  compositeTeamScore,
  defensiveScore,
  gapAnalysis,
  offensiveCoverageScore,
  threatReport,
} from "@/lib/analysis";
import { useAppStore } from "@/stores/appStore";

function toContexts(
  pool: ReturnType<typeof useAppStore.getState>["myPool"],
  battle: number[],
  usageCache: Map<string, import("@/lib/types").UsageData>,
  format: string,
): MonContext[] {
  const indices = battle.length > 0 ? battle : pool
    .map((_, i) => i)
    .filter((i) => pool[i]);
  return indices
    .map((i) => pool[i])
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      pokemon: p,
      usage: usageCache.get(`${format}:${p.slug}`) ?? null,
    }));
}

export function useAnalysis() {
  const myPool = useAppStore((s) => s.myPool);
  const oppPool = useAppStore((s) => s.oppPool);
  const myBattle = useAppStore((s) => s.myBattle);
  const oppBattle = useAppStore((s) => s.oppBattle);
  const usageCache = useAppStore((s) => s.usageCache);
  const format = useAppStore((s) => s.format);

  return useMemo(() => {
    const mine = toContexts(myPool, myBattle, usageCache, format);
    const opps = toContexts(oppPool, oppBattle, usageCache, format);
    return {
      mine,
      opps,
      matrix: buildCoverageMatrix(mine, opps),
      threats: threatReport(mine, opps),
      gaps: gapAnalysis(mine),
      offense: offensiveCoverageScore(mine, opps),
      defense: defensiveScore(mine, opps),
      teamScore: compositeTeamScore(mine, opps),
    };
  }, [myPool, oppPool, myBattle, oppBattle, usageCache, format]);
}
