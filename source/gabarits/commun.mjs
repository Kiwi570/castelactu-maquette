/* Gabarit commun Castel Actu : head, en-tête (logo, navigation, recherche, Alertez-nous), bandeau d'alerte,
   menu, pied de page, barre fixe du téléphone, voile « rotative » et panneau d'ouverture.
   Les conventions data-* sont celles que lisent le socle JavaScript et l'audit (voir le README du socle). */
import { html, brut } from '../../outils/gabarit.mjs';

const navigation = (c) => c.site.navigation.filter((cle) => c.pages[cle] && (c.pages[cle].langues || c.langues).includes(c.l));
const logo = (largeur = 240, classe = '') => html`<img class="${classe}" src="/assets/images/logo-castelactu-${largeur}.webp" srcset="/assets/images/logo-castelactu-240.webp 240w, /assets/images/logo-castelactu-480.webp 480w, /assets/images/logo-castelactu-960.webp 960w" sizes="${Math.round(largeur / 2)}px" alt="" width="1238" height="718">`;

/* Communes et rubriques : liens vers le fil filtré de l'accueil (filtres gardés dans l'adresse). */
export const lienFil = (c, params) => c.url('accueil', 'fil', params);
/* Rubriques qui ont au moins une brève (les autres arrivent en v2 : annoncées « Bientôt », jamais en lien vide). */
export const rubriquesActives = (c) => c.donnees.rubriques.filter((r) => c.donnees.articles.some((a) => a.rubrique === r.id));
export const rubriquesAVenir = (c) => c.donnees.rubriques.filter((r) => !c.donnees.articles.some((a) => a.rubrique === r.id));
const lienRubrique = (c, r, attrs = '') => (r.page ? c.lien(r.page, { texte: r.nom }) : html`<a href="${lienFil(c, `rubrique=${r.id}`)}" data-libelle="${c.s('pages.accueil.nav')}"${brut(attrs)}>${r.nom}</a>`);

function tete(c) {
  const p = c.page, cle = p.cle;
  const titre = c.s(`pages.${cle}.titre`), description = c.s(`pages.${cle}.description`);
  const ici = c.abs(c.url(cle));
  const imagePartage = c.abs(`/assets/partage/${p.partage === false ? 'accueil' : cle}-${c.l}.jpg`);
  const structure = c.donnees.structure ? JSON.stringify(c.donnees.structure).replace(/</g, '\\u003c') : '';
  return html`<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${titre}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="${ici}">
<style>${brut(c.critique.css)}</style>
<script>${brut(c.critique.js)}</script>
${(c.site.polices || []).map((f) => html`<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>\n`)}<link rel="stylesheet" href="${c.asset('css/socle.css')}">
<link rel="stylesheet" href="${c.asset('css/site.css')}">
<link rel="modulepreload" href="${c.asset('js/site.js')}">
<link rel="modulepreload" href="${c.asset('js/socle/index.js')}">
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/SplitText.min.js" defer></script>
<script type="module" src="${c.asset('js/site.js')}"></script>
<meta name="theme-color" content="${c.site.couleurs.theme || c.site.couleurs.fond}">
<link rel="icon" href="/assets/images/favicon.png" type="image/png" sizes="64x64">
<link rel="icon" href="/assets/images/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:site_name" content="${c.site.nom}">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${ici}">
<meta property="og:image" content="${imagePartage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${c.s(`pages.${p.partage === false ? 'accueil' : cle}.partageAlt`)}">
<meta name="twitter:card" content="summary_large_image">
${structure ? html`<script type="application/ld+json">${brut(structure)}</script>` : ''}
</head>`;
}

const loupe = brut('<svg class="icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>');
export const fleche = brut('<svg class="icone icone--fleche" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');

