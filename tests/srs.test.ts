import test from "node:test";
import assert from "node:assert/strict";
import { ITEMS, RULES } from "../src/lib/rules";
import { DAY, applyGrade, buildQueue, dayStart, dueIds, freshState, newBudget, rstat } from "../src/lib/srs";
import { check, norm } from "../src/lib/text";

const first = RULES[0].items[0].id;

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

test("première réussite : boîte 1, retour dans 1 jour ; réussites suivantes : 3, 7, 14, 30, 60 jours", () => {
  let S = freshState();
  const t0 = dayStart() + 3 * 3600_000;
  const delays: number[] = [];
  for (let i = 0; i < 6; i++) {
    S = applyGrade(S, first, true, false, "daily", t0 + i * DAY);
    delays.push((S.cards[first].d - dayStart(t0 + i * DAY)) / DAY);
  }
  assert.deepEqual(delays, [1, 3, 7, 14, 30, 60]);
  S = applyGrade(S, first, true, false, "daily", t0 + 7 * DAY);
  assert.equal(S.cards[first].b, 6, "la boîte ne dépasse pas 6");
});

test("une erreur ramène la carte en boîte 1, à demain", () => {
  let S = freshState();
  for (let i = 0; i < 3; i++) S = applyGrade(S, first, true, false, "daily");
  S = applyGrade(S, first, false, false, "daily");
  assert.equal(S.cards[first].b, 1);
  assert.equal(S.cards[first].d, dayStart() + DAY);
  assert.equal(S.cards[first].ko, 1);
});

test("avec indice, réussite sans promotion de boîte", () => {
  let S = applyGrade(freshState(), first, true, true, "daily");
  assert.equal(S.cards[first].b, 1);
  S = applyGrade(S, first, true, false, "daily");
  const b = S.cards[first].b;
  S = applyGrade(S, first, true, true, "daily");
  assert.equal(S.cards[first].b, b);
});

test("diagnostic : réussite → boîte 2 ; échec → règle marquée faible", () => {
  const a = RULES[0], b = RULES[1];
  let S = applyGrade(freshState(), a.items[0].id, true, false, "diag");
  S = applyGrade(S, b.items[0].id, false, false, "diag");
  assert.equal(S.cards[a.items[0].id].b, 2);
  assert.equal(S.rules[a.id].diag, "ok");
  assert.equal(S.rules[b.id].diag, "ko");
  assert.equal(rstat(S, b).status, "weak");
});

test("les nouvelles cartes viennent d'abord des règles faibles, dans la limite du budget", () => {
  let S = freshState();
  const weak = RULES[10];
  S = applyGrade(S, weak.items[0].id, false, false, "diag");
  S.cards[weak.items[0].id].d = 0; // à réviser
  const q = buildQueue(S, "daily");
  assert.ok(q.length <= S.settings.newPerDay + dueIds(S).length);
  assert.ok(q.filter((id) => ITEMS[id].rule === weak.id).length >= 2, "la règle faible est servie en priorité");
});

test("budget de nouvelles cartes : décompté dans la journée", () => {
  let S = freshState();
  assert.equal(newBudget(S), 8);
  S = applyGrade(S, first, true, false, "daily");
  assert.equal(newBudget(S), 7);
  S = applyGrade(S, first, true, false, "daily"); // carte déjà vue : ne compte pas comme nouvelle
  assert.equal(newBudget(S), 7);
});

test("séance ciblée : seulement les cartes de la règle choisie", () => {
  const S = freshState();
  const r = RULES[3];
  const q = buildQueue(S, "focus", { rule: r.id });
  assert.equal(q.length, r.items.length);
  assert.ok(q.every((id) => ITEMS[id].rule === r.id));
});

test("diagnostic : une question par règle", () => {
  const q = buildQueue(freshState(), "diag");
  assert.equal(q.length, RULES.length);
  assert.equal(new Set(q.map((id) => ITEMS[id].rule)).size, RULES.length);
});
