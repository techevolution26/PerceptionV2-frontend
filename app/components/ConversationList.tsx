// app/components/ConversationList.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Avatar from "./ui/Avatar";
import type { UserWithUnread } from "../types/models";

export default function ConversationList({ convos }: { convos: UserWithUnread[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = Number(params.get("peer"));

  return (
    <aside className="flex h-full w-80 flex-col border-r border-border-hairline bg-background p-4">
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-foreground">Recent chats</h2>
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {convos.map((u) => {
          const lastMsgTime = u.lastMessage ? new Date(u.lastMessage) : null;
          const isSelected = u.id === selected;

          return (
            <li key={u.id}>
              <button
                onClick={() => router.replace(`/messages?peer=${u.id}`)}
                className={`flex w-full items-center gap-3 rounded-control p-2.5 text-left transition ${
                  isSelected ? "bg-accent-soft" : "hover:bg-surface-hover"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar src={u.avatar_url} alt={u.name} size="md" />
                  {u.unread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent font-mono text-[11px] font-bold text-accent-on">
                      {u.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="truncate font-medium text-foreground">{u.name}</div>
                    {lastMsgTime && (
                      <span className="whitespace-nowrap font-mono text-[11px] text-foreground-subtle">
                        {lastMsgTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  {u.lastMessagePreview && (
                    <div className="mt-0.5 truncate text-sm text-foreground-subtle">
                      {u.lastMessagePreview}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
