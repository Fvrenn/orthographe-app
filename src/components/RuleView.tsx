"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RMAP } from "@/lib/rules";
import { rstat } from "@/lib/srs";
import { useApp } from "@/lib/store";
import { RuleCard, StatusChip } from "./parts";

export function RuleView({ id }: { id: string }) {
  const { S, startSession } = useApp();
  const router = useRouter();
  const r = RMAP[id];
  if (!r) return <p className="note">Règle introuvable.</p>;
  const s = rstat(S, r);
  return (
    <>
      <Link href="/regles/" className="back">‹ Règles</Link>
      <h1>{r.titre}</h1>
      <p><StatusChip status={s.status} /> <small>{r.cat}</small></p>
      <RuleCard r={r} />
      <button className="btn primary" onClick={() => { if (startSession("focus", { rule: r.id })) router.push("/seance/"); }}>
        S&apos;entraîner sur cette règle
      </button>
    </>
  );
}
