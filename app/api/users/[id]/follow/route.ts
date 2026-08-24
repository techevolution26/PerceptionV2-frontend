// app/api/users/[id]/follow/route.js

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  const res = await fetch(`${API_BASE}/api/users/${id}/follow`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  const res = await fetch(`${API_BASE}/api/users/${id}/follow`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
