// app/api/broadcasting/auth/route.js
//
// Proxies pusher-js's private-channel auth handshake to the backend. This
// was previously entirely commented out — a dead route — which meant every
// private-channel subscription (i.e. the notifications feed in
// NotificationsPanel.jsx) silently failed to authorize.
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const body = await request.text();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/broadcasting/auth`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
