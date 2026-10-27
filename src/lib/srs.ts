/* Répétition espacée (boîtes de Leitner), statistiques et construction des séances. Fonctions pures sur State. */
import { ITEMS, RMAP, RULES } from "./rules";
import type { Kind, Opt, Rule, Settings, State } from "./types";

export const DAY = 86_400_000;
/** Délai en jours selon la boîte (1 à 6). */
export const INTERVALS = [0, 1, 3, 7, 14, 30, 60];

export const dayStart = (t: number = Date.now()): number => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayKey = (t: number = Date.now()): string => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const endToday = (): number => dayStart() + DAY - 1;

export const DEFAULT_SETTINGS: Settings = { newPerDay: 8, sessionMax: 25, mode: "saisie" };
export function freshState(): State {
  return { v: 1, cards: {}, rules: {}, settings: { ...DEFAULT_SETTINGS }, log: [], days: {} };
}

export type RuleStatus = "new" | "learn" | "weak" | "ok";
export type RuleStat = { n: number; ko: number; seen: number; due: number; total: number; status: RuleStatus; err: number; dg?: "ok" | "ko" };

export function rstat(S: State, r: Rule): RuleStat {
  let n = 0, ko = 0, seen = 0, due = 0, minb = 9;
  const lim = endToday();
  for (const it of r.items) {
    const c = S.cards[it.id];
    if (c) { seen++; n += c.n; ko += c.ko; if (c.d <= lim) due++; minb = Math.min(minb, c.b); }
  }
  const dg = S.rules[r.id]?.diag;
  const err = n ? ko / n : 0;
  let status: RuleStatus = "new";
  if (seen > 0 || dg) {
    status = "learn";
    if ((n >= 3 && err >= 0.35) || (n < 3 && dg === "ko")) status = "weak";
    else if (seen === r.items.length && minb >= 4) status = "ok";
  }
  return { n, ko, seen, due, total: r.items.length, status, err, dg };
}

export function dueIds(S: State): string[] {
  const lim = endToday();
  return Object.keys(S.cards).filter((id) => ITEMS[id] && S.cards[id].d <= lim).sort((a, b) => S.cards[a].d - S.cards[b].d);
}

export function newBudget(S: State): number {
  const d = S.days[dayKey()];
  return Math.max(0, S.settings.newPerDay - (d ? d.new : 0));
}

/** Règles à introduire en priorité : faibles d'abord, puis en cours, puis jamais vues. */
export function ruleOrder(S: State): Rule[] {
  const st = RULES.map((r) => ({ r, s: rstat(S, r) }));
  const weak = st.filter((x) => x.s.status === "weak").sort((a, b) => b.s.err - a.s.err);
  const learn = st.filter((x) => x.s.status === "learn" && x.s.seen < x.s.total);
  const rest = st.filter((x) => x.s.status === "new");
  return [...weak, ...learn, ...rest].map((x) => x.r);
}

export function pickNew(S: State, n: number): string[] {
  const out: string[] = [];
  for (const r of ruleOrder(S)) {
    let taken = 0;
    for (const it of r.items) {
      if (out.length >= n) return out;
      if (!S.cards[it.id] && taken < 3) { out.push(it.id); taken++; }
    }
  }
  return out;
}

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

export function buildQueue(S: State, kind: Kind, opt: Opt = {}): string[] {
  const due = dueIds(S);
  if (kind === "focus" && opt.rule) {
    const r = RMAP[opt.rule];
    const mine = due.filter((id) => ITEMS[id].rule === r.id);
    const fresh = r.items.filter((it) => !S.cards[it.id]).map((it) => it.id);
    return shuffle([...mine, ...fresh]);
  }
  if (kind === "diag") {
    const rules = RULES.filter((r) => !opt.cat || r.cat === opt.cat);
    return shuffle(rules.map((r) => {
      const pool = r.items.filter((it) => !S.cards[it.id]);
      const from = pool.length ? pool : r.items;
      return from[Math.floor(Math.random() * from.length)].id;
    }));
  }
  const max = opt.max ?? S.settings.sessionMax;
  const d = due.slice(0, max);
  const budget = opt.extra ?? newBudget(S);
  const nb = Math.min(budget, Math.max(0, max - d.length));
  return shuffle([...d, ...pickNew(S, nb)]);
}

/** Enregistre la réponse à une carte (première tentative de la séance) et renvoie le nouvel état. */
export function applyGrade(S0: State, cid: string, ok: boolean, hint: boolean, kind: Kind, now: number = Date.now()): State {
  const S = structuredClone(S0);
  const it = ITEMS[cid];
  const isNew = !S.cards[cid];
  const c = S.cards[cid] ?? (S.cards[cid] = { b: 0, d: 0, n: 0, ok: 0, ko: 0 });
  const before = c.b;
  c.n++; c.t = now;
  if (ok) {
    c.ok++;
    if (kind === "diag" && isNew) c.b = 2;
    else if (hint) c.b = Math.max(c.b, 1);
    else c.b = Math.min(c.b + 1, 6);
  } else {
    c.ko++; c.b = 1;
  }
  if (kind === "diag") {
    const r = S.rules[it.rule] ?? (S.rules[it.rule] = {});
    if (!ok) r.diag = "ko"; else if (!r.diag) r.diag = "ok";
  }
  c.d = dayStart(now) + INTERVALS[c.b] * DAY;
  S.log.push([now, cid, ok ? 1 : 0, before]);
  if (S.log.length > 3000) S.log = S.log.slice(-3000);
  const k = dayKey(now);
  const d = S.days[k] ?? (S.days[k] = { done: 0, new: 0 });
  d.done++;
  if (isNew && kind !== "diag") d.new++;
  return S;
}

export function streak(S: State): number {
  let n = 0, t = dayStart();
  if (!S.days[dayKey(t)]?.done) t -= DAY;
  while (S.days[dayKey(t)]?.done) { n++; t -= DAY; }
  return n;
}

export function accuracy7(S: State): number | null {
  const since = Date.now() - 7 * DAY;
  const l = S.log.filter((x) => x[0] >= since);
  return l.length ? Math.round((100 * l.filter((x) => x[2]).length) / l.length) : null;
}

/** Priorité d'une règle : taux d'erreur lissé, majoré si le diagnostic était faible, plus les cartes dues. */
export function priority(s: RuleStat): number {
  return ((s.ko + 1) / (s.n + 2)) * (s.dg === "ko" ? 1.3 : 1) + s.due * 0.05;
}
