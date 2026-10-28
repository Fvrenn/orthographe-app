/* Répétition espacée par règle, statistiques et construction des séances. Fonctions pures sur State.
   - Une règle (pas une phrase) a une boîte et une date de révision. À chaque passage, on tire des phrases
     de cette règle qu'on n'a pas vues depuis longtemps, de plus en plus difficiles quand la boîte monte.
   - La boîte ne bouge qu'une fois par jour, et seulement si la règle est due : réviser en avance ne fait
     pas monter plus vite (l'espacement est ce qui fixe la règle). Une erreur la renvoie à demain.
   - Une règle est « acquise » après de nombreuses réussites étalées dans le temps (voir MASTERY). */
import { ITEMS, RMAP, RULES } from "./rules";
import type { Item, Kind, Level, Opt, Rule, RuleProg, Settings, State } from "./types";

export const DAY = 86_400_000;
/** Délai en jours selon la boîte (1 à 8). Même acquise, une règle revient au moins tous les deux mois. */
export const INTERVALS = [0, 1, 2, 4, 7, 14, 30, 45, 60];
export const MAX_BOX = INTERVALS.length - 1;
/** Critères d'acquisition : réussites (sans indice), étalées sur au moins `span` jours et `days` jours distincts,
 *  avec une réussite récente d'au moins `recent`. */
export const MASTERY = { ok: 20, span: 14, days: 5, recent: 0.8 };
const RECENT = 10;

export const dayStart = (t: number = Date.now()): number => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayKey = (t: number = Date.now()): string => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export const endToday = (t: number = Date.now()): number => dayStart(t) + DAY - 1;

export const DEFAULT_SETTINGS: Settings = { newRules: 2, sessionMax: 25, mode: "saisie", aiKey: "", aiModel: "gemini-2.5-flash" };
export function freshState(): State {
  return { v: 2, rules: {}, items: {}, settings: { ...DEFAULT_SETTINGS }, log: [], days: {}, writings: [], backupAt: 0 };
}
export function blankProg(): RuleProg {
  return { b: 0, d: 0, moved: 0, n: 0, ok: 0, ko: 0, days: 0, first: 0, lastOk: 0, recent: "" };
}

const recentAcc = (p: RuleProg): number | null =>
  p.recent.length ? [...p.recent].filter((c) => c === "1").length / p.recent.length : null;

export type Mastery = { ok: number; span: number; days: number; done: boolean };
export function mastery(p: RuleProg | undefined): Mastery {
  if (!p) return { ok: 0, span: 0, days: 0, done: false };
  const span = p.first ? Math.round((p.lastOk - p.first) / DAY) : 0;
  const acc = recentAcc(p) ?? 0;
  const done = p.ok >= MASTERY.ok && span >= MASTERY.span && p.days >= MASTERY.days && acc >= MASTERY.recent;
  return { ok: p.ok, span, days: p.days, done };
}

export type RuleStatus = "new" | "learn" | "weak" | "ok";
export type RuleStat = { n: number; ko: number; due: number; status: RuleStatus; err: number; dg?: "ok" | "ko"; m: Mastery };

export function rstat(S: State, r: Rule, now: number = Date.now()): RuleStat {
  const p = S.rules[r.id];
  const m = mastery(p);
  if (!p || (!p.n && !p.diag)) return { n: 0, ko: 0, due: 0, status: "new", err: 0, m };
  const acc = recentAcc(p);
  let status: RuleStatus = "learn";
  if ((p.recent.length >= 3 && acc !== null && acc < 0.65) || (p.n < 3 && p.diag === "ko")) status = "weak";
  else if (m.done && p.b >= 3) status = "ok";
  const due = p.b > 0 && p.d <= endToday(now) ? 1 : 0;
  return { n: p.n, ko: p.ko, due, status, err: p.n ? p.ko / p.n : 0, dg: p.diag, m };
}

/** Règles à réviser aujourd'hui, les plus en retard d'abord. */
export function dueRules(S: State, now: number = Date.now()): Rule[] {
  const lim = endToday(now);
  return RULES.filter((r) => { const p = S.rules[r.id]; return p && p.b > 0 && p.d <= lim; })
    .sort((a, b) => S.rules[a.id].d - S.rules[b.id].d);
}

/** Règles jamais travaillées : celles ratées au diagnostic d'abord, puis dans l'ordre du programme. */
export function newRules(S: State): Rule[] {
  const fresh = RULES.filter((r) => !S.rules[r.id]?.n);
  return [...fresh.filter((r) => S.rules[r.id]?.diag === "ko"), ...fresh.filter((r) => S.rules[r.id]?.diag !== "ko")];
}

export function newBudget(S: State): number {
  const d = S.days[dayKey()];
  return Math.max(0, S.settings.newRules - (d ? d.new : 0));
}

/** Niveau de difficulté maximal proposé selon la boîte de la règle. */
export const maxLevel = (b: number): Level => (b >= 5 ? 3 : b >= 3 ? 2 : 1);

/** Choisit k phrases d'une règle : jamais vues ou vues il y a le plus longtemps, en préférant
 *  les plus difficiles autorisées. `exclude` évite de reposer une phrase déjà vue dans la séance. */
