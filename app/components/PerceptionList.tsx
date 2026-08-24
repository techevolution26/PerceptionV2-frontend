// app/components/PerceptionsList.tsx
"use client";

import { useState, useEffect } from "react";
import NewPerceptionForm from "./NewPerceptionForm";
import PerceptionCard from "./PerceptionCard";
import EditPerceptionModal from "./EditPerceptionModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import useLikeToggle from "../hooks/useLikeToggle";
import VantageMark from "./ui/VantageMark";
import type { Perception, Topic } from "../types/models";

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4 rounded-card border border-border-hairline bg-surface p-4">
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

export default function PerceptionsList({ topic }: { topic: Topic }) {
  const [list, setList] = useState<Perception[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Perception | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Perception | null>(null);
  const toggleLike = useLikeToggle();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!topic?.id) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ topic_id: String(topic.id) });
    fetch(`/api/perceptions?${params}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setList)
      .catch((err) => {
        console.error("Error loading perceptions:", err);
        setError(typeof err === "string" ? err : "Failed to load perceptions.");
      })
      .finally(() => setLoading(false));
  }, [topic?.id, token]);

  const handleEdit = (p: Perception) => setEditTarget(p);
  const handleDelete = (p: Perception) => setDeleteTarget(p);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/perceptions/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setList((curr) => curr.filter((p) => p.id !== deleteTarget.id));
    } else {
      alert("Delete failed.");
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-danger">Error: {error}</p>;

  if (list.length === 0) {
    return (
      <div className="space-y-6 py-14 text-center">
        <VantageMark size={30} className="mx-auto text-foreground-subtle" />
        <div className="space-y-1.5">
          <p className="text-lg text-foreground">
            No perceptions yet in <strong className="font-semibold">{topic.name}</strong>
          </p>
          <p className="text-sm text-foreground-subtle">Be the first vantage point on this topic.</p>
        </div>
        <div className="mx-auto max-w-lg text-left">
          <NewPerceptionForm
            topics={[{ id: topic.id, name: topic.name }]}
            onSuccess={(newP) => setList([newP, ...list])}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <PerceptionCard
            key={p.id}
            perception={p}
            onLike={() =>
              toggleLike(p, (id, liked, likes_count) =>
                setList((curr) =>
                  curr.map((x) =>
                    x.id === id ? { ...x, liked_by_user: liked, likes_count } : x
                  )
                )
              )
            }
            onEdit={() => handleEdit(p)}
            onDelete={() => handleDelete(p)}
            showOwnerActions
            className="h-full"
          />
        ))}
      </div>

      {editTarget && (
        <EditPerceptionModal
          perception={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            setList((curr) => curr.map((x) => (x.id === updated.id ? updated : x)));
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
    </>
  );
}
