// app/components/FollowButton.tsx
"use client";

import { useState, useEffect } from "react";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import useCurrentUser from "../hooks/useCurrentUser";
import Spinner from "./Spinner";
import type { UserSlim } from "../types/models";

export default function FollowButton({ profileUserId }: { profileUserId: number }) {
  const { user: me, loading: meLoading } = useCurrentUser();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!me) {
      setIsFollowing(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/users/${profileUserId}/followers`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload: UserSlim[] | { data: UserSlim[] } = await res.json();
        const followers: UserSlim[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
            ? payload.data
            : [];
        if (!cancelled) {
          setIsFollowing(followers.some((u) => u.id === me.id));
        }
      } catch (err) {
        console.error("Failed to load followers:", err);
        if (!cancelled) setIsFollowing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [me, profileUserId]);

  const handleClick = async () => {
    if (!me) {
      alert("Please log in to follow users.");
      return;
    }
    setActionLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${profileUserId}/follow`, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed (${res.status}): ${text}`);
      }
      setIsFollowing((prev) => !prev);
    } catch (err) {
      console.error("Follow/unfollow error:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (meLoading || isFollowing === null) {
    return <div className="h-9 w-24 animate-pulse rounded-control bg-surface-sunken" />;
  }

  return (
    <button
      onClick={handleClick}
      disabled={actionLoading}
      className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-control px-4 py-2 text-sm font-medium transition
        ${isFollowing
          ? "border border-border-strong bg-surface text-foreground hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
          : "bg-foreground text-background hover:opacity-90"
        }
        ${actionLoading ? "pointer-events-none opacity-70" : ""}`}
    >
      {actionLoading ? (
        <Spinner size={16} className="text-current" />
      ) : (
        <>
          {isFollowing ? <UserMinusIcon className="h-4 w-4" /> : <UserPlusIcon className="h-4 w-4" />}
          <span>{isFollowing ? "Following" : "Follow"}</span>
        </>
      )}
    </button>
  );
}
