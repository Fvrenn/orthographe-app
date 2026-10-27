/* Repère les exercices où le trou a très peu de contexte (à relire à la main) : npx tsx scripts/audit-context.ts */
import { RULES } from "../src/lib/rules";
let n = 0, total = 0;
for (const r of RULES) for (const it of r.items) {
  total++;
  const before = it.p.split("___")[0].trim();
  const words = before.split(/\s+/).filter(Boolean).length;
  if (words <= 1) { n++; console.log(`${it.id.padEnd(16)} | ${it.p}`); }
}
console.log(`\n${n} exercices sur ${total} ont au plus un mot avant le trou.`);
