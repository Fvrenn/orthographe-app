"use client";
import { useRouter } from "next/navigation";
import { CATS, RULES } from "@/lib/rules";
import { useApp } from "@/lib/store";

export default function Diagnostic() {
  const { startSession } = useApp();
  const router = useRouter();
  const go = (cat: string) => { if (startSession("diag", { cat })) router.push("/seance/"); };
  return (
    <>
      <h1>Diagnostic</h1>
      <p className="note">Une question par règle, sans indice. Les erreurs servent à classer tes règles par priorité. Réponds de mémoire, sans chercher : c&apos;est le but.</p>
      <button className="btn primary" onClick={() => go("")}>Tout ({RULES.length} questions)</button>
      {CATS.map((c) => (
        <button key={c} className="btn" onClick={() => go(c)}>{c} ({RULES.filter((r) => r.cat === c).length})</button>
      ))}
    </>
  );
}
