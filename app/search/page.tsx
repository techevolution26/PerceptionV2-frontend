// app/search/page.jsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchPageWithParams from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-foreground-subtle">Loading search…</p>}>
      <SearchPageWithParams />
    </Suspense>
  );
}