export function pickItems(S: State, r: Rule, k: number, exclude: Set<string> = new Set()): string[] {
  const top = maxLevel(S.rules[r.id]?.b ?? 0);
  const free = r.items.filter((it) => !exclude.has(it.id));
  let pool = free.filter((it) => it.lvl <= top);
  if (pool.length < k) pool = free;
  const score = (it: Item) => (S.items[it.id]?.t ?? 0) - it.lvl * 3 * DAY + Math.random() * DAY;
  return pool.map((it) => ({ id: it.id, s: score(it) })).sort((a, b) => a.s - b.s).slice(0, k).map((x) => x.id);
}

/** Nombre de phrases par révision : plus au début, puis deux pour vérifier la règle dans des contextes différents. */
const perReview = (S: State, r: Rule): number => {
  const b = S.rules[r.id]?.b ?? 0;
  return rstat(S, r).status === "weak" || b <= 2 ? 3 : 2;
};

export function shuffle<T>(a: T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}

export function buildQueue(S: State, kind: Kind, opt: Opt = {}): string[] {
  const used = new Set<string>();
  const take = (r: Rule, k: number) => { const ids = pickItems(S, r, k, used); ids.forEach((id) => used.add(id)); return ids; };
  if (kind === "focus" && opt.rules?.length) {
    const rs = opt.rules.map((id) => RMAP[id]).filter(Boolean);
    return shuffle(rs.flatMap((r) => take(r, rs.length === 1 ? 6 : 3)));
  }
  if (kind === "diag") {
    return shuffle(RULES.filter((r) => !opt.cat || r.cat === opt.cat).map((r) => {
      const easy = r.items.filter((it) => it.lvl === 1);
      const pool = easy.filter((it) => !S.items[it.id]);
      const from = pool.length ? pool : easy.length ? easy : r.items;
      return from[Math.floor(Math.random() * from.length)].id;
    }));
  }
  const max = opt.max ?? S.settings.sessionMax;
  const out: string[] = [];
  for (const r of dueRules(S)) {
    if (out.length >= max) break;
    out.push(...take(r, Math.min(perReview(S, r), max - out.length)));
  }
  let budget = opt.extra ?? newBudget(S);
  for (const r of newRules(S)) {
    if (budget <= 0 || out.length >= max) break;
    out.push(...take(r, Math.min(3, max - out.length)));
    budget--;
  }
  return shuffle(out);
}

/** Phrase de remplacement après une erreur : une autre phrase de la même règle, pas encore vue dans la séance. */
export function retryItem(S: State, cid: string, used: Record<string, true>): string {
  const r = RMAP[ITEMS[cid].rule];
  return pickItems(S, r, 1, new Set(Object.keys(used)))[0] ?? cid;
}

/** Enregistre une réponse et renvoie le nouvel état. */
export function applyGrade(S0: State, cid: string, ok: boolean, hint: boolean, kind: Kind, now: number = Date.now()): State {
  const S = structuredClone(S0);
  const it = ITEMS[cid];
  const today = dayStart(now);
  const ip = S.items[cid] ?? (S.items[cid] = { n: 0, ok: 0, t: 0 });
  ip.n++; ip.t = now; if (ok) ip.ok++;

  const isNew = !S.rules[it.rule]?.n;
  const p: RuleProg = (S.rules[it.rule] = { ...blankProg(), ...S.rules[it.rule] });
  p.n++;
  p.recent = (p.recent + (ok ? "1" : "0")).slice(-RECENT);
  if (!ok) p.ko++;
  else if (!hint) {
    p.ok++;
    if (!p.first) p.first = today;
    if (p.lastOk !== today) p.days++;
    p.lastOk = today;
  }

  const due = p.b === 0 || p.d <= today + DAY - 1;
  if (!ok) { p.b = 1; p.d = today + DAY; p.moved = today; }
  else if (p.moved !== today && due) {
    p.b = kind === "diag" && p.b === 0 ? 2 : hint ? Math.max(p.b, 1) : Math.min(p.b + 1, MAX_BOX);
    p.d = today + INTERVALS[p.b] * DAY;
    p.moved = today;
  }
  if (kind === "diag") { if (!ok) p.diag = "ko"; else if (!p.diag) p.diag = "ok"; }

  S.log.push([now, cid, ok ? 1 : 0]);
  if (S.log.length > 3000) S.log = S.log.slice(-3000);
  const k = dayKey(now);
  const d = S.days[k] ?? (S.days[k] = { done: 0, new: 0 });
  d.done++;
  if (isNew && kind !== "diag") d.new++;
  return S;
}

/** Erreurs trouvées dans une rédaction : chaque règle concernée compte comme un échec et revient aujourd'hui. */
export function applyWriting(S0: State, ruleIds: string[], words: number, errors: number, now: number = Date.now()): State {
  const S = structuredClone(S0);
  const today = dayStart(now);
  const ids = [...new Set(ruleIds)].filter((id) => RMAP[id]);
  for (const id of ids) {
    const p: RuleProg = (S.rules[id] = { ...blankProg(), ...S.rules[id] });
    p.n++; p.ko++;
    p.recent = (p.recent + "0").slice(-RECENT);
    p.b = 1; p.d = today; p.moved = today;
  }
  S.writings.push({ t: now, words, errors, rules: ids });
  if (S.writings.length > 100) S.writings = S.writings.slice(-100);
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

/** Priorité d'une règle : taux d'erreur lissé, majoré si le diagnostic était faible, plus un bonus si elle est due. */
export function priority(s: RuleStat): number {
  return ((s.ko + 1) / (s.n + 2)) * (s.dg === "ko" ? 1.3 : 1) + s.due * 0.05;
}
