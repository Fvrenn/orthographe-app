/** 1 : phrase simple et directe. 2 : contexte plus long ou piège. 3 : phrase ambiguë, accord à distance, cas limite. */
export type Level = 1 | 2 | 3;
export type Item = { id: string; p: string; a: string; lvl: Level; rule: string };
export type Rule = {
  id: string; cat: string; titre: string; regle: string; test: string;
  ex: string[]; opts: string[] | null; items: Item[];
};

/** Progression d'une règle. La répétition espacée porte sur la règle, pas sur une phrase précise :
 *  à chaque révision on tire une phrase différente de la même règle. Dates = début de jour (ms). */
export type RuleProg = {
  seen?: boolean; diag?: "ok" | "ko";
  b: number;       // boîte (0 = jamais réussie)
  d: number;       // prochaine révision
  moved: number;   // jour du dernier changement de boîte (un seul par jour)
  n: number; ok: number; ko: number;
  days: number;    // nombre de jours distincts avec au moins une réussite
  first: number;   // jour de la première réussite (0 si aucune)
  lastOk: number;  // jour de la dernière réussite
  recent: string;  // derniers résultats, du plus ancien au plus récent : "1" réussi, "0" raté
};
export type ItemProg = { n: number; ok: number; t: number };
export type Mode = "saisie" | "boutons";
export type Settings = { newRules: number; sessionMax: number; mode: Mode; aiKey: string; aiModel: string };
export type Writing = { t: number; words: number; errors: number; rules: string[] };
export type State = {
  v: 2;
  rules: Record<string, RuleProg>;
  items: Record<string, ItemProg>;
  settings: Settings;
  log: [number, string, 0 | 1][];
  days: Record<string, { done: number; new: number }>;
  writings: Writing[];
  backupAt: number;
};
export type Kind = "daily" | "diag" | "focus";
export type Opt = { max?: number; extra?: number; cat?: string; rules?: string[] };
export type Phase = "lesson" | "q" | "fb" | "sum";
export type Session = {
  kind: Kind; day: string; queue: string[]; total: number; ok: number; ko: number; count: number;
  used: Record<string, true>; retry: Record<string, true>; wrong: Record<string, number>;
  hint: boolean; phase: Phase; last: { ok: boolean } | null;
};
