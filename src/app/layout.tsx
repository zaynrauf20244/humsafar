import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import {
  Bricolage_Grotesque,
  DM_Sans,
  Noto_Naskh_Arabic,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { ToastProvider } from "@/components/ui";
import { HumSafarProvider } from "@/lib/store";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const urduDisplay = Noto_Nastaliq_Urdu({
  variable: "--font-urdu-display",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const urduBody = Noto_Naskh_Arabic({
  variable: "--font-urdu-body",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HumSafar — People already going your way",
  description:
    "Offer a seat or find a seat. Cost sharing for your daily commute — not a taxi.",
  applicationName: "HumSafar",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HumSafar",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F6B4F",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${urduDisplay.variable} ${urduBody.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-16">
        <HumSafarProvider>
          <ToastProvider>
            <Suspense fallback={<div className="min-h-dvh bg-[var(--leaf-deep)]" />}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </ToastProvider>
        </HumSafarProvider>
      </body>
    </html>
  );
}
