// app/contexts/EchoContext.tsx
"use client";
import { createContext, useEffect, useState, type ReactNode } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

export const EchoContext = createContext<Echo<"pusher"> | null>(null);

export function EchoProvider({ children }: { children: ReactNode }) {
  // NOTE: this previously mutated `EchoContext._currentValue` directly instead
  // of using state, which is an undocumented React internal and never
  // actually triggered a re-render for consumers — so every useContext(EchoContext)
  // call in the app (NotificationsPanel, NotificationsProvider) always saw `null`
  // and real-time notifications silently never connected. Fixed to use state.
  const [echo, setEcho] = useState<Echo<"pusher"> | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    window.Pusher = Pusher;
    const instance = new Echo<"pusher">({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
      wsHost: window.location.hostname,
      wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT) || 6001,
      forceTLS: process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true",
      enabledTransports: ["ws", "wss"],
      // Default is "/broadcasting/auth" — our BFF proxy for this lives
      // under /api, so this must be set explicitly or every private-channel
      // subscription 404s.
      authEndpoint: "/api/broadcasting/auth",
      auth: { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
    });
    setEcho(instance);

    return () => {
      instance.disconnect();
      setEcho(null);
    };
  }, []);

  return <EchoContext.Provider value={echo}>{children}</EchoContext.Provider>;
}
