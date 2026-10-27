/* Contrôle de cohérence du contenu : npm run check */
import { RULES } from "../src/lib/rules";
import { norm } from "../src/lib/text";

let errors = 0, items = 0;
const ids = new Set<string>();
const bad = (m: string) => { console.log("ERREUR :", m); errors++; };

for (const r of RULES) {
  if (ids.has(r.id)) bad(`id dupliqué ${r.id}`);
  ids.add(r.id);
  if (!r.regle || !r.test || !r.ex.length) bad(`${r.id} : champ manquant`);
  if (!r.items.length) bad(`${r.id} : aucun exercice`);
  for (const it of r.items) {
    items++;
    if (it.p.split("___").length !== 2) bad(`${r.id} : un seul trou attendu dans « ${it.p} »`);
    if (!it.a) bad(`${it.id} : réponse vide`);
    if (r.opts && !it.a.split("|").some((a) => r.opts!.map(norm).includes(norm(a)))) {
      bad(`${it.id} : réponse « ${it.a} » absente des boutons de ${r.id}`);
    }
  }
}
console.log(`${RULES.length} règles, ${items} exercices.`, errors ? `${errors} erreur(s)` : "Contenu cohérent.");
process.exit(errors ? 1 : 0);
