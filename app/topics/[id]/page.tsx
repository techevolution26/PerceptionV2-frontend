// app/topics/[id]/page.tsx
import type { Metadata } from "next";
import PerceptionsList from "../../components/PerceptionList";
import type { Topic } from "../../types/models";

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${API_BASE}/api/topics/${id}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};
    const topic: Topic = await res.json();
    return { title: topic.name };
  } catch {
    return {};
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const topicRes = await fetch(`${API_BASE}/api/topics/${id}`, {
    headers: { Accept: "application/json" },
  });

  if (!topicRes.ok) {
    throw new Error(`Failed to load topic ${id}, status: ${topicRes.status}`);
  }

  const topic: Topic = await topicRes.json();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{topic.name}</h1>
        {topic.description && (
          <p className="text-sm text-foreground-subtle">{topic.description}</p>
        )}
      </div>

      <PerceptionsList topic={topic} />
    </main>
  );
}
