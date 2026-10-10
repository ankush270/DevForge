import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const appSans = Plus_Jakarta_Sans({
  variable: "--font-app-sans",
  subsets: ["latin"],
  display: "swap",
});

const appMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b0f17",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DevForge — Engineering Knowledge & Spaced Repetition OS",
  description: "High-yield active recall, multi-perspective study modes, and SuperMemo SM-2 spaced repetition engine built for software engineering interviews.",
  authors: [{ name: "Ankush & DevForge Contributors", url: "https://github.com/ankush270/DevForge" }],
  keywords: [
    "spaced repetition",
    "supermemo sm-2",
    "software engineering",
    "system design interview",
    "active recall",
    "dsa flashcards",
    "developer notes",
  ],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "DevForge — Engineering Knowledge OS",
    description: "Developer-first spaced repetition and active recall system for technical interview mastery.",
    type: "website",
    url: "https://github.com/ankush270/DevForge",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${appSans.variable} ${appMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-sky-500/25 selection:text-sky-300">
        {children}
      </body>
    </html>
  );
}
