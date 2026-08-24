import type { Metadata } from "next";
import ProfileSection from "../../components/ProfileSection";
import RecentPerceptions from "../../components/RecentPerceptions";
import type { UserProfile as UserProfileType } from "../../types/models";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${API_BASE}/api/users/${id}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};
    const user: UserProfileType = await res.json();
    return { title: user.name };
  } catch {
    return {};
  }
}

export default async function UserProfile({ params }: UserPageProps) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Failed to fetch User ${id} data`);

  const user: UserProfileType = await res.json();

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <ProfileSection user={user} />
      <section>
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-foreground">Recent perceptions</h2>
        <RecentPerceptions userId={id} />
      </section>
    </main>
  );
}
