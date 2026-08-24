// app/users/[id]/following/page.tsx
import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";
import type { UserSlim } from "../../../types/models";

export default async function FollowingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to load following: ${res.status}`);
  }
  const json: UserSlim[] | { data: UserSlim[] } = await res.json();
  const following: UserSlim[] = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link href={`/users/${id}`} className="text-sm font-medium text-foreground-muted hover:text-accent">
        &larr; Back to profile
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {following.length
          ? `Following ${following.length} user${following.length > 1 ? "s" : ""}`
          : "Not following anyone yet"}
      </h1>

      {following.length === 0 ? (
        <p className="text-foreground-subtle">This user isn&rsquo;t following anyone yet.</p>
      ) : (
        <UserListGrid users={following} currentUserId={id} />
      )}
    </main>
  );
}
