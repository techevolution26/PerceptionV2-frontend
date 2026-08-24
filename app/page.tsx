"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import PerceptionCard from "./components/PerceptionCard";
import EditPerceptionModal from "./components/EditPerceptionModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import VantageMark from "./components/ui/VantageMark";
import usePerceptionsStore from "./store/usePerceptionsStore";
import { useShallow } from "zustand/react/shallow";
import type { Perception, Topic, LikeToggle } from "./types/models";

interface TopicGroup extends Topic {
  items: Perception[];
}

function SkeletonCard() {
  return (
    <div className="space-y-4 rounded-card border border-border-hairline bg-surface p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-sunken" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 rounded bg-surface-sunken" />
          <div className="h-2 w-1/3 rounded bg-surface-sunken" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-surface-sunken" />
      <div className="h-3 w-5/6 rounded bg-surface-sunken" />
      <div className="h-32 w-full rounded bg-surface-sunken" />
      <div className="mt-3 flex space-x-4">
        <div className="h-4 w-10 rounded bg-surface-sunken" />
        <div className="h-4 w-10 rounded bg-surface-sunken" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editTarget, setEditTarget] = useState<Perception | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Perception | null>(null);
  const [loading, setLoading] = useState(true);

  // FIXED: useShallow ensures array references created by map/filter stop the infinite loop
  const perceptions = usePerceptionsStore(
    useShallow((s) => s.order.map((id) => s.byId[id]).filter(Boolean)),
  );
  const hydrateFeed = usePerceptionsStore((s) => s.hydrateFeed);
  const updatePerception = usePerceptionsStore((s) => s.updatePerception);
  const removePerception = usePerceptionsStore((s) => s.removePerception);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const t: Topic[] = await fetch("/api/topics", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        setTopics(t);

        const res2 = await fetch("/api/perceptions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res2.status === 401) {
          router.push("/login");
          return;
        }

        let perData: Perception[] = [];
        if (res2.ok) {
          const text = await res2.text();
          perData = text ? JSON.parse(text) : [];
        } else {
          console.error("Error fetching perceptions:", res2.status);
        }

        hydrateFeed(perData);
      } catch (error) {
        console.error("Failed to load dashboard resources:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, router, hydrateFeed]);

  // OPTIMIZATION: Memoized computation avoids recalculating nested loops on every single re-render
  const byTopic: TopicGroup[] = useMemo(() => {
    return topics
      .map((topic) => ({
        ...topic,
        items: perceptions.filter((p) => p.topic?.id === topic.id).slice(0, 3),
      }))
      .filter((group) => group.items.length > 0);
  }, [topics, perceptions]);

  const handleLike = async (p: Perception) => {
    const method = p.liked_by_user ? "DELETE" : "POST";
    const res = await fetch(`/api/perceptions/${p.id}/like`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const { liked, likes_count }: LikeToggle = await res.json();
    updatePerception(p.id, { liked_by_user: liked, likes_count });
  };

  const handleEdit = (perception: Perception) => setEditTarget(perception);
  const handleDelete = (perception: Perception) => setDeleteTarget(perception);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/perceptions/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      removePerception(deleteTarget.id);
    } else {
      alert("Failed to delete perception.");
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-12 p-4 sm:p-6">
        {Array.from({ length: 2 }).map((_, idx) => (
          <section key={idx}>
            <div className="mb-6 h-5 w-1/3 animate-pulse rounded bg-surface-sunken" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-12 p-4 sm:p-6">
      {byTopic.map((group) => (
        <section key={group.id}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {group.name}
            </h2>
            {group.items.length >= 3 && (
              <Link
                href={`/topics/${group.id}`}
                className="flex items-center gap-1.5 rounded-pill border border-border-hairline px-3.5 py-1.5 text-sm font-medium text-foreground-muted transition hover:border-accent/50 hover:text-accent"
              >
                See more
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((p) => (
              <PerceptionCard
                key={p.id}
                perception={p}
                onLike={() => handleLike(p)}
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p)}
                showOwnerActions
                className="h-full"
              />
            ))}
          </div>
        </section>
      ))}

      {byTopic.length === 0 && (
        <div className="space-y-4 py-16 text-center">
          <VantageMark size={30} className="mx-auto text-foreground-subtle" />
          <p className="text-sm text-foreground-subtle">
            No perceptions available yet. Check back soon!
          </p>
        </div>
      )}

      {editTarget && (
        <EditPerceptionModal
          perception={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            updatePerception(updated.id, updated);
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
