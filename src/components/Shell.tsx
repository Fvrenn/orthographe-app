"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

const NAV: [string, string][] = [["/", "Accueil"], ["/regles/", "Règles"], ["/priorites/", "Priorités"], ["/reglages/", "Réglages"]];

export function BottomNav() {
  const path = usePathname() ?? "/";
  if (path.startsWith("/seance")) return null;
  const on = (href: string) => (href === "/" ? path === "/" || path.startsWith("/diagnostic") : path.startsWith(href));
  return (
    <nav className="nav" aria-label="Navigation principale">
      {NAV.map(([href, label]) => (
        <Link key={href} href={href} className={on(href) ? "on" : ""} aria-current={on(href) ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}

export function Toast() {
  const { toast } = useApp();
  return toast ? <div className="toast" role="status">{toast}</div> : null;
}

/** Enregistre le service worker (mode hors connexion) en production uniquement. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
  }, []);
  return null;
}
