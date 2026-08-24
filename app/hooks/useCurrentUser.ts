// app/hooks/useCurrentUser.ts
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // FIXED: Imported pathname to track route mutations
import type { UserMe } from "../types/models";

interface UseCurrentUserResult {
  user: UserMe | null;
  loading: boolean;
  error: Error | null;
}

export default function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pathname = usePathname(); // FIXED: Watches for active route changes

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setUser(null); // FIXED: Clears out state if a token is intentionally removed (logout)
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Token is stale or invalid, purge it cleanly
            localStorage.removeItem("token");
          }
          throw new Error("Not authenticated");
        }
        return res.json() as Promise<UserMe>;
      })
      .then((me) => {
        setUser(me);
        setError(null);
      })
      .catch((err: Error) => {
        console.error("Hook profile load error:", err);
        setUser(null);
        setError(err);
      })
      .finally(() => setLoading(false));

    // FIXED: Including pathname ensures logging in/out triggers a state re-evaluation immediately
  }, [pathname]);

  return { user, loading, error };
}
