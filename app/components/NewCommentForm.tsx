// components/NewCommentForm.tsx
"use client";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { PaperClipIcon, XMarkIcon, BoltIcon } from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import Card from "./ui/Card";
import type { Comment } from "../types/models";

interface NewCommentFormProps {
  perceptionId: number;
  onAdd: (comment: Comment) => void;
}

export default function NewCommentForm({ perceptionId, onAdd }: NewCommentFormProps) {
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

    const res = await fetch(`/api/perceptions/${perceptionId}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });

    const data: Comment & { message?: string } = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed");
    } else {
      onAdd(data);
      setBody("");
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setLoading(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMedia(e.target.files[0]);
    }
  };

  return (
    <Card className="mb-6 p-5">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="comment" className="mb-1.5 ml-0.5 block text-sm font-medium text-foreground-muted">
            Add your perception
          </label>
          <textarea
            id="comment"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's your take on this?"
            required
            className="min-h-[120px] w-full rounded-control border border-border-hairline bg-surface-sunken p-3.5 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-control border border-border-hairline px-3.5 py-2 text-sm text-foreground-muted transition hover:border-border-strong hover:text-foreground"
            >
              <PaperClipIcon className="h-4 w-4" />
              {mediaFile ? mediaFile.name : "Add media"}
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
                className="ml-2 text-foreground-subtle transition hover:text-danger"
                aria-label="Remove media"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button type="submit" variant="accent" loading={loading} disabled={!body}>
            {!loading && <BoltIcon className="h-4 w-4" />}
            {loading ? "Posting…" : "Share perception"}
          </Button>
        </div>

        {mediaFile && (
          <div className="mt-3 rounded-control border border-accent/25 bg-accent-soft p-2.5 text-sm font-medium text-accent-strong">
            Media ready: {mediaFile.name}
          </div>
        )}
      </form>
    </Card>
  );
}
