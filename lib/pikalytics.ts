import type { TopList, UsageData } from "./types";

export async function fetchTopList(
  format: string,
  signal?: AbortSignal,
): Promise<TopList> {
  const res = await fetch(
    `/api/pikalytics/pokedex/${encodeURIComponent(format)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`top list fetch failed: ${res.status}`);
  return (await res.json()) as TopList;
}

export async function fetchUsage(
  format: string,
  slug: string,
  signal?: AbortSignal,
): Promise<UsageData> {
  const res = await fetch(
    `/api/pikalytics/pokedex/${encodeURIComponent(format)}/${encodeURIComponent(slug)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`usage fetch failed: ${res.status}`);
  return (await res.json()) as UsageData;
}

export async function fetchPikalyticsHealth(): Promise<
  "ok" | "degraded" | "down"
> {
  try {
    const res = await fetch("/api/pikalytics/health");
    const body = (await res.json()) as { status: "ok" | "degraded" | "down" };
    return body.status;
  } catch {
    return "down";
  }
}
