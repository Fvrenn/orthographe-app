"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RMAP } from "@/lib/rules";
import { INTERVALS, rstat } from "@/lib/srs";
import { useApp } from "@/lib/store";
import { MasteryLine, RuleCard, StatusChip } from "./parts";

export function RuleView({ id }: { id: string }) {
  const { S, startSession } = useApp();
  const router = useRouter();
  const r = RMAP[id];
  if (!r) return <p className="note">Règle introuvable.</p>;
  const s = rstat(S, r), p = S.rules[r.id];
  const next = p?.b ? new Date(p.d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : null;
  return (
    <>
      <Link href="/regles/" className="back">‹ Règles</Link>
      <h1>{r.titre}</h1>
      <p><StatusChip status={s.status} /> <small>{r.cat} · {r.items.length} phrases</small></p>
      <RuleCard r={r} />
      {p?.n ? (
        <p className="note">
          <MasteryLine m={s.m} /><br />
          {Math.round(s.err * 100)} % d&apos;erreurs sur {s.n} réponses
          {next && <><br />Prochaine révision : {s.due ? "aujourd'hui" : next} (intervalle {INTERVALS[p.b]} j)</>}
        </p>
      ) : null}
      <button className="btn primary" onClick={() => { if (startSession("focus", { rules: [r.id] })) router.push("/seance/"); }}>
        S&apos;entraîner sur cette règle
      </button>
      <p className="note">S&apos;entraîner en avance ne fait pas avancer la date de révision : c&apos;est l&apos;espacement qui fixe la règle.</p>
    </>
  );
}
