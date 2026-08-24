// app/hooks/usePerceptionDetail.ts
import { useState, useEffect, useCallback } from "react";
import type { Perception, Comment, UserMe } from "../types/models";

interface UsePerceptionDetailResult {
  me: UserMe | null;
  perception: Perception | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setPerception: React.Dispatch<React.SetStateAction<Perception | null>>;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

function normalize(list: Comment[] = []): Comment[] {
  return list.map((c) => ({ ...c, replies: normalize(c.replies || []) }));
}

export function usePerceptionDetail(
  id: number | string,
): UsePerceptionDetailResult {
  const [perception, setPerception] = useState<Perception | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      // 1. Fetch public perception details and comments. This will pass cleanly for anyone.
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/perceptions/${id}`, { headers }),
        fetch(`/api/perceptions/${id}/comments`, { headers }),
      ]);

      if (!pRes.ok || !cRes.ok) {
        throw new Error("Failed to load perception or comments");
      }

      const [p, c]: [Perception, Comment[]] = await Promise.all([
        pRes.json(),
        cRes.json(),
      ]);

      setPerception(p);
      setComments(normalize(c));

      // 2. ISOLATED PROFILE CHECK: Fetch user metadata only if a valid token is present
      if (token) {
        try {
          const uRes = await fetch("/api/user", { headers });
          if (uRes.ok) {
            const u: UserMe = await uRes.json();
            setMe(u);
          } else if (uRes.status === 401) {
            // Token expired or invalid, clear state back to guest mode gently
            setMe(null);
          }
        } catch (userErr) {
          console.warn("Optional profile load skipped or failed:", userErr);
          setMe(null);
        }
      } else {
        setMe(null); // Explicitly guest
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  return {
    me,
    perception,
    comments,
    loading,
    error,
    reload: load,
    setPerception,
    setComments,
  };
}
