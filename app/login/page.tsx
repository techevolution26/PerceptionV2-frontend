// app/login/page.tsx
// The actual UI lives in components/LoginModal.tsx, rendered by AppShell
// whenever the pathname is "/login". This route exists so the URL is
// linkable and shareable; it renders nothing of its own.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return null;
}
