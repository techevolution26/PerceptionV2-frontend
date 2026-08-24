// app/components/NewPerceptionForm.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import usePerceptionsStore from "../store/usePerceptionsStore";
import type { Perception, TopicSlim } from "../types/models";

interface NewPerceptionFormProps {
  topics: TopicSlim[];
  onSuccess: (perception: Perception) => void;
  token?: string | null;
}

type MediaKind = "image" | "video" | null;

export default function NewPerceptionForm({ topics, onSuccess, token: tokenProp }: NewPerceptionFormProps) {
  const [body, setBody] = useState("");
  const [topicId, setTopicId] = useState<number | "">(topics[0]?.id ?? "");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaKind>(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!body || !topicId) return;
    setLoading(true);
    const form = new FormData();
    form.append("body", body);
    form.append("topic_id", String(topicId));
    if (mediaFile) form.append("media", mediaFile);

    const token = tokenProp || localStorage.getItem("token");
    const res = await fetch("/api/perceptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      alert("Error: " + text);
      setLoading(false);
      return;
    }

    const data: Perception = await res.json();
    usePerceptionsStore.getState().addPerception(data);
    onSuccess(data);

    setBody("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setLoading(false);
  };

  const handleFileChange = (kind: MediaKind) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType(kind);
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's your take on this?"
          rows={4}
          className="w-full resize-none rounded-control border border-border-hairline bg-surface-sunken p-3 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 sm:text-[15px]"
        />
      </div>

      {mediaPreview && (
        <div className="group relative">
          {mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaPreview}
              alt="preview"
              className="max-h-48 w-full rounded-control object-contain sm:max-h-80"
            />
          ) : (
            <video
              src={mediaPreview}
              controls
              className="max-h-48 w-full rounded-control object-contain sm:max-h-80"
            />
          )}
          <button
            type="button"
            onClick={handleRemoveMedia}
            aria-label="Remove media"
            className="absolute -right-2 -top-2 rounded-full bg-foreground p-1.5 text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-subtle">Topic</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setTopicId(topic.id)}
              className={`rounded-control border p-2.5 text-center text-xs transition sm:text-sm
              ${topicId === topic.id
                  ? "border-accent/60 bg-accent-soft text-accent-strong"
                  : "border-border-hairline text-foreground-muted hover:border-border-strong hover:text-foreground"
                }`}
            >
              <span className="break-words leading-tight">{topic.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-hairline pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          <label className="cursor-pointer rounded-control p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground">
            <PhotoIcon className="h-5 w-5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange("image")} />
          </label>
          <label className="cursor-pointer rounded-control p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground">
            <VideoCameraIcon className="h-5 w-5" />
            <input type="file" accept="video/*" className="hidden" onChange={handleFileChange("video")} />
          </label>
        </div>

        <Button type="submit" variant="accent" loading={loading} disabled={!body || !topicId} className="w-full sm:w-auto">
          {!loading && <ArrowUpTrayIcon className="h-4 w-4" />}
          {loading ? "Posting…" : "Post perception"}
        </Button>
      </div>
    </form>
  );
}
