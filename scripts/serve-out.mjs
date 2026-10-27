/* Sert le dossier out/ en local pour tester le build : npm run serve [port] */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.argv[2]) || 8080;
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml",
  ".png": "image/png", ".webmanifest": "application/manifest+json", ".json": "application/json", ".txt": "text/plain; charset=utf-8",
};

createServer(async (req, res) => {
  let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
  let f = join(root, normalize(p));
  if (!f.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(f)).isDirectory()) f = join(f, "index.html");
  } catch {
    if (!extname(f)) f = f + ".html";
  }
  try {
    const d = await readFile(f);
    res.writeHead(200, { "Content-Type": types[extname(f)] ?? "application/octet-stream", "Cache-Control": "no-cache" }).end(d);
  } catch {
    res.writeHead(404).end("404");
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
