# Castel Actu — maquette v3

Maquette du futur site de Castel Actu, média local, indépendant et associatif du Pays de Châteaubriant.
Site statique (HTML, CSS, JavaScript), sans étape de construction, prêt pour Vercel.

Direction artistique « Rotative » : papier journal, deux encres tirées du logo (bleu Castel, rouge alerte),
trame d'impression sur les photos, titres Archivo à largeur variable, textes Newsreader.

## Nouveautés de la v3 (audit des effets et transitions)

- Plus aucun éclair au chargement : ce qui est visible à l'ouverture est animé en CSS dès la première image
  (la rotative, la Une, les entrées de l'article, le rideau d'arrivée). Le JavaScript prend le relais ensuite.
- La rotative ne dépend plus du chargement du script : elle reste fluide même si la page charge lentement.
- Changement de page : le rideau couvre la nouvelle page dès son premier affichage, puis s'efface.
- Changement d'article (« À lire aussi ») : la page tourne et le nouvel article arrive en haut.
- Lien direct vers une section (index.html#agenda, menu depuis une autre page) : corrige une erreur qui bloquait
  les animations et l'arrivée au mauvais endroit.
- Grands sauts dans la page (menu, en-tête) : passage sous le rideau au lieu d'un long défilement.
- Filtres : les cartes ne disparaissent plus pour réapparaître une seconde fois.
- Photos imprimées (WebGL) : plaque d'impression puis trame puis couleur, sans passage par une image pâle ;
  le compte-fils ne suit plus le doigt pendant le défilement sur téléphone.
- Titre du journal et du pied de page dimensionnés en CSS (plus de saut de taille au chargement).
- Formulaire : feuillets qui glissent l'un sur l'autre sans trou, double clic sans effet.
- Menu téléphone : volet qui se déroule et se referme. Filets des titres qui se tracent avec le titre.

## Nouveautés de la v2 (audit complet)

- La Une sort de presse : la photo passe de la trame d'impression à la couleur dès l'ouverture, sans attendre le défilement.
- Compte-fils d'imprimeur au survol (ou au doigt) : une loupe grossit la photo et fait réapparaître la trame.
- « À la une aussi » en rangée de trois sous la Une ; la photo occupe toute la hauteur de la colonne.
- Recherche accessible depuis l'en-tête sur toutes les pages ; libellé « Mode calme » visible sur grand écran.
- Rubriques vides grisées en fin de liste ; sur téléphone, les rubriques défilent sur une seule ligne.
- Carte des communes : étiquettes placées sans chevauchement et lisibles de 320 px au grand écran.
- Vidéo : la carte mène à la page Facebook. Qui sommes-nous : citation sur photo, portrait recadré.
- Envoyer une info : déroulé en trois étapes sous le formulaire, colonne latérale fixe.
- Corrections : traits de coupe supprimés, ponctuation qui ne passe plus seule à la ligne, débordement de la lettre d'info,
  contraste des mentions « à compléter », zones tactiles de 44 px, barre de lecture en haut de l'article,
  logo Central 8 affiché en entier.

## Pages

- `index.html` : la Une, l'audience, le fil filtrable (rubrique, commune, recherche), la carte des 11 communes,
  les chantiers (galerie horizontale épinglée), les plus lus, le podcast et la vidéo, l'agenda, qui sommes-nous, l'appel à envoyer une info.
- `article.html#identifiant` : fiche article type. Le même gabarit affiche chaque info (ex. `article.html#le-smash`).
- `envoyer-une-info.html` : formulaire en 5 étapes (simulé, rien n'est envoyé) et mini-Une composée à la fin.
- `404.html` : page introuvable.

## Mettre à jour le contenu

Tout le contenu dynamique est dans **`assets/js/data.js`** : articles, rubriques, communes, audience, agenda, podcast, alerte.

- Une alerte : remplacer `export const ALERTE = null;` par `{ titre: '…', texte: '…' }`.
- Une échéance (`echeance.fin`) dépassée bascule seule en « Échéance passée ». Un événement terminé s'affiche « Terminé ».
- Une image générée par IA doit garder `ia: true` (mention « Illustration IA », AI Act art. 50).

Après toute modification de CSS ou JS, **augmenter le numéro `?v=N`** partout (pages HTML, `modulepreload`,
`import` des modules et `import('./halftone.js?v=N')`), à l'identique, sinon les visiteurs gardent l'ancienne version.

## Images

- `img/articles`, `img/agenda`, `img/equipe`, `img/logo` : images du site actuel, en WebP 480/960/1600.
- `img/grok` : images générées avec Grok (ambiances uniquement, jamais de lieu réel).
- `img/articles/voirie-d771-*` : visuel provisoire, photo à fournir.
- Pour remplacer une image : garder le même nom de fichier.

## À compléter par le client

- Dates de publication des articles (le site actuel n'en affiche aucune).
- Textes complets des articles, chapôs manquants.
- Sources de plusieurs visuels (Ville Marie, JMT, rue du Château, Jardins du Château, piscine).
- Date du relevé d'audience ; correspondance des compteurs de vues avec les articles (à confirmer).
- Lien de la chaîne YouTube, présentation de Castel FM, contenu Météo.
- Fichiers audio du podcast : `audio/info-en-bref-economie.mp3`, `audio/info-en-bref-evenement.mp3`.
- Dates de la prochaine Foire de Béré, affiche Théâtre de Verre 2026-2027.
- Modalités d'adhésion ou de don à l'association.
- Politique de confidentialité et conditions d'utilisation (obligatoires avec les formulaires).
- Délai de réponse aux infos envoyées.

## Incohérences relevées sur le site actuel

1. Trois chiffres d'audience : 1,7 million de vues/mois, 200 000 lecteurs/mois, « plus d'un million » (description Google).
2. E-mail faux dans la section Contact : `contact@CasteActu.fr` (il manque un « l »).
3. Deux adresses : « Centre ville » et « 17 rue d'Ancenis ».
4. Aucune date sur les articles ; contenu arrêté vers mi-mars 2026.
5. Emplacements vides visibles (« NOUVEAU ----- ----- », « + -- --- vues ») ; compteurs qui varient (35 441 / 35 444).
6. Images IA sans mention, dont un portrait généré du fondateur.
7. Capture Google Street View (© Google) utilisée pour Central 8 : non reprise ici.
8. « Gaetan » sur le site, « Gaëtan » sur un visuel ; « Le Smas'h » à confirmer.
9. Liens Conditions, Confidentialité et Contact qui renvoient à l'accueil.
10. « Média associatif depuis 2016 » alors que l'association est déclarée le 21/01/2026.

## À retirer pour la mise en ligne définitive

- La balise `<meta name="robots" content="noindex, nofollow">` dans chaque page.
- L'en-tête `X-Robots-Tag` dans `vercel.json`.
- La mention « Maquette de travail, non référencée » du pied de page.
- Les simulations : lettre d'info, formulaire d'envoi, exemple d'alerte (à brancher sur de vrais services).
- Mettre à jour l'hébergeur dans les mentions légales et l'adresse des images de partage (`og:image`, `og:url`).

## Technique

- GSAP 3.15 (ScrollTrigger, SplitText, Flip), Lenis 1.3, OGL 1.0 : hébergés dans `assets/vendor`.
- Polices Archivo et Newsreader en WOFF2 dans `assets/fonts` (licence OFL).
- Trame WebGL (OGL) sur les grandes photos, version CSS sans WebGL, mode calme et « réduire les animations » respectés.
- Aucune règle Cache-Control : Vercel revérifie chaque fichier à chaque visite.
