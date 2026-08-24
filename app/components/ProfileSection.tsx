// app/components/ProfileSection.tsx
"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { PencilIcon, XMarkIcon, CheckIcon, CalendarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import useCurrentUser from "../hooks/useCurrentUser";
import FollowButton from "./FollowButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./ui/Avatar";
import Pill from "./ui/Pill";
import Button from "./ui/Button";
import Card from "./ui/Card";
import type { UserProfile } from "../types/models";

export default function ProfileSection({ user: initialUser }: { user: UserProfile }) {
  const inputFile = useRef<HTMLInputElement>(null);
  const { user: me } = useCurrentUser();
  const isOwnProfile = me?.id === initialUser.id;
  const router = useRouter();

  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const uploadAvatar = async (file: File) => {
    setLoading(true);
    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const updated: UserProfile & { message?: string } = await res.json();
      if (!res.ok) throw new Error(updated.message || "Upload failed");
      setUser(updated);
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const updated: UserProfile & { message?: string } = await res.json();
      if (!res.ok) throw new Error(updated.message || "Save failed");
      setUser(updated);
      setEditing(false);
    } catch (err) {
      alert("Save failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 items-start gap-6 p-6 md:grid-cols-[auto,1fr,auto] md:p-8">
        {/* Avatar */}
        <div className="relative self-center md:self-start">
          <div className="relative h-28 w-28">
            <Avatar src={user.avatar_url} alt={user.name} size={112} className="border-4 border-background shadow-md" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-accent" />
              </div>
            )}
            {isOwnProfile && !editing && (
              <button
                type="button"
                onClick={() => inputFile.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-full bg-foreground p-2 text-background shadow-lg transition hover:opacity-90"
                aria-label="Change avatar"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            <input
              ref={inputFile}
              type="file"
              name="avatar"
              accept="image/*"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUser((u) => ({ ...u, avatar_url: URL.createObjectURL(file) }));
                  uploadAvatar(file);
                }
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* Profile Info */}
        <form onSubmit={handleSave} className="space-y-4">
          {editing ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground-subtle">Username / profession</label>
                  <input
                    type="text"
                    name="profession"
                    defaultValue={user.profession ?? undefined}
                    className="w-full rounded-control border border-border-hairline bg-surface-sunken px-3.5 py-2.5 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground-subtle">Bio</label>
                  <textarea
                    name="bio"
                    defaultValue={user.bio ?? undefined}
                    rows={4}
                    className="w-full resize-none rounded-control border border-border-hairline bg-surface-sunken px-3.5 py-2.5 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="accent" loading={loading}>
                  {!loading && <CheckIcon className="h-4 w-4" />}
                  {loading ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{user.name}</h1>
                {!isOwnProfile && <FollowButton profileUserId={user.id} />}
                {!isOwnProfile && (
                  <button
                    onClick={() => router.push(`/messages?peer=${user.id}`)}
                    className="ml-1 flex items-center gap-1.5 rounded-pill border border-border-hairline px-3 py-1.5 text-sm text-foreground-muted transition hover:border-border-strong hover:text-foreground"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    Message
                  </button>
                )}
              </div>
              {user.profession && <p className="text-accent">{user.profession}</p>}
              {user.bio && (
                <p className="line-clamp-6 whitespace-pre-line text-foreground-muted">{user.bio}</p>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-control px-3 py-1.5 text-sm font-medium text-foreground-muted transition hover:bg-surface-hover hover:text-foreground"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit profile
                </button>
              )}
            </>
          )}
        </form>

        {/* Stats */}
        <div className="w-full space-y-3 md:w-auto md:self-center">
          <div className="flex items-center text-sm text-foreground-subtle">
            <CalendarIcon className="mr-1.5 h-4 w-4" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/users/${user.id}`}>
              <Pill>{user.perceptions_count} perceptions</Pill>
            </Link>
            <Link href={`/users/${user.id}/followers`}>
              <Pill>{user.followers_count} followers</Pill>
            </Link>
            <Link href={`/users/${user.id}/following`}>
              <Pill>{user.following_count} following</Pill>
            </Link>
            <Link href="/topics">
              <Pill tone="accent">{user.topics_count} topics</Pill>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
