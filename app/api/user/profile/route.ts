export async function POST(request: Request) {
  const form = await request.formData();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/user/profile`, {
    method: "POST",
    headers: {
      Authorization: request.headers.get("authorization") || "",
    },
    body: form,
  });

  // Reading the raw response‐body as text (so we can detect HTML vs. JSON)
  const text = await res.text();
  let data;
  try {
    // If it’s valid JSON, parse it
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // Otherwise, package the raw text into message
    data = { message: text };
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
