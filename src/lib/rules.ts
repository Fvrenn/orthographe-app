/* Contenu pédagogique : règles de grammaire publiques, reformulées, avec des phrases d'exercice originales.
   R(id, catégorie, titre, règle, test, exemples, boutons, items)
   Chaque item : [phrase avec ___, réponse (variantes séparées par |)]. */
import type { Item, Rule } from "./types";

export const RULES: Rule[] = [];

function R(
  id: string, cat: string, titre: string, regle: string, test: string,
  ex: string[], opts: string[] | null, items: [string, string, string?][],
): void {
  RULES.push({
    id, cat, titre, regle, test, ex, opts,
    items: items.map((x, i): Item => ({ id: id + "#" + i, p: x[0], a: x[1], f: x[2] ?? "", rule: id })),
  });
}

/* ===================== HOMOPHONES ===================== */
const C_HOM = "Homophones";

R("h_a", C_HOM, "a / à",
  "« a » est le verbe avoir (il a). « à » est une préposition (aller à Lyon).",
  "Remplace par « avait » : si la phrase reste correcte, écris « a ».",
  ["Il a faim.", "Il va à Lyon."], ["a", "à"], [
    ["Elle ___ perdu son badge.", "a"],
    ["Nous allons ___ la gare.", "à"],
    ["Ce train ___ du retard.", "a"],
    ["Il apprend ___ nager.", "à"],
    ["Je pense ___ toi.", "à"],
    ["Mon frère ___ vingt ans.", "a"]]);

R("h_et", C_HOM, "est / et",
  "« est » est le verbe être (il est). « et » est la conjonction qui relie deux éléments.",
  "Remplace par « était » : si la phrase reste correcte, écris « est ».",
  ["Le ciel est bleu.", "Du pain et du beurre."], ["est", "et"], [
    ["Le ciel ___ bleu.", "est"],
    ["Du pain ___ du beurre.", "et"],
    ["Quelle ___ la date aujourd'hui ?", "est"],
    ["Elle chante ___ elle danse.", "et"],
    ["Ce film ___ passionnant.", "est"],
    ["Il ___ parti hier soir.", "est"]]);

R("h_on", C_HOM, "on / ont",
  "« ont » est le verbe avoir au pluriel (ils ont). « on » est un pronom sujet (on part).",
  "Remplace par « avaient » : si ça marche, écris « ont ». Sinon, remplace par « il » : c'est « on ».",
  ["Ils ont faim.", "On part demain."], ["on", "ont"], [
    ["Ils ___ faim.", "ont"],
    ["___ part demain matin.", "on"],
    ["Les enfants ___ fini leurs devoirs.", "ont"],
    ["Quand ___ est fatigué, on dort mal.", "on"],
    ["Elles ___ pris le train de nuit.", "ont"],
    ["Que fait-___ ce soir ?", "on"]]);

R("h_son", C_HOM, "son / sont",
  "« sont » est le verbe être au pluriel (ils sont). « son » est un déterminant possessif (son sac).",
  "Remplace par « seront » : si ça marche, écris « sont ».",
  ["Ils sont en retard.", "Il range son bureau."], ["son", "sont"], [
    ["Ils ___ en retard.", "sont"],
    ["Il a perdu ___ stylo.", "son"],
    ["Les clés ___ sur la table.", "sont"],
    ["Elle range ___ bureau.", "son"],
    ["Je crois que ces fruits ___ mûrs.", "sont"],
    ["Paul a oublié ___ parapluie.", "son"]]);

R("h_ces", C_HOM, "ces / ses",
  "« ces » est le pluriel de ce, cet, cette (ces nuages-là). « ses » est le pluriel de son, sa (ses mains).",
  "Remplace par « ce / cet / cette » : si ça marche, écris « ces ». Remplace par « son / sa » : c'est « ses ».",
  ["Regarde ces nuages.", "Il se lave ses mains."], ["ces", "ses"], [
    ["Regarde ___ nuages-là : il va pleuvoir.", "ces"],
    ["Il se lave ___ mains.", "ses"],
    ["Je n'achète pas ___ fruits-ci, ils sont trop chers.", "ces"],
    ["Le chat nettoie ___ pattes.", "ses"],
    ["___ jours-ci, il fait doux.", "ces"]]);

R("h_la", C_HOM, "la / l'a / là",
  "« la » est un article ou un pronom (la porte). « l'a » (ou « l'as ») est le pronom l' + le verbe avoir. « là » indique un lieu ou renforce.",
  "Remplace par « les » : « la ». Remplace par « l'avait » (ou « l'avais ») : « l'a » (ou « l'as »). Sinon : « là ».",
  ["Je la vois.", "Il l'a vu.", "Il est là."], ["la", "l'a", "l'as", "là"], [
    ["Il ___ vu hier.", "l'a"],
    ["Le chat est ___ , sous la table.", "là"],
    ["Cette rue, je ___ connais bien.", "la"],
    ["Cet homme-___ me dit quelque chose.", "là"],
    ["Tu ___ déjà lu, ce livre ?", "l'as"],
    ["Ce dossier, elle ___ envoyé ce matin.", "l'a"]]);

R("h_ou", C_HOM, "ou / où",
  "« ou » exprime un choix. « où » indique le lieu ou le temps et prend un accent grave.",
  "Remplace par « ou bien » : « ou » sans accent. Sinon : « où ».",
  ["Du thé ou du café ?", "La ville où je suis né."], ["ou", "où"], [
    ["Tu préfères du thé ___ du café ?", "ou"],
    ["La ville ___ je suis né est petite.", "où"],
    ["___ vas-tu ce week-end ?", "où"],
    ["Viens lundi ___ mardi.", "ou"],
    ["Le jour ___ il est parti, il pleuvait.", "où"]]);

