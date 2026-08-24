// app/search/SearchContent.tsx
"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Avatar from "../components/ui/Avatar";
import Card from "../components/ui/Card";
import Spinner from "../components/Spinner";
import type { Perception } from "../types/models";

export default function SearchPageWithParams() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState<Perception[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let canceled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?query=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!canceled) setResults(data);
      })
      .catch((e: Error) => {
        if (!canceled) setError(e.message);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
      <div className="relative">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
        <input
          type="text"
          defaultValue={query}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            const params = new URLSearchParams(window.location.search);
            if (val) params.set("query", val);
            else params.delete("query");
            window.history.replaceState({}, "", `?${params.toString()}`);
          }}
          placeholder="Search perceptions or users…"
          className="w-full rounded-pill border border-border-hairline bg-surface-sunken py-2.5 pl-10 pr-4 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-foreground-subtle">
          <Spinner size={18} /> Searching…
        </div>
      )}
      {error && <p className="text-danger">Error: {error}</p>}

      {!loading && !error && results.length === 0 && query && (
        <p className="text-foreground-subtle">No results found for &ldquo;{query}&rdquo;.</p>
      )}

      <ul className="space-y-4">
        {results.map((p) => (
          <Card as="li" key={p.id} className="p-4">
            <div className="mb-2 flex items-center gap-2.5">
              <Avatar src={p.user?.avatar_url} alt={p.user?.name} size="sm" />
              <div>
                <p className="font-medium text-foreground">{p.user?.name}</p>
                {p.user?.profession && (
                  <p className="text-sm text-foreground-subtle">{p.user.profession}</p>
                )}
              </div>
            </div>
            <p className="text-foreground">{p.body}</p>
            <Link
              href={`/perceptions/${p.id}`}
              className="mt-2 inline-block text-sm font-medium text-accent hover:text-accent-strong"
            >
              View perception
            </Link>
          </Card>
        ))}
      </ul>
    </main>
  );
}
