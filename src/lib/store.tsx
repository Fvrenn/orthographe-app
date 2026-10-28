"use client";
/* État global : progression (persistée dans le navigateur) et séance en cours. */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ITEMS } from "./rules";
import { applyGrade, applyWriting, blankProg, buildQueue, dayKey, freshState, retryItem } from "./srs";
import { exportState, KEY, parseState, SES_KEY } from "./storage";
import { check } from "./text";
import type { Kind, Opt, Phase, Session, Settings, State } from "./types";

type Ctx = {
  S: State; ready: boolean; ses: Session | null; toast: string;
  startSession: (kind: Kind, opt?: Opt) => boolean;
  lessonOk: () => void; hint: () => void; submit: (val: string, idk: boolean) => void; next: () => void; quit: () => void;
  setSettings: (p: Partial<Settings>) => void;
  recordWriting: (rules: string[], words: number, errors: number) => void;
  exportJson: () => string; importJson: (txt: string) => boolean; reset: () => void;
  notify: (m: string) => void;
};
const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp hors AppProvider");
  return c;
}

function phaseFor(S: State, queue: string[], kind: Kind): Phase {
  if (!queue.length) return "sum";
  const cid = queue[0];
  return kind !== "diag" && !S.rules[ITEMS[cid].rule]?.seen && !S.items[cid] ? "lesson" : "q";
}

/** Séance enregistrée : reprise si l'application a été fermée le même jour (iOS ferme souvent les apps en arrière-plan). */
function loadSession(): Session | null {
  try {
    const s = JSON.parse(localStorage.getItem(SES_KEY) ?? "null") as Session | null;
    if (!s || s.day !== dayKey() || !s.queue.every((id) => ITEMS[id])) return null;
    return s;
  } catch { return null; }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [S, setS] = useState<State>(freshState);
  const [ready, setReady] = useState(false);
  const [ses, setSes] = useState<Session | null>(null);
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chargement après l'hydratation (le rendu statique n'a pas accès à localStorage).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const s = raw ? parseState(raw) : null;
      if (s) {
        // Copie de l'ancien format avant de l'écraser par la version migrée.
        if (raw && JSON.parse(raw).v === 1 && !localStorage.getItem(KEY + "_avant_migration")) localStorage.setItem(KEY + "_avant_migration", raw);
        setS(s);
      }
      setSes(loadSession());
    } catch { /* stockage indisponible */ }
    // Demande au navigateur de ne pas effacer les données pour libérer de la place.
    navigator.storage?.persist?.().catch(() => {});
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* stockage plein ou interdit */ }
  }, [S, ready]);
  useEffect(() => {
    if (!ready) return;
    try { if (ses) localStorage.setItem(SES_KEY, JSON.stringify(ses)); else localStorage.removeItem(SES_KEY); } catch { /* idem */ }
  }, [ses, ready]);

  const notify = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const startSession: Ctx["startSession"] = (kind, opt = {}) => {
    const queue = buildQueue(S, kind, opt);
    if (!queue.length) { notify("Rien à réviser pour le moment. Reviens plus tard, ou lance un diagnostic."); return false; }
    setSes({ kind, day: dayKey(), queue, total: queue.length, ok: 0, ko: 0, count: 0, used: {}, retry: {}, wrong: {}, hint: false, phase: phaseFor(S, queue, kind), last: null });
    return true;
  };

  const lessonOk = () => {
    if (!ses) return;
    const rid = ITEMS[ses.queue[0]].rule;
    setS((p) => { const n = structuredClone(p); (n.rules[rid] ??= blankProg()).seen = true; return n; });
    setSes({ ...ses, phase: "q" });
  };
  const hint = () => { if (ses) setSes({ ...ses, hint: true }); };

  const submit = (val: string, idk: boolean) => {
    if (!ses) return;
    const cid = ses.queue[0], it = ITEMS[cid];
    const ok = !idk && check(it, val);
    let ns = ses;
    if (!ses.used[cid]) {
      setS(applyGrade(S, cid, ok, ses.hint, ses.kind));
      ns = {
        ...ses, used: { ...ses.used, [cid]: true }, count: ses.count + 1,
        ok: ses.ok + (ok ? 1 : 0), ko: ses.ko + (ok ? 0 : 1),
        wrong: ok ? ses.wrong : { ...ses.wrong, [it.rule]: (ses.wrong[it.rule] ?? 0) + 1 },
      };
    }
    setSes({ ...ns, phase: "fb", last: { ok } });
  };

  const next = () => {
    if (!ses) return;
    const cid = ses.queue[0];
    const q = ses.queue.slice(1);
    let { retry, total } = ses;
    if (!ses.last?.ok && ses.kind !== "diag") {
      // Après une erreur, la règle revient un peu plus tard avec une autre phrase (la même s'il n'y en a plus).
      const exclude = { ...ses.used, ...Object.fromEntries(q.map((id) => [id, true as const])) };
      const alt = retryItem(S, cid, exclude);
      q.splice(Math.min(3, q.length), 0, alt);
      retry = { ...retry, [alt]: true };
      if (alt !== cid) total++;
    }
    setSes({ ...ses, queue: q, retry, total, hint: false, last: null, phase: phaseFor(S, q, ses.kind) });
  };
  const quit = () => setSes(null);

  const setSettings = (p: Partial<Settings>) => setS((prev) => ({ ...prev, settings: { ...prev.settings, ...p } }));
  const recordWriting: Ctx["recordWriting"] = (rules, words, errors) => setS((p) => applyWriting(p, rules, words, errors));
  const exportJson = () => { setS((p) => ({ ...p, backupAt: Date.now() })); return exportState(S); };
  const importJson = (txt: string) => {
    const s = parseState(txt);
    if (!s) { notify("Fichier invalide : rien n'a été modifié."); return false; }
    setS({ ...s, settings: { ...s.settings, aiKey: s.settings.aiKey || S.settings.aiKey }, backupAt: Date.now() });
    setSes(null);
    notify("Sauvegarde importée."); return true;
  };
  const reset = () => { setS((p) => ({ ...freshState(), settings: { ...freshState().settings, aiKey: p.settings.aiKey } })); setSes(null); };

  return (
    <AppCtx.Provider value={{ S, ready, ses, toast, startSession, lessonOk, hint, submit, next, quit, setSettings, recordWriting, exportJson, importJson, reset, notify }}>
      {children}
    </AppCtx.Provider>
  );
}
