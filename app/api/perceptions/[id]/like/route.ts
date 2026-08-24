// app/api/perceptions/[id]/like/route.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${API_BASE}/api/perceptions/${id}/like`, {
    method: "POST",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${API_BASE}/api/perceptions/${id}/like`, {
    method: "DELETE",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
