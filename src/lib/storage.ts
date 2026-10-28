/* Lecture de l'état sauvegardé (localStorage ou fichier importé), avec migration des anciens formats. */
import { ITEMS, RULES } from "./rules";
import { DEFAULT_SETTINGS, blankProg, dayStart, freshState } from "./srs";
import type { RuleProg, State } from "./types";

export const KEY = "ortho_v1"; // nom historique conservé : c'est là que se trouve la progression existante
export const SES_KEY = "ortho_session";

type V1 = {
  v: 1;
  cards: Record<string, { b: number; d: number; n: number; ok: number; ko: number; t?: number }>;
  rules: Record<string, { seen?: boolean; diag?: "ok" | "ko" }>;
  settings?: { newPerDay?: number; sessionMax?: number; mode?: "saisie" | "boutons" };
  log: [number, string, 0 | 1, number?][];
  days: State["days"];
};

/** Boîtes de la v1 (1, 3, 7, 14, 30, 60 jours) → boîtes de la v2 de délai équivalent. */
const BOX_V1_TO_V2 = [0, 1, 3, 4, 5, 6, 8];

/** Version 1 (répétition par phrase) → version 2 (répétition par règle). */
export function migrateV1(o: V1): State {
  const S = freshState();
  S.settings = {
    ...DEFAULT_SETTINGS,
    sessionMax: o.settings?.sessionMax ?? DEFAULT_SETTINGS.sessionMax,
    mode: o.settings?.mode ?? DEFAULT_SETTINGS.mode,
    newRules: Math.max(1, Math.round((o.settings?.newPerDay ?? 8) / 4)),
  };
  S.log = (o.log ?? []).map(([t, cid, ok]) => [t, cid, ok]);
  S.days = o.days ?? {};
  for (const [id, c] of Object.entries(o.cards ?? {})) {
    if (ITEMS[id]) S.items[id] = { n: c.n, ok: c.ok, t: c.t ?? 0 };
  }
  for (const r of RULES) {
    const cards = r.items.map((it) => o.cards?.[it.id]).filter((c) => c !== undefined);
    const old = o.rules?.[r.id];
    if (!cards.length && !old) continue;
    const p: RuleProg = { ...blankProg(), ...(old?.seen ? { seen: true } : {}), ...(old?.diag ? { diag: old.diag } : {}) };
    if (cards.length) {
      p.b = Math.min(...cards.map((c) => BOX_V1_TO_V2[c.b] ?? 1));
      p.d = Math.min(...cards.map((c) => c.d));
      p.n = cards.reduce((a, c) => a + c.n, 0);
      p.ok = cards.reduce((a, c) => a + c.ok, 0);
      p.ko = cards.reduce((a, c) => a + c.ko, 0);
    }
    const mine = S.log.filter((x) => ITEMS[x[1]]?.rule === r.id);
    const okDays = [...new Set(mine.filter((x) => x[2]).map((x) => dayStart(x[0])))].sort((a, b) => a - b);
    p.days = okDays.length;
    p.first = okDays[0] ?? 0;
    p.lastOk = okDays[okDays.length - 1] ?? 0;
    p.recent = mine.slice(-10).map((x) => String(x[2])).join("");
    S.rules[r.id] = p;
  }
  return S;
}

export function parseState(txt: string): State | null {
  try {
    const s = JSON.parse(txt);
    if (!s || typeof s !== "object") return null;
    if (s.v === 1 && typeof s.cards === "object") return migrateV1(s as V1);
    if (s.v !== 2 || typeof s.rules !== "object") return null;
    const base = freshState();
    return { ...base, ...s, settings: { ...base.settings, ...s.settings } };
  } catch { return null; }
}

/** Sauvegarde exportée : sans la clé d'API, qui reste sur l'appareil. */
export function exportState(S: State): string {
  return JSON.stringify({ ...S, settings: { ...S.settings, aiKey: "" } });
}
