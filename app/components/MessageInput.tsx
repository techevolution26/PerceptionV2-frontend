// app/components/MessageInput.tsx
"use client";

import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { FaceSmileIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import type { EmojiClickData } from "emoji-picker-react";
import type { DisplayMessage, UserMe, MessagesPage } from "../types/models";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

type MessagesData = InfiniteData<MessagesPage>;

interface MutationContext {
  prev: MessagesData | undefined;
  tempId: string;
}

export default function MessageInput({ peerId, token }: { peerId: number | string; token: string | null }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [viewportInfo, setViewportInfo] = useState({
    vh: typeof window !== "undefined" ? window.innerHeight : 0,
    vw: typeof window !== "undefined" ? window.innerWidth : 0,
    keyboardOffset: 0,
  });
  const [mounted, setMounted] = useState(false);

  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pickerRootRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // portal root for emoji picker
  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.setAttribute("id", "emoji-picker-root");
    el.className = "emoji-picker-portal-root";
    pickerRootRef.current = el;
    document.body.appendChild(el);
    setMounted(true);
    return () => {
      try {
        document.body.removeChild(el);
      } catch {
        /* already removed */
      }
    };
  }, []);

  // autosize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  // visualViewport handling (mobile)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let keyboardOffset = 0;
      if (window.visualViewport) {
        const vv = window.visualViewport;
        keyboardOffset = Math.max(0, vh - vv.height - (vv.offsetTop || 0));
      }
      setViewportInfo({ vh, vw, keyboardOffset });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }
    return () => {
      window.removeEventListener("resize", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
    };
  }, []);

  // outside-click detection for portal
  useEffect(() => {
    const isNode = (n: unknown): n is Node =>
      typeof n === "object" && n !== null && (typeof Node !== "undefined" && n instanceof Node);

    const onDocPointerUp = (e: PointerEvent) => {
      if (!pickerRootRef.current) return;
      if (!showEmoji) return;

      let path: EventTarget[] = [];
      try {
        path = e.composedPath ? e.composedPath() : [];
      } catch {
        path = [];
      }
      if (!Array.isArray(path)) path = [];

      const clickedInsidePortal = path.some((n) => {
        if (n === pickerRootRef.current) return true;
        return isNode(n) && isNode(pickerRootRef.current) && pickerRootRef.current!.contains(n);
      });

      const clickedToggle = path.some((n) => n === toggleRef.current);
      const clickedInput =
        e.target === inputRef.current || e.target === textareaRef.current || path.some((n) => n === textareaRef.current || n === inputRef.current);

      if (!clickedInsidePortal && !clickedToggle && !clickedInput) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("pointerup", onDocPointerUp);
    return () => document.removeEventListener("pointerup", onDocPointerUp);
  }, [showEmoji]);

  // ----- Mutation with optimistic update + broadcast -----
  const sendMutation = useMutation<DisplayMessage, Error, string, MutationContext>({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/conversations/${peerId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Send failed: ${res.status} ${res.statusText} - ${errorText}`);
      }
      return res.json();
    },

    onMutate: async (body: string) => {
      await queryClient.cancelQueries({ queryKey: ["messages", peerId] });
      const prev = queryClient.getQueryData<MessagesData>(["messages", peerId]);
      const tempId = `temp-${Date.now()}`;

      queryClient.setQueryData<MessagesData>(["messages", peerId], (old) => {
        if (!old || !Array.isArray(old.pages) || !old.pages[0] || !Array.isArray(old.pages[0].data)) return old;
        const me = queryClient.getQueryData<UserMe>(["me"]);
        const fake: DisplayMessage = {
          id: -Date.now(),
          body,
          from_user_id: me?.id ?? -1,
          to_user_id: Number(peerId),
          read_at: null,
          sending: true,
          created_at: new Date().toISOString(),
        };
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [fake, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { prev, tempId };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["messages", peerId], ctx.prev);
    },

    onSuccess: (serverMsg, _vars, ctx) => {
      const tempId = ctx?.tempId;
      queryClient.setQueryData<MessagesData>(["messages", peerId], (old) => {
        if (!old || !Array.isArray(old.pages)) return old;

        // try to replace temp message
        let replaced = false;
        const pages = old.pages.map((pg) => {
          const data = pg.data.map((m) => {
            if (String(m.id) === tempId) {
              replaced = true;
              return serverMsg;
            }
            return m;
          });
          return { ...pg, data };
        });

        if (replaced) return { ...old, pages };

        // dedupe: if serverMsg already exists, return old unchanged
        const exists = old.pages.some((pg) => pg.data.some((m) => m.id === serverMsg.id));
        if (exists) return old;

        // otherwise prepend serverMsg to first page
        const newFirst = { ...pages[0], data: [serverMsg, ...pages[0].data] };
        return { ...old, pages: [newFirst, ...pages.slice(1)] };
      });

      // broadcast to other tabs (simulate server push)
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("perception-messages");
          bc.postMessage({ type: "message_created", peerId, message: serverMsg });
          bc.close();
        } else {
          try {
            localStorage.setItem(
              "perception_message_event",
              JSON.stringify({ t: Date.now(), type: "message_created", peerId, message: serverMsg })
            );
            setTimeout(() => localStorage.removeItem("perception_message_event"), 50);
          } catch {
            /* ignore */
          }
        }
      } catch (err) {
        console.warn("broadcast failed", err);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", peerId], refetchType: "all" });
    },
  });

  const send = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMutation.mutate(trimmed, {
      onSuccess: () => {
        setInput("");
        inputRef.current?.focus();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, peerId, sendMutation]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const char = emojiData?.emoji ?? "";
    setInput((i) => i + char);
    setShowEmoji(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const toggleEmoji = () => {
    if (!showEmoji) {
      textareaRef.current?.blur();
      setTimeout(() => setShowEmoji(true), 80);
    } else {
      setShowEmoji(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const computePickerStyle = (): CSSProperties => {
    const baseBottom = 16;
    const keyboardOffset = viewportInfo.keyboardOffset || 0;
    const bottom = `calc(env(safe-area-inset-bottom, 0px) + ${baseBottom + keyboardOffset}px)`;
    const vw = Math.max(320, viewportInfo.vw || (typeof window !== "undefined" ? window.innerWidth : 1024));
    const maxWidth = Math.min(420, Math.max(240, vw - 24));
    const finalWidth = Math.min(360, maxWidth);
    return {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      bottom,
      zIndex: 9999,
      width: finalWidth + "px",
      maxWidth: "95%",
      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
      borderRadius: "12px",
      overflow: "hidden",
    };
  };

  const picker =
    showEmoji && mounted && pickerRootRef.current
      ? createPortal(
        <div style={computePickerStyle()}>
          <div className="overflow-hidden rounded-card border border-border-hairline shadow-2xl">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              previewConfig={{ showPreview: false }}
              skinTonesDisabled
              searchDisabled={false}
              lazyLoadEmojis
              height={320}
              width="100%"
            />
          </div>
        </div>,
        pickerRootRef.current
      )
      : null;

  return (
    <div className="relative">
      <div className="flex items-end rounded-control border border-border-hairline bg-surface p-2 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent/50">
        <button
          ref={toggleRef}
          onClick={toggleEmoji}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground-subtle transition hover:bg-surface-hover hover:text-accent"
          type="button"
          aria-label="Toggle emoji picker"
        >
          <FaceSmileIcon className="h-5 w-5" />
        </button>

        <textarea
          ref={(el) => {
            textareaRef.current = el;
            inputRef.current = el;
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          onFocus={() => {
            setShowEmoji(false);
          }}
          className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-foreground placeholder:text-foreground-subtle focus:outline-none"
          placeholder="Type a message…"
          aria-label="Message"
        />

        <button
          onClick={send}
          disabled={sendMutation.isPending || !input.trim()}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
            input.trim() ? "bg-accent text-accent-on hover:bg-accent-strong" : "bg-surface-sunken text-foreground-subtle"
          }`}
          type="button"
          aria-label="Send message"
        >
          {sendMutation.isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PaperAirplaneIcon className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {picker}
    </div>
  );
}
