// app/hooks/useConversations.ts
import { useQuery } from "@tanstack/react-query";
import type { UserWithUnread } from "../types/models";

export function useConversations(token: string | null) {
  return useQuery<UserWithUnread[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch conversations");
      }
      return res.json();
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });
}
