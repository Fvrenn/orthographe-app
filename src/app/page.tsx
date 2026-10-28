"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RULES } from "@/lib/rules";
import { accuracy7, buildQueue, DAY, dueRules, MASTERY, newBudget, rstat, streak } from "@/lib/srs";
import { useApp } from "@/lib/store";
import type { Kind, Opt } from "@/lib/types";

export default function Home() {
  const { S, ready, ses, startSession } = useApp();
  const router = useRouter();
  if (!ready) return <p className="note">Chargement…</p>;

  const go = (kind: Kind, opt?: Opt) => { if (startSession(kind, opt)) router.push("/seance/"); };
  const due = dueRules(S).length, nb = newBudget(S);
  const prev = buildQueue(S, "daily").length;
  const stats = RULES.map((r) => ({ r, s: rstat(S, r) }));
  const started = stats.filter((x) => x.s.status !== "new").length;
  const solid = stats.filter((x) => x.s.status === "ok").length;
  const acc = accuracy7(S), st = streak(S);
  const diagDone = Object.values(S.rules).some((r) => r.diag);
  const weak = stats.filter((x) => x.s.status === "weak").sort((a, b) => b.s.err - a.s.err).slice(0, 3);
  const mins = Math.max(1, Math.round((prev * 25) / 60));
  const date = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const needBackup = started > 0 && Date.now() - S.backupAt > 14 * DAY;

  return (
    <>
      <h1>Orthographe</h1>
      <p className="sub">{date}</p>
      {ses && ses.phase !== "sum" && (
        <Link href="/seance/" className="btn accent">Reprendre la séance en cours <small>{ses.count}/{ses.total}</small></Link>
      )}
      <div className="tiles">
        <div className="tile"><b>{due}</b><span>règle{due > 1 ? "s" : ""} à réviser</span></div>
        <div className="tile"><b>{nb}</b><span>nouvelle{nb > 1 ? "s" : ""} règle{nb > 1 ? "s" : ""}</span></div>
        <div className="tile"><b>{st}</b><span>jour{st > 1 ? "s" : ""} de suite</span></div>
      </div>
      {prev ? (
        <>
          <button className="btn primary big" onClick={() => go("daily")}>
            Commencer la séance <small>{prev} phrase{prev > 1 ? "s" : ""} · ≈ {mins} min</small>
          </button>
          <button className="btn" onClick={() => go("daily", { max: 10 })}>Séance courte (10 phrases)</button>
        </>
      ) : (
        <>
          <p className="note ok-note">Rien à réviser pour le moment : c&apos;est fait pour aujourd&apos;hui. Reviens demain, ou attaque une nouvelle règle.</p>
          <button className="btn primary" onClick={() => go("daily", { max: 10, extra: 1 })}>Une nouvelle règle en plus</button>
        </>
      )}
      <Link href="/redaction/" className="btn">Rédaction : trouver mes fautes dans un texte</Link>
      <Link href="/diagnostic/" className={`btn ${diagDone ? "" : "accent"}`}>
        {diagDone ? "Refaire un diagnostic" : "Diagnostic : trouver mes points faibles"}
      </Link>
      {!diagDone && !started && (
        <p className="note">Conseil : commence par le diagnostic. Il détecte les règles que tu ne maîtrises pas pour te les faire travailler en priorité.</p>
      )}
      {needBackup && (
        <p className="note ko-note">Ta progression n&apos;existe que sur cet appareil. <Link href="/reglages/">Exporte une sauvegarde</Link> de temps en temps.</p>
      )}
      {weak.length > 0 && (
        <>
          <h2>Points faibles</h2>
          {weak.map((x) => (
            <button key={x.r.id} className="row" onClick={() => go("focus", { rules: [x.r.id] })}>
              <span><b>{x.r.titre}</b><small>{x.s.n > 1 ? `${Math.round(x.s.err * 100)} % d'erreurs` : "Ratée au diagnostic"} · {x.r.cat}</small></span><i>›</i>
            </button>
          ))}
        </>
      )}
      <h2>Progression</h2>
      <div className="stats">
        <div><b>{started}</b> / {RULES.length}<span>règles commencées</span></div>
        <div><b>{solid}</b><span>règles acquises</span></div>
        <div><b>{acc === null ? "–" : `${acc} %`}</b><span>réussite 7 jours</span></div>
      </div>
      <p className="note">Une règle est acquise après au moins {MASTERY.ok} réussites étalées sur {MASTERY.span} jours. Même acquise, elle revient de temps en temps avec des phrases plus difficiles.</p>
    </>
  );
}
