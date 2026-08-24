"use client";

import type { ReactNode, MouseEventHandler } from "react";
import { PlusIcon, BellIcon, HomeIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
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

export default function Sidebar({ onNewClick = () => {}, onBellClick = () => {} }: SidebarProps) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  const go = (path: string) => router.push(path);

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
        <NavButton active={pathname === "/"} onClick={() => go("/")} title="Home">
          <HomeIcon className="h-5 w-5" />
        </NavButton>

        <NavButton onClick={onNewClick} title="New Perception">
          <PlusIcon className="h-5 w-5" />
        </NavButton>

        <NavButton onClick={onBellClick} title="Notifications">
          <BellIcon className="h-5 w-5" />
        </NavButton>

        <NavButton active={pathname?.startsWith("/messages")} onClick={() => go("/messages")} title="Messages">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </NavButton>
      </div>

      <div className="flex flex-col items-center gap-4 pb-1">
        {/* <ThemeToggle /> */}
        <button
          onClick={() => user && go(`/users/${user.id}`)}
          title="My profile"
          aria-label="My profile"
          className="rounded-full ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-accent/50"
        >
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-sunken" />
          ) : (
            <Avatar src={user?.avatar_url} alt={user?.name} size="sm" />
          )}
        </button>
      </div>
    </nav>
  );
}
