"use client";
/* État global : progression (persistée dans le navigateur) et séance en cours. */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ITEMS } from "./rules";
import { applyGrade, buildQueue, DEFAULT_SETTINGS, freshState } from "./srs";
import { check } from "./text";
import type { Kind, Opt, Phase, Session, Settings, State } from "./types";

const KEY = "ortho_v1";

type Ctx = {
  S: State; ready: boolean; ses: Session | null; toast: string;
  startSession: (kind: Kind, opt?: Opt) => boolean;
  lessonOk: () => void; hint: () => void; submit: (val: string, idk: boolean) => void; next: () => void; quit: () => void;
  setSettings: (p: Partial<Settings>) => void;
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
  return kind !== "diag" && !S.rules[ITEMS[cid].rule]?.seen && !S.cards[cid] ? "lesson" : "q";
}

function parseState(txt: string): State | null {
  try {
    const s = JSON.parse(txt);
    if (!s || s.v !== 1 || typeof s.cards !== "object") return null;
    return { ...freshState(), ...s, settings: { ...DEFAULT_SETTINGS, ...s.settings } };
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
    try { const s = parseState(localStorage.getItem(KEY) ?? ""); if (s) setS(s); } catch { /* stockage indisponible */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* stockage plein ou interdit */ }
  }, [S, ready]);

  const notify = useCallback((m: string) => {
    setToast(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 3500);
  }, []);

  const startSession: Ctx["startSession"] = (kind, opt = {}) => {
    const queue = buildQueue(S, kind, opt);
    if (!queue.length) { notify("Rien à réviser pour le moment. Reviens plus tard, ou lance un diagnostic."); return false; }
    setSes({ kind, queue, total: queue.length, ok: 0, ko: 0, count: 0, graded: {}, retry: {}, wrong: {}, hint: false, phase: phaseFor(S, queue, kind), last: null });
    return true;
  };

  const lessonOk = () => {
    if (!ses) return;
    const rid = ITEMS[ses.queue[0]].rule;
    setS((p) => { const n = structuredClone(p); (n.rules[rid] ??= {}).seen = true; return n; });
    setSes({ ...ses, phase: "q" });
  };
  const hint = () => { if (ses) setSes({ ...ses, hint: true }); };

  const submit = (val: string, idk: boolean) => {
    if (!ses) return;
    const cid = ses.queue[0], it = ITEMS[cid];
    const ok = !idk && check(it, val);
    let ns = ses;
    if (!ses.graded[cid]) {
      setS(applyGrade(S, cid, ok, ses.hint, ses.kind));
      ns = {
        ...ses, graded: { ...ses.graded, [cid]: true }, count: ses.count + 1,
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
    const retry = { ...ses.retry };
    if (!ses.last?.ok) { q.splice(Math.min(3, q.length), 0, cid); retry[cid] = true; }
    setSes({ ...ses, queue: q, retry, hint: false, last: null, phase: phaseFor(S, q, ses.kind) });
  };
  const quit = () => setSes(null);

  const setSettings = (p: Partial<Settings>) => setS((prev) => ({ ...prev, settings: { ...prev.settings, ...p } }));
  const exportJson = () => JSON.stringify(S);
  const importJson = (txt: string) => {
    const s = parseState(txt);
    if (!s) { notify("Fichier invalide : rien n'a été modifié."); return false; }
    setS(s); notify("Sauvegarde importée."); return true;
  };
  const reset = () => { setS(freshState()); setSes(null); };

  return (
    <AppCtx.Provider value={{ S, ready, ses, toast, startSession, lessonOk, hint, submit, next, quit, setSettings, exportJson, importJson, reset, notify }}>
      {children}
    </AppCtx.Provider>
  );
}
