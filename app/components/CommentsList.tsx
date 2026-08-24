"use client";
import { useState } from "react";
import NewReplyForm from "./NewReplyForm";
import Avatar from "./ui/Avatar";
import Pill from "./ui/Pill";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import type { Comment } from "../types/models";

type ReplyAddedHandler = (parentId: number, reply: Comment) => void;

interface CommentItemProps {
  comment: Comment;
  onReplyAdded: ReplyAddedHandler;
  depth?: number;
}

function CommentItem({ comment, onReplyAdded, depth = 0 }: CommentItemProps) {
  const [openForm, setOpenForm] = useState(false);
  const [openReplies, setOpenReplies] = useState(false);
  const replies = Array.isArray(comment.replies) ? comment.replies : [];

  return (
    <li
      style={{ paddingLeft: depth > 0 ? 20 : 0 }}
      className="relative mb-4"
    >
      {depth > 0 && (
        <div className="absolute bottom-0 left-2 top-0 w-px bg-border-hairline" />
      )}

      <div className="rounded-card border border-border-hairline bg-surface p-4 sm:p-5">
        {/* Header */}
        <div className="mb-3.5 flex items-start gap-3">
          <Avatar src={comment.user.avatar_url} alt={comment.user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold text-foreground">{comment.user.name}</h3>
              {comment.user.profession && (
                <Pill tone="accent" className="italic">{comment.user.profession}</Pill>
              )}
            </div>
            <p className="mt-0.5 font-mono text-xs text-foreground-subtle">
              {new Date(comment.created_at).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <p className="mb-3.5 text-sm text-foreground sm:text-[15px]">{comment.body}</p>

        {comment.media_url &&
          (/\.(mp4|webm|ogg)$/i.test(comment.media_url) ? (
            <video src={comment.media_url} controls className="mb-3 max-h-64 w-full rounded-control" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.media_url} alt="" className="mb-3 max-h-64 w-full rounded-control object-contain" />
          ))}

        {/* Actions */}
        <div className="flex items-center gap-4 border-t border-border-hairline pt-3 text-sm">
          <button
            onClick={() => setOpenForm((v) => !v)}
            className="flex items-center gap-1.5 text-foreground-muted transition hover:text-accent"
          >
            <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
            {openForm ? "Cancel reply" : "Reply"}
          </button>

          {replies.length > 0 && (
            <button
              onClick={() => setOpenReplies((v) => !v)}
              className="font-medium text-foreground-muted transition hover:text-accent"
            >
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>

      {/* Reply form */}
      {openForm && (
        <div className="ml-3 mt-3">
          <NewReplyForm
            parentId={comment.id}
            perceptionId={comment.perception_id}
            onAdd={(newReply) => {
              onReplyAdded(comment.id, newReply);
              setOpenForm(false);
              setOpenReplies(true);
            }}
          />
        </div>
      )}

      {/* Nested Replies */}
      {openReplies && replies.length > 0 && (
        <ul className="mt-4 space-y-4">
          {replies.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onReplyAdded={onReplyAdded}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

interface CommentsListProps {
  comments: Comment[];
  onReplyAdded: ReplyAddedHandler;
}

export default function CommentsList({ comments, onReplyAdded }: CommentsListProps) {
  if (!Array.isArray(comments) || comments.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border-strong p-6 text-center text-foreground-subtle">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <ul className="space-y-5">
      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onReplyAdded={onReplyAdded} />
      ))}
    </ul>
  );
}
