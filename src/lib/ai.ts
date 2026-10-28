/* Analyse d'une rédaction par l'API Gemini (clé personnelle, appel direct depuis le navigateur).
   On envoie la liste des règles de l'application avec leur identifiant ; le modèle répond en JSON contraint
   (schéma + liste fermée d'identifiants), donc l'application sait directement quelles règles faire travailler. */
import { RMAP, RULES } from "./rules";

export type Finding = { extrait: string; correction: string; regle: string | null; explication: string };
export const NO_RULE = "aucune";

function prompt(text: string): string {
  const list = RULES.map((r) => `- ${r.id} : ${r.titre}. ${r.regle}`).join("\n");
  return `Tu es correcteur d'orthographe et de grammaire française.
Voici les règles travaillées par l'élève, chacune avec son identifiant :
${list}

Relève TOUTES les fautes d'orthographe, de grammaire et d'accord du texte ci-dessous (pas le style, pas la ponctuation seule).
Pour chaque faute :
- "extrait" : les mots fautifs, recopiés exactement tels qu'ils sont écrits dans le texte (quelques mots au plus) ;
- "correction" : le même extrait corrigé ;
- "regle" : l'identifiant de la règle de la liste qui explique la faute, ou "${NO_RULE}" si aucune ne correspond vraiment ;
- "explication" : une phrase courte en français.
N'invente pas de faute : si un passage est correct, ne le cite pas. Si le texte n'a aucune faute, renvoie une liste vide.

Texte :
"""
${text}
"""`;
}

const schema = {
  type: "OBJECT",
  properties: {
    erreurs: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          extrait: { type: "STRING" },
          correction: { type: "STRING" },
          regle: { type: "STRING", format: "enum", enum: [...RULES.map((r) => r.id), NO_RULE] },
          explication: { type: "STRING" },
        },
        required: ["extrait", "correction", "regle", "explication"],
      },
    },
  },
  required: ["erreurs"],
};

export async function analyse(text: string, key: string, model: string): Promise<Finding[]> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt(text) }] }],
      generationConfig: { temperature: 0, responseMimeType: "application/json", responseSchema: schema },
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? `Erreur ${res.status}`);
  const out = (data?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
  const parsed = JSON.parse(out) as { erreurs: Finding[] };
  return (parsed.erreurs ?? [])
    .filter((f) => f.extrait && f.correction && f.extrait.trim() !== f.correction.trim())
    .map((f) => ({ ...f, regle: f.regle && RMAP[f.regle] ? f.regle : null }));
}

export const SUBJECTS = [
  "Raconte ta dernière journée de travail ou d'études, du réveil au coucher.",
  "Décris un voyage qui t'a marqué : où, avec qui, ce qui s'est passé.",
  "Écris un courriel à un collègue pour reporter une réunion et proposer deux nouvelles dates.",
  "Donne ton avis sur le télétravail : avantages, inconvénients, ce que tu préfères.",
  "Raconte un souvenir d'enfance que tu n'as jamais oublié.",
  "Explique à un ami comment préparer ton plat préféré.",
  "Décris la ville ou le quartier où tu vis à quelqu'un qui ne le connaît pas.",
  "Écris une lettre de réclamation pour un colis livré en retard et abîmé.",
  "Raconte un film ou une série que tu as aimé, sans dévoiler la fin.",
  "Imagine ta journée idéale dans dix ans.",
  "Explique un problème que tu as résolu récemment et comment tu t'y es pris.",
  "Rédige le compte rendu d'une réunion ou d'une discussion importante.",
  "Décris une personne qui t'a influencé et explique pourquoi.",
  "Raconte ce que tu as fait le week-end dernier, puis ce que tu feras le prochain.",
];
