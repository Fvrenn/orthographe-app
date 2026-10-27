"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ITEMS, RMAP } from "@/lib/rules";
import { shuffle } from "@/lib/srs";
import { firstAnswer } from "@/lib/text";
import { useApp } from "@/lib/store";
import { RuleCard, Sentence } from "./parts";

const KEYS = ["é", "è", "ê", "à", "â", "ç", "ô", "î", "û", "ï", "œ", "'", "-"];

function TopBar() {
  const { ses, quit } = useApp();
  const router = useRouter();
  if (!ses) return null;
  const pct = Math.round((100 * ses.count) / ses.total);
  return (
    <div className="topbar">
      <button className="x" aria-label="Quitter la séance" onClick={() => { quit(); router.push("/"); }}>✕</button>
      <div className="pbar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} /></div>
      <span className="cnt">{ses.count}/{ses.total}</span>
    </div>
  );
}

export function LessonView() {
  const { ses, lessonOk } = useApp();
  if (!ses) return null;
  const r = RMAP[ITEMS[ses.queue[0]].rule];
  return (
    <>
      <TopBar />
      <p className="tag">Nouvelle règle · {r.cat}</p>
      <h1>{r.titre}</h1>
      <RuleCard r={r} />
      <button className="btn primary big" onClick={lessonOk}>J&apos;ai compris, je m&apos;entraîne</button>
    </>
  );
}

export function QuestionView() {
  const { ses, S, submit, hint } = useApp();
  const [val, setVal] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const cid = ses?.queue[0];
  useEffect(() => { setVal(""); input.current?.focus(); }, [cid]);
  if (!ses || !cid) return null;
  const it = ITEMS[cid], r = RMAP[it.rule];
  // Dans le diagnostic, les choix possibles sont toujours affichés : une phrase à trou sans choix est indevinable.
  const useBtn = (S.settings.mode === "boutons" || ses.kind === "diag") && r.opts !== null;

  const onSubmit = (e: FormEvent) => { e.preventDefault(); submit(val, false); };
  const insert = (ch: string) => {
    const el = input.current; if (!el) return;
    const s = el.selectionStart ?? val.length, e = el.selectionEnd ?? val.length;
    setVal(val.slice(0, s) + ch + val.slice(e));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + ch.length, s + ch.length); });
  };
  return (
    <>
      <TopBar />
      <p className="tag">{ses.kind === "diag" ? "Diagnostic" : r.cat}{ses.retry[cid] ? " · à revoir" : ""}</p>
      <p className="target">Règle testée : <b>{r.titre}</b></p>
      <p className="sent"><Sentence p={it.p} answer={firstAnswer(it)} filled={false} /></p>
      {ses.hint && <div className="test"><b>Astuce</b> {r.test}</div>}
      {useBtn ? (
        <div className="opts">
          {shuffleOnce(r.opts!, cid).map((o) => <button key={o} className="btn opt" onClick={() => submit(o, false)}>{o}</button>)}
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <input ref={input} className="ans" type="text" value={val} onChange={(e) => setVal(e.target.value)}
            autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="done"
            aria-label="Ta réponse" placeholder="Écris la réponse" />
          <div className="keys">
            {KEYS.map((k) => <button type="button" key={k} className="key" onClick={() => insert(k)}>{k}</button>)}
          </div>
          <button type="submit" className="btn primary">Valider</button>
        </form>
      )}
      <div className="row2">
        {ses.kind !== "diag" && !ses.hint && <button className="btn ghost" onClick={hint}>Indice</button>}
        <button className="btn ghost" onClick={() => submit("", true)}>Je ne sais pas</button>
      </div>
    </>
  );
}

/** Ordre des boutons mélangé une seule fois par carte (stable entre deux rendus). */
const orderCache = new Map<string, string[]>();
function shuffleOnce(opts: string[], cid: string): string[] {
  let o = orderCache.get(cid);
  if (!o) { o = shuffle(opts); orderCache.set(cid, o); }
  return o;
}

export function FeedbackView() {
  const { ses, next } = useApp();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus(); }, []);
  if (!ses || !ses.last) return null;
  const it = ITEMS[ses.queue[0]], r = RMAP[it.rule], ok = ses.last.ok;
  return (
    <>
      <TopBar />
      <div className={`fb ${ok ? "ok" : "ko"}`}>
        <b>{ok ? "Correct" : "À retenir"}</b>
        <p className="sent"><Sentence p={it.p} answer={firstAnswer(it)} filled /></p>
        <p className="rule"><b>{r.titre}</b><br />{r.regle}</p>
        {!ok && (<>
          <div className="test"><b>Astuce</b> {r.test}</div>
          <p className="note">Cette carte reviendra tout à l&apos;heure, puis demain.</p>
        </>)}
      </div>
      <button ref={btn} className="btn primary big" onClick={next}>Suivant</button>
    </>
  );
}

export function SummaryView() {
  const { ses, S, quit, startSession } = useApp();
  const router = useRouter();
  if (!ses) return null;
  const wrong = Object.keys(ses.wrong).map((id) => RMAP[id]).filter(Boolean);
  const limit = new Date(); limit.setHours(0, 0, 0, 0);
  const tomorrow = Object.keys(S.cards).filter((id) => ITEMS[id] && S.cards[id].d <= limit.getTime() + 2 * 86_400_000 - 1).length;
  return (
    <>
      <h1>Séance terminée</h1>
      <div className="tiles">
        <div className="tile"><b>{ses.ok}</b><span>réussies du 1er coup</span></div>
        <div className="tile"><b>{ses.ko}</b><span>à revoir</span></div>
        <div className="tile"><b>{tomorrow}</b><span>cartes d&apos;ici demain</span></div>
      </div>
      {wrong.length ? (<>
        <h2>À retravailler</h2>
        {wrong.map((r) => (
          <button key={r.id} className="row" onClick={() => { quit(); if (startSession("focus", { rule: r.id })) router.push("/seance/"); else router.push("/"); }}>
            <span><b>{r.titre}</b><small>{r.cat}</small></span><i>›</i>
          </button>
        ))}
      </>) : <p className="note">Aucune erreur. Bien joué.</p>}
      {ses.kind === "diag" && <p className="note">Le diagnostic est enregistré : tes règles faibles passent en tête de tes séances.</p>}
      <button className="btn primary big" onClick={() => { quit(); router.push("/"); }}>Retour à l&apos;accueil</button>
    </>
  );
}