function entete(c) {
  const a = c.site.actionEntete;
  return html`<header data-entete>
  <div class="entete-rangee">
    <a class="entete-logo" href="${c.url('accueil')}" data-libelle="${c.libelle('accueil')}"${c.page.cle === 'accueil' ? brut(' aria-current="page"') : ''}>
      ${logo(240)}<span class="visuellement-cache">${c.t('commun.logoAlt')}</span>
    </a>
    <nav data-nav aria-label="${c.s('commun.navigation')}">
      <ul><li><a href="${c.url('accueil', 'fil')}" data-libelle="${c.libelle('accueil')}">${c.t('commun.toutLactu')}</a></li>${navigation(c).filter((k) => k !== 'accueil').map((k) => html`<li>${c.lien(k)}</li>`)}</ul>
    </nav>
    <div class="entete-actions">
      <button type="button" class="entete-recherche" data-recherche-bouton aria-controls="recherche" aria-expanded="false" aria-label="${c.s('commun.rechercher')}">${loupe}<span class="entete-recherche-libelle">${c.t('commun.rechercher')}</span></button>
      <a class="bouton bouton--alerte" href="${c.url(a.page)}" data-libelle="${c.libelle(a.page)}"${c.page.cle === a.page ? brut(' aria-current="page"') : ''}>${c.t('commun.actionEntete')}</a>
      <button type="button" data-menu-bouton aria-controls="menu" aria-expanded="false" data-libelle-ouvrir="${c.s('commun.menu')}" data-libelle-fermer="${c.s('commun.fermer')}"><span data-libelle-bouton>${c.t('commun.menu')}</span></button>
    </div>
  </div>
</header>
<div id="recherche" class="recherche" data-recherche role="dialog" aria-modal="true" aria-label="${c.s('commun.rechercher')}" hidden>
  <form class="recherche-form conteneur" action="${c.url('accueil')}" method="get" role="search" data-recherche-form>
    <label for="recherche-champ" class="recherche-label">${c.t('commun.rechercheLabel')}</label>
    <div class="recherche-rangee">
      <input id="recherche-champ" name="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="${c.s('commun.rechercheExemple')}">
      <button type="submit" class="bouton">${c.t('commun.rechercher')}</button>
      <button type="button" class="recherche-fermer" data-recherche-fermer aria-label="${c.s('commun.fermer')}"><span aria-hidden="true">×</span></button>
    </div>
  </form>
</div>
<div id="menu" data-menu role="dialog" aria-modal="true" aria-label="${c.s('commun.menu')}">
  <div class="menu-grille">
    <ul class="menu-pages">${navigation(c).map((k, i) => html`<li style="--i:${i}">${c.lien(k, { classe: 'menu-lien' })}</li>`)}<li style="--i:${navigation(c).length}">${c.lien(a.page, { classe: 'menu-lien menu-lien--alerte' })}</li></ul>
    <div class="menu-cote">
      <p class="sur-titre">${c.t('commun.rubriques')}</p>
      <ul class="menu-rubriques">${rubriquesActives(c).map((r, i) => html`<li style="--i:${i + 6}">${lienRubrique(c, r)}</li>`)}</ul>
      <p class="menu-bientot">${c.t('commun.bientot', { liste: rubriquesAVenir(c).map((r) => r.nom).join(', ') })}</p>
      <p><a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')} ${c.site.contact.telephone}</a></p>
      <p><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></p>
    </div>
  </div>
</div>`;
}

/* Bandeau d'alerte : lu dans donnees/alerte.json, sur toutes les pages, en tête du contenu. */
function ruban(c) {
  const al = c.donnees.alerte;
  const dernieres = c.donnees.articles.slice(0, 5);
  const sep = html`<span class="ruban-sep" aria-hidden="true">✦</span>`;
  const morceau = html`<span class="ruban-morceau"><span class="ruban-etat"><span class="ruban-point" aria-hidden="true"></span>${al.active ? c.t('commun.alerteEnCours') : ''} ${al.texte}</span>${sep}<span class="ruban-titre">${c.t('commun.rubanDernieres')}</span>${dernieres.map((a) => html`<span class="ruban-info">${a.titre}</span>${sep}`)}${c.t('commun.rubanPromesse')}${sep}</span>`;
  return html`<div class="ruban-alerte${al.active ? ' ruban-alerte--active' : ''}" data-effet="ruban-alerte" role="region" aria-label="${c.s('commun.alerteRegion')}">
  <p class="visuellement-cache" role="status">${al.texte}</p>
  <div class="ruban-fenetre" aria-hidden="true"><div class="ruban-piste" id="ruban-alerte" data-boucle-css>${morceau}${morceau}</div></div>
  <button type="button" class="ruban-pause" data-pause-pour="ruban-alerte" data-libelle-pause="${c.s('commun.pause')}" data-libelle-lecture="${c.s('commun.lecture')}" aria-label="${c.s('commun.rubanPause')}"><span data-libelle-bouton>${c.t('commun.pause')}</span></button>
</div>`;
}

