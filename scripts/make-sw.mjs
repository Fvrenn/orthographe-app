/* Après `next build` : génère out/sw.js avec la liste exacte des fichiers à mettre en cache.
   Hors connexion, tout le site (pages, scripts, styles, icônes) est donc disponible. */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const BASE = process.env.BASE_PATH || "";

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(OUT).filter((f) => !f.endsWith("sw.js") && !f.endsWith(".map"));
const urls = new Set();
const hash = createHash("sha1");
for (const f of files.sort()) {
  const rel = relative(OUT, f).split(sep).join("/");
  hash.update(rel).update(readFileSync(f));
  if (rel === "404.html" || rel === "_not-found.html") continue;
  urls.add(`${BASE}/${rel}`);
  // un dossier (/regles/) est servi par son index.html : on met les deux adresses en cache
  if (rel.endsWith("index.html")) urls.add(`${BASE}/${rel.slice(0, -"index.html".length)}`);
}
const version = "ortho-" + hash.digest("hex").slice(0, 10);

const sw = `/* Généré par scripts/make-sw.mjs : ne pas modifier à la main. */
const VERSION = ${JSON.stringify(version)};
const FILES = ${JSON.stringify([...urls].sort(), null, 1)};

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// On sert d'abord la copie en cache ; si on est connecté, on la rafraîchit pour la prochaine ouverture.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then((cache) =>
      cache.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request).then((res) => {
          if (res && res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit || cache.match(${JSON.stringify(BASE + "/")}));
        return hit || net;
      })
    )
  );
});
`;
writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js : ${urls.size} adresses en cache, version ${version}`);
