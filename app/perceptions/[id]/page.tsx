"use client";

import { useParams, useRouter } from "next/navigation";
import PerceptionCard from "../../components/PerceptionCard";
import NewCommentForm from "../../components/NewCommentForm";
import CommentsList from "../../components/CommentsList";
import { usePerceptionDetail } from "../../hooks/usePerceptionDetail";
import useLikeToggle from "../../hooks/useLikeToggle";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Button from "../../components/ui/Button";
import VantageMark from "../../components/ui/VantageMark";
import type { Comment } from "../../types/models";

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-1/2 rounded bg-surface-sunken" />
      <div className="h-4 w-full rounded bg-surface-sunken" />
      <div className="h-32 rounded-card bg-surface-sunken" />
    </div>
  );
}

export default function PerceptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    me,
    perception,
    comments,
    loading,
    error,
    reload,
    setPerception,
    setComments,
  } = usePerceptionDetail(id);
  const toggleLike = useLikeToggle();

  // Pull local browser storage auth state safely
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isOwner = me?.id === perception?.user?.id;
  const hasCommented = comments.some((c) => c.user.id === me?.id);

  // ACTION PROTECTION FILTER UTILITY
  const guardAction = (callback: () => void) => {
    if (!token) {
      router.push("/login");
      return;
    }
    callback();
  };

  const addComment = (c: Comment) => {
    setComments((curr) => [{ ...c, replies: [] }, ...curr]);
  };

  const addReply = (parentId: number, reply: Comment) => {
    const insert = (arr: Comment[]): Comment[] =>
      arr.map((c) =>
        c.id === parentId
          ? { ...c, replies: [{ ...reply, replies: [] }, ...c.replies] }
          : { ...c, replies: insert(c.replies) },
      );
    setComments((cs) => insert(cs));
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
        <Skeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl space-y-4 p-4 text-center sm:p-6">
        <p className="text-danger">Error: {error}</p>
        <Button variant="accent" onClick={reload}>
          Retry
        </Button>
      </main>
    );
  }

  if (!perception) {
    return (
      <p className="py-8 text-center text-foreground-subtle">
        Perception not found.
      </p>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:space-y-8 sm:p-6">
      {!isOwner && (
        <button
          onClick={() =>
            guardAction(() =>
              router.push(`/messages?peer=${perception.user.id}`),
            )
          }
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-strong"
        >
          <ChatBubbleLeftIcon className="h-4 w-4" />
          Message {perception.user.name}
        </button>
      )}

      <PerceptionCard
        perception={perception}
        onLike={() =>
          guardAction(() =>
            toggleLike(perception, (likedId, liked, count) =>
              setPerception((p) =>
                p && p.id === likedId
                  ? { ...p, liked_by_user: liked, likes_count: count }
                  : p,
              ),
            ),
          )
        }
        detailView
      />

      <section className="space-y-5">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Perceive
        </h3>

        {/* Render the interactive text composition area if logged in, otherwise show a login nudge banner */}
        {token ? (
          <NewCommentForm perceptionId={perception.id} onAdd={addComment} />
        ) : (
          <div className="border border-dashed border-border-hairline p-5 text-center rounded-card text-sm text-foreground-muted bg-surface/50">
            Have a unique take on this?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-accent font-semibold hover:underline"
            >
              Log in to join the discussion.
            </button>
          </div>
        )}

        {/* If the viewer is an unauthenticated guest, force visibility of the vantage barrier */}
        {!token ? (
          <div
            className="mx-auto flex w-fit items-center gap-2 rounded-card border border-accent/25 bg-accent-soft px-5 py-4 text-sm text-accent-strong shadow-sm cursor-pointer"
            onClick={() => router.push("/login")}
          >
            <VantageMark size={18} />
            Sign in and share your perception to unlock others&apos;
            perspectives.
          </div>
        ) : isOwner || hasCommented || comments.length === 0 ? (
          <CommentsList
            comments={comments}
            onReplyAdded={(parentId, reply) =>
              guardAction(() => addReply(parentId, reply))
            }
          />
        ) : (
          <div className="mx-auto flex w-fit items-center gap-2 rounded-card border border-accent/25 bg-accent-soft px-5 py-4 text-sm text-accent-strong">
            <VantageMark size={18} />
            Share your perception to see others&apos; perspectives.
          </div>
        )}
      </section>
    </main>
  );
}
