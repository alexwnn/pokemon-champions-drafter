import type { Pokemon, TypeName, UsageData } from "./types";
import { ALL_TYPES } from "./types";
import {
  effectiveness,
  bestEffectivenessFromTypes,
  worstIncoming,
} from "./typeChart";

export interface MonContext {
  pokemon: Pokemon;
  usage?: UsageData | null;
}

export function attackingTypes(ctx: MonContext): TypeName[] {
  const fromUsage = ctx.usage?.topMoves
    .map((m) => m.type)
    .filter((t): t is TypeName => !!t);
  if (fromUsage && fromUsage.length > 0) {
    return Array.from(new Set(fromUsage));
  }
  return ctx.pokemon.types;
}

export function bestOffense(attacker: MonContext, defender: Pokemon): number {
  return bestEffectivenessFromTypes(attackingTypes(attacker), defender.types);
}

export function worstDefense(
  defender: MonContext,
  threat: MonContext,
): number {
  return worstIncoming(defender.pokemon.types, attackingTypes(threat));
}

export interface CoverageMatrixCell {
  myMon: Pokemon;
  oppMon: Pokemon;
  offense: number;
  defense: number;
}

export function buildCoverageMatrix(
  mine: MonContext[],
  opps: MonContext[],
): CoverageMatrixCell[][] {
  return mine.map((m) =>
    opps.map((o) => ({
      myMon: m.pokemon,
      oppMon: o.pokemon,
      offense: bestOffense(m, o.pokemon),
      defense: worstIncoming(m.pokemon.types, attackingTypes(o)),
    })),
  );
}

export interface Threat {
  pokemon: Pokemon;
  pressure: number;
  breakdown: { target: Pokemon; multiplier: number }[];
}

export function threatReport(
  mine: MonContext[],
  opps: MonContext[],
): Threat[] {
  return opps
    .map((o) => {
      const breakdown = mine.map((m) => ({
        target: m.pokemon,
        multiplier: bestEffectivenessFromTypes(
          attackingTypes(o),
          m.pokemon.types,
        ),
      }));
      const pressure = breakdown.reduce((a, b) => a + b.multiplier, 0);
      return { pokemon: o.pokemon, pressure, breakdown };
    })
    .sort((a, b) => b.pressure - a.pressure);
}

export interface Gap {
  type: TypeName;
  bestResistFactor: number;
}

export function gapAnalysis(mine: MonContext[]): Gap[] {
  if (mine.length === 0) return [];
  const gaps: Gap[] = [];
  for (const t of ALL_TYPES) {
    let best = Infinity;
    for (const m of mine) {
      const inc = effectiveness(t, m.pokemon.types);
      if (inc < best) best = inc;
    }
    if (best >= 2) gaps.push({ type: t, bestResistFactor: best });
  }
  return gaps.sort((a, b) => b.bestResistFactor - a.bestResistFactor);
}

export interface CoverageScore {
  coveredCount: number;
  total: number;
  pct: number;
  uncovered: Pokemon[];
}

export function offensiveCoverageScore(
  mine: MonContext[],
  opps: MonContext[],
): CoverageScore {
  const uncovered: Pokemon[] = [];
  for (const o of opps) {
    const anyHitsHard = mine.some((m) => bestOffense(m, o.pokemon) >= 2);
    if (!anyHitsHard) uncovered.push(o.pokemon);
  }
  const total = opps.length;
  const covered = total - uncovered.length;
  return {
    coveredCount: covered,
    total,
    pct: total === 0 ? 0 : (covered / total) * 100,
    uncovered,
  };
}

export function defensiveScore(
  mine: MonContext[],
  opps: MonContext[],
): number {
  if (mine.length === 0 || opps.length === 0) return 0;
  let total = 0;
  for (const m of mine) {
    let worst = 0;
    for (const o of opps) {
      const mult = worstIncoming(m.pokemon.types, attackingTypes(o));
      if (mult > worst) worst = mult;
    }
    total += 1 / Math.max(0.25, worst);
  }
  return (total / mine.length) * 50;
}

export function compositeTeamScore(
  mine: MonContext[],
  opps: MonContext[],
): number {
  if (mine.length === 0 || opps.length === 0) return 0;
  const cov = offensiveCoverageScore(mine, opps).pct;
  const def = Math.min(100, defensiveScore(mine, opps));
  const gapPenalty = gapAnalysis(mine).length * 6;
  return Math.max(0, Math.min(100, cov * 0.55 + def * 0.45 - gapPenalty));
}

