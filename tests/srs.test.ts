import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, RULES } from "../src/lib/rules";
import {
  DAY, INTERVALS, MASTERY, applyGrade, applyWriting, buildQueue, dayStart, dueRules, freshState, maxLevel, newBudget, pickItems, retryItem, rstat,
} from "../src/lib/srs";
import { migrateV1, parseState } from "../src/lib/storage";
import { check, norm } from "../src/lib/text";

const R0 = RULES[0];
const first = R0.items[0].id;
const t0 = dayStart(Date.UTC(2026, 0, 5)) + 10 * 3600_000;

test("normalisation : apostrophes, traits d'union et casse, mais accents conservés", () => {
  assert.equal(norm("  L’AMI  "), "l'ami");
  assert.equal(norm("peut‑être"), "peut-être");
  const it = ITEMS["h_a#1"]; // « à »
  assert.ok(check(it, " À "));
  assert.ok(!check(it, "a"));
  assert.ok(!check(ITEMS[first], ""));
});

test("variantes acceptées (a|b)", () => {
  assert.ok(check(ITEMS["v_futcond#2"], "appèlerai"));
  assert.ok(check(ITEMS["v_futcond#2"], "appellerai"));
});

test("la boîte de la règle monte d'un cran par révision due réussie : 1, 2, 4, 7, 14, 30, 45, 60 jours", () => {
  let S = freshState();
  let t = t0;
  const delays: number[] = [];
  for (let i = 0; i < 9; i++) {
    S = applyGrade(S, R0.items[i % R0.items.length].id, true, false, "daily", t);
    const p = S.rules[R0.id];
    delays.push((p.d - dayStart(t)) / DAY);
    t = p.d + 10 * 3600_000; // on revient le jour prévu
  }
  assert.deepEqual(delays, [...INTERVALS.slice(1), INTERVALS[INTERVALS.length - 1]]);
});

test("une seule promotion par jour, et pas de promotion si la règle n'est pas due", () => {
  let S = applyGrade(freshState(), first, true, false, "daily", t0);
  S = applyGrade(S, R0.items[1].id, true, false, "daily", t0 + 1000);
  assert.equal(S.rules[R0.id].b, 1, "deux réussites le même jour : une seule promotion");
  S = applyGrade(S, R0.items[2].id, true, false, "focus", t0 + 2 * DAY + 1000);
  assert.equal(S.rules[R0.id].b, 2, "due ce jour-là : promotion");
  S = applyGrade(S, R0.items[3].id, true, false, "focus", t0 + 3 * DAY);
  assert.equal(S.rules[R0.id].b, 2, "pas due (prévue dans 2 jours) : pas de promotion");
  assert.equal(S.rules[R0.id].ok, 4, "mais la réussite compte pour l'acquisition");
});

test("une erreur ramène la règle en boîte 1, à demain, même après une réussite le même jour", () => {
  let S = applyGrade(freshState(), first, true, false, "daily", t0);
  S = applyGrade(S, R0.items[1].id, false, false, "daily", t0 + 1000);
  assert.equal(S.rules[R0.id].b, 1);
  assert.equal(S.rules[R0.id].d, dayStart(t0) + DAY);
  S = applyGrade(S, R0.items[2].id, true, false, "daily", t0 + 2000);
  assert.equal(S.rules[R0.id].b, 1, "la reprise du jour même ne fait pas remonter");
});

test("avec indice : pas de promotion ni de réussite comptée", () => {
  const S = applyGrade(freshState(), first, true, true, "daily", t0);
  assert.equal(S.rules[R0.id].b, 1);
  assert.equal(S.rules[R0.id].ok, 0);
});

test("acquisition : il faut assez de réussites ET un étalement dans le temps", () => {
  let S = freshState();
  for (let i = 0; i < MASTERY.ok + 5; i++) S = applyGrade(S, R0.items[i % R0.items.length].id, true, false, "focus", t0 + i * 1000);
  assert.notEqual(rstat(S, R0, t0).status, "ok", "beaucoup de réussites en un jour ne suffisent pas");
  let t = t0;
  for (let i = 0; i < 6; i++) { t = S.rules[R0.id].d + 3600_000; S = applyGrade(S, R0.items[i % R0.items.length].id, true, false, "daily", t); }
  const s = rstat(S, R0, t);
  assert.ok(s.m.span >= MASTERY.span && s.m.days >= MASTERY.days);
  assert.equal(s.status, "ok");
});

test("diagnostic : réussite → boîte 2 ; échec → règle faible, proposée en premier", () => {
  const a = RULES[0], b = RULES[5];
  let S = applyGrade(freshState(), a.items[0].id, true, false, "diag", t0);
  S = applyGrade(S, b.items[0].id, false, false, "diag", t0);
  assert.equal(S.rules[a.id].b, 2);
  assert.equal(S.rules[a.id].diag, "ok");
  assert.equal(rstat(S, b).status, "weak");
});

