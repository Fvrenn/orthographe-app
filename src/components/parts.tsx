import type { ReactNode } from "react";
import type { Rule } from "@/lib/types";
import type { RuleStatus } from "@/lib/srs";

const LABEL: Record<RuleStatus, [string, string]> = {
  new: ["Nouvelle", "c-new"], learn: ["En cours", "c-learn"], weak: ["À travailler", "c-weak"], ok: ["Acquise", "c-ok"],
};
export function StatusChip({ status }: { status: RuleStatus }) {
  const [t, c] = LABEL[status];
  return <span className={`chip ${c}`}>{t}</span>;
}

/** Phrase à trou. `filled` affiche la bonne réponse à la place du trou. */
export function Sentence({ p, answer, filled }: { p: string; answer: string; filled: boolean }) {
  const [before, after = ""] = p.split("___");
  const attached = /[A-Za-zÀ-ÿ]$/.test(before) || /^[A-Za-zÀ-ÿ]/.test(after);
  const apos = answer.endsWith("'");
  const hw = (t: string): ReactNode[] =>
    t.split(/(\([^)]+\))/).map((s, i) => (/^\(.+\)$/.test(s) ? <em key={i} className="hw">{s}</em> : s));
  return (
    <>
      {hw(before)}
      {filled ? <b className="fill">{answer}</b> : <span className={"blank" + (attached ? " sm" : "")} />}
      {hw(apos ? after.replace(/^ /, "") : after)}
    </>
  );
}

/** Explication d'une règle : énoncé, astuce et exemples. */
export function RuleCard({ r }: { r: Rule }) {
  return (
    <>
      <p className="regle">{r.regle}</p>
      <div className="test"><b>Astuce</b> {r.test}</div>
      <ul className="ex">{r.ex.map((e) => <li key={e}>{e}</li>)}</ul>
    </>
  );
}
