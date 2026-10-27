export type Item = { id: string; p: string; a: string; f: string; rule: string };
export type Rule = {
  id: string; cat: string; titre: string; regle: string; test: string;
  ex: string[]; opts: string[] | null; items: Item[];
};
export type Card = { b: number; d: number; n: number; ok: number; ko: number; t?: number };
export type Mode = "saisie" | "boutons";
export type Settings = { newPerDay: number; sessionMax: number; mode: Mode };
export type State = {
  v: 1;
  cards: Record<string, Card>;
  rules: Record<string, { seen?: boolean; diag?: "ok" | "ko" }>;
  settings: Settings;
  log: [number, string, 0 | 1, number][];
  days: Record<string, { done: number; new: number }>;
};
export type Kind = "daily" | "diag" | "focus";
export type Opt = { max?: number; extra?: number; cat?: string; rule?: string };
export type Phase = "lesson" | "q" | "fb" | "sum";
export type Session = {
  kind: Kind; queue: string[]; total: number; ok: number; ko: number; count: number;
  graded: Record<string, true>; retry: Record<string, true>; wrong: Record<string, number>;
  hint: boolean; phase: Phase; last: { ok: boolean } | null;
};
