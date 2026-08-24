// app/users/[id]/followers/page.tsx
import Link from "next/link";
import UserListGrid from "../../../components/UserListGrid";
import type { UserPublic, UserSlim } from "../../../types/models";

export default async function FollowersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const userRes = await fetch(`${API_BASE}/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });
  if (!userRes.ok) throw new Error(`Failed to load user ${id}`);
  const user: UserPublic = await userRes.json();

  const folRes = await fetch(`${API_BASE}/api/users/${id}/followers`, {
    headers: { Accept: "application/json" },
  });
  if (!folRes.ok) throw new Error(`Failed to load followers: ${folRes.status}`);
  const folJson: UserSlim[] | { data: UserSlim[] } = await folRes.json();
  const followers: UserSlim[] = Array.isArray(folJson) ? folJson : Array.isArray(folJson.data) ? folJson.data : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Link href={`/users/${id}`} className="text-sm font-medium text-foreground-muted hover:text-accent">
        &larr; Back to profile
      </Link>
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{user.name}&rsquo;s followers</h1>
        {followers.length === 0 ? (
          <p className="mt-4 text-foreground-subtle">No one is following {user.name} yet.</p>
        ) : (
          <div className="mt-4">
            <UserListGrid users={followers} currentUserId={id} />
          </div>
        )}
      </section>
    </main>
  );
}
