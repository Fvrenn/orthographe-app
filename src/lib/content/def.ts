import type { Item, Level, Rule } from "../types";

/** R(id, catégorie, titre, règle, astuce, exemples, boutons, items).
 *  Chaque item : [phrase avec ___, réponse (variantes séparées par |), niveau 1 à 3 (1 par défaut)].
 *  L'identifiant d'un item est sa position (« h_a#3 ») : on ajoute les nouvelles phrases À LA FIN
 *  de la liste et on n'en supprime pas, sinon la progression enregistrée se décale (voir npm run check). */
export function R(
  id: string, cat: string, titre: string, regle: string, test: string,
  ex: string[], opts: string[] | null, items: [string, string, Level?][],
): Rule {
  return {
    id, cat, titre, regle, test, ex, opts,
    items: items.map((x, i): Item => ({ id: id + "#" + i, p: x[0], a: x[1], lvl: x[2] ?? 1, rule: id })),
  };
}