R("h_ni", C_HOM, "ni / n'y",
  "« n'y » est ne + y devant un verbe. « ni » coordonne deux éléments négatifs (ni l'un ni l'autre).",
  "Ajoute « pas » ou « jamais » : si ça marche juste après, c'est « n'y ». Sinon : « ni ».",
  ["Il n'y va jamais.", "Ni café ni thé."], ["ni", "n'y"], [
    ["Il ___ va jamais.", "n'y"],
    ["Elle n'a ___ frère ni sœur.", "ni"],
    ["Ce lieu est dangereux : on ___ va pas.", "n'y"],
    ["On ___ voit rien dans ce brouillard.", "n'y"],
    ["Il ne boit ni café ___ thé.", "ni"]]);

R("h_sans", C_HOM, "sans / s'en / c'en",
  "« sans » exprime l'absence. « s'en » est se + en devant un verbe. « c'en » se trouve dans « c'en est fait ».",
  "Mets « il » devant : si ça marche, c'est « s'en ». Si tu peux dire « cela en », c'est « c'en ». Sinon : « sans ».",
  ["Il part sans rien dire.", "Elle s'en souvient.", "C'en est fini."], ["sans", "s'en", "c'en"], [
    ["Il est parti ___ rien dire.", "sans"],
    ["Elle ___ souvient très bien.", "s'en"],
    ["Ils ___ vont déjà.", "s'en"],
    ["___ est fini de rire.", "c'en"],
    ["Sortir ___ parapluie, c'est risqué.", "sans"]]);

R("h_quand", C_HOM, "quand / qu'en / quant",
  "« quand » = lorsque. « qu'en » = que + en (ne … qu'en été). « quant à » = en ce qui concerne.",
  "Remplace par « lorsque » : « quand ». Décompose en « que en » : « qu'en ». « Quant » est toujours suivi de « à ».",
  ["Quand il pleut, je reste.", "Il ne réussit qu'en travaillant.", "Quant à moi, je reste."], ["quand", "qu'en", "quant"], [
    ["___ il pleut, je reste à la maison.", "quand"],
    ["Il ne réussira ___ travaillant.", "qu'en"],
    ["___ à moi, je reste ici.", "quant"],
    ["Elle ne sort ___ été.", "qu'en"],
    ["Dis-moi ___ tu viens.", "quand"]]);

R("h_peutetre", C_HOM, "peut être / peut-être",
  "« peut-être » est un adverbe qui signifie « probablement ». « peut être » est le verbe pouvoir suivi du verbe être.",
  "Remplace par « probablement » : si ça marche, écris « peut-être » avec un trait d'union.",
  ["Il viendra peut-être.", "Cela peut être vrai."], ["peut-être", "peut être"], [
    ["Il viendra ___ demain.", "peut-être"],
    ["Ce colis ___ livré demain, si tout va bien.", "peut être"],
    ["Elle est ___ malade.", "peut-être"],
    ["Cela ___ vrai, mais je doute.", "peut être"],
    ["___ a-t-il oublié.", "peut-être"]]);

R("h_plustot", C_HOM, "plus tôt / plutôt",
  "« plus tôt » s'oppose à « plus tard » (deux mots). « plutôt » exprime une préférence ou un degré (assez).",
  "Remplace par « plus tard » : si ça marche, écris « plus tôt » en deux mots.",
  ["Viens plus tôt.", "Il est plutôt grand."], ["plus tôt", "plutôt"], [
    ["Il fait ___ froid pour la saison.", "plutôt"],
    ["Viens ___ demain : je serai là dès huit heures.", "plus tôt"],
    ["Je préfère ___ le train que l'avion.", "plutôt"],
    ["Si tu étais arrivé ___ , tu aurais vu le début.", "plus tôt"],
    ["Ce film est ___ réussi.", "plutôt"]]);

R("h_si", C_HOM, "si / s'il / s'y",
  "« si » exprime la condition ou l'interrogation. « s'il » = si + il. « s'y » = se + y devant un verbe.",
  "Remplace par « se » : si ça marche, c'est « s'y ». Devant « il », « si » devient « s'il ».",
  ["Si tu viens, préviens-moi.", "S'il pleut, on reste.", "Il s'y habitue."], ["si", "s'il", "s'ils", "s'y"], [
    ["___ tu viens, préviens-moi.", "si"],
    ["Je ne sais pas ___ elle viendra.", "si"],
    ["___ il pleut, on reste ici.", "s'il"],
    ["Cette ville lui plaît ; il ___ installe.", "s'y"],
    ["Elle ne sait pas ___ ils sont rentrés.", "s'ils"]]);

R("h_cest", C_HOM, "c'est / s'est, ce sont / se sont",
  "« c'est » et « ce sont » présentent (c'est lui). « s'est » et « se sont » appartiennent à un verbe pronominal (il s'est levé).",
  "Remplace le sujet par « me » ou « te » : si ça marche, c'est « se / s'est ». Sinon : « ce / c'est ».",
  ["C'est une bonne idée.", "Il s'est levé tôt."], ["c'est", "s'est", "ce sont", "se sont"], [
    ["Il ___ levé tôt.", "s'est"],
    ["___ une bonne idée.", "c'est"],
    ["Elles ___ perdues en route.", "se sont"],
    ["___ mes amis d'enfance.", "ce sont"],
    ["Elle ___ trompée de chemin.", "s'est"]]);

R("h_voix", C_HOM, "voix / voie",
  "« la voix » sort de la gorge et prend un x comme « vox ». « la voie » est un chemin (voie ferrée).",
  "La voix s'entend ; la voie se parcourt.",
  ["Elle a une belle voix.", "Le train est sur la voie 3."], ["voix", "voie"], [
    ["Elle a une belle ___ .", "voix"],
    ["Le train est sur la ___ 3.", "voie"],
    ["Parle à haute ___ .", "voix"],
    ["Une ___ ferrée traverse la vallée.", "voie"],
    ["Il a perdu la ___ à force de crier.", "voix"]]);

