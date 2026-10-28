/* Contrôle de cohérence du contenu : npm run check */
import { readFileSync, writeFileSync } from "node:fs";
import { RULES } from "../src/lib/rules";
import { norm } from "../src/lib/text";

let errors = 0, items = 0;
const ids = new Set<string>();
const bad = (m: string) => { console.log("ERREUR :", m); errors++; };
const words = (s: string) => norm(s).split(/[\s'’,.;:!?()«»-]+/).filter(Boolean);

for (const r of RULES) {
  if (ids.has(r.id)) bad(`id dupliqué ${r.id}`);
  ids.add(r.id);
  if (!r.regle || !r.test || !r.ex.length) bad(`${r.id} : champ manquant`);
  if (r.items.length < 8) bad(`${r.id} : seulement ${r.items.length} phrases (8 au moins, pour varier les révisions)`);
  if (!r.items.some((it) => it.lvl > 1)) bad(`${r.id} : aucune phrase de niveau 2 ou 3`);
  const seen = new Set<string>();
  for (const it of r.items) {
    items++;
    if (seen.has(norm(it.p))) bad(`${it.id} : phrase en double « ${it.p} »`);
    seen.add(norm(it.p));
    const parts = it.p.split("___");
    if (parts.length !== 2) { bad(`${r.id} : un seul trou attendu dans « ${it.p} »`); continue; }
    if (!it.a) bad(`${it.id} : réponse vide`);
    if (r.opts && !it.a.split("|").some((a) => r.opts!.map(norm).includes(norm(a)))) {
      bad(`${it.id} : réponse « ${it.a} » absente des boutons de ${r.id}`);
    }
    // Mot répété autour du trou, ex. « ___ il pleut » avec la réponse « s'il » → « s'il il pleut ».
    const before = words(parts[0]).at(-1), after = words(parts[1].replace(/\([^)]*\)/g, "")).at(0);
    for (const a of it.a.split("|")) {
      const w = words(a);
      if (w.length && after && w.at(-1) === after) bad(`${it.id} : « ${a} » + « ${after} » répète un mot dans « ${it.p} »`);
      if (w.length && before && w[0] === before && before.length > 1) bad(`${it.id} : « ${before} » + « ${a} » répète un mot dans « ${it.p} »`);
    }
  }
}

/* Les identifiants (« h_a#3 ») sont des positions : insérer ou supprimer une phrase au milieu d'une liste
   décalerait la progression enregistrée sur les téléphones. scripts/item-ids.json garde chaque identifiant
   déjà publié avec sa réponse ; on ajoute les nouveaux, on ne modifie jamais les anciens. */
const SNAP = "scripts/item-ids.json";
const snap: Record<string, string> = JSON.parse(readFileSync(SNAP, "utf8"));
const now = Object.fromEntries(RULES.flatMap((r) => r.items.map((it) => [it.id, it.a])));
for (const [id, a] of Object.entries(snap)) {
  if (!(id in now)) bad(`${id} a disparu : ne supprime pas de phrase publiée (corrige-la plutôt)`);
  else if (norm(now[id]) !== norm(a)) bad(`${id} : réponse « ${a} » devenue « ${now[id]} ». Phrase déplacée ? Ajoute les nouvelles phrases en fin de liste (correction voulue : mets aussi à jour ${SNAP})`);
}
const added = Object.keys(now).filter((id) => !(id in snap));
if (!errors && added.length) {
  writeFileSync(SNAP, "{\n" + Object.entries({ ...snap, ...Object.fromEntries(added.map((id) => [id, now[id]])) })
    .map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n") + "\n}\n");
  console.log(`${added.length} nouvel(s) identifiant(s) ajouté(s) à ${SNAP}.`);
}

console.log(`${RULES.length} règles, ${items} exercices.`, errors ? `${errors} erreur(s)` : "Contenu cohérent.");
process.exit(errors ? 1 : 0);
