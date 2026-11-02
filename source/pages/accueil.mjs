/* Accueil Castel Actu « La Une vivante » : la Une, le fil filtrable, le Pays commune par commune,
   les plus lus, vidéo et podcast, chantiers et projets, Alertez-nous, 10 ans.
   Chaque section a un effet qui bouge au défilement ou tout seul, visible aussi sur téléphone. */
import { html, brut, typo } from '../../outils/gabarit.mjs';
import { fleche, lienFil, rubriquesAVenir } from '../gabarits/commun.mjs';
import { visuel, visuelBreve, carteBreve, lienBreve, sourceLibelle, vues, communesTexte, statutLibelle, existe } from '../modeles/outils.mjs';
import { carteCommunes } from '../modeles/communes.mjs';
import { lecteurPodcast } from '../modeles/podcast.mjs';
import { tampon } from '../modeles/tampon.mjs';

export const page = { cle: 'accueil', fichier: 'index', imagePartage: 'articles/bijouterie-de-camille-1280.webp' };

const SECONDAIRES = ['bijouterie-de-camille', 'bricomarche', 'super-u-station-lavage'];
const PREMIERS = 8;
const GALERIE = ['quartier-ville-marie', 'residence-jardins-du-chateau', 'piscine-espace-dauphin', 'voirie-d771', 'theatre-de-verdure-choisel', 'maison-des-associations', 'hauts-de-bere'];
/* Compte à rebours des 10 ans calculé à la génération (heure de Paris) ; le script le remet à jour chaque jour. */
const jourParis = (d) => Math.round(Date.parse(new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d) + 'T00:00:00Z') / 86400000);
function compteRepli(c) {
  const n = jourParis(new Date(c.site.dixAns)) - jourParis(new Date());
  const chiffre = n > 0 ? c.s('dixAns.jours', { n }) : c.s('accueil.dixAns.compteRepli');
  const texte = n > 0 ? c.s('dixAns.avant') : n === 0 ? c.s('dixAns.jour') : c.s('dixAns.apres');
  return html`<span class="compte-chiffre mono" data-compte-chiffre>${chiffre}</span><span class="compte-texte" data-compte-texte>${texte}</span>`;
}
/* Date du jour à la génération (heure de Paris) ; le script la remet à jour à l'ouverture. */
const dateDuJour = () => { const d = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date()); return d.charAt(0).toUpperCase() + d.slice(1); };

