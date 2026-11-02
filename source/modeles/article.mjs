/* Modèle « article » : ouverture, barre de lecture, l'essentiel (fiche réelle), texte à compléter,
   lieu sur le plan, à lire aussi, appel à l'action. Une page par brève (v2 : les autres brèves). */
import { html, brut, typo } from '../../outils/gabarit.mjs';
import { fleche, lienFil } from '../gabarits/commun.mjs';
import { visuelBreve, carteBreve, communesTexte, nomRubrique, vues } from './outils.mjs';
import { carteCommunes } from './communes.mjs';

export function pageArticle(c, slug, { lies = [] } = {}) {
  const a = c.donnees.articles.find((x) => x.slug === slug);
  const aussi = lies.map((s) => c.donnees.articles.find((x) => x.slug === s)).filter(Boolean);
  const rub = c.donnees.rubriques.find((r) => r.id === a.rubrique);
  return html`
<div data-barre-lecture aria-hidden="true"></div>
<section class="page-tete page-tete--image page-tete--article conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu"><a class="sur-titre-lien" href="${rub.page ? c.url(rub.page) : lienFil(c, `rubrique=${a.rubrique}`)}" data-libelle="${rub.page ? c.libelle(rub.page) : c.s('pages.accueil.nav')}">${nomRubrique(c, a.rubrique)}</a> · <span class="sur-titre-rouge">${a.etiquette}</span> · ${communesTexte(c, a)}</p>
    <h1 class="article-titre tete-anim" data-anime="gsap" data-tete="lignes">${a.titre}</h1>
    <p class="article-chapeau tete-anim" data-anime="gsap" data-tete="fondu">${a.chapeau}</p>
    <p class="tete-infos mono tete-anim" data-anime="gsap" data-tete="fondu" data-info-cle>${a.vues ? html`<span><strong data-compteur="${a.vues}">${vues(a.vues)}</strong> ${c.t('accueil.vuesFacebook')}</span>` : ''}<span>${c.t('commun.datePublication')}</span></p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu">
      ${a.facebook ? html`<a class="bouton" href="${a.facebook}" target="_blank" rel="noopener" data-action-principale data-survol="magnetique">${c.t(a.format === 'video' ? 'article.voirVideo' : 'article.lireFacebook')} ${fleche}</a>` : ''}
      <button type="button" class="bouton bouton--contour" data-partager data-titre="${a.titre}" data-message="${c.s('article.lienCopie')}">${c.t('article.partager')}</button>
    </p>
    <p class="partage-statut" role="status" data-partage-statut></p>
  </div>
  ${visuelBreve(c, a, { classe: 'page-tete-media article-media tete-anim', sizes: '(max-width: 760px) 92vw, 46vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde" data-fx-force=".8"', priorite: true })}
</section>

<section class="article-corps" id="essentiel">
  <div class="conteneur article-grille">
    <aside class="essentiel" aria-labelledby="essentiel-titre">
      <h2 id="essentiel-titre" data-anime="lignes">${c.t('article.essentiel')}</h2>
      <svg class="trait-essentiel" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true" data-fx="trace" focusable="false"><path d="M2 6 H298" fill="none" stroke="currentColor" stroke-width="3"/></svg>
      <dl class="fiche" data-anime="cascade">
        ${(a.details || []).map((d) => html`<div><dt>${d.libelle}</dt><dd>${d.valeur}</dd></div>`)}
        <div><dt>${c.t('article.commune')}</dt><dd>${communesTexte(c, a)}</dd></div>
        <div><dt>${c.t('article.source')}</dt><dd>${a.facebook ? html`<a href="${a.facebook}" target="_blank" rel="noopener">${c.t('article.postFacebook')} ${fleche}</a>` : c.t('commun.lienAFournir')}</dd></div>
      </dl>
    </aside>
    <div class="article-texte">
      ${a.vues ? html`<figure class="essentiel-chiffre" data-visuel data-anime>
        <p class="sur-titre">${c.t('article.chiffre.surTitre')}</p>
        <strong class="essentiel-chiffre-n" data-compteur="${a.vues}">${vues(a.vues)}</strong>
        <figcaption>${c.t('article.chiffre.texte')}</figcaption>
      </figure>` : ''}
      <p class="article-lettrine" data-anime>${c.t('article.texteAFournir')}</p>
      <blockquote class="article-note" data-anime><p>${c.t('article.note')}</p></blockquote>
    </div>
  </div>
</section>

<section class="pays pays--article" id="lieu">
  <div class="conteneur pays-grille">
    <header class="section-tete pays-tete">
      <p class="sur-titre">${c.t('article.lieu.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('article.lieu.titre'))}"><span class="impression-encre">${c.t('article.lieu.titre')}</span></h2>
      <p class="section-intro">${(a.details || []).find((d) => d.libelle === 'Adresse')?.valeur || communesTexte(c, a)}</p>
      <p>${html`<a class="lien-fleche" href="${lienFil(c, `commune=${a.communes[0]}`)}" data-libelle="${c.s('pages.accueil.nav')}">${c.t('article.lieu.autres', { commune: communesTexte(c, a) })}</a>`}</p>
    </header>
    ${carteCommunes(c, { compte: (cid) => (a.communes.includes(cid) ? 1 : 0), id: 'carte-article', titre: c.s('article.lieu.alt', { commune: communesTexte(c, a) }), libelle: (n) => (n ? c.s('article.lieu.ici') : '') })}
  </div>
</section>

<section class="aussi" id="aussi">
  <div class="conteneur">
    <p class="sur-titre">${c.t('article.aussi.surTitre')}</p>
    <h2 data-anime="lignes">${c.t('article.aussi.titre')}</h2>
    <div class="aussi-grille" data-anime="cascade">${aussi.map((x) => carteBreve(c, x, { sizes: '(max-width: 760px) 36vw, 30vw' }))}</div>
    <div class="appel-final" data-anime>
      <p class="appel-final-texte">${c.t('article.appel')}</p>
      ${c.lien('alertez-nous', { params: `type=info&rubrique=${a.rubrique}&sujet=${a.slug}`, ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t('commun.actionEntete'), attrs: 'data-survol="magnetique"' })}
    </div>
  </div>
</section>
`;
}
