/* Page type « association » : histoire 2016-2026 (frise aux statuts automatiques), média indépendant et associatif,
   valeurs, fondateur (portrait à fournir), transparence (association, audience), soutenir (à compléter). */
import { html, brut, typo } from '../../outils/gabarit.mjs';
import { fleche } from '../gabarits/commun.mjs';
import { visuel } from '../modeles/outils.mjs';
import { tampon } from '../modeles/tampon.mjs';

export const page = { cle: 'qui-sommes-nous', fichier: 'qui-sommes-nous', modele: 'association', imagePartage: 'grok/redaction-nuit-1168.webp' };

const JALONS = [
  { cle: 'creation', date: '2016-11-13' },
  { cle: 'association', date: '2026-01-21' },
  { cle: 'dixAns', date: '2026-11-13' },
];
const jourParis = (d) => Math.round(Date.parse(new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d) + 'T00:00:00Z') / 86400000);

export default (c) => {
  const aujourdhui = jourParis(new Date());
  return html`
<section class="page-tete page-tete--image conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu">${c.t('qui.surTitre')}</p>
    <h1 class="impression impression--tete" data-effet="impression" data-texte="${typo(c.s('qui.titre'))}"><span class="impression-encre">${c.t('qui.titre')}</span></h1>
    <p class="section-intro tete-anim" data-anime="gsap" data-tete="fondu">${c.t('qui.intro')}</p>
    <p class="tete-infos mono tete-anim" data-anime="gsap" data-tete="fondu" data-info-cle><strong>${c.t('qui.depuis')}</strong><span>${c.t('qui.statut')}</span></p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu">
      ${c.lien('alertez-nous', { params: 'type=contact', ancre: 'formulaire', classe: 'bouton', texte: c.t('qui.ecrire'), attrs: 'data-action-principale data-survol="magnetique"' })}
      <a class="lien-fleche" href="#soutenir">${c.t('qui.soutenirLien')}</a>
    </p>
  </div>
  ${visuel(c, { nom: 'grok/redaction-nuit', alt: c.s('images.redaction'), priorite: true, classe: 'page-tete-media tete-anim', sizes: '(max-width: 760px) 92vw, 46vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde"' })}
</section>

<section class="histoire" id="histoire">
  <div class="conteneur">
    <header class="section-tete">
      <p class="sur-titre">${c.t('qui.histoire.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('qui.histoire.titre'))}"><span class="impression-encre">${c.t('qui.histoire.titre')}</span></h2>
      <p class="section-intro">${c.t('qui.histoire.texte')}</p>
    </header>
    <ol class="frise-histoire" data-anime="cascade" data-jalons="${JSON.stringify({ passe: c.s('qui.histoire.etat.passe'), jour: c.s('qui.histoire.etat.jour'), avenir: c.s('qui.histoire.etat.avenir') })}">
      ${JALONS.map((j) => { const d = jourParis(new Date(j.date + 'T12:00:00+01:00')); const etat = d < aujourdhui ? 'passe' : d === aujourdhui ? 'jour' : 'avenir'; return html`<li class="jalon jalon--${etat}" data-jalon="${j.date}"><span class="jalon-date mono">${c.t(`qui.histoire.${j.cle}.date`)}</span><strong class="jalon-titre">${c.t(`qui.histoire.${j.cle}.titre`)}</strong><span class="jalon-texte">${c.t(`qui.histoire.${j.cle}.texte`)}</span><span class="jalon-etat mono">${c.t(`qui.histoire.etat.${etat}`)}</span></li>`; })}
    </ol>
    <svg class="frise-histoire-trait" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true" data-fx="trace" focusable="false"><path d="M2 5 H998" fill="none" stroke="currentColor" stroke-width="3"/></svg>
    ${visuel(c, { nom: 'grok/rotative', alt: c.s('images.rotative'), classe: 'histoire-media', sizes: '(max-width: 760px) 92vw, 80vw', attrs: 'data-fx="parallaxe" data-fx-force="8"' })}
  </div>
</section>

<section class="independant" id="independant">
  <div class="conteneur indep-grille">
    ${visuel(c, { nom: 'grok/rouleau-encre', alt: c.s('images.encre'), classe: 'indep-media', sizes: '(max-width: 760px) 70vw, 30vw', attrs: 'data-anime="rideau"' })}
    <div>
      <p class="sur-titre">${c.t('qui.indep.surTitre')}</p>
      <h2 data-anime="lignes">${c.t('qui.indep.titre')}</h2>
      <p class="section-intro" data-anime>${c.t('qui.indep.texte')}</p>
      <p data-anime>${c.t('qui.indep.texte2')}</p>
      <ul class="valeurs" data-anime="cascade">
        <li><strong>${c.t('valeurs.proche.titre')}</strong> ${c.t('valeurs.proche.texte')}</li>
        <li><strong>${c.t('valeurs.fiable.titre')}</strong> ${c.t('valeurs.fiable.texte')}</li>
        <li><strong>${c.t('valeurs.respect.titre')}</strong> ${c.t('valeurs.respect.texte')}</li>
      </ul>
    </div>
  </div>
</section>

<section class="fondateur" id="fondateur">
  <div class="conteneur fondateur-grille">
    <figure class="monogramme" data-visuel role="img" aria-label="${c.s('qui.fondateur.monogrammeAlt')}" data-effet="tampon-10-ans">
      <svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle cx="100" cy="100" r="94" class="tampon-bord"/><circle cx="100" cy="100" r="80" class="tampon-bord tampon-bord--fin"/><text x="100" y="128" text-anchor="middle" class="monogramme-lettre">G</text></svg>
      <figcaption class="mono">${c.t('qui.fondateur.portrait')}</figcaption>
    </figure>
    <div>
      <p class="sur-titre">${c.t('qui.fondateur.surTitre')}</p>
      <blockquote class="citation" data-anime="mots"><p>${c.t('qui.fondateur.citation')}</p></blockquote>
      <p class="citation-auteur" data-anime><strong>${c.t('qui.fondateur.nom')}</strong>, ${c.t('qui.fondateur.role')}</p>
      <p data-anime>${c.t('qui.fondateur.texte')}</p>
    </div>
  </div>
</section>

<section class="transparence" id="transparence">
  <div class="conteneur transp-grille">
    <div>
      <p class="sur-titre">${c.t('qui.transp.surTitre')}</p>
      <h2 class="impression impression--clair" data-effet="impression" data-texte="${typo(c.s('qui.transp.titre'))}"><span class="impression-encre">${c.t('qui.transp.titre')}</span></h2>
      <p class="audience audience--clair" data-visuel><strong class="audience-chiffre" data-compteur="1.7">1,7</strong> ${c.t('accueil.dixAns.audience')}<span class="audience-source">${c.t('commun.audienceSource')}</span></p>
    </div>
    <dl class="fiche fiche--clair" data-anime="cascade">
      <div><dt>${c.t('qui.transp.editeur')}</dt><dd>${c.t('commun.association')}, ${c.site.contact.adresse}</dd></div>
      <div><dt>${c.t('qui.transp.directeur')}</dt><dd>${c.t('qui.transp.directeurNom')}</dd></div>
      <div><dt>${c.t('qui.transp.declaration')}</dt><dd>${c.t('qui.transp.declarationDate')}</dd></div>
      <div><dt>${c.t('qui.transp.rna')}</dt><dd class="mono">W441007944</dd></div>
      <div><dt>${c.t('qui.transp.siret')}</dt><dd class="mono">100 220 995 00011</dd></div>
      <div><dt>${c.t('qui.transp.financement')}</dt><dd>${c.t('qui.transp.financementTexte')}</dd></div>
    </dl>
  </div>
</section>

<section class="soutenir" id="soutenir">
  <div class="conteneur soutenir-grille">
    <div class="soutenir-tampon">${tampon(c, { id: 'tampon-qui' })}</div>
    <div>
      <p class="sur-titre">${c.t('qui.soutenir.surTitre')}</p>
      <h2 data-anime="lignes">${c.t('qui.soutenir.titre')}</h2>
      <ul class="soutiens" data-anime="cascade">
        <li><strong>${c.t('qui.soutenir.adherer')}</strong><span>${c.t('qui.soutenir.aCompleterCourt')}</span></li>
        <li><strong>${c.t('qui.soutenir.don')}</strong><span>${c.t('qui.soutenir.aCompleterCourt')}</span></li>
        <li><strong>${c.t('qui.soutenir.benevole')}</strong><span>${c.t('qui.soutenir.aCompleterCourt')}</span></li>
        <li><strong>${c.t('qui.soutenir.partager')}</strong><span>${c.t('qui.soutenir.partagerTexte')}</span></li>
      </ul>
      <p class="note-source" data-anime>${c.t('qui.soutenir.aCompleter')}</p>
      <p class="dix-actions" data-anime>
        ${c.lien('alertez-nous', { params: 'type=contact&rubrique=association', ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t('qui.soutenir.action'), attrs: 'data-survol="magnetique"' })}
        <a class="lien-fleche" href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')} ${fleche}</a>
      </p>
    </div>
  </div>
</section>
`;
};
