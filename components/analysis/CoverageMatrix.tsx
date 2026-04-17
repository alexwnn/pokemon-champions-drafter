"use client";

import Image from "next/image";
import { multiplierColor, multiplierLabel } from "@/lib/theme";
import { useAnalysis } from "@/hooks/useAnalysis";

export function CoverageMatrix() {
  const { matrix, mine, opps } = useAnalysis();
  if (mine.length === 0 || opps.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
        Draft both teams to see the coverage matrix.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Coverage matrix</h3>
        <span className="font-mono text-[10px] text-muted">
          offense / defense per pairing
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th />
              {opps.map((o) => (
                <th key={o.pokemon.slug} className="p-0">
                  <div className="flex flex-col items-center gap-0.5 w-14">
                    <Image
                      src={o.pokemon.spriteUrl}
                      alt={o.pokemon.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 [image-rendering:pixelated]"
                      unoptimized
                    />
                    <span className="text-[10px] truncate max-w-full text-danger">
                      {o.pokemon.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, ri) => (
              <tr key={mine[ri].pokemon.slug}>
                <th className="p-0">
                  <div className="flex flex-col items-center gap-0.5 w-14">
                    <Image
                      src={mine[ri].pokemon.spriteUrl}
                      alt={mine[ri].pokemon.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 [image-rendering:pixelated]"
                      unoptimized
                    />
                    <span className="text-[10px] truncate max-w-full text-primary">
                      {mine[ri].pokemon.name}
                    </span>
                  </div>
                </th>
                {row.map((cell, ci) => (
                  <td
                    key={`${ri}-${ci}`}
                    className="p-0 text-center align-middle"
                  >
                    <div
                      className="flex flex-col items-center justify-center h-14 w-14 rounded font-mono text-[11px] text-white"
                      style={{ background: multiplierColor(cell.offense) }}
                      title={`Offense ${multiplierLabel(cell.offense)} / Defense ${multiplierLabel(cell.defense)}`}
                    >
                      <span>{multiplierLabel(cell.offense)}</span>
                      <span className="text-[9px] opacity-70">
                        {multiplierLabel(cell.defense)}↓
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
