"use client";

import { useEffect } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import Image from "next/image";
import { useAppStore } from "@/stores/appStore";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { TypePill } from "@/components/ui/TypePill";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { StrengthsTab } from "./StrengthsTab";
import { WeaknessesTab } from "./WeaknessesTab";
import { CoverageTab } from "./CoverageTab";

const TABS = ["strengths", "weaknesses", "coverage"] as const;

export function PokemonDrawer() {
  const selectedSide = useAppStore((s) => s.selectedSide);
  const selectedSlot = useAppStore((s) => s.selectedSlot);
  const closeDrawer = useAppStore((s) => s.closeDrawer);
  const tab = useAppStore((s) => s.drawerTab);
  const setTab = useAppStore((s) => s.setDrawerTab);
  const mon = useAppStore((s) => {
    if (selectedSide === null || selectedSlot === null) return null;
    const pool = selectedSide === "my" ? s.myPool : s.oppPool;
    return pool[selectedSlot];
  });
  const { data: detail } = usePokemonDetail(mon?.slug ?? null);

  useEffect(() => {
    if (!mon) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mon, closeDrawer]);

  if (!mon) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={closeDrawer}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-label={`${mon.name} detail`}
        className={clsx(
          "fixed z-50 bg-surface border-border flex flex-col",
          "md:top-0 md:right-0 md:h-full md:w-[380px] md:border-l",
          "inset-x-0 bottom-0 max-h-[90vh] rounded-t-xl border-t md:rounded-none md:border-t-0",
        )}
      >
        <header className="flex items-start gap-3 p-3 border-b border-border">
          <Image
            src={mon.spriteUrl}
            alt={mon.name}
            width={72}
            height={72}
            className="h-16 w-16 [image-rendering:pixelated] shrink-0"
            unoptimized
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold truncate">{mon.name}</h2>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close detail"
                className="inline-flex h-7 w-7 items-center justify-center rounded text-muted hover:text-text hover:bg-surface-2"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-1 flex gap-1 flex-wrap">
              {mon.types.map((t) => (
                <TypePill key={t} type={t} size="xs" />
              ))}
            </div>
            {detail ? (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-mono text-muted">
                <span>HP {detail.baseStats.hp}</span>
                <span>ATK {detail.baseStats.atk}</span>
                <span>DEF {detail.baseStats.def}</span>
                <span>SPA {detail.baseStats.spa}</span>
                <span>SPD {detail.baseStats.spd}</span>
                <span>SPE {detail.baseStats.spe}</span>
              </div>
            ) : (
              <Skeleton className="mt-1 h-3 w-40" />
            )}
          </div>
        </header>
        <nav className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={clsx(
                "flex-1 py-2 text-xs uppercase tracking-wide font-medium border-b-2 -mb-px",
                tab === t
                  ? "border-primary text-text"
                  : "border-transparent text-muted hover:text-text",
              )}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto">
          {tab === "strengths" && <StrengthsTab pokemon={mon} />}
          {tab === "weaknesses" && <WeaknessesTab pokemon={mon} />}
          {tab === "coverage" && <CoverageTab pokemon={mon} />}
        </div>
      </aside>
    </>
  );
}
