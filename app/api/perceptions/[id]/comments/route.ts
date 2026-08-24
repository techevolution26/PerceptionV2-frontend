//app/api/perceptions/[id]/comments/route.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RawComment {
  replies?: RawComment[];
  [key: string]: unknown;
}

// Recursive normalization — forces `replies` to always be an array, at
// every depth, regardless of what the backend sent.
function normalize(list: RawComment[] | undefined | null): RawComment[] {
  return (list || []).map((c) => ({
    ...c,
    replies: Array.isArray(c.replies) ? normalize(c.replies) : [],
  }));
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  // Fetching raw comments (backend) returning them with nested `replies`)
  const res = await fetch(`${API_BASE}/api/perceptions/${id}/comments`, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });
  const rawText = await res.text();
  let comments: RawComment[];
  try {
    comments = JSON.parse(rawText);
  } catch {
    comments = [];
  }

  comments = normalize(comments);

  return new Response(JSON.stringify(comments), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  // Previously referenced API_BASE from GET's local scope, which doesn't
  // exist here — this threw "ReferenceError: API_BASE is not defined" on
  // every comment submission. Now declared once at module scope above.
  const res = await fetch(`${API_BASE}/api/perceptions/${id}/comments`, {
    method: "POST",
    headers: { Authorization: token },
    body: form,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
