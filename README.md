# Castel Actu : maquette « La Une vivante »

Maquette du futur site de Castel Actu, média local, indépendant et associatif du Pays de Châteaubriant.
Site statique (HTML, CSS, JavaScript) prêt pour Vercel, sans étape de construction : les pages sont générées avant chaque livraison.

Adresse prévue : https://castelactu-maquette.vercel.app

## Pages de la v1

| Page | Adresse | Modèle |
|---|---|---|
| Accueil | `/` | Une, fil filtrable, communes, plus lus, vidéo et podcast, chantiers, Alertez-nous, 10 ans |
| Travaux et projets | `/rubriques/travaux-et-projets` | rubrique |
| Central 8 | `/articles/central-8` | article |
| Vidéos et podcasts | `/videos-et-podcasts` | médias |
| Alertez-nous | `/alertez-nous` | formulaire en 4 étapes |
| Qui sommes-nous | `/qui-sommes-nous` | association |
| Mentions légales | `/mentions-legales` | légal |
| Page introuvable | `/404` | 404 |

Prévu en v2 (mêmes modèles, images Grok déjà fournies) : les 13 autres rubriques (Actualité, Commerces, Économie, Sport, Événements, Culture, Faits divers, Association, Médias, People, High-tech, Bons plans, Emploi), les 24 autres brèves en page article, la page Confidentialité.

## Travailler sur la maquette

```
node outils/generer.mjs          pages HTML générées depuis donnees/ et source/
node outils/images-partage.mjs   images de partage 1200×630 (assets/partage/)
python3 outils/images.py recu/lot-site.json   conversion des images en WebP
node _audit/audit.mjs            audit standard (--rapide, --complet)
```

- Textes : `donnees/textes/fr.json`. Brèves : `donnees/articles.json`. Rubriques, communes, alerte, podcasts : `donnees/*.json`.
- Le bandeau d'alerte se règle dans `donnees/alerte.json` (`"active": true` et le texte de l'alerte) : il passe au rouge sur toutes les pages.
- Ne jamais modifier à la main les pages générées (`index.html`, `rubriques/…`, `articles/…`).
- Effets propres au projet : `assets/js/site.js` (rotative, impression, ruban-alerte, radar-communes, coupures, frise-chantiers, tampon-10-ans, onde-podcast). Style : `assets/css/site.css`.

## À fournir par Castel Actu

- Adresse du siège et e-mail à confirmer ; chiffre d'audience à confirmer.
- Dates de publication et textes complets des brèves ; dates d'ouverture annoncées à confirmer (Central 8, Le Smas'h, Crédit Mutuel, supérette de Treffieux).
- Les rubriques sans brève (Faits divers, Association, Médias, People, High-tech, Bons plans, Emploi) sont annoncées « Bientôt » : elles apparaissent dès qu'une brève y est rangée dans `donnees/articles.json`.
- Fichiers audio des podcasts « En bref », lien du direct, présentation de Castel FM.
- Portrait du fondateur, photo de Central 8.
- Droits des photos tierces et des perspectives de projets.
- Politique de confidentialité, modalités d'adhésion, de don et de bénévolat.

## À la mise en ligne définitive

À retirer :
- la consigne `noindex` : balise robots dans `source/gabarits/commun.mjs` et en-tête `X-Robots-Tag` dans `vercel.json` ;
- les formulaires simulés (Alertez-nous) : à brancher sur un vrai envoi ;
- les mentions « à compléter », une fois les informations fournies ;
- la phrase « Maquette » du pied de page (`commun.maquette`).

À garder :
- la mention « Illustration générée » sur toutes les images créées par IA (Grok et illustrations ChatGPT), vignettes comprises ;
- les crédits des mentions légales.
