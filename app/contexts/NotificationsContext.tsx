// app/contexts/NotificationsContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import { EchoContext } from "./EchoContext";
import type { Notification, NotificationsResponse } from "../types/models";

interface NotificationsContextValue {
  unread: number;
  shaking: boolean;
  bump: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  unread: 0,
  shaking: false,
  bump: () => {},
  clear: () => {},
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useCurrentUser();
  const echo = useContext(EchoContext);

  const [unread, setUnread] = useState(0);
  const [shaking, setShaking] = useState(false);

  // Fetch initial unread count
  useEffect(() => {
    if (loading || !user) return;
    const token = localStorage.getItem("token");
    (async () => {
      try {
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body: NotificationsResponse = await res.json();
        setUnread((body.data || []).filter((n: Notification) => !n.read_at).length);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [loading, user]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!echo || !user) return;
    const channel = echo.private(`App.Models.User.${user.id}`);
    channel.listen(".notification", () => {
      setUnread((u) => u + 1);
      setShaking(true);
      setTimeout(() => setShaking(false), 2000);
    });
    return () => {
      echo.leaveChannel(`private-App.Models.User.${user.id}`);
    };
  }, [echo, user]);

  const bump = useCallback(() => setUnread((u) => u + 1), []);
  const clear = useCallback(() => setUnread(0), []);

  return (
    <NotificationsContext.Provider value={{ unread, shaking, bump, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
