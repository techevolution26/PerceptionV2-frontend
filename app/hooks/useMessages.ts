// app/hooks/useMessages.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Message, MessagesPage } from "../types/models";

export function useMessages(peerId: number | string | null, token: string | null) {
  return useInfiniteQuery<MessagesPage>({
    queryKey: ["messages", peerId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(
        `/api/conversations/${peerId}?page=${pageParam}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const messages: Message[] = await res.json();
      return {
        data: messages,
        // our backend doesn't paginate further, so:
        nextPage: undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: Boolean(peerId && token),
    staleTime: 1000 * 60 * 5,
  });
}