R("h_pret", C_HOM, "prêt / près",
  "« prêt » signifie préparé. « près » signifie proche, avec « de ».",
  "Remplace par « proche » : « près ». Remplace par « préparé » : « prêt ».",
  ["Le dîner est prêt.", "Il habite près de la gare."], ["prêt", "près"], [
    ["Le dîner est ___ .", "prêt"],
    ["Il habite ___ de la gare.", "près"],
    ["Es-tu ___ à partir ?", "prêt"],
    ["Nous sommes ___ du but.", "près"],
    ["Il n'est pas ___ de revenir.", "près"]]);

R("h_parce", C_HOM, "parce que / par ce que",
  "« parce que » répond à « pourquoi » (cause). « par ce que » = par + ce que (par la chose que).",
  "Remplace par « car » : « parce que ». Remplace par « par la chose que » : « par ce que ».",
  ["Je rentre parce que le train part.", "Je suis surpris par ce que tu dis."], ["parce que", "par ce que"], [
    ["Je pars ___ le train est à huit heures.", "parce que"],
    ["Je suis ravi ___ tu as dit hier.", "par ce que"],
    ["Elle reste ___ la pluie continue.", "parce que"],
    ["Il a été étonné ___ nous avons fait.", "par ce que"]]);

R("h_quelque", C_HOM, "quelque / quel que",
  "« quelque » signifie un peu de, environ, ou plusieurs. « quel que » (en deux mots, avec accord) introduit « quel que soit ».",
  "Si tu peux dire « quel que soit », écris « quel que » en deux mots et accorde « quel ».",
  ["Quelques jours. Quel que soit ton choix."], null, [
    ["___ soit ton choix, je le respecte.", "quel que"],
    ["Il y a ___ vingt personnes dans la salle.", "quelque"],
    ["___ soient ses raisons, il a tort.", "quelles que"],
    ["Il reste ___ minutes avant le départ.", "quelques"]]);

R("h_quoique", C_HOM, "quoique / quoi que",
  "« quoique » = bien que. « quoi que » (en deux mots) = quelle que soit la chose que ; on le trouve dans « quoi qu'il arrive ».",
  "Remplace par « bien que » : « quoique ». Remplace par « quelle que soit la chose » : « quoi que ».",
  ["Quoique fatigué, il sourit.", "Quoi qu'il arrive, restons calmes."], null, [
    ["___ tu fasses, je te soutiendrai.", "quoi que"],
    ["Il est venu, ___ la route fût longue.", "quoique"],
    ["___ il arrive, restons calmes.", "quoi qu'"],
    ["Elle sourit, ___ elle soit fatiguée.", "quoiqu'"]]);

R("h_cense", C_HOM, "censé / sensé",
  "« censé » signifie supposé. « sensé » signifie raisonnable, plein de bon sens.",
  "Remplace par « supposé » : « censé ». Remplace par « raisonnable » : « sensé ».",
  ["Il est censé arriver à midi.", "Une réponse sensée."], null, [
    ["Il est ___ arriver à midi.", "censé"],
    ["Un projet ___ , réaliste.", "sensé"],
    ["Elle est ___ partir demain.", "censée"],
    ["Voilà une remarque ___ .", "sensée"]]);

R("h_tache", C_HOM, "tâche / tache",
  "« la tâche » est un travail à accomplir (accent circonflexe). « la tache » est une salissure ou une marque (pas d'accent).",
  "Travail à faire : « tâche ». Salissure : « tache ».",
  ["Ma tâche du jour est finie.", "Une tache de café."], ["tâche", "tache"], [
    ["Il y a une ___ de café sur ta chemise.", "tache"],
    ["Ma ___ du jour est terminée.", "tâche"],
    ["Quelle ___ difficile !", "tâche"],
    ["Elle a nettoyé la ___ sur la nappe.", "tache"],
    ["Il a accompli sa ___ avec soin.", "tâche"]]);

R("h_davantage", C_HOM, "davantage / d'avantage",
  "« davantage » (en un mot) signifie plus. « d'avantage » (en deux mots) est « de » + le nom avantage.",
  "Remplace par « plus (de) » : « davantage ». Si c'est le nom « avantage » : « d'avantage ».",
  ["Il faut davantage de patience.", "Cette offre a beaucoup d'avantages."], null, [
    ["Il faut ___ de patience.", "davantage"],
    ["Cette offre présente beaucoup ___ .", "d'avantages"],
    ["Je voudrais ___ de temps.", "davantage"],
    ["Quel est l'___ de cette méthode ?", "avantage"]]);

R("h_dans", C_HOM, "dans / d'en",
  "« dans » indique le lieu, le temps ou la manière. « d'en » = de + en, devant un verbe à l'infinitif.",
  "Si un infinitif suit, écris « d'en ».",
  ["Il arrive dans une heure.", "Il a décidé d'en parler."], ["dans", "d'en"], [
    ["Il est temps ___ finir.", "d'en"],
    ["Il arrive ___ une heure.", "dans"],
    ["Elle a décidé ___ parler.", "d'en"],
    ["Range-le ___ le tiroir.", "dans"],
    ["N'oublie pas ___ prendre.", "d'en"]]);

R("h_avenir", C_HOM, "avenir / à venir",
  "« l'avenir » est un nom, précédé d'un déterminant. « à venir » suit un verbe ou un groupe nominal.",
  "Un déterminant devant : « avenir ». Un verbe ou un nom avant : « à venir ».",
  ["L'avenir dira.", "Les mois à venir."], ["avenir", "à venir"], [
    ["Pense ___ chercher le courrier.", "à venir"],
    ["L'___ dira si j'ai raison.", "avenir"],
    ["Les années ___ seront chargées.", "à venir"],
    ["N'hésite pas ___ me voir.", "à venir"],
    ["Elle croit en son ___ .", "avenir"]]);