export interface RecommendationBreakdown {
  offense: number;
  defense: number;
  meta: number;
  synergy: number;
  total: number;
}

export interface Recommendation {
  pokemon: Pokemon;
  usage?: UsageData | null;
  usagePct: number;
  breakdown: RecommendationBreakdown;
  reason: string;
}

function scoreOffense(
  candidate: MonContext,
  opps: MonContext[],
): number {
  if (opps.length === 0) return 50;
  const avg =
    opps.reduce((a, o) => a + bestOffense(candidate, o.pokemon), 0) /
    opps.length;
  return Math.min(100, avg * 50);
}

function scoreDefense(candidate: MonContext, opps: MonContext[]): number {
  if (opps.length === 0) return 50;
  const worst =
    opps.reduce(
      (a, o) =>
        a + worstIncoming(candidate.pokemon.types, attackingTypes(o)),
      0,
    ) / opps.length;
  return Math.max(0, 100 - worst * 40);
}

function scoreMeta(usagePct: number): number {
  return Math.min(100, usagePct * 2.2);
}

function scoreSynergy(
  candidate: MonContext,
  teammates: MonContext[],
): number {
  if (teammates.length === 0) return 50;
  let score = 50;
  const candDefTypes = candidate.pokemon.types;
  for (const t of teammates) {
    const teammateWeak = ALL_TYPES.filter(
      (typ) => effectiveness(typ, t.pokemon.types) >= 2,
    );
    const candidateResists = teammateWeak.filter(
      (typ) => effectiveness(typ, candDefTypes) <= 1,
    );
    score += candidateResists.length * 3;
  }
  const teammateUsageNames = new Set(
    teammates.flatMap(
      (t) => t.usage?.teammates.map((tm) => tm.name) ?? [],
    ),
  );
  if (teammateUsageNames.has(candidate.pokemon.slug)) score += 15;
  return Math.min(100, score);
}

export function recommendNext(
  team: MonContext[],
  opps: MonContext[],
  candidates: {
    pokemon: Pokemon;
    usage?: UsageData | null;
    usagePct: number;
  }[],
  limit = 3,
): Recommendation[] {
  const scored: Recommendation[] = candidates.map((c) => {
    const ctx: MonContext = { pokemon: c.pokemon, usage: c.usage };
    const offense = scoreOffense(ctx, opps);
    const defense = scoreDefense(ctx, opps);
    const meta = scoreMeta(c.usagePct);
    const synergy = scoreSynergy(ctx, team);
    const total =
      offense * 0.35 + defense * 0.25 + meta * 0.15 + synergy * 0.25;
    const dominant = (
      [
        ["offense", offense] as const,
        ["defense", defense] as const,
        ["synergy", synergy] as const,
        ["meta", meta] as const,
      ] as const
    ).reduce((a, b) => (b[1] > a[1] ? b : a));
    const reason = reasonFor(dominant[0], ctx, opps);
    return {
      pokemon: c.pokemon,
      usage: c.usage,
      usagePct: c.usagePct,
      breakdown: { offense, defense, meta, synergy, total },
      reason,
    };
  });
  return scored.sort((a, b) => b.breakdown.total - a.breakdown.total).slice(0, limit);
}

function reasonFor(
  dim: "offense" | "defense" | "meta" | "synergy",
  c: MonContext,
  opps: MonContext[],
): string {
  const name = c.pokemon.name;
  if (dim === "offense") {
    const hits = opps
      .filter((o) => bestOffense(c, o.pokemon) >= 2)
      .map((o) => o.pokemon.name)
      .slice(0, 2);
    if (hits.length) return `${name} hits ${hits.join(" & ")} hard.`;
    return `${name} applies broad offensive pressure.`;
  }
  if (dim === "defense") {
    const resists = opps
      .filter(
        (o) =>
          worstIncoming(c.pokemon.types, attackingTypes(o)) <= 0.5,
      )
      .map((o) => o.pokemon.name)
      .slice(0, 2);
    if (resists.length)
      return `${name} walls ${resists.join(" & ")}.`;
    return `${name} is defensively flexible against this team.`;
  }
  if (dim === "synergy") {
    return `${name} plugs type gaps on your side.`;
  }
  return `${name} is a meta anchor (${Math.round(
    Math.min(100, c.usage ? 50 + c.usage.usagePct : 50),
  )}% usage).`;
}
