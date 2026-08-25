"use client";

import { useState, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useClickAway } from "react-use";
import { format, isThisYear } from "date-fns";
import { createPortal } from "react-dom";
import html2canvas from "html2canvas-pro";
import useCurrentUser from "../hooks/useCurrentUser";
import Avatar from "./ui/Avatar";
import Card from "./ui/Card";
import type { Perception } from "../types/models";

interface PerceptionCardProps {
  perception: Perception;
  onLike?: (id: number) => void;
  onComment?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  detailView?: boolean;
  showMenu?: boolean;
  showOwnerActions?: boolean;
  className?: string;
}

export default function PerceptionCard({
  perception,
  onLike,
  onEdit,
  onDelete,
  detailView = false,
  showMenu = true,
  showOwnerActions = false,
  className = "",
}: PerceptionCardProps) {
  const router = useRouter();
  const { user: me } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useClickAway(menuRef, () => setMenuOpen(false));

  const {
    id,
    user,
    body,
    media_url: media,
    likes_count: likes,
    comments_count: comments,
    liked_by_user: liked,
    topic,
    created_at,
  } = perception;

  const isOwner = me?.id === user.id;
  const isVideo = /\.(mp4|webm|ogg)$/i.test(media || "");

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const sec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
    return isThisYear(date) ? format(date, "d MMM") : format(date, "d MMM yy");
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const menuEl =
      cardRef.current.querySelector<HTMLElement>(".perception-menu");
    const hiddenEls = cardRef.current.querySelectorAll<HTMLElement>(
      ".exclude-from-snapshot",
    );
    if (menuEl) menuEl.style.visibility = "hidden";
    hiddenEls.forEach((el) => (el.style.visibility = "hidden"));

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor:
          getComputedStyle(cardRef.current).backgroundColor || "#fff",
        ignoreElements: (el) => el.classList?.contains("exclude-from-snapshot"),
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Snapshot failed");
          return;
        }
        const file = new File([blob], "perception.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          navigator.share({ files: [file], title: "Perception" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "perception.png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      });
    } catch (err) {
      console.error("Snapshot error:", err);
      alert("Snapshot failed");
    } finally {
      if (menuEl) menuEl.style.visibility = "visible";
      hiddenEls.forEach((el) => (el.style.visibility = "visible"));
    }
  };

  return (
    <>
      <Card
        as="div"
        ref={cardRef}
        hover
        className={`relative flex flex-col overflow-hidden ${className}`}
        onDoubleClick={() => router.push(`/perceptions/${id}`)}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-3.5 pt-3.5 sm:px-4">
          <Avatar src={user.avatar_url} alt={user.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/users/${user.id}`}
                  className="block truncate text-sm font-medium text-foreground hover:underline sm:text-[15px]"
                  title={user.name}
                >
                  {user.name}
                </Link>
                {topic?.name && (
                  <div className="truncate text-xs text-foreground-subtle">
                    <span className="mr-1">a view on</span>
                    <span className="font-medium text-foreground-muted">
                      {topic.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="ml-2 whitespace-nowrap font-mono text-[11px] text-foreground-subtle">
                {formatRelativeTime(created_at)}
              </div>
            </div>
          </div>

          {showMenu && (
            <div className="relative ml-1" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-control p-1.5 text-foreground-subtle transition hover:bg-surface-hover hover:text-foreground"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                title="Actions"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div
                  className="perception-menu absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-control border border-border-hairline bg-surface shadow-xl sm:w-40"
                  role="menu"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleShare();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-hover"
                    role="menuitem"
                  >
                    Share snapshot
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-hover"
                    role="menuitem"
                  >
                    Copy link
                  </button>

                  {isOwner && showOwnerActions && (
                    <>
                      <hr className="border-border-hairline" />
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit?.(id);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-hover"
                        role="menuitem"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete?.(id);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-danger transition hover:bg-danger/10"
                        role="menuitem"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body Container */}
        <div className="relative px-3.5 pb-2 pt-2 sm:px-4">
          <div className="relative">
            <p
              className={`whitespace-pre-wrap break-words text-sm text-foreground sm:text-[15px] sm:leading-relaxed ${
                detailView ? "" : "line-clamp-10"
              }`}
            >
              {body}
            </p>

            {/* FIXED: The smooth fading mask layer. Only shows on the feed view if the text runs long. */}
            {!detailView && body.length > 140 && (
              <div
                className="pointer-events-none absolute bottom-0 left-0 h-6 w-full bg-gradient-to-t from-surface via-surface/60 to-transparent"
                aria-hidden="true"
              />
            )}
          </div>
        </div>

        {/* Media */}
        {media && (
          <div className="w-full pb-2">
            {isVideo ? (
              <video
                src={media}
                controls
                className="max-h-[38vh] w-full object-contain sm:max-h-[46vh]"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media}
                alt=""
                className="max-h-[48vh] w-full cursor-pointer object-cover sm:max-h-[60vh]"
                loading="lazy"
                decoding="async"
                onClick={() => setShowImagePreview(true)}
              />
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center gap-1 border-t border-border-hairline px-2 py-1.5">
          <button
            onClick={() => onLike?.(id)}
            className="flex items-center gap-1.5 rounded-control px-2.5 py-2 text-foreground-muted transition hover:bg-surface-hover active:scale-95"
            aria-label={`Like perception ${id}`}
            style={{ touchAction: "manipulation" }}
          >
            {liked ? (
              <HeartIconSolid className="h-[18px] w-[18px] text-accent" />
            ) : (
              <HeartIcon className="h-[18px] w-[18px]" />
            )}
            <span className="font-mono text-xs">{likes}</span>
          </button>

          <button
            onClick={() =>
              detailView ? null : router.push(`/perceptions/${id}`)
            }
            disabled={detailView}
            className={`flex items-center gap-1.5 rounded-control px-2.5 py-2 text-foreground-muted transition hover:bg-surface-hover active:scale-95 ${detailView ? "cursor-not-allowed opacity-40" : ""}`}
            aria-label={`View comments for perception ${id}`}
            style={{ touchAction: "manipulation" }}
          >
            <ChatBubbleOvalLeftIcon className="h-[18px] w-[18px]" />
            <span className="font-mono text-xs">{comments}</span>
          </button>
        </div>
      </Card>

      {/* Image preview modal */}
      {showImagePreview &&
        media &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
            onClick={() => setShowImagePreview(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media}
              alt=""
              className="max-h-[92vh] max-w-full rounded-card object-contain"
              onClick={(e: MouseEvent<HTMLImageElement>) => e.stopPropagation()}
              loading="lazy"
              decoding="async"
            />
          </div>,
          document.body,
        )}
    </>
  );
}
