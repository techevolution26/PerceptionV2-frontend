"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import {
  PlusIcon,
  BellIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";
import useCurrentUser from "../hooks/useCurrentUser";
import Avatar from "./ui/Avatar";

interface MobileNavProps {
  onNewClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onBellClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  forceVisible?: boolean;
}

export default function MobileNav({
  onNewClick = () => {},
  onBellClick = () => {},
  forceVisible = false,
}: MobileNavProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname(); // <-- used to hide profile on messages
  const go = (path: string) => router.push(path);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showHandle, setShowHandle] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    lastY.current = typeof window !== "undefined" ? window.scrollY || 0 : 0;

    const onFocusIn = (ev: FocusEvent) => {
      const target = ev.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        setVisible(false);
        setShowHandle(true);
      }
    };
    const onFocusOut = () => setShowHandle(true);

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const diff = y - lastY.current;
        if (diff > 10) {
          if (!forceVisible) {
            setVisible(false);
            setShowHandle(true);
          }
        } else if (diff < -10) {
          setVisible(true);
          setShowHandle(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimer.current);
    };
  }, [forceVisible]);

  useEffect(() => {
    if (forceVisible) {
      setVisible(true);
      setShowHandle(false);
    }
  }, [forceVisible]);

  if (!mounted) return null;

  const flashVisible = (duration = 2500) => {
    if (forceVisible) return;
    if (!user) return;
    setVisible(true);
    setShowHandle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setShowHandle(true);
    }, duration);
  };

  const handleNew = (e: MouseEvent<HTMLButtonElement>) => {
    flashVisible(3000);
    if (user) onNewClick(e);
  };
  const handleBell = (e: MouseEvent<HTMLButtonElement>) => {
    flashVisible(2600);
    if (user) onBellClick(e);
  };

  const handleReveal = () => {
    setVisible(true);
    setShowHandle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setShowHandle(true);
    }, 4000);
  };

  // hide profile button when on messages route to avoid overlap/conflict
  const hideProfileOnMessages = pathname?.startsWith("/messages");

  return (
    <>
      {showHandle && !visible && (
        <button
          aria-label="Open navigation"
          onClick={handleReveal}
          className="fixed bottom-6 left-1/2 z-40 flex h-10 w-10 -translate-x-1/2 items-center justify-center
                     rounded-full border border-border-hairline bg-surface/95 text-foreground shadow-sm backdrop-blur lg:hidden"
        >
          <div className="h-3 w-3 rounded-full bg-accent" />
        </button>
      )}

      <nav
        aria-hidden={visible ? "false" : "true"}
        role="navigation"
        className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-pill
                    border border-border-hairline bg-surface/90 px-2 py-1.5 shadow-lg backdrop-blur
                    transition-all duration-300 ease-out lg:hidden
                    ${visible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-6 opacity-0 pointer-events-none"}`}
      >
        <button onClick={handleNew} className="touch-manipulation rounded-full p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground" title="New Perception" aria-label="Create New">
          <PlusIcon className="h-5 w-5" />
        </button>

        <button onClick={handleBell} className="rounded-full p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground" title="Notifications" aria-label="Notifications">
          <BellIcon className="h-5 w-5" />
        </button>

        <button onClick={() => go("/messages")} className="rounded-full p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground" title="Messages" aria-label="Messages">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>

        <button onClick={() => go("/")} className="rounded-full p-2.5 text-foreground-muted transition hover:bg-surface-hover hover:text-foreground" title="Home" aria-label="Home">
          <HomeIcon className="h-5 w-5" />
        </button>
      </nav>

      {/* Profile/Profile-CTA button: visible up to lg breakpoint unless on messages route */}
      {!hideProfileOnMessages && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          {loading ? (
            <div className="h-11 w-11 animate-pulse rounded-full border border-border-hairline bg-surface-sunken shadow-md" />
          ) : user ? (
            <button
              onClick={() => go(`/users/${user.id}`)}
              title="Profile"
              aria-label="Open profile"
              className="block overflow-hidden rounded-full border-2 border-background shadow-md focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <Avatar src={user.avatar_url} alt={user.name} size="md" />
            </button>
          ) : (
            <button
              onClick={() => go("/login")}
              title="Sign in"
              aria-label="Sign in / create account"
              className="h-11 rounded-pill bg-foreground px-4 font-semibold text-background shadow-md transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Sign in
            </button>
          )}
        </div>
      )}
    </>
  );
}
