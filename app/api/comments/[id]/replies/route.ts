//app/api/comments/[id]/replies/route.js

// GET replies
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const res = await fetch(`${API}/api/comments/${id}/replies`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

// POST a new reply
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();
  const { id } = await params;
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const res = await fetch(`${API}/api/comments/${id}/replies`, {
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
