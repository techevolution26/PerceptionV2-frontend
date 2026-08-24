"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";
import EditPerceptionModal from "./EditPerceptionModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import useLikeToggle from "../hooks/useLikeToggle";
import { motion, AnimatePresence } from "motion/react";
import Button from "./ui/Button";
import type { Perception } from "../types/models";

export default function RecentPerceptions({ userId }: { userId: number | string }) {
  const [list, setList] = useState<Perception[]>([]);
  const [editTarget, setEditTarget] = useState<Perception | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Perception | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const toggleLike = useLikeToggle();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/perceptions`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, token]);

  const handleLikeUpdate = (id: number, liked: boolean, likes_count: number) => {
    setList((curr) =>
      curr.map((p) => (p.id === id ? { ...p, liked_by_user: liked, likes_count } : p))
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/perceptions/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setList((curr) => curr.filter((p) => p.id !== deleteTarget.id));
    } else {
      alert("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const itemsPerPage = 10;
  const visible = list.slice(0, page * itemsPerPage);
  const hasMore = visible.length < list.length;

  if (loading) {
    return (
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-card bg-surface-sunken" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="py-6 text-center text-danger">Error: {error}</p>;
  }

  if (list.length === 0) {
    return (
      <div className="py-12 text-center italic text-foreground-subtle">
        No perceptions yet. Be the first to share!
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          <AnimatePresence>
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <PerceptionCard
                  perception={p}
                  onLike={() =>
                    toggleLike(p, (id, liked, likes_count) =>
                      handleLikeUpdate(id, liked, likes_count)
                    )
                  }
                  onComment={() => (window.location.href = `/perceptions/${p.id}`)}
                  onEdit={() => setEditTarget(p)}
                  onDelete={() => setDeleteTarget(p)}
                  showOwnerActions
                  className="h-full"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <Button variant="outline" className="mt-6" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        )}
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
