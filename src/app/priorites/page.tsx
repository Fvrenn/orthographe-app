"use client";
import { useRouter } from "next/navigation";
import { CATS, RULES } from "@/lib/rules";
import { priority, rstat } from "@/lib/srs";
import { useApp } from "@/lib/store";
import { StatusChip } from "@/components/parts";

export default function Priorites() {
  const { S, startSession } = useApp();
  const router = useRouter();
  const list = RULES.map((r) => ({ r, s: rstat(S, r) }))
    .filter((x) => x.s.n > 0 || x.s.dg)
    .map((x) => ({ ...x, p: priority(x.s) }))
    .sort((a, b) => b.p - a.p);
  const cats = CATS.map((c) => {
    const rs = RULES.filter((r) => r.cat === c).map((r) => rstat(S, r));
    const n = rs.reduce((a, x) => a + x.n, 0), ko = rs.reduce((a, x) => a + x.ko, 0);
    return { c, pc: n ? Math.round((100 * (n - ko)) / n) : null };
  });
  return (
    <>
      <h1>À travailler</h1>
      {list.length ? (
        <>
          <p className="note">Classé par taux d&apos;erreur, avec les cartes dues. Touche une règle pour t&apos;entraîner dessus.</p>
          {list.slice(0, 12).map((x) => (
            <button key={x.r.id} className="row" onClick={() => { if (startSession("focus", { rule: x.r.id })) router.push("/seance/"); }}>
              <span><b>{x.r.titre}</b><small>{Math.round(x.s.err * 100)} % d&apos;erreurs sur {x.s.n} essais · {x.s.due} à réviser</small></span>
              <StatusChip status={x.s.status} />
            </button>
          ))}
        </>
      ) : (
        <p className="note">Pas encore de données. Lance un diagnostic ou une première séance.</p>
      )}
      <h2>Réussite par catégorie</h2>
      {cats.map(({ c, pc }) => (
        <div className="bar2" key={c}><span>{c}</span><i><u style={{ width: `${pc ?? 0}%` }} /></i><em>{pc === null ? "–" : `${pc} %`}</em></div>
      ))}
    </>
  );
}
