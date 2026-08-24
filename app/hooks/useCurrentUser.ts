// app/hooks/useCurrentUser.ts
"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json() as Promise<UserMe>;
      })
      .then((me) => setUser(me))
      .catch((err: Error) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
