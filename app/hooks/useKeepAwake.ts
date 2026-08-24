// app/hooks/useKeepAwake.ts
"use client";
import { useEffect, useRef } from "react";

interface UseKeepAwakeOptions {
  /** health ping endpoint */
  url?: string;
  /** ms between pings while the tab is visible (default 5m) */
  visibleInterval?: number;
  /** ms between pings while the tab is hidden (default 15m) */
  hiddenInterval?: number;
  /** max backoff on repeated failures (default 10m) */
  maxBackoff?: number;
}

export default function useKeepAwake({
  url = "/api/ping",
  visibleInterval = 1000 * 60 * 5,
  hiddenInterval = 1000 * 60 * 15,
  maxBackoff = 1000 * 60 * 10,
}: UseKeepAwakeOptions = {}): void {
  const aliveRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const backoffRef = useRef(0);
  const abortedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    abortedRef.current = false;

    const ping = async (): Promise<boolean> => {
      try {
        const controller = new AbortController();
        const signal = controller.signal;
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal,
          headers: { "x-keepalive-tick": "1" },
        });
        if (!res.ok) throw new Error("ping failed: " + res.status);
        aliveRef.current = true;
        backoffRef.current = 0;
        return true;
      } catch {
        backoffRef.current = Math.min(
          backoffRef.current ? backoffRef.current * 2 : 1000 * 10,
          maxBackoff,
        );
        return false;
      }
    };

    const scheduleNext = (immediate = false) => {
      clearTimeout(timerRef.current);
      if (abortedRef.current) return;
      const visible =
        !document.hidden && document.visibilityState === "visible";
      const baseInterval = visible ? visibleInterval : hiddenInterval;
      const backoff = backoffRef.current || 0;
      const delay = immediate ? 0 : Math.max(baseInterval, backoff);
      timerRef.current = setTimeout(async () => {
        await ping();
        scheduleNext(false);
      }, delay);
    };

    scheduleNext(true);

    const onFocus = () => scheduleNext(true);
    const onVisibility = () => {
      if (!document.hidden && document.visibilityState === "visible") {
        scheduleNext(true);
      }
    };
    const onOnline = () => scheduleNext(true);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    // FIXED: Removed the onBeforeUnload navigator.sendBeacon listener loop
    // to prevent implicit HTTP POST method generation.

    return () => {
      abortedRef.current = true;
      clearTimeout(timerRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [url, visibleInterval, hiddenInterval, maxBackoff]);
}
