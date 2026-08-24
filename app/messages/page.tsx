// app/messages/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import useCurrentUser from "../hooks/useCurrentUser";
import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useMessageStream } from "../hooks/useMessageStream";
import ConversationSidebar from "../components/ConversationSidebar";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import Spinner from "../components/Spinner";
import VantageMark from "../components/ui/VantageMark";
import type { DisplayMessage, MessagesPage } from "../types/models";

import { Suspense, useState, type ReactNode } from "react";

function MessagesHubContent({ peerId }: { peerId: number | null }) {
  const { user: me, loading: meLoading } = useCurrentUser();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const convosQuery = useConversations(token);
  const router = useRouter();

  const messagesQuery = useMessages(peerId, token);
  const queryClient = useQueryClient();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useMessageStream(peerId, (newMsg: DisplayMessage) => {
    queryClient.setQueryData<InfiniteData<MessagesPage>>(["messages", peerId], (old) => {
      if (!old) return old;
      const updated = {
        ...old,
        pages: [{ ...old.pages[0], data: [...old.pages[0].data, newMsg] }, ...old.pages.slice(1)],
      };
      return updated;
    });
  });

  if (meLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }
  if (!me) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-sm text-foreground-subtle">
        Please log in to view messages.
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 w-full">
      <ConversationSidebar
        conversations={convosQuery.data || []}
        selectedPeer={peerId}
        onSelect={(id) => {
          setSidebarOpen(false);
          router.push(`/messages?peer=${id}`);
        }}
        className="h-full border-r border-border-hairline"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
      />

      {peerId ? (
        <div className="flex h-full min-h-0 flex-1 flex-col">
          <ChatWindow
            peerId={peerId}
            messagesPages={messagesQuery.data}
            fetchNextPage={() => messagesQuery.fetchNextPage()}
            hasNextPage={Boolean(messagesQuery.hasNextPage)}
            isLoading={messagesQuery.isLoading}
            onOpenSidebar={() => setSidebarOpen(true)}
            className="h-full"
          >
            <MessageInput peerId={peerId} token={token} />
          </ChatWindow>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md p-8 text-center">
            <VantageMark size={40} className="mx-auto mb-4 text-foreground-subtle" />
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground">No conversation selected</h2>
            <p className="text-sm text-foreground-subtle">
              Select a conversation from the sidebar or search for users to start chatting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PeerIdProvider({ children }: { children: (peerId: number | null) => ReactNode }) {
  const params = useSearchParams();
  const peerId = Number(params.get("peer")) || null;
  return children(peerId);
}

export default function MessagesHub() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner size={28} />
        </div>
      }
    >
      <PeerIdProvider>{(peerId) => <MessagesHubContent peerId={peerId} />}</PeerIdProvider>
    </Suspense>
  );
}
