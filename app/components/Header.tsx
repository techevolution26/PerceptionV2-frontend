"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LightBulbIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ui/ThemeToggle";
import type { UserMe } from "../types/models";

export default function Header({ onBellClick = () => {} }: { onBellClick?: () => void }) {
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
    <div className="flex min-h-[3.5rem] items-center justify-between gap-4 px-4 py-2.5 md:px-6">
      {/* Wordmark — the lightbulb stands in for the "o" in Percepti[o]n */}
      <Link
        href="/"
        className="group flex shrink-0 items-center text-lg font-semibold tracking-tight text-foreground md:hidden"
      >
        <span>Percepti</span>
        <LightBulbIcon className="-mx-0.5 h-4.5 w-4.5 text-accent transition-transform duration-300 group-hover:-rotate-12" />
        <span>n</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          {loading ? (
            <span className="h-3.5 w-3.5 rounded-full border-2 border-foreground-subtle border-t-transparent animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="h-4 w-4 text-foreground-subtle" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          placeholder={loading ? "Searching…" : "Search perceptions, topics, people…"}
          className="block w-full rounded-pill border border-border-hairline bg-surface-sunken py-2 pl-9 pr-3.5 text-sm
                     text-foreground placeholder:text-foreground-subtle transition
                     focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-60"
        />
      </form>

      <div className="hidden shrink-0 items-center gap-3 md:flex">
        <ThemeToggle />
      </div>
    </div>
  );
}
