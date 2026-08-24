// app/topics/page.tsx
"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import Spinner from "../components/Spinner";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import type { Topic, TopicsResponse } from "../types/models";

interface FollowableTopic extends Topic {
  followed: boolean;
}

export default function TopicsPage() {
  const { user: me, loading: meLoading } = useCurrentUser();
  const [topics, setTopics] = useState<FollowableTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const topicsRes = await fetch("/api/topics", {
          headers: { Accept: "application/json" },
        });
        if (!topicsRes.ok) {
          const err = await topicsRes.json();
          throw new Error(err.message || `${topicsRes.status}`);
        }
        const raw: Topic[] | TopicsResponse = await topicsRes.json();
        const topicsData: Topic[] = Array.isArray(raw) ? raw : raw.topics;

        let followedIds: number[] = [];
        if (me) {
          const folRes = await fetch(`/api/users/${me.id}/topics`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (folRes.ok) {
            const fol: Topic[] = await folRes.json();
            followedIds = fol.map((t) => t.id);
          }
        }

        if (!cancelled) {
          setTopics(
            topicsData.map((t) => ({
              ...t,
              followed: followedIds.includes(t.id),
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load topics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [me]);

  async function handleToggleFollow(id: number, currentlyFollowed: boolean) {
    const method = currentlyFollowed ? "DELETE" : "POST";
    const res = await fetch(`/api/topics/${id}/follow`, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      alert("Failed to update follow status");
      return;
    }
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, followed: !currentlyFollowed } : t))
    );
  }

  if (loading || meLoading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl flex-col items-center justify-center p-4">
        <Spinner size={40} />
        <p className="mt-3 text-sm text-foreground-subtle">Loading topics…</p>
      </div>
    );
  }

  if (error) {
    return <p className="mx-auto max-w-3xl p-4 text-danger">{error}</p>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Choose topics to follow</h1>
      <ul className="space-y-3">
        {topics.map((t) => (
          <Card as="li" key={t.id} className="flex items-center justify-between p-4">
            <div className="flex min-w-0 items-center gap-3.5">
              {t.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image_url} alt={t.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-sm font-medium text-foreground-muted">
                  {t.name[0]}
                </div>
              )}
              <div className="min-w-0">
                <strong className="block truncate font-medium text-foreground">{t.name}</strong>
                <small className="line-clamp-1 text-foreground-subtle">{t.description}</small>
              </div>
            </div>

            <Button
              variant={t.followed ? "outline" : "accent"}
              size="sm"
              onClick={() => handleToggleFollow(t.id, t.followed)}
              className="shrink-0"
            >
              {t.followed ? "Following" : "Follow"}
            </Button>
          </Card>
        ))}
      </ul>
    </main>
  );
}
