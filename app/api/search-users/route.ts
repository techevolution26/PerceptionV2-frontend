// app/api/search-users/route.js
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q) return NextResponse.json([], { status: 200 });
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(
    `${API_BASE}/api/search-users?query=${encodeURIComponent(q)}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await res.json();
  // Expecting backend returns array of { id,name,avatar_url,profession }
  return NextResponse.json(data, { status: res.status });
}