R("h_affaire", C_HOM, "avoir affaire à / avoir à faire",
  "« avoir affaire à » signifie être en rapport avec quelqu'un. « avoir à faire » = devoir accomplir.",
  "Remplace par « être en rapport avec » : « affaire à ». Remplace par « avoir à réaliser » : « à faire ».",
  ["Tu as affaire à un expert.", "J'ai du travail à faire."], ["affaire", "à faire"], [
    ["Il a du travail ___ .", "à faire"],
    ["Tu as ___ à un expert.", "affaire"],
    ["Rien ___ , c'est trop tard.", "à faire"],
    ["Nous avons ___ à un client exigeant.", "affaire"],
    ["J'ai beaucoup ___ cette semaine.", "à faire"]]);

R("h_notre", C_HOM, "notre / nôtre, votre / vôtre",
  "Sans article devant : « notre, votre » (déterminant). Après « le, la, les » : « nôtre, vôtre » avec un accent circonflexe.",
  "Un nom suit : pas d'accent. « le / la / les » avant : accent.",
  ["Notre voiture est là.", "La vôtre est ici."], ["notre", "nôtre", "nôtres", "votre", "vôtre", "vôtres"], [
    ["___ voiture est en panne.", "notre"],
    ["Ce n'est pas le vôtre, c'est le ___ .", "nôtre"],
    ["Voici ___ adresse.", "votre"],
    ["Madame, ces clés sont les ___ .", "vôtres"],
    ["Ton avis vaut bien le ___ .", "nôtre"]]);

R("h_leur", C_HOM, "leur / leurs",
  "Devant un verbe, « leur » est invariable (je leur parle). Devant un nom, il s'accorde : « leur » (singulier) ou « leurs » (pluriel).",
  "Devant un verbe : toujours « leur ». Devant un nom pluriel : « leurs ».",
  ["Je leur parle.", "Ils aiment leurs chiens."], ["leur", "leurs"], [
    ["Je ___ parle demain.", "leur"],
    ["Ils aiment ___ chiens.", "leurs"],
    ["Elle ___ a écrit hier.", "leur"],
    ["Ils ont perdu ___ clés.", "leurs"],
    ["Les enfants et ___ parents arrivent.", "leurs"]]);

R("h_ca", C_HOM, "ça / çà / sa",
  "« ça » = cela (sans accent). « çà » ne reste que dans « çà et là ». « sa » est le possessif féminin.",
  "Remplace par « cela » : « ça ». Un nom féminin suit : « sa ».",
  ["Ça va ?", "Sa voiture.", "Çà et là."], ["ça", "çà", "sa"], [
    ["___ va ?", "ça"],
    ["Elle range ___ chambre.", "sa"],
    ["Des papiers traînent ___ et là.", "çà"],
    ["Je n'aime pas ___ .", "ça"],
    ["C'est ___ , la vie !", "ça"]]);

const C_VERB = "Terminaisons des verbes";

R("v_nt", C_VERB, "Ils chantent : -nt",
  "À la 3e personne du pluriel, le verbe se termine par -nt (ils chantent), jamais par un s.",
  "Mets la phrase à l'imparfait : « ils chantaient ». La terminaison reste en -nt.",
  ["Les oiseaux chantent.", "Elles arrivent demain."], null, [
    ["Les oiseaux ___ (chanter) dès l'aube.", "chantent"],
    ["Mes voisins ___ (rentrer) tard.", "rentrent"],
    ["Les enfants ___ (jouer) dehors.", "jouent"],
    ["Elles ___ (arriver) demain.", "arrivent"],
    ["Ces fleurs ___ (sentir) bon.", "sentent"],
    ["Les experts ___ (estimer) les dégâts.", "estiment"]]);

R("v_s2", C_VERB, "Tu manges : s à la 2e personne",
  "À la 2e personne du singulier, le verbe prend un s (tu manges, tu mangeras). Exceptions : tu peux, tu veux, tu vaux, et l'impératif.",
  "Pose-toi la question : le sujet est « tu » ? Alors la terminaison est en s (ou x pour peux, veux).",
  ["Tu manges. Tu arriveras tôt."], null, [
    ["Tu ___ (parler) trop vite.", "parles"],
    ["Tu ___ (finir) quand ?", "finis"],
    ["Si tu ___ (pouvoir), viens.", "peux"],
    ["Demain, tu ___ (arriver) tôt.", "arriveras"],
    ["Tu ___ (vouloir) du thé ?", "veux"],
    ["Tu te ___ (présenter) lundi.", "présenteras"]]);

R("v_peux", C_VERB, "Je peux / il peut",
  "Le t est la marque de la 3e personne (il peut). Avec « je » et « tu », on écrit peux (et veux).",
  "Regarde le sujet : « il / elle / on » → t ; « je / tu » → x.",
  ["Je peux venir.", "Il peut venir."], null, [
    ["Je ne ___ (pouvoir) pas venir.", "peux"],
    ["Il ___ (pouvoir) neiger demain.", "peut"],
    ["Elle ne ___ (pouvoir) pas rester.", "peut"],
    ["Tu ___ (pouvoir) m'aider ?", "peux"],
    ["Je ___ (vouloir) bien t'aider.", "veux"],
    ["Il ___ (vouloir) partir.", "veut"]]);

R("v_imparfait", C_VERB, "Imparfait : je savais / il savait",
  "À l'imparfait, « je » et « tu » prennent -ais ; « il, elle, on » prennent -ait.",
  "Cherche le sujet du verbe : singulier de la 1re ou 2e personne → s ; 3e personne → t.",
  ["Je savais. Tu savais. Il savait."], null, [
    ["Je ___ (savoir) la réponse.", "savais"],
    ["Avant, tu ___ (finir) tôt.", "finissais"],
    ["Il ___ (aimer) lire le soir.", "aimait"],
    ["Quand j'___ (avoir) dix ans, je jouais dehors.", "avais"],
    ["Tu ___ (croire) tout ce qu'on te disait.", "croyais"],
    ["Elle ___ (vouloir) toujours gagner.", "voulait"]]);

