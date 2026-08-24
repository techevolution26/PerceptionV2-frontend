"use client";

import type { ReactNode, MouseEventHandler } from "react";
import {
  PlusIcon,
  BellIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";
import useCurrentUser from "../hooks/useCurrentUser";
import VantageMark from "./ui/VantageMark";
import Avatar from "./ui/Avatar";
import ThemeToggle from "./ui/ThemeToggle";

interface NavButtonProps {
  active?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  title: string;
  children: ReactNode;
}

function NavButton({ active, onClick, title, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`relative flex h-11 w-11 items-center justify-center rounded-control transition touch-manipulation
        ${active ? "bg-surface-sunken text-foreground" : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"}`}
    >
      {children}
      {active && (
        <span className="absolute -left-2 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
      )}
    </button>
  );
}

interface SidebarProps {
  onNewClick?: () => void;
  onBellClick?: () => void;
}

export default function Sidebar({
  onNewClick = () => {},
  onBellClick = () => {},
}: SidebarProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const go = (path: string) => router.push(path);

  // FIXED: Action guard ensuring user icon clicks route unauthenticated/401 guests to login portal
  const handleProfileClick = () => {
    if (!token || !user) {
      router.push("/login");
      return;
    }
    router.push(`/users/${user.id}`);
  };

  // FIXED: Global navigation interceptor to guard secondary buttons for clean guest UX
  const handleProtectedGo = (path: string) => {
    if (!token) {
      router.push("/login");
      return;
    }
    go(path);
  };

  return (
    <nav className="flex h-full flex-col items-center">
      <button
        onClick={() => go("/")}
        title="Perspective — Home"
        aria-label="Perspective home"
        className="mb-8 flex h-9 w-9 items-center justify-center text-accent transition hover:opacity-80"
      >
        <VantageMark size={26} strokeWidth={1.7} />
      </button>

      <div className="flex flex-1 flex-col items-center gap-2">
        <NavButton
          active={pathname === "/"}
          onClick={() => go("/")}
          title="Home"
        >
          <HomeIcon className="h-5 w-5" />
        </NavButton>

        {/* Action button triggers internally route token-checking logic via parent shell hooks */}
        <NavButton onClick={onNewClick} title="New Perception">
          <PlusIcon className="h-5 w-5" />
        </NavButton>

        <NavButton onClick={onBellClick} title="Notifications">
          <BellIcon className="h-5 w-5" />
        </NavButton>

        {/* PROTECTED ROUTE GUARD: Intercepts message tab redirection loops */}
        <NavButton
          active={pathname?.startsWith("/messages")}
          onClick={() => handleProtectedGo("/messages")}
          title="Messages"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </NavButton>
      </div>

      <div className="flex flex-col items-center gap-4 pb-1">
        {/* <ThemeToggle /> */}
        <button
          onClick={handleProfileClick}
          title={token && user ? "My profile" : "Log in"}
          aria-label={token && user ? "My profile" : "Log in"}
          className="rounded-full ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-accent/50"
        >
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-sunken" />
          ) : (
            <Avatar
              src={user?.avatar_url}
              alt={user?.name || "Guest User"}
              size="sm"
            />
          )}
        </button>
      </div>
    </nav>
  );
}
