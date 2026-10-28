# Orthographe — entraînement personnel (Next.js)

Application web installable (PWA) pour s'entraîner à l'orthographe sur téléphone, **sans connexion**.
Next.js (App Router) + React + TypeScript, exporté en **site statique** : aucun serveur n'est nécessaire.
Aucune donnée n'est envoyée : la progression reste dans le navigateur de l'appareil.

La méthode et ses sources sont dans `docs/methode_apprentissage.md`.

## Principes pédagogiques appliqués

| Principe | Dans l'application |
|---|---|
| Rappel actif | On **écrit** la réponse (clavier d'accents intégré). Un mode « boutons » existe pour les homophones, moins efficace. |
| Répétition espacée | Par **règle** (pas par phrase) : 1, 2, 4, 7, 14, 30, 45, 60 jours. À chaque révision, on tire des phrases de la règle non vues depuis longtemps, plus difficiles quand la règle progresse (niveaux 1 à 3). Une erreur renvoie la règle à demain et elle revient dans la séance avec une **autre phrase**. Réviser en avance ne fait pas avancer la date. |
| Acquisition | Une règle est « acquise » après 20 réussites étalées sur au moins 14 jours (5 jours distincts), avec 80 % de réussite récente. Même acquise, elle revient au moins tous les deux mois. |
| Transfert à l'écrit | Onglet « Écrire » : une rédaction libre est analysée par Gemini (clé personnelle, dans Réglages), qui relie chaque faute à une règle. Ces règles reviennent dans la séance du jour. |
| Savoir quoi travailler | Diagnostic (une question par règle), puis les règles faibles passent en tête. Onglet « Priorités » classé par taux d'erreur. |
| Expliquer la structure | Chaque règle : explication courte, astuce (test de substitution), exemples. Affichée avant la première carte et après chaque erreur. |
| Éviter les formes fautives | Les exercices montrent un **trou**, jamais une phrase fautive. |

## Commandes

```
npm install
npm run dev       # développement : http://localhost:3000 (pas de service worker)
npm run check     # cohérence du contenu (63 règles, 721 exercices) et stabilité des identifiants
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

### Progression et mises à jour
- Une **mise à jour** du site ne touche pas à la progression (elle est dans `localStorage`, pas dans le cache du service worker). L'application affiche « Nouvelle version disponible » : il suffit de toucher « Mettre à jour ». **Inutile de réinstaller l'icône.**
- Sur iPhone, l'application de l'écran d'accueil a son propre stockage, séparé de Safari. **Supprimer l'icône efface la progression**, et l'ouvrir dans Safari montre une progression vide.
- Pour changer d'appareil ou réinstaller : Réglages → Exporter, puis Importer dans la nouvelle installation.
- Les anciennes sauvegardes (format v1) sont converties automatiquement ; une copie de l'ancien format est gardée sous `ortho_v1_avant_migration`.

## Organisation du code

```
src/lib/content/      contenu pédagogique par catégorie : règles reformulées + exercices originaux
src/lib/rules.ts      assemble le contenu (RULES, RMAP, ITEMS)
src/lib/storage.ts    lecture de la sauvegarde, migration des anciens formats, export
src/lib/ai.ts         analyse d'une rédaction par l'API Gemini (sortie JSON contrainte aux identifiants de règles)
src/lib/srs.ts        répétition espacée, statistiques, construction des séances (fonctions pures)
src/lib/store.tsx     état global, séance en cours (reprise après fermeture), sauvegarde dans localStorage
src/lib/text.ts       normalisation et correction des réponses
src/app/              pages : accueil, diagnostic, règles (+ pages statiques par règle), rédaction, priorités, réglages, séance
src/components/       navigation, écrans de séance, éléments communs
scripts/make-sw.mjs   génère le service worker après le build (liste exacte des fichiers à mettre en cache)
tests/                tests unitaires
```

## Ajouter ou corriger des exercices
Édite `src/lib/content/*.ts` : chaque règle est un appel `R(id, catégorie, titre, règle, astuce, exemples, boutons, items)`.
Un item est `["Phrase avec ___", "réponse", niveau]` (variantes : `"réponse1|réponse2"` ; niveau 1, 2 ou 3, 1 par défaut).
**Ajoute les nouvelles phrases en fin de liste et n'en supprime pas** : l'identifiant d'une phrase est sa position, et la progression y est attachée.
`npm run check` le vérifie (`scripts/item-ids.json`), repère aussi les mots répétés autour du trou (« s'il il ») et exige 8 phrases par règle dont au moins une de niveau 2 ou 3.

## Limites actuelles
- Le contenu a été rédigé par l'assistant et n'a pas été relu par un enseignant : vérifie dans un dictionnaire en cas de doute.
- Pas de dictée audio.
- L'analyse des rédactions passe par une IA : elle peut oublier ou inventer une faute. Les textes sont envoyés à Google.
- Sur la grammaire, l'efficacité de la répétition espacée est moins établie que pour le vocabulaire : l'accueil affiche ta réussite à 7 jours pour le mesurer.
