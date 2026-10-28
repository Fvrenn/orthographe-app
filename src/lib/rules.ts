/* Contenu pédagogique : règles de grammaire publiques, reformulées, avec des phrases d'exercice originales.
   Le contenu est rangé par catégorie dans src/lib/content/. */
import { ACCORDS } from "./content/accords";
import { HOMOPHONES } from "./content/homophones";
import { MOTS } from "./content/mots";
import { VERBES } from "./content/verbes";
import type { Item, Rule } from "./types";

export const RULES: Rule[] = [...HOMOPHONES, ...VERBES, ...ACCORDS, ...MOTS];
export const RMAP: Record<string, Rule> = Object.fromEntries(RULES.map((r) => [r.id, r]));
export const ITEMS: Record<string, Item> = Object.fromEntries(RULES.flatMap((r) => r.items.map((i) => [i.id, i])));
export const CATS: string[] = [...new Set(RULES.map((r) => r.cat))];