R("v_nous", C_VERB, "Nous chantons : -ons",
  "À la 1re personne du pluriel, la terminaison est toujours -ons (nous jouons). « -ont » est réservé à « ils ».",
  "Si le sujet est « nous », la terminaison est -ons.",
  ["Nous chantons.", "Nous finirons demain."], null, [
    ["Nous ___ (chanter) ensemble.", "chantons"],
    ["Nous ___ (finir) demain.", "finirons"],
    ["Nous nous ___ (amuser) bien.", "amusons"],
    ["Nous ___ (manger) ici ce soir.", "mangeons"],
    ["Nous ___ (recevoir) ta lettre chaque lundi.", "recevons"]]);

R("v_er_e", C_VERB, "-é ou -er",
  "Infinitif : -er (parler). Participe passé : -é (parlé), qui s'accorde si besoin.",
  "Remplace par un verbe du 3e groupe (vendre, prendre) : si on dit « vendre », c'est -er ; si on dit « vendu », c'est -é.",
  ["Il veut manger.", "Elle a mangé."], null, [
    ["Elle a ___ (manger) tout le gâteau.", "mangé"],
    ["Il veut ___ (manger) maintenant.", "manger"],
    ["Nous avons ___ (travailler) hier soir.", "travaillé"],
    ["Il va ___ (travailler) demain.", "travailler"],
    ["Le dossier est ___ (classer).", "classé"],
    ["Il faut ___ (appeler) le médecin.", "appeler"],
    ["La porte a été ___ (fermer) à clé.", "fermée"]]);

R("v_endre", C_VERB, "Il prend : d aux verbes en -dre",
  "À la 3e personne du singulier, les verbes en -dre gardent le d (il prend, il répond, il attend).",
  "Pense à l'infinitif : prendre → il prend ; défendre → il défend.",
  ["Il prend le train.", "Elle répond vite."], null, [
    ["Il ___ (prendre) le train de huit heures.", "prend"],
    ["Elle ___ (comprendre) vite.", "comprend"],
    ["Le magasin ne ___ (reprendre) pas les articles.", "reprend"],
    ["Il ne ___ (répondre) jamais.", "répond"],
    ["Ça ___ (dépendre) du temps.", "dépend"],
    ["Il ___ (attendre) le bus.", "attend"]]);

R("v_imper", C_VERB, "Impératif : pas de s à mange",
  "À l'impératif, 2e personne du singulier, les verbes en -er n'ont pas de s (mange). Un s apparaît devant en ou y (manges-en, vas-y). Aller fait « va » ; avoir fait « aie ».",
  "Pas de « tu » exprimé ? C'est l'impératif : pas de s (sauf devant en ou y).",
  ["Mange ta soupe.", "Va au marché.", "N'aie pas peur."], null, [
    ["___ (manger) ta soupe !", "mange"],
    ["___ (aller) chercher du pain !", "va"],
    ["N'___ (avoir) pas peur !", "aie"],
    ["Ne ___ (rester) pas là !", "reste"],
    ["Le train part : ___-y vite ! (aller)", "vas"],
    ["Tu as des bonbons : ___-en à ton frère. (donner)", "donnes"]]);

R("v_envoyer", C_VERB, "J'envoie : -e au présent",
  "« envoyer » est un verbe du 1er groupe : j'envoie, tu envoies, il envoie. Le nom « envoi » n'a pas de e.",
  "Un verbe du 1er groupe prend -e à la 1re personne (j'aime → j'envoie).",
  ["J'envoie un message.", "Un envoi rapide."], null, [
    ["Je vous ___ (envoyer) le dossier.", "envoie"],
    ["Tu m'___ (envoyer) un message ?", "envoies"],
    ["Elle ___ (envoyer) un courriel.", "envoie"],
    ["Nous ___ (envoyer) le colis lundi.", "envoyons"],
    ["J'___ (envoyer) la lettre demain.", "envoie"],
    ["Le tarif de l'___ (nom) dépend du poids.", "envoi"]]);

R("v_ier", C_VERB, "-ions / -iions : verbes en -ier",
  "Aux 1re et 2e personnes du pluriel, les verbes en -ier et -yer ont deux i à l'imparfait et au subjonctif (nous vérifiions, que vous envoyiez). Au présent : un seul i (nous vérifions).",
  "Imparfait ou subjonctif ? Deux i. Présent ? Un seul i.",
  ["Nous vérifions. Hier, nous vérifiions."], null, [
    ["Nous ___ (vérifier) toujours deux fois.", "vérifions"],
    ["Hier, nous ___ (vérifier) les comptes.", "vérifiions"],
    ["Il faut que vous ___ (envoyer) ce courrier.", "envoyiez"],
    ["Quand nous ___ (étudier) ensemble, tout allait mieux.", "étudiions"],
    ["Vous ___ (oublier) toujours vos clés.", "oubliez"],
    ["Il faut que nous ___ (oublier) cette histoire.", "oubliions"]]);

R("v_futcond", C_VERB, "Futur -rai / conditionnel -rais",
  "Futur : je ferai (-rai). Conditionnel : je ferais (-rais). Le conditionnel exprime une hypothèse ou un futur dans le passé.",
  "Remplace « je » par « il » : futur → il fera ; conditionnel → il ferait.",
  ["Demain, je ferai les courses.", "Si j'avais le temps, je ferais du sport."], null, [
    ["Demain, je ___ (faire) les courses.", "ferai"],
    ["Si j'avais le temps, je ___ (faire) du sport.", "ferais"],
    ["Je vous ___ (appeler) ce soir.", "appellerai|appèlerai"],
    ["Il m'a dit qu'il ___ (venir) lundi.", "viendrait"],
    ["Un jour, je ___ (visiter) Rome.", "visiterai"],
    ["Si tu me le demandais, je te ___ (prêter) ma voiture.", "prêterais"]]);

