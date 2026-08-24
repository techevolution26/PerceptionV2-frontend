// app/api/perceptions/route.js

export async function GET(request: Request) {
  const token = request.headers.get("authorization") || "";

  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const endpoint = `${API_BASE}/api/perceptions${qs ? `?${qs}` : ""}`;

  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Perceptions proxy error:", res.status, text);
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/perceptions`, {
    method: "POST",
    headers: { Authorization: token },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Perception POST proxy error:", res.status, text);
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
