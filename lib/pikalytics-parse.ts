import type { TopList, TopListEntry, TypeName, UsageData } from "./types";
import { ALL_TYPES } from "./types";

export function pikaNameToSlug(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function slugToPikaName(slug: string): string {
  return slug
    .split("-")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join("-");
}

export function parseTopList(markdown: string, format: string): TopList {
  const entries: TopListEntry[] = [];
  const rowRe =
    /^\|\s*(\d+)\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*([\d.]+)\s*%\s*\|/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRe.exec(markdown)) !== null) {
    const rank = parseInt(match[1], 10);
    const displayName = match[2].trim();
    const usagePct = parseFloat(match[3]);
    entries.push({
      slug: pikaNameToSlug(displayName),
      displayName,
      usagePct,
      rank,
    });
  }
  return { format, entries, fetchedAt: Date.now() };
}

interface Section {
  heading: string;
  body: string;
}

function splitSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m && !line.startsWith("### ")) {
      if (current) sections.push(current);
      current = { heading: m[1].trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

function parseBulletPcts(body: string): { name: string; pct: number }[] {
  const out: { name: string; pct: number }[] = [];
  const re = /^-\s+\*\*([^*]+)\*\*\s*:\s*([\d.]+)\s*%/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out.push({ name: m[1].trim(), pct: parseFloat(m[2]) });
  }
  return out;
}

function findSection(
  sections: Section[],
  needle: string,
): Section | undefined {
  const n = needle.toLowerCase();
  return sections.find((s) => s.heading.toLowerCase().includes(n));
}

function parseTeraTypes(body: string): { type: TypeName; pct: number }[] {
  const entries = parseBulletPcts(body);
  return entries
    .map((e) => ({ type: e.name.toLowerCase() as TypeName, pct: e.pct }))
    .filter((e) => (ALL_TYPES as string[]).includes(e.type));
}

export function parseUsageDetail(
  markdown: string,
  slug: string,
  format: string,
): UsageData {
  const sections = splitSections(markdown);
  const moves = findSection(sections, "common moves");
  const abilities = findSection(sections, "common abilities");
  const items = findSection(sections, "common items");
  const teammates = findSection(sections, "common teammates");
  const counters = findSection(sections, "counter");
  const tera = findSection(sections, "tera");

  const topMoves = moves ? parseBulletPcts(moves.body) : [];
  const topAbilities = abilities ? parseBulletPcts(abilities.body) : [];
  const topItems = items ? parseBulletPcts(items.body) : [];
  const teammatesList = teammates ? parseBulletPcts(teammates.body) : [];
  const countersList = counters ? parseBulletPcts(counters.body) : [];
  const teraTypes = tera ? parseTeraTypes(tera.body) : [];

  const partial =
    !moves || !abilities || !teammates || topMoves.length === 0;

  return {
    slug,
    format,
    usagePct: 0,
    topMoves,
    topAbilities,
    topItems,
    teammates: teammatesList.map((t) => ({
      ...t,
      name: pikaNameToSlug(t.name),
    })),
    counters: countersList.map((t) => ({
      ...t,
      name: pikaNameToSlug(t.name),
    })),
    teraTypes,
    fetchedAt: Date.now(),
    partial,
  };
}