R("v_apresque", C_VERB, "Après que + indicatif",
  "Après « après que », on emploie l'indicatif (temps composé) : après qu'il est parti. Le subjonctif est fautif ici.",
  "« Après que » parle d'un fait accompli : temps composé de l'indicatif.",
  ["Après qu'il est parti, nous avons mangé."], null, [
    ["Après qu'il ___ (partir), nous avons mangé.", "est parti"],
    ["Après que nous ___ (finir), il a plu.", "avons fini"],
    ["Après qu'elle ___ (sortir), le calme est revenu.", "est sortie"],
    ["Après qu'ils ___ (manger), ils sont partis.", "ont mangé"],
    ["Après que vous ___ (rentrer), on dînera.", "serez rentrés"]]);

R("v_sifutur", C_VERB, "Après si : pas de futur",
  "Après « si », on n'emploie ni futur ni conditionnel. Si + présent → futur ; si + imparfait → conditionnel.",
  "Regarde la proposition avec « si » : présent ou imparfait seulement.",
  ["Si tu viens, je serai là.", "Si je pouvais, je viendrais."], null, [
    ["Si tu viens, je te ___ (montrer) ma maison.", "montrerai"],
    ["S'il pleut, nous ___ (rester) ici.", "resterons"],
    ["Si elle ___ (savoir), elle te le dirait.", "savait"],
    ["Si vous ___ (venir) demain, je serai là.", "venez"],
    ["Si j'___ (avoir) le temps, je lirais davantage.", "avais"]]);

R("v_teuph", C_VERB, "Le t de a-t-il, va-t'en",
  "On ajoute un t entre deux traits d'union quand le verbe finit par une voyelle et que « il, elle, on » suit (a-t-il, aime-t-elle). Dans « va-t'en », c'est un t suivi d'une apostrophe.",
  "Le verbe finit par a, e ou c'est un impératif réfléchi ? Pense au t.",
  ["A-t-il fini ?", "Va-t'en !"], null, [
    ["A-___-il fini ?", "t"],
    ["Aime-___-elle le thé ?", "t"],
    ["Pourra-___-on venir ?", "t"],
    ["Va-___'en !", "t"],
    ["Y a-___-il du pain ?", "t"]]);

/* ===================== ACCORDS ===================== */
const C_ACC = "Accords";

R("a_plupart", C_ACC, "La plupart des... sont",
  "Avec « la plupart de + nom pluriel », le verbe est au pluriel (la plupart des élèves sont). Avec un nom singulier, il reste au singulier (la plupart du temps est perdu).",
  "Regarde le complément de « la plupart » : pluriel → pluriel ; singulier → singulier.",
  ["La plupart des élèves sont présents."], null, [
    ["La plupart des élèves ___ (être) présents.", "sont"],
    ["La plupart des livres ___ (avoir) été lus.", "ont"],
    ["La plupart du temps ___ (être) perdu.", "est"],
    ["La plupart des invités ___ (arriver) tôt.", "arrivent"]]);

R("a_pp_etre", C_ACC, "Participe passé avec être",
  "Avec l'auxiliaire être, le participe passé s'accorde avec le sujet.",
  "Trouve le sujet, accorde en genre et en nombre.",
  ["Elle est arrivée. Ils sont partis."], null, [
    ["Elle est ___ (arriver) hier.", "arrivée"],
    ["Ils sont ___ (partir) tôt.", "partis"],
    ["Les filles sont ___ (tomber).", "tombées"],
    ["Elles se sont ___ (lever) tôt.", "levées"],
    ["Ma sœur est ___ (rester) à la maison.", "restée"]]);

R("a_pp_avoir", C_ACC, "Participe passé avec avoir",
  "Avec avoir, le participe ne s'accorde pas avec le sujet. Il s'accorde seulement avec le complément d'objet direct placé avant le verbe.",
  "Cherche le COD (« quoi ? »). Il est avant le verbe ? Accorde. Sinon : invariable.",
  ["Les photos que j'ai prises.", "J'ai pris des photos."], null, [
    ["Les photos que j'ai ___ (prendre) sont belles.", "prises"],
    ["Elle a ___ (écrire) une lettre.", "écrit"],
    ["La lettre qu'elle a ___ (écrire) est longue.", "écrite"],
    ["Les fleurs, il les a ___ (acheter) ce matin.", "achetées"],
    ["Ils ont ___ (voir) la mer.", "vu"]]);

R("a_faire_inf", C_ACC, "Fait + infinitif : invariable",
  "Quand « faire » est suivi d'un infinitif, son participe « fait » reste invariable (elle s'est fait couper les cheveux).",
  "« Fait » devant un infinitif ne s'accorde pas.",
  ["Elle s'est fait couper les cheveux."], null, [
    ["Elle s'est ___ (faire) couper les cheveux.", "fait"],
    ["Ils se sont ___ (faire) réparer la voiture.", "fait"],
    ["Les gâteaux qu'elle a ___ (faire) cuire sentent bon.", "fait"],
    ["Il les a ___ (faire) venir.", "fait"]]);

R("a_tout", C_ACC, "Tout / toute / tous",
  "« tout » adverbe (= tout à fait) est invariable, sauf devant un adjectif féminin commençant par une consonne : toute petite, mais tout étonnée. Devant un nom pluriel : « tous » ou « toutes ».",
  "Un nom pluriel suit (« tous les... ») ? Écris tous. Un adjectif suit ? Adverbe : tout (toute devant un féminin à consonne).",
  ["Tous les matins.", "Elle est toute petite.", "Elle est tout étonnée."], null, [
    ["___ les matins, il court.", "tous"],
    ["Elle est ___ petite.", "toute"],
    ["Il est ___ seul.", "tout"],
    ["Elle est ___ étonnée.", "tout"],
    ["Elle est ___ contente.", "toute"]]);

