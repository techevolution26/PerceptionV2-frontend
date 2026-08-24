// app/hooks/useMessageStream.ts
import { useEffect } from "react";
import Pusher from "pusher-js";
import Echo from "laravel-echo";
import type { Message } from "../types/models";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstancePromise: Promise<Echo<"pusher">> | null = null;

function initEcho(): Promise<Echo<"pusher">> {
  if (!echoInstancePromise) {
    echoInstancePromise = (async () => {
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        throw new Error("PUSHER key missing");
      }
      if (typeof window !== "undefined") {
        window.Pusher = Pusher;
      }
      return new Echo<"pusher">({
        broadcaster: "pusher",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
        // Previously missing entirely — without these, Echo defaults to
        // reaching real Pusher.com cloud infrastructure using `cluster` to
        // build the URL, not our self-hosted soketi container.
        wsHost: typeof window !== "undefined" ? window.location.hostname : undefined,
        wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT) || 6001,
        // Previously hardcoded `true`, which breaks against local dev's
        // non-TLS soketi (docker-compose exposes plain ws://, not wss://).
        forceTLS: process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true",
        enabledTransports: ["ws", "wss"],
      });
    })();
  }
  return echoInstancePromise;
}

interface BroadcastPayload {
  type: "message_created";
  peerId: number | string;
  message: Message;
}

/**
 * useMessageStream(peerId, onNewMessage)
 *
 * - tries to listen via Laravel Echo (pusher) if env vars exist
 * - always listens to BroadcastChannel "perception-messages" (if available)
 * - falls back to localStorage "perception_message_event" storage events
 *
 * onNewMessage(message) will be invoked for incoming messages relevant to peerId.
 */
export function useMessageStream(
  peerId: number | string | null | undefined,
  onNewMessage?: (message: Message) => void
): void {
  useEffect(() => {
    if (!peerId) return;

    let mounted = true;
    let echo: Echo<"pusher"> | null = null;
    let channel: ReturnType<Echo<"pusher">["channel"]> | null = null;
    let bc: BroadcastChannel | null = null;

    (async () => {
      try {
        if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
          echo = await initEcho();
          if (!mounted || !echo) return;
          try {
            channel = echo.channel(`conversations.${peerId}`);
            channel.listen(".NewMessage", ({ message }: { message: Message }) => {
              if (!mounted) return;
              try {
                onNewMessage?.(message);
              } catch (err) {
                console.error("onNewMessage error", err);
              }
            });
          } catch (err) {
            console.warn("Echo channel setup failed:", err);
          }
        }
      } catch {
        // Echo init failed — ignore, we'll rely on BroadcastChannel / storage
        // (this often happens in dev when env var missing or Pusher blocked)
      }
    })();

    // BroadcastChannel listener (frontend only, across tabs)
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("perception-messages");
        bc.onmessage = (ev: MessageEvent<BroadcastPayload>) => {
          const data = ev?.data;
          if (!data) return;
          if (data.type === "message_created") {
            if (String(data.peerId) === String(peerId)) {
              onNewMessage?.(data.message);
            }
          }
        };
      }
    } catch {
      bc = null;
    }

    // localStorage fallback for older environments (storage events fire in other tabs)
    const storageHandler = (ev: StorageEvent) => {
      try {
        if (!ev?.newValue) return;
        if (ev.key !== "perception_message_event") return;
        const parsed: BroadcastPayload = JSON.parse(ev.newValue);
        if (!parsed || parsed.type !== "message_created") return;
        if (String(parsed.peerId) === String(peerId)) {
          onNewMessage?.(parsed.message);
        }
      } catch {
        // ignore bad parse
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      mounted = false;
      try {
        if (channel && echo) {
          channel.stopListening(".NewMessage");
        }
      } catch {
        /* ignore */
      }
      try {
        bc?.close();
      } catch {
        /* ignore */
      }
      window.removeEventListener("storage", storageHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId, onNewMessage]);
}