export default (c) => {
  const A = c.donnees.articles;
  const une = A.find((a) => a.une);
  const secondaires = SECONDAIRES.map((s) => A.find((a) => a.slug === s));
  const travaux = A.filter((a) => a.rubrique === 'travaux');
  /* La galerie montre un chantier par état d'avancement, jusqu'au projet annulé (raturé) ; la rubrique les montre tous. */
  const chantiers = GALERIE.map((s) => A.find((a) => a.slug === s)).filter(Boolean);
  /* Brèves dont l'image est déjà sur la page : dans le fil, en version typographique (aucune image en double). */
  const alaUne = new Set([une.slug, ...SECONDAIRES]);
  const dejaIllustrees = new Set([...alaUne, ...chantiers.map((a) => a.slug)]);
  const plusLus = A.filter((a) => a.vues).sort((x, y) => y.vues - x.vues).slice(0, 3);
  const videos = A.filter((a) => a.format === 'video');
  const compte = (f) => A.filter(f).length;
  const rubriques = c.donnees.rubriques.map((r) => ({ ...r, n: compte((a) => a.rubrique === r.id) })).filter((r) => r.n);
  const aVenir = rubriquesAVenir(c);

  return html`
<section class="une" id="une" data-section-tete>
  <div class="conteneur">
    <header class="manchette">
      <p class="manchette-haut tete-anim" data-anime="gsap" data-tete="fondu">
        <span class="mono" data-date-du-jour>${dateDuJour()}</span>
        <span class="mono manchette-zone">${c.t('accueil.manchetteZone')}</span>
      </p>
      <span class="filet filet--double tete-anim" data-anime="gsap" data-tete="filet" aria-hidden="true"></span>
      <h1 class="manchette-titre impression impression--tete" data-effet="impression" data-texte="${typo(c.s('accueil.manchette'))}"><span class="impression-encre">${c.t('accueil.manchette')}</span></h1>
      <span class="filet tete-anim" data-anime="gsap" data-tete="filet" aria-hidden="true"></span>
      <p class="manchette-bas tete-anim" data-anime="gsap" data-tete="fondu">
        <span class="manchette-promesse">${c.t('accueil.promesse')}</span>
        <span class="info-alerte" data-info-cle><span class="ruban-point" aria-hidden="true"></span>${c.donnees.alerte.texte}</span>
      </p>
    </header>

    <div class="une-grille">
      <article class="une-principale">
        <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu"><span class="sur-titre-rouge">${c.t('accueil.aLaUne')}</span> · ${une.etiquette} · ${communesTexte(c, une)}</p>
        <h2 class="une-titre tete-anim" data-anime="gsap" data-tete="lignes">${lienBreve(c, une, une.titre, { classe: 'une-titre-lien' })}</h2>
        <p class="une-chapeau tete-anim" data-anime="gsap" data-tete="fondu">${une.chapeau}</p>
        <p class="une-meta mono tete-anim" data-anime="gsap" data-tete="fondu"><span><strong data-compteur="${une.vues}">${vues(une.vues)}</strong> ${c.t('accueil.vuesFacebook')}</span><span>${c.t('commun.datePublication')}</span></p>
        <p class="une-actions tete-anim" data-anime="gsap" data-tete="fondu">
          ${c.lien(une.page, { classe: 'bouton', texte: c.t('accueil.lireUne'), attrs: 'data-action-principale data-survol="magnetique"' })}
          <a class="lien-fleche" href="#fil">${c.t('accueil.toutLeFil')}</a>
        </p>
      </article>
      ${visuelBreve(c, une, { classe: 'une-media tete-anim', sizes: '(max-width: 760px) 92vw, 40vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde" data-fx-force=".8"', priorite: true })}
    </div>

    <div class="une-secondaires" data-anime="cascade">
      ${secondaires.map((a) => carteBreve(c, a, { sizes: '(max-width: 760px) 92vw, 28vw' }))}
    </div>
  </div>
</section>

<section class="fil" id="fil" data-fil data-premiers="${PREMIERS}">
  <div class="conteneur">
    <header class="section-tete">
      <p class="sur-titre">${c.t('accueil.fil.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('accueil.fil.titre'))}"><span class="impression-encre">${c.t('accueil.fil.titre')}</span></h2>
      <p class="section-intro">${c.t('accueil.fil.intro')}</p>
    </header>

    <form class="filtres" data-filtres role="search" aria-label="${c.s('accueil.fil.filtres')}" action="${c.url('accueil', 'fil')}">
      <div class="filtres-ligne filtres-rubriques" role="group" aria-label="${c.s('accueil.fil.parRubrique')}">
        <button type="button" class="puce" data-filtre="rubrique" data-valeur="" aria-pressed="true">${c.t('accueil.fil.tout')} <span class="puce-n">${A.length}</span></button>
        ${rubriques.map((r) => html`<button type="button" class="puce" data-filtre="rubrique" data-valeur="${r.id}" aria-pressed="false">${r.nom} <span class="puce-n">${r.n}</span></button>`)}
      </div>
      <p class="filtres-bientot">${c.t('commun.bientot', { liste: aVenir.map((r) => r.nom).join(', ') })}</p>
      <div class="filtres-ligne filtres-bas">
        <div class="champ champ--compact">
          <label for="fil-commune">${c.t('accueil.fil.commune')}</label>
          <select id="fil-commune" name="commune" data-filtre-select="commune">
            <option value="">${c.t('accueil.fil.toutesCommunes')}</option>
            ${c.donnees.communes.map((x) => { const n = compte((a) => a.communes.includes(x.id)); return html`<option value="${x.id}"${n ? '' : brut(' disabled')}>${x.nom} (${n})</option>`; })}
          </select>
        </div>
        <div class="filtres-format" role="group" aria-label="${c.s('accueil.fil.format')}">
          <button type="button" class="puce" data-filtre="format" data-valeur="" aria-pressed="true">${c.t('accueil.fil.tousFormats')}</button>
          <button type="button" class="puce" data-filtre="format" data-valeur="article" aria-pressed="false">${c.t('accueil.fil.articles')}</button>
          <button type="button" class="puce" data-filtre="format" data-valeur="video" aria-pressed="false">${c.t('accueil.fil.videos')}</button>
        </div>
        <div class="champ champ--compact champ--recherche">
          <label for="fil-q">${c.t('accueil.fil.chercher')}</label>
          <input id="fil-q" name="q" type="search" autocomplete="off" placeholder="${c.s('commun.rechercheExemple')}" data-filtre-q>
        </div>
      </div>
      <p class="filtres-resultat mono" aria-live="polite" data-fil-resultat data-modele="${c.s('accueil.fil.resultat')}" data-modele-un="${c.s('accueil.fil.resultatUn')}" data-modele-defaut="${c.s('accueil.fil.resultatDefaut')}">${c.t('accueil.fil.resultatDefaut', { n: A.length, u: alaUne.size })}</p>
    </form>

    <div class="fil-grille" data-fil-grille>
      ${(() => { let k = 0; return A.map((a) => {
        const horsDefaut = alaUne.has(a.slug);
        const rang = horsDefaut ? -1 : k++;
        const attrs = horsDefaut ? 'data-hors-defaut' : rang >= PREMIERS ? 'data-fil-suite' : rang >= 5 ? 'data-fil-tel-suite' : '';
        return carteBreve(c, a, { sansImage: dejaIllustrees.has(a.slug), attrs });
      }); })()}
    </div>
    <p class="fil-vide" data-fil-vide hidden>${c.t('accueil.fil.aucun')} <button type="button" class="lien" data-fil-reinit>${c.t('accueil.fil.reinitialiser')}</button></p>
    <p class="fil-plus"><button type="button" class="bouton bouton--contour" data-fil-plus>${c.t('accueil.fil.plus')}</button></p>
  </div>
</section>

<section class="pays" id="pays">
  <div class="conteneur pays-grille">
    <header class="section-tete pays-tete">
      <p class="sur-titre">${c.t('accueil.pays.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('accueil.pays.titre'))}"><span class="impression-encre">${c.t('accueil.pays.titre')}</span></h2>
      <p class="section-intro">${c.t('accueil.pays.intro')}</p>
      <ul class="pays-liste" data-anime="cascade">
        ${c.donnees.communes.map((x) => { const n = compte((a) => a.communes.includes(x.id)); return html`<li class="${n ? '' : 'pays-vide'}">${n ? html`<a href="${lienFil(c, `commune=${x.id}`)}" data-filtre-commune="${x.id}" data-libelle="${c.s('pages.accueil.nav')}">${x.nom}</a>` : html`<span>${x.nom}</span>`}<span class="mono">${n ? c.s(n > 1 ? 'accueil.pays.infos' : 'accueil.pays.info', { n }) : c.s('accueil.pays.aucune')}</span></li>`; })}
      </ul>
    </header>
    ${carteCommunes(c, { compte: (id) => compte((a) => a.communes.includes(id)), id: 'carte-pays' })}
  </div>
</section>

<section class="plus-lus" id="plus-lus">
  <div class="conteneur">
    <header class="section-tete">
      <p class="sur-titre">${c.t('accueil.plusLus.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('accueil.plusLus.titre'))}"><span class="impression-encre">${c.t('accueil.plusLus.titre')}</span></h2>
    </header>
    <ol class="coupures" data-visuel data-effet="coupures">
      ${plusLus.map((a, i) => html`<li class="coupure" style="--r:${[-1.6, 1.1, -0.8][i]}deg">
        <span class="coupure-rang" aria-hidden="true">${i + 1}</span>
        <p class="carte-meta"><span class="etiquette">${a.etiquette}</span><span>${communesTexte(c, a)}</span></p>
        <h3 class="coupure-titre">${lienBreve(c, a, a.titre)}</h3>
        <p class="coupure-vues mono"><strong data-compteur="${a.vues}">${vues(a.vues)}</strong> ${c.t('accueil.vuesFacebook')}</p>
      </li>`)}
    </ol>
    <p class="note-source">${c.t('accueil.plusLus.source')}</p>
  </div>
</section>

<section class="ecoute" id="ecoute">
  <div class="conteneur ecoute-grille">
    <div class="ecoute-texte">
      <header class="section-tete">
        <p class="sur-titre">${c.t('accueil.ecoute.surTitre')}</p>
        <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('accueil.ecoute.titre'))}"><span class="impression-encre">${c.t('accueil.ecoute.titre')}</span></h2>
        <p class="section-intro">${c.t('accueil.ecoute.intro')}</p>
      </header>
      <div class="podcasts">${c.donnees.podcasts.map((p) => lecteurPodcast(c, p))}</div>
      <p>${c.lien('videos-podcasts', { classe: 'bouton bouton--contour', texte: c.t('accueil.ecoute.tout'), attrs: 'data-survol="magnetique"' })}</p>
    </div>
    <div class="ecoute-cote">
      ${visuel(c, { nom: 'grok/studio-radio', alt: c.s('images.studio'), classe: 'ecoute-media', sizes: '(max-width: 760px) 92vw, 44vw', attrs: 'data-fx="parallaxe" data-fx-force="8"', texteCode: c.s('accueil.ecoute.codeStudio') })}
      <div class="videos-bref">
        <p class="sur-titre">${c.t('accueil.ecoute.videos', { n: videos.length })}</p>
        <ul class="videos-liste" data-anime="cascade">
          ${videos.slice(0, 4).map((a) => html`<li><span class="format-video">${c.t('commun.video')}</span>${lienBreve(c, a, a.titre, { classe: 'videos-lien' })}</li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="chantiers ecran epingle" id="chantiers" data-fx="galerie" data-entete-cache>
  <div class="conteneur chantiers-tete">
    <div>
      <p class="sur-titre">${c.t('accueil.chantiers.surTitre', { n: travaux.length })}</p>
      <h2 data-anime="lignes">${c.t('accueil.chantiers.titre')}</h2>
    </div>
    <p class="chantiers-lien">${c.lien('rubrique-travaux', { classe: 'lien-fleche', texte: c.t('accueil.chantiers.rubrique') })}</p>
  </div>
  <div class="piste chantiers-piste" data-galerie data-anime="cascade" tabindex="0" role="region" aria-label="${c.s('accueil.chantiers.region')}">
    ${chantiers.map((a) => html`<article class="chantier${a.statut === 'annule' ? ' chantier--annule' : ''}" data-statut="${a.statut}" data-survol="incline" data-survol-force="4">
      ${visuelBreve(c, a, { classe: 'chantier-media', sizes: '(max-width: 760px) 78vw, 28vw' })}
      <p class="carte-meta"><span class="statut statut--${a.statut}">${statutLibelle(c, a.statut)}</span><span>${communesTexte(c, a)}</span></p>
      <h3 class="chantier-titre">${lienBreve(c, a, a.titre)}${a.statut === 'annule' ? brut('<svg class="rature" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-rature><path d="M4 26 C 60 14, 120 30, 180 18 S 270 24, 296 14" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>') : ''}</h3>
    </article>`)}
  </div>
  <div class="frise" aria-hidden="true">
    <svg class="frise-regle" viewBox="0 0 1000 24" preserveAspectRatio="none" data-effet="frise-chantiers" focusable="false">
      <path class="frise-fond" d="M0 12 H1000" />
      <path class="frise-trait" d="M0 12 H1000" />
      ${chantiers.map((a, i) => brut(`<line class="frise-cran frise-cran--${a.statut}" x1="${((i + 0.5) / chantiers.length * 1000).toFixed(1)}" x2="${((i + 0.5) / chantiers.length * 1000).toFixed(1)}" y1="4" y2="20"/>`))}
    </svg>
    <div class="galerie-progres"><span></span></div>
  </div>
</section>

<section class="appel-alerte" id="alertez">
  <div class="conteneur appel-grille">
    <div>
      <p class="sur-titre">${c.t('accueil.alerte.surTitre')}</p>
      <h2 class="impression impression--clair" data-effet="impression" data-texte="${typo(c.s('accueil.alerte.titre'))}"><span class="impression-encre">${c.t('accueil.alerte.titre')}</span></h2>
      <p class="section-intro">${c.t('accueil.alerte.texte')}</p>
      <ol class="appel-etapes" data-anime="cascade">
        <li><span class="mono">01</span>${c.t('accueil.alerte.etape1')}</li>
        <li><span class="mono">02</span>${c.t('accueil.alerte.etape2')}</li>
        <li><span class="mono">03</span>${c.t('accueil.alerte.etape3')}</li>
      </ol>
      <p class="appel-actions">
        ${c.lien('alertez-nous', { classe: 'bouton bouton--alerte', texte: c.t('accueil.alerte.action'), attrs: 'data-survol="magnetique"' })}
        <a class="lien-clair" href="mailto:${c.site.contact.email}">${c.site.contact.email}</a>
      </p>
    </div>
    ${visuel(c, { nom: 'grok/telephone-rue', alt: c.s('images.telephone'), classe: 'appel-media', sizes: '(max-width: 760px) 92vw, 42vw', attrs: 'data-anime="rideau"', texteCode: c.s('accueil.alerte.codeVisuel') })}
  </div>
</section>

<section class="dix-ans" id="dix-ans">
  <div class="conteneur dix-grille">
    <div class="dix-tampon">
      ${tampon(c)}
      <p class="compte" data-compte-a-rebours="${c.site.dixAns}" data-textes="${JSON.stringify({ avant: typo(c.s('dixAns.avant')), jour: typo(c.s('dixAns.jour')), apres: typo(c.s('dixAns.apres')), jours: c.s('dixAns.jours') })}">${compteRepli(c)}</p>
    </div>
    <div class="dix-texte">
      <p class="sur-titre">${c.t('accueil.dixAns.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('accueil.dixAns.titre'))}"><span class="impression-encre">${c.t('accueil.dixAns.titre')}</span></h2>
      <p class="section-intro">${c.t('accueil.dixAns.texte')}</p>
      <ul class="valeurs" data-anime="cascade">
        <li><strong>${c.t('valeurs.proche.titre')}</strong> ${c.t('valeurs.proche.texte')}</li>
        <li><strong>${c.t('valeurs.fiable.titre')}</strong> ${c.t('valeurs.fiable.texte')}</li>
        <li><strong>${c.t('valeurs.respect.titre')}</strong> ${c.t('valeurs.respect.texte')}</li>
      </ul>
      <p class="audience"><strong class="audience-chiffre" data-compteur="1.7">1,7</strong> ${c.t('accueil.dixAns.audience')}<span class="audience-source">${c.t('commun.audienceSource')}</span></p>
      <p class="dix-actions">
        ${c.lien('qui-sommes-nous', { classe: 'bouton', texte: c.t('accueil.dixAns.action'), attrs: 'data-survol="magnetique"' })}
        <a class="lien-fleche" href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')} ${fleche}</a>
      </p>
    </div>
    ${visuel(c, { nom: 'grok/rouleau-encre', alt: c.s('images.encre'), classe: 'dix-media', sizes: '(max-width: 760px) 60vw, 22vw', attrs: 'data-fx="zoom"', texteCode: '' })}
  </div>
</section>
`;
};
