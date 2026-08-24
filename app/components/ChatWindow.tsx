// app/components/ChatWindow.tsx
"use client";
import { useEffect, useRef, useState, Fragment, type ReactNode, type UIEvent } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Avatar from "./ui/Avatar";
import Spinner from "./Spinner";
import type { DisplayMessage, UserPublic, MessagesPage } from "../types/models";

function formatDateHeader(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

interface ChatWindowProps {
  peerId: number | string | null;
  messagesPages: InfiniteData<MessagesPage> | undefined;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  onOpenSidebar: () => void;
  children: ReactNode;
  className?: string;
}

export default function ChatWindow({
  peerId,
  messagesPages,
  fetchNextPage,
  hasNextPage,
  isLoading,
  onOpenSidebar,
  children,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [peer, setPeer] = useState<UserPublic | null>(null);

  useEffect(() => {
    if (!peerId) return;
    let canceled = false;
    fetch(`/api/users/${peerId}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!canceled) setPeer(data);
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, [peerId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const nearBottom = distanceFromBottom < 200;

    setTimeout(() => {
      if (nearBottom) {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 40);
  }, [messagesPages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size={28} />
      </div>
    );
  }

  const flat: DisplayMessage[] = [];
  (messagesPages?.pages || []).forEach((pg) => {
    if (Array.isArray(pg.data)) flat.push(...pg.data);
  });

  interface MessageGroup {
    day: string;
    messages: DisplayMessage[];
  }
  const groups: MessageGroup[] = [];
  flat.forEach((m) => {
    const day = new Date(m.created_at).toDateString();
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.day !== day) {
      groups.push({ day, messages: [m] });
    } else {
      lastGroup.messages.push(m);
    }
  });

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {/* Chat header */}
      <div className="sticky top-0 z-10 flex items-center border-b border-border-hairline bg-background/90 px-4 py-3 backdrop-blur">
        <button
          onClick={onOpenSidebar}
          className="mr-3 rounded-control p-1 text-foreground-muted hover:bg-surface-hover md:hidden"
          aria-label="Open conversations"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {peer ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar src={peer.avatar_url} alt={peer.name} size="sm" />
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-success" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{peer.name}</h2>
              <p className="text-xs text-foreground-subtle">Online</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-surface-sunken" />
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-surface-sunken" />
              <div className="h-2.5 w-16 rounded bg-surface-sunken" />
            </div>
          </div>
        )}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
        onScroll={({ currentTarget }: UIEvent<HTMLDivElement>) => {
          if (hasNextPage && currentTarget.scrollTop < 40) {
            fetchNextPage();
          }
        }}
      >
        {hasNextPage && (
          <div className="flex justify-center py-2">
            <button onClick={fetchNextPage} className="text-sm font-medium text-accent hover:text-accent-strong">
              Load older messages
            </button>
          </div>
        )}

        {groups.map((g) => (
          <Fragment key={g.day}>
            <div className="flex items-center justify-center">
              <div className="rounded-pill bg-surface-sunken px-3 py-1 font-mono text-[11px] text-foreground-subtle">
                {formatDateHeader(g.messages[0].created_at)}
              </div>
            </div>

            {g.messages.map((msg) => {
              const isMe = msg.from_user_id !== Number(peerId);
              const timestamp = new Date(msg.created_at);
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`relative max-w-[85%] break-words rounded-2xl px-4 py-2 sm:max-w-[70%] ${
                      isMe
                        ? "rounded-br-md bg-foreground text-background"
                        : "rounded-bl-md border border-border-hairline bg-surface text-foreground"
                    } ${msg.sending ? "italic opacity-70" : ""}`}
                  >
                    <div className="text-sm sm:text-[15px]">{msg.body}</div>

                    <div className={`mt-1 text-[11px] ${isMe ? "text-background/60" : "text-foreground-subtle"}`}>
                      {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {isMe && (msg.sending ? " · Sending…" : msg.delivered ? " · Delivered" : "")}
                    </div>
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}

        <div ref={endRef} className="h-2" />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 z-10 border-t border-border-hairline bg-background px-4 py-3">
        {children}
      </div>
    </div>
  );
}
