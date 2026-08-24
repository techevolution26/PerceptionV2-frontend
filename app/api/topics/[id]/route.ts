// app/api/topics/[id]/route.js

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Forward to your my backend:
  const res = await fetch(`${API_BASE}/api/topics/${id}`, {
    headers: { Accept: "application/json", Authorization: token },
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
