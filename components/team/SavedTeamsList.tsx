"use client";

import { useState } from "react";
import { Save, Trash2, Upload, Download, RotateCcw } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { ensurePokemonDetail } from "@/hooks/usePokemonDetail";
import { toLightPokemon } from "@/lib/pokeapi";

export function SavedTeamsList() {
  const savedTeams = useAppStore((s) => s.savedTeams);
  const saveTeam = useAppStore((s) => s.saveTeam);
  const deleteTeam = useAppStore((s) => s.deleteTeam);
  const loadTeam = useAppStore((s) => s.loadTeam);
  const myPool = useAppStore((s) => s.myPool);
  const resetAll = useAppStore((s) => s.resetAll);
  const setSlot = useAppStore((s) => s.setSlot);

  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const canSave = myPool.some((p) => p);

  function handleSave() {
    if (!canSave) return;
    saveTeam(name);
    setName("");
  }

  function handleExport(): string {
    return myPool.map((p) => p?.slug ?? "").filter(Boolean).join(",");
  }

  async function handleImport() {
    setImportError(null);
    const slugs = importText
      .split(/[,\s\n]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 6);
    if (slugs.length === 0) {
      setImportError("Paste a comma-separated list of Pokémon names.");
      return;
    }
    const results = await Promise.allSettled(
      slugs.map((s) => ensurePokemonDetail(s)),
    );
    resetAll();
    let placed = 0;
    const failed: string[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        setSlot("my", placed, toLightPokemon(r.value));
        placed++;
      } else {
        failed.push(slugs[i]);
      }
    });
    if (failed.length) {
      setImportError(`Not found: ${failed.join(", ")}`);
    } else {
      setImportText("");
      setShowImport(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-border bg-surface-2 p-2">
        <div className="flex gap-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="flex-1 min-w-0 bg-transparent text-sm outline-none px-1 placeholder:text-muted"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-bg font-medium disabled:opacity-40"
          >
            <Save size={12} /> Save
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowImport((v) => !v)}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted hover:text-text"
        >
          <Upload size={12} /> Import
        </button>
        <button
          type="button"
          onClick={() => {
            const text = handleExport();
            if (text) navigator.clipboard.writeText(text).catch(() => {});
          }}
          disabled={!canSave}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted hover:text-text disabled:opacity-40"
        >
          <Download size={12} /> Copy
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center justify-center gap-1 rounded border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted hover:text-danger"
          aria-label="Reset all teams"
        >
          <RotateCcw size={12} />
        </button>
      </div>

      {showImport && (
        <div className="rounded-md border border-border bg-surface-2 p-2 flex flex-col gap-2">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={3}
            placeholder="pikachu, charizard, dragonite…"
            className="w-full bg-bg border border-border rounded px-2 py-1 text-xs font-mono outline-none focus:border-primary"
          />
          {importError && (
            <p className="text-[11px] text-danger">{importError}</p>
          )}
          <button
            type="button"
            onClick={handleImport}
            className="self-end rounded bg-primary px-2 py-1 text-xs text-bg font-medium"
          >
            Load
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="text-[11px] uppercase tracking-wide text-muted px-1">
          Saved teams
        </div>
        {savedTeams.length === 0 && (
          <div className="text-xs text-muted px-1 py-2">
            No teams saved yet.
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {savedTeams.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-2 rounded border border-border bg-surface-2 px-2 py-1"
            >
              <button
                type="button"
                onClick={async () => {
                  await Promise.all(
                    t.members.map((slug) =>
                      ensurePokemonDetail(slug).catch(() => null),
                    ),
                  );
                  loadTeam(t.id, "my");
                }}
                className="flex-1 text-left text-xs"
              >
                <div className="font-medium truncate">{t.name}</div>
                <div className="font-mono text-[10px] text-muted truncate">
                  {t.members.join(", ")}
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteTeam(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger"
                aria-label={`Delete ${t.name}`}
              >
                <Trash2 size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
