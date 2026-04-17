"use client";

import { AlertTriangle, ShieldCheck, Swords } from "lucide-react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { TypePill } from "@/components/ui/TypePill";
import { ThreatChip } from "./ThreatChip";

export function AnalysisSummary() {
  const { teamScore, offense, threats, gaps, mine, opps } = useAnalysis();
  const ready = mine.length > 0 && opps.length > 0;
  return (
    <div className="flex flex-col gap-3">
      <section className="rounded-lg border border-border bg-surface p-3">
        <h3 className="text-sm font-semibold mb-2">Team score</h3>
        {ready ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl text-primary">
                {teamScore.toFixed(0)}
              </span>
              <span className="text-xs text-muted">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 rounded bg-surface-2 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${teamScore}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] font-mono text-muted flex items-center gap-1">
              <Swords size={12} />
              Offense coverage: {offense.coveredCount}/{offense.total} (
              {offense.pct.toFixed(0)}%)
            </div>
          </>
        ) : (
          <p className="text-xs text-muted">
            Pick at least one Pokémon on each side to compute a score.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-surface p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <AlertTriangle size={14} className="text-danger" /> Threat report
        </h3>
        {!ready && (
          <p className="text-xs text-muted">
            Add opponent Pokémon to rank their pressure.
          </p>
        )}
        <div className="flex flex-col gap-1">
          {threats.slice(0, 5).map((t) => (
            <ThreatChip key={t.pokemon.slug} threat={t} />
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-3">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <ShieldCheck size={14} className="text-gold" /> Gap analysis
        </h3>
        {mine.length === 0 && (
          <p className="text-xs text-muted">
            Draft Pokémon to check defensive gaps.
          </p>
        )}
        {mine.length > 0 && gaps.length === 0 && (
          <p className="text-xs text-success">
            No unresisted types on your team.
          </p>
        )}
        <div className="flex flex-wrap gap-1">
          {gaps.map((g) => (
            <div
              key={g.type}
              className="flex items-center gap-1"
              title={`Best incoming multiplier: ${g.bestResistFactor}×`}
            >
              <TypePill type={g.type} size="xs" />
              <span className="font-mono text-[10px] text-danger">
                {g.bestResistFactor}×
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
