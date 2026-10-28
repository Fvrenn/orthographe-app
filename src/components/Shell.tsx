"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";

const NAV: [string, string][] = [["/", "Accueil"], ["/regles/", "Règles"], ["/redaction/", "Écrire"], ["/priorites/", "Priorités"], ["/reglages/", "Réglages"]];

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

/** Enregistre le service worker (mode hors connexion) en production uniquement.
 *  Quand une nouvelle version est installée, propose de recharger. La progression n'est pas touchée :
 *  elle est dans localStorage, que le service worker ne gère pas. */
export function ServiceWorker() {
  const [update, setUpdate] = useState(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const hadController = !!navigator.serviceWorker.controller;
    const onChange = () => { if (hadController) setUpdate(true); };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    let reg: ServiceWorkerRegistration | undefined;
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).then((r) => { reg = r; }).catch(() => {});
    // Une app de l'écran d'accueil iOS revient souvent de l'arrière-plan sans recharger : on vérifie à ce moment-là.
    const onVisible = () => { if (document.visibilityState === "visible") reg?.update().catch(() => {}); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  if (!update) return null;
  return (
    <div className="update" role="status">
      Nouvelle version disponible.
      <button onClick={() => location.reload()}>Mettre à jour</button>
    </div>
  );
}