R("a_couleurs", C_ACC, "Couleurs composées",
  "Les couleurs formées avec un nom (orange, marron) ou composées (bleu clair, vert pomme) sont invariables. Exceptions : rose, mauve, pourpre, écarlate, fauve, vermeil.",
  "C'est un nom employé comme couleur, ou deux mots ? Invariable. C'est « rose » ? Il s'accorde.",
  ["Des chaussures marron.", "Des robes bleu clair.", "Des fleurs roses."], null, [
    ["Elle a des chaussures ___ . (marron)", "marron"],
    ["Des chaussettes ___ . (orange)", "orange"],
    ["Des robes ___ . (bleu clair)", "bleu clair"],
    ["Des rideaux ___ . (vert pomme)", "vert pomme"],
    ["Des murs ___ . (blanc cassé)", "blanc cassé"],
    ["Des fleurs ___ . (rose)", "roses"]]);

R("a_nombres", C_ACC, "Vingt, cent, mille",
  "« vingt » et « cent » prennent un s quand ils sont multipliés et en fin de nombre (quatre-vingts, deux cents), mais pas s'ils sont suivis d'un autre nombre (quatre-vingt-trois, deux cent dix). « mille » est invariable.",
  "Un autre nombre suit ? Pas de s. Rien ne suit, ou un nom ? s (sauf mille).",
  ["Quatre-vingts personnes.", "Deux cent dix euros."], null, [
    ["200 euros s'écrit : deux ___ euros.", "cents"],
    ["80 personnes s'écrit : quatre-___ personnes.", "vingts"],
    ["283 s'écrit : deux cent quatre-___-trois.", "vingt"],
    ["3 000 s'écrit : trois ___ .", "mille"],
    ["220 s'écrit : deux cent ___ .", "vingt"]]);

R("a_demi", C_ACC, "Demi / demie",
  "Devant un nom, avec un trait d'union, « demi » est invariable (une demi-heure). Après le nom, il s'accorde en genre (une heure et demie).",
  "Avant le nom : demi. Après le nom : accord en genre.",
  ["Une demi-heure.", "Une heure et demie."], null, [
    ["Une ___-heure s'est écoulée.", "demi"],
    ["Il est trois heures et ___ .", "demie"],
    ["Un ___-litre d'eau, s'il vous plaît.", "demi"],
    ["Une heure et ___ , c'est long.", "demie"],
    ["Elle a bu une ___-bouteille.", "demi"]]);

R("a_meme", C_ACC, "Même / mêmes",
  "« même » devant un nom s'accorde en nombre (les mêmes idées). Avec un pronom, il prend un trait d'union et s'accorde (elles-mêmes).",
  "Pluriel du nom ou du pronom ? Mets le s à même.",
  ["Les mêmes idées.", "Elles-mêmes."], null, [
    ["Les ___ erreurs reviennent.", "mêmes"],
    ["Elles-___ l'ont dit.", "mêmes"],
    ["Il l'a fait lui-___ .", "même"],
    ["Ce sont les ___ idées.", "mêmes"]]);

R("a_cijoint", C_ACC, "Ci-joint / ci-jointe",
  "« ci-joint » est invariable en début de phrase ou devant un nom sans article. Placé après le nom, il s'accorde (la facture ci-jointe).",
  "Devant le nom ou en tête de phrase : invariable. Après le nom : accord.",
  ["Veuillez trouver ci-joint la facture.", "La facture ci-jointe."], null, [
    ["Veuillez trouver ci-___ la facture.", "joint"],
    ["Ci-___ les justificatifs.", "joint"],
    ["Les documents ci-___ sont à signer.", "joints"],
    ["La lettre ci-___ est datée de mai.", "jointe"]]);

R("a_te", C_ACC, "Qualité, amitié : pas de e",
  "Les noms féminins en -té et -tié n'ont pas de e final (qualité, amitié). Exceptions : dictée, jetée, montée, portée, butée, pâtée, et les contenus (assiettée).",
  "Un nom féminin en -té/-tié : pas de e, sauf liste d'exceptions.",
  ["La qualité.", "Une dictée."], null, [
    ["La qualit___ est bonne.", "é"],
    ["L'amiti___ est précieuse.", "é"],
    ["La difficult___ est grande.", "é"],
    ["Il a écrit une dict___ .", "ée"],
    ["La mont___ est raide.", "ée"],
    ["Quelle beaut___ !", "é"]]);

/* ===================== MOTS ET LOCUTIONS ===================== */
const C_MOT = "Mots et locutions";

R("m_x", C_MOT, "x final : mieux, connexion",
  "« mieux » prend toujours un x. « connexion » prend un x, malgré « connecter » (une connexion est un croisement).",
  "Mieux, c'est mieux avec un x. Une connexion se croise : x.",
  ["Il va mieux.", "Une connexion Internet."], null, [
    ["Tu vas ___ , maintenant ?", "mieux"],
    ["La ___ Internet est coupée.", "connexion"],
    ["Il chante ___ que moi.", "mieux"],
    ["La ___ au réseau est lente.", "connexion"]]);

R("m_muet", C_MOT, "Lettres muettes et finales",
  "Cauchemar : pas de d final. Langage : pas de u. Malgré : jamais de s. Parmi : pas de s. Hormis : avec s.",
  "Cauchemar (pas de d), langage (pas de u), malgré et parmi (pas de s), hormis (s).",
  ["Un cauchemar.", "Malgré la pluie."], null, [
    ["Il a fait un horrible ___ cette nuit. (mauvais rêve)", "cauchemar"],
    ["Le ___ des signes est une langue visuelle.", "langage"],
    ["Il est sorti ___ la pluie.", "malgré"],
    ["Tout le monde est venu, ___ Paul.", "hormis"],
    ["Il est ___ les premiers.", "parmi"]]);