test("séance du jour : règles dues d'abord, puis le budget de nouvelles règles", () => {
  let S = freshState();
  const weak = RULES[10];
  S = applyGrade(S, weak.items[0].id, false, false, "diag", Date.now() - DAY);
  assert.ok(dueRules(S).some((r) => r.id === weak.id));
  const q = buildQueue(S, "daily");
  assert.ok(q.filter((id) => ITEMS[id].rule === weak.id).length >= 2, "la règle faible est servie avec plusieurs phrases");
  const rules = new Set(q.map((id) => ITEMS[id].rule));
  assert.equal(rules.size, 1 + S.settings.newRules);
  assert.equal(new Set(q).size, q.length, "pas deux fois la même phrase");
});

test("budget de nouvelles règles : décompté dans la journée", () => {
  let S = freshState();
  assert.equal(newBudget(S), 2);
  S = applyGrade(S, first, true, false, "daily");
  assert.equal(newBudget(S), 1);
  S = applyGrade(S, R0.items[1].id, true, false, "daily"); // même règle : ne compte pas
  assert.equal(newBudget(S), 1);
});

test("choix des phrases : jamais vues ou vues il y a longtemps, niveau selon la boîte", () => {
  let S = freshState();
  const r = RULES.find((x) => x.items.some((it) => it.lvl === 3))!;
  const easy = pickItems(S, r, 3);
  assert.ok(easy.every((id) => ITEMS[id].lvl === 1), "règle nouvelle : niveau 1");
  S.rules[r.id] = { ...S.rules[r.id], b: 6, d: 0, moved: 0, n: 10, ok: 10, ko: 0, days: 5, first: 0, lastOk: 0, recent: "1111111111" };
  assert.equal(maxLevel(6), 3);
  const hard = pickItems(S, r, 2);
  assert.ok(hard.some((id) => ITEMS[id].lvl >= 2), "règle avancée : phrases plus difficiles");
  for (const it of r.items) S.items[it.id] = { n: 1, ok: 1, t: t0 };
  S.items[r.items[0].id].t = t0 - 100 * DAY;
  S.rules[r.id].b = 1;
  assert.equal(pickItems(S, r, 1)[0], r.items[0].id, "la phrase vue il y a le plus longtemps d'abord");
});

test("après une erreur, la reprise utilise une autre phrase de la même règle", () => {
  const alt = retryItem(freshState(), first, { [first]: true });
  assert.notEqual(alt, first);
  assert.equal(ITEMS[alt].rule, R0.id);
});

test("séance ciblée : seulement les règles choisies", () => {
  const q = buildQueue(freshState(), "focus", { rules: [RULES[3].id, RULES[7].id] });
  assert.ok(q.length >= 4);
  assert.ok(q.every((id) => [RULES[3].id, RULES[7].id].includes(ITEMS[id].rule)));
});

test("diagnostic : une question par règle", () => {
  const q = buildQueue(freshState(), "diag");
  assert.equal(q.length, RULES.length);
  assert.equal(new Set(q.map((id) => ITEMS[id].rule)).size, RULES.length);
});

test("rédaction : les règles fautives reviennent aujourd'hui et sont comptées comme erreurs", () => {
  let S = applyGrade(freshState(), first, true, false, "daily", t0 - 10 * DAY);
  S = applyWriting(S, [R0.id, R0.id, "inconnue"], 120, 3, t0);
  assert.equal(S.rules[R0.id].b, 1);
  assert.equal(S.rules[R0.id].d, dayStart(t0));
  assert.equal(S.rules[R0.id].ko, 1);
  assert.deepEqual(S.writings[0].rules, [R0.id]);
});

test("migration de la version 1 : progression conservée et convertie par règle", () => {
  const old = {
    v: 1,
    cards: { [first]: { b: 3, d: t0 + 7 * DAY, n: 4, ok: 3, ko: 1, t: t0 }, [R0.items[1].id]: { b: 2, d: t0 + 3 * DAY, n: 2, ok: 2, ko: 0, t: t0 } },
    rules: { [R0.id]: { seen: true }, [RULES[2].id]: { diag: "ko" } },
    settings: { newPerDay: 8, sessionMax: 40, mode: "boutons" },
    log: [[t0 - 2 * DAY, first, 0, 1], [t0 - DAY, first, 1, 1], [t0, R0.items[1].id, 1, 1]],
    days: { "2026-01-05": { done: 3, new: 1 } },
  };
  const S = parseState(JSON.stringify(old))!;
  assert.equal(S.v, 2);
  const p = S.rules[R0.id];
  assert.equal(p.n, 6); assert.equal(p.ok, 5); assert.equal(p.ko, 1);
  assert.equal(p.b, 3, "boîte la plus basse des phrases (v1 boîte 2 = 3 jours → v2 boîte 3)");
  assert.equal(p.d, t0 + 3 * DAY);
  assert.equal(p.days, 2); assert.equal(p.recent, "011");
  assert.ok(p.seen);
  assert.equal(S.rules[RULES[2].id].diag, "ko");
  assert.equal(S.settings.sessionMax, 40); assert.equal(S.settings.mode, "boutons"); assert.equal(S.settings.newRules, 2);
  assert.equal(S.items[first].n, 4);
  assert.deepEqual(migrateV1(old as never).days, old.days);
});
