"use client";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { APIStatusDot } from "@/components/ui/APIStatusDot";
import { TeamPanel } from "@/components/team/TeamPanel";
import { SavedTeamsList } from "@/components/team/SavedTeamsList";
import { GhostSuggestion } from "@/components/team/GhostSuggestion";
import { useApiStatus } from "@/hooks/useApiStatus";
import { useOpponentSuggestions } from "@/hooks/useOpponentSuggestions";
import { CoverageMatrix } from "@/components/analysis/CoverageMatrix";
import { RecommendationPanel } from "@/components/analysis/RecommendationPanel";
import { AnalysisSummary } from "@/components/analysis/AnalysisSummary";
import { PokemonDrawer } from "@/components/detail/PokemonDrawer";
import { DegradedBanner } from "@/components/ui/DegradedBanner";
import { useAppStore } from "@/stores/appStore";

export default function Home() {
  useApiStatus();
  const format = useAppStore((s) => s.format);
  const oppPool = useAppStore((s) => s.oppPool);
  const suggestions = useOpponentSuggestions();

  // Map empty-slot-index → suggestion (walks in slot order, pulls from ranked list)
  const suggestionBySlot = new Map<number, (typeof suggestions)[number]>();
  let sIdx = 0;
  oppPool.forEach((p, i) => {
    if (!p && suggestions[sIdx]) {
      suggestionBySlot.set(i, suggestions[sIdx]);
      sIdx++;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-primary" aria-hidden />
          <span className="font-semibold tracking-tight">
            Champions Drafter
          </span>
          <span className="hidden sm:inline text-xs font-mono text-muted">
            {format}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <APIStatusDot />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_340px] gap-4 p-4">
        <aside className="order-2 lg:order-1">
          <SavedTeamsList />
        </aside>
        <section className="order-1 lg:order-2 flex flex-col gap-4 min-w-0">
          <DegradedBanner />
          <TeamPanel side="my" title="My Pool" accent="primary" />
          <TeamPanel
            side="opp"
            title="Opponent Pool"
            accent="danger"
            slotPlaceholder={(i) => {
              const s = suggestionBySlot.get(i);
              if (!s) return null;
              return <GhostSuggestion suggestion={s} slotIdx={i} />;
            }}
          />
          <CoverageMatrix />
          <RecommendationPanel />
        </section>
        <aside className="order-3">
          <AnalysisSummary />
        </aside>
      </main>
      <PokemonDrawer />
    </div>
  );
}
