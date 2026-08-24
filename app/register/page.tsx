// app/register/page.tsx
// The actual UI lives in components/RegisterModal.tsx, rendered by AppShell
// whenever the pathname is "/register". This route exists so the URL is
// linkable and shareable; it renders nothing of its own.
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return null;
}
