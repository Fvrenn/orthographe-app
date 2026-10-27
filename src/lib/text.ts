import type { Item } from "./types";

/** Minuscules, apostrophes et traits d'union unifiés, espaces réduits. Les accents sont conservés (ils font partie de l'orthographe). */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[‐-―−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function check(item: Item, input: string): boolean {
  const n = norm(input);
  return n !== "" && item.a.split("|").some((a) => norm(a) === n);
}

export function firstAnswer(item: Item): string {
  return item.a.split("|")[0];
}