R("m_doubles", C_MOT, "Lettres doubles piégeuses",
  "Dilemme : deux m. Développer : un seul l et deux p. Occurrence : deux r. Acompte : un seul c. Rémunérer : « mun » avant « nér ». Intéresser : deux s.",
  "Une lettre double se mémorise par le mot lui-même : pense au piège du mot.",
  ["Un dilemme.", "En l'occurrence."], null, [
    ["Il est face à un ___ : rester ou partir.", "dilemme"],
    ["Le ___ de la ville est rapide.", "développement"],
    ["Il y a un oubli ; ___ , c'est une erreur de date.", "en l'occurrence"],
    ["Il a versé un ___ de 20 %.", "acompte"],
    ["Il faut ___ ce travail à sa juste valeur.", "rémunérer"],
    ["Cette lecture va t'___ .", "intéresser"]]);

R("m_magasin", C_MOT, "Magasin / magazine",
  "Un magasin est une boutique (avec s). Un magazine est une revue (avec z).",
  "On achète dans un magasin ; on lit un magazine.",
  ["Le magasin ferme.", "Un magazine de cuisine."], null, [
    ["Le ___ ferme à 19 h.", "magasin"],
    ["Elle lit un ___ de cuisine.", "magazine"],
    ["Ce ___ de jouets est ouvert le dimanche.", "magasin"]]);

R("m_exig", C_MOT, "Exigeant / exigence",
  "L'adjectif s'écrit exigeant (exigeante, exigeants) : e puis a. Le nom s'écrit exigence, sans a.",
  "Adjectif : -eant. Nom : -ence.",
  ["Un professeur exigeant.", "Ses exigences."], null, [
    ["Mon professeur est très ___ .", "exigeant"],
    ["Cette cliente est ___ .", "exigeante"],
    ["Ses ___ sont élevées.", "exigences"],
    ["Ils sont ___ sur la qualité.", "exigeants"]]);

R("m_loc", C_MOT, "Locutions : bien sûr, eh bien, soi-disant",
  "Bien sûr : deux mots. Eh bien : eh, pas « et ». Soi-disant : avec un trait d'union, invariable. Sens dessus dessous : sens, pas sans. Auparavant : un seul mot.",
  "Chaque locution s'apprend d'un bloc.",
  ["Bien sûr !", "Eh bien, allons-y."], null, [
    ["___ , je viendrai !", "bien sûr"],
    ["___ bien, allons-y !", "eh"],
    ["Ce ___ expert s'est trompé.", "soi-disant"],
    ["La pièce est ___ .", "sens dessus dessous"],
    ["Je suis passé ___ , mais tu étais absent.", "auparavant"],
    ["Il est ___ jeune, mais sérieux.", "certes"]]);

R("m_parti", C_MOT, "Parti / partie : locutions",
  "Prendre parti : choisir un camp. Tirer parti : profiter de. Prendre à partie : s'en prendre à quelqu'un. Faire partie de : être membre.",
  "Choisir un camp ou profiter : parti. S'attaquer à quelqu'un ou être membre : partie.",
  ["Il refuse de prendre parti.", "Il fait partie de l'équipe."], null, [
    ["Il refuse de prendre ___ .", "parti"],
    ["La foule a pris l'arbitre à ___ .", "partie"],
    ["Elle sait tirer ___ de chaque situation.", "parti"],
    ["Il fait ___ de l'équipe.", "partie"]]);

R("m_fab", C_MOT, "Fabricant, diagnostic",
  "« fabricant » est un nom. « fabriquant » est un participe présent (en fabriquant). « diagnostic » est un nom ; « diagnostique » est la forme du verbe diagnostiquer.",
  "Un nom ? -cant et -tic. Un verbe ? -quant et -que.",
  ["Le fabricant.", "En fabriquant."], null, [
    ["Le ___ de ces jouets est français.", "fabricant"],
    ["Il s'est blessé en ___ cette machine.", "fabriquant"],
    ["Le médecin a posé son ___ .", "diagnostic"],
    ["Ce médecin ___ souvent des allergies.", "diagnostique"]]);

R("m_cedille", C_MOT, "c / ç : la cédille",
  "Devant a, o, u, la lettre c prend une cédille pour garder le son [s] (ça, leçon, reçu). Devant e ou i, pas de cédille.",
  "Le son [s] devant a, o ou u ? Cédille.",
  ["Nous commençons.", "Un garçon."], null, [
    ["Nous commen___ons.", "ç"],
    ["Il re___oit un colis.", "ç"],
    ["Une le___on de français.", "ç"],
    ["Il commen___e demain.", "c"],
    ["Un gar___on.", "ç"]]);

R("m_abbr", C_MOT, "M., MM., Mme, Mmes",
  "Monsieur s'abrège M. ; messieurs : MM. ; madame : Mme ; mesdames : Mmes. Jamais « Mr ».",
  "Pas de Mr en français.",
  ["M. Dupont.", "MM. Durand et Martin."], null, [
    ["Abrège « monsieur » : ___", "M."],
    ["Abrège « messieurs » : ___", "MM."],
    ["Abrège « madame » : ___", "Mme"],
    ["Abrège « mesdames » : ___", "Mmes"]]);

export const RMAP: Record<string, Rule> = Object.fromEntries(RULES.map((r) => [r.id, r]));
export const ITEMS: Record<string, Item> = Object.fromEntries(RULES.flatMap((r) => r.items.map((i) => [i.id, i])));
export const CATS: string[] = [...new Set(RULES.map((r) => r.cat))];
