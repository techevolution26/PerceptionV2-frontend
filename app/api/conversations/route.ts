// app/api/conversations/route.js
import { NextResponse } from "next/server";

const API_BASE= process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: Request) {
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${API_BASE}/api/conversations`, {
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  // for creating a new conversation? or sending a message?
  // if you meant to start DM with a user:
  const token = request.headers.get("authorization") || "";
  const body = await request.json();
  const res = await fetch(`${API_BASE}/api/conversations`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
