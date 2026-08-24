// app/components/LoginModal.tsx
"use client";

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon, XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import VantageMark from "./ui/VantageMark";
import Button from "./ui/Button";

export default function LoginModal() {
  // 1) Hooks declared up front — order never changes
  const [mounted, setMounted] = useState(false); // client mount guard
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // control animation/visibility
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  // 2) Client-only effects (after mount)
  useEffect(() => {
    setMounted(true);
    const visTimer = setTimeout(() => setIsVisible(true), 10);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = setTimeout(() => emailRef.current?.focus(), 120);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(visTimer);
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      setIsVisible(false);
      setTimeout(() => router.push("/"), 220);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.push("/"), 220);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-200 sm:items-center ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={handleClose} aria-hidden="true" />

      <div
        className={`relative h-full w-full overflow-auto rounded-none border-border-hairline bg-surface shadow-2xl transition-transform duration-200 sm:h-auto sm:w-auto sm:max-w-md sm:rounded-card sm:border ${isVisible ? "scale-100" : "scale-95"}`}
        style={{ maxHeight: "calc(100dvh - 48px)" }}
      >
        <div className="relative p-6 sm:p-8">
          <button
            onClick={handleClose}
            aria-label="Close login modal"
            className="absolute right-4 top-4 rounded-control p-1 text-foreground-subtle transition hover:bg-surface-hover hover:text-foreground"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
              <VantageMark size={28} strokeWidth={1.7} />
            </div>
            <h2 id="login-modal-title" className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
            <p className="mt-1 text-sm text-foreground-subtle">Sign in to continue seeing every side of it.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-foreground-muted">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-subtle">
                  <EnvelopeIcon className="h-4.5 w-4.5" />
                </div>
                <input
                  ref={emailRef}
                  id="login-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                  required
                  className="block w-full rounded-control border border-border-hairline bg-surface-sunken py-3 pl-10 pr-3 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  aria-label="Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-foreground-muted">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-foreground-subtle">
                  <LockClosedIcon className="h-4.5 w-4.5" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="block w-full rounded-control border border-border-hairline bg-surface-sunken py-3 pl-10 pr-3 text-sm text-foreground transition placeholder:text-foreground-subtle focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/50"
                  aria-label="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-foreground-muted">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-border-strong text-accent focus:ring-accent/50" />
                Remember me
              </label>
              <a href="#" className="text-foreground-muted hover:text-accent">Forgot password?</a>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-control bg-danger/10 p-2.5 text-sm text-danger">
                <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-foreground-subtle">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-medium text-accent hover:text-accent-strong">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
