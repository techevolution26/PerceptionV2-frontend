// components/NewReplyForm.tsx
"use client";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { PaperClipIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import type { Comment } from "../types/models";

interface NewReplyFormProps {
  parentId: number;
  perceptionId: number;
  onAdd: (reply: Comment) => void;
}

export default function NewReplyForm({ parentId, onAdd }: NewReplyFormProps) {
  const [body, setBody] = useState("");
  const [mediaFile, setMedia] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append("body", body);
    if (mediaFile) form.append("media", mediaFile);

    const res = await fetch(`/api/comments/${parentId}/replies`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });
    const data: Comment & { message?: string } = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.message || "Failed to reply");
    } else {
      onAdd(data);
      setBody("");
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMedia(e.target.files[0]);
    }
  };

  return (
    <div className="rounded-control border border-border-hairline bg-surface-sunken p-3.5">
      <form onSubmit={handleSubmit}>
        <div className="mb-2.5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your reply…"
            required
            className="min-h-[76px] w-full rounded-control border border-border-hairline bg-surface p-2.5 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-control border border-border-hairline px-2.5 py-1.5 text-xs text-foreground-muted transition hover:border-border-strong hover:text-foreground"
            >
              <PaperClipIcon className="h-3.5 w-3.5" />
              {mediaFile ? mediaFile.name : "Media"}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {mediaFile && (
              <button
                type="button"
                onClick={() => {
                  setMedia(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-1 text-foreground-subtle transition hover:text-danger"
                aria-label="Remove media"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button type="submit" variant="accent" size="sm" loading={loading} disabled={!body}>
            {!loading && <PaperAirplaneIcon className="h-3.5 w-3.5" />}
            {loading ? "Posting…" : "Post reply"}
          </Button>
        </div>

        {mediaFile && (
          <div className="mt-2 rounded-control bg-accent-soft px-2.5 py-1.5 text-xs text-accent-strong">
            Ready: {mediaFile.name}
          </div>
        )}
      </form>
    </div>
  );
}
