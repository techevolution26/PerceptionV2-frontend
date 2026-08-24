"use client";
import { useState, useEffect, useRef } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Avatar from "./ui/Avatar";
import type { UserWithUnread, UserSlim } from "../types/models";

interface ConversationSidebarProps {
  conversations: UserWithUnread[];
  selectedPeer: number | null;
  onSelect: (peerId: number) => void;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export default function ConversationSidebar({
  conversations,
  selectedPeer,
  onSelect,
  className = "",
  isOpen = false,
  onClose = () => {},
  onOpen = () => {},
}: ConversationSidebarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSlim[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        setInputFocused(true);
      }
    };
    const onFocusOut = () => {
      setTimeout(() => setInputFocused(false), 120);
    };
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const base = (
    <div className={`flex h-full w-80 flex-col overflow-hidden bg-background ${className}`}>
      <div className="flex items-center gap-3 border-b border-border-hairline p-4">
        <h1 className="flex-1 text-xl font-semibold tracking-tight text-foreground">Messages</h1>

        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="ml-2 inline-flex rounded-control p-1 text-foreground-muted hover:bg-surface-hover lg:hidden"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-border-hairline p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-foreground-subtle" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full rounded-control border border-border-hairline bg-surface-sunken px-4 py-2.5 pl-9 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Search users"
            aria-expanded={Boolean(query || results.length)}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-2.5 text-foreground-subtle hover:text-foreground"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center">
            <p className="animate-pulse text-sm text-foreground-subtle">Searching users…</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="border-b border-border-hairline px-4 py-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
              Search results
            </h3>
            <ul className="space-y-1">
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => onSelect(u.id)}
                    className="flex w-full items-center gap-3 rounded-control p-2 text-left transition hover:bg-surface-hover"
                  >
                    <Avatar src={u.avatar_url} alt={u.name} size="sm" />
                    <div className="overflow-hidden text-left">
                      <div className="truncate font-medium text-foreground">{u.name}</div>
                      {u.profession && (
                        <div className="truncate text-xs text-foreground-subtle">{u.profession}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="px-4 py-3">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
            Conversations
          </h3>
          <ul className="space-y-1">
            {conversations.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => onSelect(u.id)}
                  className={`flex w-full items-center gap-3 rounded-control p-2.5 text-left transition ${
                    u.id === selectedPeer ? "bg-accent-soft" : "hover:bg-surface-hover"
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
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="truncate font-medium text-foreground">{u.name}</div>
                      {u.lastMessage && (
                        <span className="whitespace-nowrap font-mono text-[11px] text-foreground-subtle">
                          {new Date(u.lastMessage).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    {u.lastMessagePreview && (
                      <div className="mt-0.5 truncate text-sm text-foreground-subtle">{u.lastMessagePreview}</div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-40 lg:hidden">
        <div className="absolute inset-0 bg-overlay" onClick={onClose} />
        <div className="absolute bottom-0 left-0 top-0 w-[84%] max-w-xs border-r border-border-hairline bg-background shadow-xl">
          {base}
        </div>
      </div>
    );
  }

  const showOpenButton = !selectedPeer && !inputFocused;

  return (
    <>
      {showOpenButton && (
        <button
          aria-label="Open conversations"
          onClick={onOpen}
          className="fixed left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center
                     rounded-full border border-border-hairline bg-surface/95 p-3 shadow-lg backdrop-blur
                     focus:outline-none focus:ring-2 focus:ring-accent/50 lg:hidden"
          title="Open messages"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-foreground-muted" />
        </button>
      )}

      <aside className="hidden lg:flex lg:flex-col">{base}</aside>
    </>
  );
}
