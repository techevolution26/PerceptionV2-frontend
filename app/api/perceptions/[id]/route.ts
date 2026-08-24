// app/api/perceptions/[id]/route.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${API_BASE}/api/perceptions/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  // forwarding the raw FormData (NOT setting Content-Type!)
  const res = await fetch(`${API_BASE}/api/perceptions/${id}`, {
    method: "PUT",
    headers: { Authorization: token },
    body: form,
  });

  // parsing whatever Laravel backend returns
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${API_BASE}/api/perceptions/${id}`, {
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
