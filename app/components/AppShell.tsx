// app/components/AppShell.tsx
"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useKeepAwake from "../hooks/useKeepAwake";
import useTopics from "../hooks/useTopics";
import { EchoProvider } from "../contexts/EchoContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TopicsCarousel from "./TopicsCarousel";
import NewPerceptionForm from "./NewPerceptionForm";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import NotificationsPanel from "./NotificationsPanel";
import MobileNav from "./MobileNav";
import Button from "./ui/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function AppShell({ children }: { children: ReactNode }) {
  useKeepAwake({ url: "/api/ping", visibleInterval: 5 * 60_000 });

  const [queryClient] = useState(() => new QueryClient());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  }, [pathname]);

  // Note: the hook takes no arguments (it always reads its own token from
  // localStorage internally) — kept that way here rather than passing one
  // that's silently ignored.
  const { topics, loading } = useTopics();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY;
      if (!ticking && Math.abs(diff) > 10) {
        window.requestAnimationFrame(() => {
          setShowTopics(diff < 0 || currentY < 40);
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <QueryClientProvider client={queryClient}>
      <EchoProvider>
      <div className="flex min-h-screen w-full flex-col">
        <aside className="fixed left-0 top-0 z-40 hidden h-full w-20 flex-col items-center border-r border-border-hairline bg-background py-5 md:flex">
          <Sidebar
            onNewClick={() => setShowForm(true)}
            onBellClick={() => setShowNotifications((v) => !v)}
          />
        </aside>

        <div className="flex min-h-screen w-full flex-col pb-16 pl-0 md:pb-0 md:pl-20">
          <header className="sticky top-0 z-30 border-b border-border-hairline bg-background/85 backdrop-blur">
            <Header onBellClick={() => setShowNotifications((v) => !v)} />
          </header>
          <TopicsCarousel topics={topics} visible={showTopics && !loading} />
          <main className="flex-grow">{children}</main>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-overlay md:items-center"
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-card border border-border-hairline bg-surface p-5 shadow-2xl md:rounded-card"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold tracking-tight">New Perception</h2>
                  <Button variant="ghost" size="sm" className="!px-2" onClick={() => setShowForm(false)} aria-label="Close">
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
                <NewPerceptionForm
                  topics={topics}
                  onSuccess={() => setShowForm(false)}
                  token={token}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {pathname === "/login" && <LoginModal />}
        {pathname === "/register" && <RegisterModal />}

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm rounded-card border border-border-hairline bg-surface p-3 shadow-2xl sm:right-6"
            >
              <NotificationsPanel />
            </motion.div>
          )}
        </AnimatePresence>

        <MobileNav
          onNewClick={() => setShowForm(true)}
          onBellClick={() => setShowNotifications((v) => !v)}
        />
      </div>
      </EchoProvider>
    </QueryClientProvider>
  );
}
