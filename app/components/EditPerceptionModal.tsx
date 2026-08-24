// app/components/EditPerceptionModal.tsx
"use client";

import { useRef, useState, useEffect, type ChangeEvent, type MouseEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import type { Perception, Topic } from "../types/models";

interface EditPerceptionModalProps {
  perception: Perception;
  onClose: () => void;
  onSave: (updated: Perception) => void;
}

export default function EditPerceptionModal({ perception, onClose, onSave }: EditPerceptionModalProps) {
  const [body, setBody] = useState(perception.body || "");
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(perception.media_url || null);
  const [topicId, setTopicId] = useState<number | "">(perception.topic?.id ?? "");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

  useEffect(() => {
    fetch("/api/topics", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTopics)
      .catch(console.error);
  }, [token]);

  const handleSave = async () => {
    setLoading(true);

    const form = new FormData();
    form.append("body", body);
    form.append("topic_id", String(topicId));
    if (media) form.append("media", media);

    const res = await fetch(`/api/perceptions/${perception.id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Update failed: " + err);
      setLoading(false);
      return;
    }

    const updated: Perception = await res.json();
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-card border border-border-hairline bg-surface p-6 shadow-2xl"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-control p-1 text-foreground-subtle transition hover:bg-surface-hover hover:text-foreground"
          disabled={loading}
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Edit perception</h2>

        <div className="space-y-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-control border border-border-hairline bg-surface-sunken p-3 text-sm text-foreground transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
            disabled={loading}
          />

          <select
            value={topicId}
            onChange={(e) => setTopicId(Number(e.target.value))}
            className="w-full rounded-control border border-border-hairline bg-surface-sunken p-2.5 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
            disabled={loading}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {preview && (
            <div className="overflow-hidden rounded-control border border-border-hairline">
              {/\.(mp4|webm|ogg)$/i.test(preview) ? (
                <video src={preview} controls className="max-h-[300px] w-full" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="media preview" className="max-h-[300px] w-full object-contain" />
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              ref={fileRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const f = e.target.files?.[0];
                if (f) {
                  setMedia(f);
                  setPreview(URL.createObjectURL(f));
                }
              }}
              disabled={loading}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={loading}>
              Replace media
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSave} loading={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
