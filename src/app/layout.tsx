import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/lib/store";
import { BottomNav, ServiceWorker, Toast } from "@/components/Shell";
import "./globals.css";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Orthographe",
  description: "Entraînement personnel à l'orthographe, hors connexion",
  manifest: `${base}/manifest.webmanifest`,
  icons: { icon: `${base}/icon.svg`, apple: `${base}/icon-192.png` },
  appleWebApp: { capable: true, title: "Orthographe" },
};
export const viewport: Viewport = { themeColor: "#1f6f4a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>
          <main className="app">{children}</main>
          <BottomNav />
          <Toast />
          <ServiceWorker />
        </AppProvider>
      </body>
    </html>
  );
}
