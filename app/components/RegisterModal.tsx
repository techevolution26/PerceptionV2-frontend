"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { UserIcon, EnvelopeIcon, LockClosedIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import VantageMark from "./ui/VantageMark";
import Button from "./ui/Button";

interface FloatingFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<{ className?: string }>;
  error?: string;
}

const FloatingField = forwardRef<HTMLInputElement, FloatingFieldProps>(function FloatingField(
  { icon: Icon, error, ...inputProps },
  ref
) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-3.5 h-4.5 w-4.5 text-foreground-subtle" />
      <input
        ref={ref}
        {...inputProps}
        className={`peer w-full rounded-control border bg-surface-sunken px-10 pb-2 pt-4 text-sm text-foreground placeholder-transparent transition focus:outline-none focus:ring-2
          ${error ? "border-danger/50 focus:ring-danger/40" : "border-border-hairline focus:border-transparent focus:ring-accent/50"}`}
      />
      <label className="pointer-events-none absolute left-10 top-3.5 text-sm text-foreground-subtle transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-foreground-muted peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs">
        {inputProps.placeholder}
      </label>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
});

interface FieldErrors {
  email?: string;
  password_confirmation?: string;
}

interface RegisterErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  token?: string;
}

export default function RegisterModal() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setShouldRender(true);
    const t = setTimeout(() => setIsVisible(true), 10);

    document.body.style.overflow = "hidden";
    setTimeout(() => nameRef.current?.focus(), 120);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFields = (): FieldErrors => {
    const errs: FieldErrors = {};
    if (!form.email.includes("@")) errs.email = "Invalid email format";
    if (form.password !== form.password_confirmation) errs.password_confirmation = "Passwords do not match";
    return errs;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      router.push("/");
    }, 220);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const errs = validateFields();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: RegisterErrorResponse = await res.json();
      if (!res.ok) {
        const firstError = Object.values(data.errors || {})[0]?.[0];
        throw new Error(firstError || data.message || "Registration failed");
      }

      localStorage.setItem("token", data.token!);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/topics");
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !shouldRender) return null;

  return (
    <>
      {showToast && (
        <div className="fixed left-1/2 top-6 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-pill border border-border-hairline bg-surface px-5 py-3 text-sm font-medium text-foreground shadow-2xl">
          <CheckCircleIcon className="h-5 w-5 text-success" />
          Account created — welcome in
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-200 sm:items-center ${isVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={handleClose} />

        <div
          className={`relative my-4 h-full w-full overflow-auto rounded-none border-border-hairline bg-surface shadow-2xl transition-transform duration-200 sm:h-auto sm:max-w-md sm:rounded-card sm:border ${isVisible ? "scale-100" : "scale-95"}`}
          style={{ maxHeight: "calc(100dvh - 48px)" }}
        >
          <div className="relative p-6 sm:p-8">
            <button onClick={handleClose} aria-label="Close registration modal" className="absolute right-4 top-4 rounded-control p-1 text-foreground-subtle transition hover:bg-surface-hover hover:text-foreground">
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
                <VantageMark size={28} strokeWidth={1.7} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Join Perception</h2>
              <p className="mt-1 text-sm text-foreground-subtle">Every topic looks different from where you stand.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <FloatingField
                icon={UserIcon}
                ref={nameRef}
                name="name"
                type="text"
                required
                onChange={handleChange}
                placeholder="Full name"
              />

              <FloatingField
                icon={EnvelopeIcon}
                name="email"
                type="email"
                required
                onChange={handleChange}
                placeholder="Email"
                error={fieldErrors.email}
              />

              <FloatingField
                icon={LockClosedIcon}
                name="password"
                type="password"
                required
                onChange={handleChange}
                placeholder="Password"
              />

              <FloatingField
                icon={LockClosedIcon}
                name="password_confirmation"
                type="password"
                required
                onChange={handleChange}
                placeholder="Confirm password"
                error={fieldErrors.password_confirmation}
              />

              {error && <div className="text-sm text-danger">{error}</div>}

              <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-foreground-subtle">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-accent hover:text-accent-strong">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
