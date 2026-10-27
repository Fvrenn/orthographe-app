"use client";
import Link from "next/link";
import { CATS, RULES } from "@/lib/rules";
import { rstat } from "@/lib/srs";
import { useApp } from "@/lib/store";
import { StatusChip } from "@/components/parts";

export default function Regles() {
  const { S } = useApp();
  return (
    <>
      <h1>Règles</h1>
      {CATS.map((c) => (
        <section key={c}>
          <h2>{c}</h2>
          {RULES.filter((r) => r.cat === c).map((r) => {
            const s = rstat(S, r);
            return (
              <Link key={r.id} href={`/regles/${r.id}/`} className="row">
                <span><b>{r.titre}</b><small>{s.seen}/{s.total} vues</small></span>
                <StatusChip status={s.status} />
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );
}
