// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import AppShell from "./components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Perception.App-Your Companion to Greater Knowledge & Wisdom",
    template: "%s · Perception",
  },
  description:
    "Your Companion to Greater Knowledge & Wisdom. Power is when you stop reacting on autopilot. Power is when you decide what events mean, control your choices, and master your inner world.Perception is your daily guide to mental agency. It helps you shift from a state of constant reaction to a life of absolute clarity.Transform obstacles into raw fuel for growth. Turn your daily experiences into lasting wisdom.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
