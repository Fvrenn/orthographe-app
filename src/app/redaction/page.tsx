"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyse, SUBJECTS, type Finding } from "@/lib/ai";
import { RMAP } from "@/lib/rules";
import { useApp } from "@/lib/store";

const DRAFT = "ortho_brouillon";
const countWords = (t: string) => t.split(/\s+/).filter(Boolean).length;

export default function Redaction() {
  const { S, ready, startSession, recordWriting } = useApp();
  const router = useRouter();
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [found, setFound] = useState<Finding[] | null>(null);

  // Brouillon conservé sur l'appareil : iOS peut fermer l'application en arrière-plan.
  useEffect(() => {
    try { setText(localStorage.getItem(DRAFT) ?? ""); } catch { /* indisponible */ }
    setSubject(SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]);
  }, []);
  const edit = (t: string) => { setText(t); try { localStorage.setItem(DRAFT, t); } catch { /* idem */ } };

  if (!ready) return <p className="note">Chargement…</p>;
  const key = S.settings.aiKey, words = countWords(text);

  const run = async () => {
    setBusy(true); setErr(""); setFound(null);
    try {
      const f = await analyse(text, key, S.settings.aiModel);
      setFound(f);
      recordWriting(f.map((x) => x.regle).filter((x): x is string => !!x), words, f.length);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  };

  const rules = found ? [...new Set(found.map((f) => f.regle).filter((x): x is string => !!x))] : [];
  const history = S.writings.slice(-5).reverse();

  return (
    <>
      <h1>Rédaction</h1>
      <p className="note">Écris un texte librement (une centaine de mots ou plus), sans correcteur. L&apos;analyse relève tes fautes et les relie aux règles de l&apos;application : elles reviennent dans tes séances.</p>
      {!key && (
        <p className="note ko-note">Il faut une clé d&apos;API Gemini (gratuite) pour l&apos;analyse. Ajoute-la dans <Link href="/reglages/">Réglages</Link>.</p>
      )}
      <div className="test"><b>Sujet</b> {subject}</div>
      <button className="btn ghost" onClick={() => setSubject(SUBJECTS[(SUBJECTS.indexOf(subject) + 1) % SUBJECTS.length])}>Autre sujet</button>
      <textarea className="essay" rows={12} value={text} onChange={(e) => edit(e.target.value)}
        autoCorrect="off" autoCapitalize="sentences" spellCheck={false} placeholder="Écris ton texte ici…" />
      <p className="note">{words} mot{words > 1 ? "s" : ""}</p>
      <button className="btn primary" disabled={!key || busy || words < 20} onClick={run}>
        {busy ? "Analyse en cours…" : words < 20 ? "Écris au moins 20 mots" : "Analyser mon texte"}
      </button>
      {err && <p className="note ko-note">L&apos;analyse a échoué : {err}</p>}

      {found && (
        <>
          <h2>{found.length ? `${found.length} faute${found.length > 1 ? "s" : ""} relevée${found.length > 1 ? "s" : ""}` : "Aucune faute relevée"}</h2>
          {found.map((f, i) => (
            <div key={i} className="finding">
              <p><s>{f.extrait}</s> → <b>{f.correction}</b></p>
              <p className="note">{f.explication}</p>
              {f.regle ? <Link href={`/regles/${f.regle}/`}>{RMAP[f.regle].titre}</Link> : <small>Hors des règles de l&apos;application</small>}
            </div>
          ))}
          {rules.length > 0 && (
            <button className="btn primary big" onClick={() => { if (startSession("focus", { rules })) router.push("/seance/"); }}>
              M&apos;entraîner sur ces règles <small>{rules.length} règle{rules.length > 1 ? "s" : ""}</small>
            </button>
          )}
          <p className="note">L&apos;analyse est faite par une IA : elle peut se tromper. En cas de doute, vérifie dans un dictionnaire.</p>
          <button className="btn" onClick={() => { edit(""); setFound(null); setSubject(SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]); }}>Nouveau texte</button>
        </>
      )}

      {history.length > 0 && (
        <>
          <h2>Mes dernières rédactions</h2>
          {history.map((w) => (
            <div key={w.t} className="bar2">
              <span>{new Date(w.t).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} · {w.words} mots</span>
              <span />
              <em>{w.words ? Math.round((100 * w.errors) / w.words) : 0} %</em>
            </div>
          ))}
          <p className="note">Pourcentage = fautes pour 100 mots. C&apos;est la meilleure mesure de tes progrès réels.</p>
        </>
      )}
    </>
  );
}
