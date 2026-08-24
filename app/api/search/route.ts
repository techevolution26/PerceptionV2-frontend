// app/api/search/route.js

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Forwarding my Laravel backend
  const res = await fetch(
    `${API_BASE}/api/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        //checking here done
      },
    }
  );

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : [];
  } catch {
    return new Response(
      JSON.stringify({ message: "Invalid backend response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
