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

export function usePerceptionDetail(id: number | string): UsePerceptionDetailResult {
  const [perception, setPerception] = useState<Perception | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [uRes, pRes, cRes] = await Promise.all([
        fetch("/api/user", { headers }),
        fetch(`/api/perceptions/${id}`, { headers }),
        fetch(`/api/perceptions/${id}/comments`, { headers }),
      ]);

      if (!uRes.ok || !pRes.ok || !cRes.ok)
        throw new Error("Failed to load perception or comments");

      const [u, p, c]: [UserMe, Perception, Comment[]] = await Promise.all([
        uRes.json(),
        pRes.json(),
        cRes.json(),
      ]);

      setMe(u);
      setPerception(p);
      setComments(normalize(c));
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
