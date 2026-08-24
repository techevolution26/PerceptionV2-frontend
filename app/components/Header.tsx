// app/components/Header.tsx
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  LightBulbIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ui/ThemeToggle";
import type { UserMe } from "../types/models";
import VantageMark from "./ui/VantageMark";

export default function Header({
  onBellClick = () => {},
}: {
  onBellClick?: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [, setUser] = useState<UserMe | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setTimeout(() => setLoading(false), 600);
  };

  if (!mounted) {
    return <div className="min-h-[3.5rem]" />;
  }

  return (
    <div className="flex min-h-[3.5rem] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-4 md:px-6">
      {/* Wordmark Layout Container */}
      <Link
        href="/"
        className="group flex shrink-0 items-center gap-1 text-[16px] font-bold tracking-tight text-foreground sm:text-lg select-none"
      >
        {/* FIXED: Added 'md:hidden' so the icon is only visible on mobile layouts and disappears on desktop */}
        <VantageMark
          size={20}
          strokeWidth={1.8}
          className="text-accent transition-opacity group-hover:opacity-80 sm:size-6 md:hidden"
        />

        <div className="flex items-center">
          <span className="leading-none">Percepti</span>
          <LightBulbIcon
            className="-mx-[0.1rem] -mt-[0.12rem] h-[1.05rem] w-[1.05rem] shrink-0 text-accent transition-transform duration-300 ease-out group-hover:-rotate-12 group-hover:scale-105 sm:-mx-[0.125rem] sm:-mt-[0.15rem] sm:h-[1.2rem] sm:w-[1.2rem]"
            strokeWidth={2.2}
          />
          <span className="leading-none">n</span>
        </div>
      </Link>

      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[140px] sm:max-w-md transition-all duration-200"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3">
          {loading ? (
            <span className="h-3 w-3 rounded-full border-2 border-foreground-subtle border-t-transparent animate-spin sm:h-3.5 sm:w-3.5" />
          ) : (
            <MagnifyingGlassIcon className="h-3.5 w-3.5 text-foreground-subtle sm:h-4 sm:w-4" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          placeholder={loading ? "..." : "Search..."}
          className="block w-full rounded-pill border border-border-hairline bg-surface-sunken py-1 pl-7 pr-2.5 text-xs
                     text-foreground placeholder:text-foreground-subtle transition
                     focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60
                     sm:py-2 sm:pl-9 sm:pr-3.5 sm:text-sm
                     [@media(min-width:640px)]:placeholder:content-['Search_perceptions,_topics,_people...']"
        />
      </form>

      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <ThemeToggle />
      </div>
    </div>
  );
}
