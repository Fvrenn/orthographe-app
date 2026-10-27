# Orthographe — entraînement personnel (Next.js)

Application web installable (PWA) pour s'entraîner à l'orthographe sur téléphone, **sans connexion**.
Next.js (App Router) + React + TypeScript, exporté en **site statique** : aucun serveur n'est nécessaire.
Aucune donnée n'est envoyée : la progression reste dans le navigateur de l'appareil.

La méthode et ses sources sont dans `docs/methode_apprentissage.md`.

## Principes pédagogiques appliqués

| Principe | Dans l'application |
|---|---|
| Rappel actif | On **écrit** la réponse (clavier d'accents intégré). Un mode « boutons » existe pour les homophones, moins efficace. |
| Répétition espacée | Boîtes de Leitner : 1, 3, 7, 14, 30, 60 jours. Une erreur renvoie à demain et la carte revient dans la séance. |
| Savoir quoi travailler | Diagnostic (une question par règle), puis les règles faibles passent en tête. Onglet « Priorités » classé par taux d'erreur. |
| Expliquer la structure | Chaque règle : explication courte, astuce (test de substitution), exemples. Affichée avant la première carte et après chaque erreur. |
| Éviter les formes fautives | Les exercices montrent un **trou**, jamais une phrase fautive. |

## Commandes

```
npm install
npm run dev       # développement : http://localhost:3000 (pas de service worker)
npm run check     # cohérence du contenu (63 règles, 319 exercices)
npm test          # tests de la répétition espacée et de la correction des réponses
npm run build     # génère out/ (site statique) et out/sw.js (hors connexion)
npm run serve     # sert out/ sur http://localhost:8080 pour tester le build
```

## Utiliser sur le téléphone

Le mode hors connexion exige que le site soit servi en **HTTPS** (ou `localhost`). Il faut donc publier le dossier `out/`.

1. `npm run build`
2. Publier `out/` sur un hébergement statique gratuit (GitHub Pages, Netlify, Cloudflare Pages…).
   - Sur un site de projet GitHub Pages (`https://compte.github.io/depot/`), construire avec le sous-chemin :
     `BASE_PATH=/depot npm run build` (sous PowerShell : `$env:BASE_PATH="/depot"; npm run build`).
3. Ouvrir l'adresse sur le téléphone **une fois, avec du réseau**, puis « Ajouter à l'écran d'accueil ».
4. L'application fonctionne ensuite sans réseau. Une mise à jour est récupérée à l'ouverture suivante avec réseau.

Pense à exporter une sauvegarde de temps en temps (Réglages) : les données sont liées au navigateur du téléphone.

## Organisation du code

```
src/lib/rules.ts      contenu pédagogique : règles reformulées + exercices originaux
src/lib/srs.ts        répétition espacée, statistiques, construction des séances (fonctions pures)
src/lib/store.tsx     état global, séance en cours, sauvegarde dans localStorage
src/lib/text.ts       normalisation et correction des réponses
src/app/              pages : accueil, diagnostic, règles (+ pages statiques par règle), priorités, réglages, séance
src/components/       navigation, écrans de séance, éléments communs
scripts/make-sw.mjs   génère le service worker après le build (liste exacte des fichiers à mettre en cache)
tests/                tests unitaires
```

## Ajouter ou corriger des exercices
Édite `src/lib/rules.ts` : chaque règle est un appel `R(id, catégorie, titre, règle, astuce, exemples, boutons, items)`.
Un item est `["Phrase avec ___", "réponse"]` (variantes : `"réponse1|réponse2"`). Lance ensuite `npm run check`.

## Limites actuelles
- Le contenu a été rédigé par l'assistant et n'a pas été relu par un enseignant : vérifie dans un dictionnaire en cas de doute.
- Pas de dictée audio ni de « repérer l'erreur dans une phrase ».
- Sur la grammaire, l'efficacité de la répétition espacée est moins établie que pour le vocabulaire : l'accueil affiche ta réussite à 7 jours pour le mesurer.
- Une séance n'existe qu'en mémoire : si tu recharges la page en cours de séance, tu reviens à l'accueil (la progression déjà enregistrée est conservée).
