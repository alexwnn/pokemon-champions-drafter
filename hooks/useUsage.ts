"use client";

import { useEffect } from "react";
import { fetchUsage } from "@/lib/pikalytics";
import type { UsageData } from "@/lib/types";
import { useAppStore } from "@/stores/appStore";

const inflight = new Map<string, Promise<UsageData>>();

function key(format: string, slug: string) {
  return `${format}:${slug}`;
}

export function ensureUsage(
  format: string,
  slug: string,
): Promise<UsageData | null> {
  const store = useAppStore.getState();
  const k = key(format, slug);
  const hit = store.usageCache.get(k);
  if (hit) return Promise.resolve(hit);
  let p = inflight.get(k);
  if (!p) {
    p = fetchUsage(format, slug).finally(() => inflight.delete(k));
    inflight.set(k, p);
  }
  return p
    .then((data) => {
      useAppStore.getState().cacheUsage(data);
      return data;
    })
    .catch(() => null);
}

export function useUsage(
  format: string,
  slug: string | null,
): UsageData | null {
  const data = useAppStore((s) =>
    slug ? (s.usageCache.get(key(format, slug)) ?? null) : null,
  );
  useEffect(() => {
    if (slug) ensureUsage(format, slug);
  }, [format, slug]);
  return data;
}
