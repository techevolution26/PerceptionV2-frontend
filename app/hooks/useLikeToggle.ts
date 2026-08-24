// app/hooks/useLikeToggle.ts
import { useCallback } from "react";
import type { Perception, LikeToggle } from "../types/models";

type UpdateFn = (id: number, liked: boolean, likesCount: number) => void;

export default function useLikeToggle() {
  return useCallback(async (perception: Perception, updateFn: UpdateFn) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const method = perception.liked_by_user ? "DELETE" : "POST";
    const res = await fetch(`/api/perceptions/${perception.id}/like`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Toggle like failed");
    const json: LikeToggle = await res.json();
    updateFn(perception.id, json.liked, json.likes_count);
  }, []);
}
