// app/components/NotificationsPanel.tsx
"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useCurrentUser from "../hooks/useCurrentUser";
import { EchoContext } from "../contexts/EchoContext";
import Spinner from "./Spinner";
import { TrashIcon, BookmarkIcon, EllipsisHorizontalIcon, SunIcon, FireIcon } from "@heroicons/react/24/outline";
import type { Notification, NotificationsResponse, NotificationData } from "../types/models";

export default function NotificationsPanel() {
  const echo = useContext(EchoContext);
  const { user: me, loading: meLoading } = useCurrentUser();
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState<string[]>([]); // track newly arrived
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (meLoading || !me) return;
    setLoading(true);
    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((payload: NotificationsResponse) => setNotes(payload.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [me, meLoading]);

  useEffect(() => {
    if (!echo || !me) return;
    const channel = echo.private(`App.Models.User.${me.id}`);
    // Backend triggers a plain "notification" event (see
    // app/services/broadcast.py) rather than Laravel's internal
    // `illuminate:notification` convention that `.notification()` expects
    // — using `.listen()` with an explicit event name is the
    // framework-agnostic way to receive it.
    channel.listen(".notification", (notification: Notification) => {
      setNotes((prev) => [notification, ...prev]);
      setNewIds((ids) => [notification.id, ...ids]);
      setTimeout(() => {
        setNewIds((ids) => ids.filter((i) => i !== notification.id));
      }, 2000);
    });
    return () => {
      echo.leaveChannel(`private-App.Models.User.${me.id}`);
    };
  }, [echo, me]);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotes((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
  };

  const deleteOne = useCallback(async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const saveOne = useCallback((id: string) => {
    alert(`Saved notification ${id}!`);
    setMenuOpenFor(null);
  }, []);

  if (meLoading || loading) return <Spinner className="py-4" />;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1 pb-1">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <button
          onClick={markAllRead}
          disabled={notes.length === 0}
          className="text-xs font-medium text-accent hover:text-accent-strong disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="px-1 py-4 text-sm text-foreground-subtle">No new notifications</p>
      ) : (
        <ul className="max-h-72 space-y-1 overflow-auto">
          {notes.map((n) => {
            const { id, read_at } = n;
            const data = n.data as unknown as NotificationData;
            const topic = data?.topic ?? "General";
            const body = data?.body ?? "";
            const perceptionId = data?.type === "perception" ? data.perception_id : undefined;
            const type = data?.type ?? "perception";

            const isUnread = !read_at;
            const isNew = newIds.includes(id);

            return (
              <li
                key={id}
                className={`relative flex items-start gap-2.5 rounded-control p-2.5 text-sm transition-colors
                  ${isUnread ? "bg-accent-soft" : "hover:bg-surface-hover"}
                  ${isNew && isUnread ? "animate-shake ring-1 ring-accent/50" : ""}`}
              >
                <span className="mt-0.5 shrink-0 text-foreground-muted">
                  {type === "daily" ? <SunIcon className="h-4 w-4" /> : <FireIcon className="h-4 w-4" />}
                </span>
                <div className={`flex-1 ${isUnread ? "font-medium text-foreground" : "text-foreground-muted"}`}>
                  {type === "perception" && perceptionId ? (
                    <Link href={`/perceptions/${perceptionId}`} className="hover:underline">
                      <strong className="font-semibold">New in {topic}:</strong> {body}
                    </Link>
                  ) : (
                    <div>
                      <strong className="font-semibold">Daily motivation in {topic}:</strong> <em>{body}</em>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMenuOpenFor(menuOpenFor === id ? null : id)}
                  className="rounded-full p-1 text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
                  title="Options"
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>

                {menuOpenFor === id && (
                  <div className="absolute right-2 top-9 z-10 w-36 overflow-hidden rounded-control border border-border-hairline bg-surface shadow-xl">
                    <button
                      onClick={() => {
                        deleteOne(id);
                        setMenuOpenFor(null);
                      }}
                      className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                    <button
                      onClick={() => saveOne(id)}
                      className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-hover"
                    >
                      <BookmarkIcon className="h-4 w-4" /> Save
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
