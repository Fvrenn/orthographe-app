"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ITEMS, RULES } from "@/lib/rules";
import { accuracy7, buildQueue, dueIds, newBudget, rstat, streak } from "@/lib/srs";
import { useApp } from "@/lib/store";
import type { Kind, Opt } from "@/lib/types";

export default function Home() {
  const { S, ready, startSession } = useApp();
  const router = useRouter();
  if (!ready) return <p className="note">Chargement…</p>;

  const go = (kind: Kind, opt?: Opt) => { if (startSession(kind, opt)) router.push("/seance/"); };
  const due = dueIds(S).length, nb = newBudget(S);
  const prev = buildQueue(S, "daily").length;
  const ids = Object.keys(S.cards).filter((id) => ITEMS[id]);
  const solid = ids.filter((id) => S.cards[id].b >= 4).length;
  const acc = accuracy7(S), st = streak(S);
  const diagDone = Object.values(S.rules).some((r) => r.diag);
  const weak = RULES.map((r) => ({ r, s: rstat(S, r) })).filter((x) => x.s.status === "weak").sort((a, b) => b.s.err - a.s.err).slice(0, 3);
  const mins = Math.max(1, Math.round((prev * 25) / 60));
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <h1>Orthographe</h1>
      <p className="sub">{date}</p>
      <div className="tiles">
        <div className="tile"><b>{due}</b><span>à réviser</span></div>
        <div className="tile"><b>{nb}</b><span>nouvelles possibles</span></div>
        <div className="tile"><b>{st}</b><span>jour{st > 1 ? "s" : ""} de suite</span></div>
      </div>
      {prev ? (
        <>
          <button className="btn primary big" onClick={() => go("daily")}>
            Commencer la séance <small>{prev} carte{prev > 1 ? "s" : ""} · ≈ {mins} min</small>
          </button>
          <button className="btn" onClick={() => go("daily", { max: 10 })}>Séance courte (10 cartes)</button>
        </>
      ) : (
        <>
          <p className="note ok-note">Rien à réviser pour le moment : c&apos;est fait pour aujourd&apos;hui. Reviens demain, ou ajoute quelques nouvelles cartes.</p>
          <button className="btn primary" onClick={() => go("daily", { max: 10, extra: 5 })}>5 nouvelles cartes en plus</button>
        </>
      )}
      <Link href="/diagnostic/" className={`btn ${diagDone ? "" : "accent"}`}>
        {diagDone ? "Refaire un diagnostic" : "Diagnostic : trouver mes points faibles"}
      </Link>
      {!diagDone && !ids.length && (
        <p className="note">Conseil : commence par le diagnostic. Il détecte les règles que tu ne maîtrises pas pour te les faire travailler en priorité.</p>
      )}
      {weak.length > 0 && (
        <>
          <h2>Points faibles</h2>
          {weak.map((x) => (
            <button key={x.r.id} className="row" onClick={() => go("focus", { rule: x.r.id })}>
              <span><b>{x.r.titre}</b><small>{Math.round(x.s.err * 100)} % d&apos;erreurs · {x.r.cat}</small></span><i>›</i>
            </button>
          ))}
        </>
      )}
      <h2>Progression</h2>
      <div className="stats">
        <div><b>{ids.length}</b> / {Object.keys(ITEMS).length}<span>cartes vues</span></div>
        <div><b>{solid}</b><span>cartes solides</span></div>
        <div><b>{acc === null ? "–" : `${acc} %`}</b><span>réussite 7 jours</span></div>
      </div>
    </>
  );
}
