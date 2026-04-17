"use client";

import { useEffect } from "react";
import { fetchPikalyticsHealth } from "@/lib/pikalytics";
import { useAppStore } from "@/stores/appStore";

export function useApiStatus() {
  const setApiStatus = useAppStore((s) => s.setApiStatus);
  useEffect(() => {
    let cancelled = false;
    fetchPikalyticsHealth().then((s) => {
      if (!cancelled) setApiStatus({ pikalytics: s });
    });
    return () => {
      cancelled = true;
    };
  }, [setApiStatus]);
}
