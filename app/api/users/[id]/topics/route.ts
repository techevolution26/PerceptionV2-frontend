// app/api/users/[id]/topics/route.js
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // no auth needed to view what topics a user follows,
  const token = request.headers.get("authorization") || "";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/users/${id}/topics`, {
    headers: { Accept: "application/json", Authorization: token },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