function pied(c) {
  return html`<footer class="pied" id="pied">
  <div class="conteneur pied-tete">
    ${logo(240, 'pied-logo')}
    <p class="pied-promesse">${c.t('commun.piedPromesse')}</p>
  </div>
  <div class="conteneur pied-grille">
    <div>
      <p class="sur-titre">${c.t('commun.contact')}</p>
      <p>${c.t('commun.association')}<br>${c.site.contact.adresse}<br><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a><br><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a></p>
      <p><a href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')} ${fleche}</a></p>
    </div>
    <nav aria-label="${c.s('commun.sommaire')}">
      <p class="sur-titre">${c.t('commun.sommaire')}</p>
      <ul>${navigation(c).map((k) => html`<li>${c.lien(k)}</li>`)}<li>${c.lien(c.site.actionEntete.page)}</li><li>${c.lien('mentions-legales')}</li></ul>
    </nav>
    <nav aria-label="${c.s('commun.rubriques')}">
      <p class="sur-titre">${c.t('commun.rubriques')}</p>
      <ul class="pied-rubriques">${rubriquesActives(c).map((r) => html`<li>${lienRubrique(c, r)}</li>`)}</ul>
    </nav>
    <div>
      <p class="sur-titre">${c.t('commun.confort')}</p>
      <ul>
        <li><button type="button" class="lien" data-calme-bascule data-libelle-reduire="${c.s('commun.calmeReduire')}" data-libelle-retablir="${c.s('commun.calmeRetablir')}" data-libelle-systeme="${c.s('commun.calmeSysteme')}"><span data-libelle-bouton>${c.t('commun.calmeReduire')}</span></button></li>
        <li><a href="#haut" data-sans-transition>${c.t('commun.retourHaut')}</a></li>
      </ul>
    </div>
  </div>
  <div class="conteneur pied-bas"><p>${c.t('commun.maquette')}</p><p>${c.t('commun.copyright')}</p></div>
</footer>`;
}

function barre(c) {
  const a = c.site.actionEntete;
  return html`<div data-barre-fixe>
  <a class="bouton bouton--contour" href="tel:${c.site.contact.telephoneLien}">${c.t('commun.appeler')}</a>
  <a class="bouton bouton--alerte" href="${c.url(a.page)}" data-libelle="${c.libelle(a.page)}">${c.t('commun.actionEntete')}</a>
</div>`;
}

/* Voile « rotative » : une feuille d'encre qui passe, trois bandes de papier qui défilent, le nom de la page. */
function voile(c) {
  return html`<div data-voile aria-hidden="true">
  <div class="voile-bandes"><span></span><span></span><span></span></div>
  <div class="voile-contenu">${logo(240, 'voile-logo')}<span data-voile-libelle>${c.libelle(c.page.cle)}</span></div>
</div>`;
}

/* Panneau d'ouverture « rotative » : le logo, visible et entier dès la première image, puis les bandes de papier. */
function ouverture(c) {
  const A = c.donnees.articles;
  const textes = [0, 1, 4, 10, 5, 15, 3].map((i) => (A[i] || A[0]).titre);
  return html`<div class="ouverture-panneau" data-ouverture data-effet="rotative" aria-hidden="true">
  <div class="ouverture-centre">${logo(480, 'ouverture-logo')}<p class="ouverture-ligne">${c.t('commun.introLigne')}</p></div>
  <div class="ouverture-bandes">${textes.map((t, i) => html`<span class="ouverture-bande" style="--i:${i}"><span>${t}<i aria-hidden="true">✦</i>${t}<i aria-hidden="true">✦</i>${t}</span></span>`)}</div>
  <span class="ouverture-alerte"><span>${c.t('commun.introAlerte')}</span></span>
</div>`;
}

export function page(c, contenu) {
  return html`<!doctype html>
<html lang="${c.l}" data-v="${c.v}"${c.site.curseur ? brut(' data-curseur') : ''}>
${tete(c)}
<body id="haut" class="page-${c.page.modele || c.page.cle}">
${voile(c)}
${ouverture(c)}
<a class="evitement" href="#contenu">${c.t('commun.evitement')}</a>
<span id="note-facebook" hidden>${c.t('commun.surFacebook')}</span>
${entete(c)}
<main id="contenu" tabindex="-1"${c.page.sansAction ? brut(' data-sans-action') : ''}${c.page.sansEffet ? brut(' data-sans-effet') : ''}>
${ruban(c)}
${contenu}
</main>
${pied(c)}
${barre(c)}
</body>
</html>`;
}
