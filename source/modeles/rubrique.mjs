/* Modèle « rubrique » : ouverture, liste filtrable (statut, commune), plan des communes,
   état des chantiers en barres, autres rubriques, appel à l'action. Une page par rubrique (v2 : les autres). */
import { html, brut, typo } from '../../outils/gabarit.mjs';
import { lienFil, rubriquesAVenir } from '../gabarits/commun.mjs';
import { visuel, carteBreve, statutLibelle, STATUTS, nomCommune, existe } from './outils.mjs';
import { carteCommunes } from './communes.mjs';

export function pageRubrique(c, id, { image, alt }) {
  const r = c.donnees.rubriques.find((x) => x.id === id);
  const A = c.donnees.articles.filter((a) => a.rubrique === id);
  const statuts = STATUTS.map((s) => ({ s, n: A.filter((a) => a.statut === s).length })).filter((x) => x.n);
  const communes = c.donnees.communes.map((x) => ({ ...x, n: A.filter((a) => a.communes.includes(x.id)).length }));
  const max = Math.max(...statuts.map((x) => x.n));
  const autres = c.donnees.rubriques.filter((x) => x.id !== id).map((x) => ({ ...x, n: c.donnees.articles.filter((a) => a.rubrique === x.id).length })).filter((x) => x.n);
  const repartition = statuts.filter((x) => ['construction', 'annule'].includes(x.s)).map((x) => `${x.n} ${statutLibelle(c, x.s).toLowerCase()}`).join(' · ');
  const base = `rubriques.${id}`;
  return html`
<section class="page-tete page-tete--image conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu">${c.t('rubrique.surTitre')}</p>
    <h1 class="impression impression--tete" data-effet="impression" data-texte="${r.nom}"><span class="impression-encre">${r.nom}</span></h1>
    <p class="section-intro tete-anim" data-anime="gsap" data-tete="fondu">${c.t(`${base}.intro`)}</p>
    <p class="tete-infos mono tete-anim" data-anime="gsap" data-tete="fondu" data-info-cle><strong>${c.t('rubrique.sujets', { n: A.length })}</strong><span>${repartition}</span></p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu">
      ${c.lien('alertez-nous', { params: `type=info&rubrique=${id}`, ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t(`${base}.action`), attrs: 'data-action-principale data-survol="magnetique"' })}
      <a class="lien-fleche" href="#liste">${c.t('rubrique.voirListe')}</a>
    </p>
  </div>
  ${visuel(c, { nom: image, alt, priorite: true, classe: 'page-tete-media tete-anim', sizes: '(max-width: 760px) 92vw, 46vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde"' })}
</section>

<section class="fil fil--rubrique" id="liste" data-fil data-premiers="99">
  <div class="conteneur">
    <header class="section-tete section-tete--serree">
      <p class="sur-titre">${c.t('rubrique.liste.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('rubrique.liste.titre'))}"><span class="impression-encre">${c.t('rubrique.liste.titre')}</span></h2>
    </header>
    <form class="filtres" data-filtres role="search" aria-label="${c.s('rubrique.filtres')}" action="${c.url(c.page.cle, 'liste')}">
      <div class="filtres-ligne filtres-rubriques" role="group" aria-label="${c.s('rubrique.parStatut')}">
        <button type="button" class="puce" data-filtre="statut" data-valeur="" aria-pressed="true">${c.t('accueil.fil.tout')} <span class="puce-n">${A.length}</span></button>
        ${statuts.map((x) => html`<button type="button" class="puce" data-filtre="statut" data-valeur="${x.s}" aria-pressed="false"><span class="statut statut--${x.s}">${statutLibelle(c, x.s)}</span> <span class="puce-n">${x.n}</span></button>`)}
      </div>
      <div class="filtres-ligne filtres-bas">
        <div class="champ champ--compact">
          <label for="rub-commune">${c.t('accueil.fil.commune')}</label>
          <select id="rub-commune" name="commune" data-filtre-select="commune">
            <option value="">${c.t('accueil.fil.toutesCommunes')}</option>
            ${communes.map((x) => html`<option value="${x.id}"${x.n ? '' : brut(' disabled')}>${x.nom} (${x.n})</option>`)}
          </select>
        </div>
        <div class="champ champ--compact champ--recherche">
          <label for="rub-q">${c.t('rubrique.chercher')}</label>
          <input id="rub-q" name="q" type="search" autocomplete="off" placeholder="${c.s(`${base}.exemple`)}" data-filtre-q>
        </div>
      </div>
      <p class="filtres-resultat mono" aria-live="polite" data-fil-resultat data-modele="${c.s('rubrique.resultat')}" data-modele-un="${c.s('rubrique.resultatUn')}" data-modele-defaut="${c.s('rubrique.resultat')}">${c.t('rubrique.resultat', { n: A.length })}</p>
    </form>
    <div class="fil-grille fil-grille--rubrique" data-fil-grille data-anime="cascade">
      ${A.map((a) => carteBreve(c, a, { sizes: '(max-width: 760px) 36vw, 30vw' }))}
    </div>
    <p class="fil-vide" data-fil-vide hidden>${c.t('accueil.fil.aucun')} <button type="button" class="lien" data-fil-reinit>${c.t('accueil.fil.reinitialiser')}</button></p>
  </div>
</section>

<section class="etat-chantiers" id="etat">
  <div class="conteneur etat-grille">
    <div>
      <p class="sur-titre">${c.t('rubrique.etat.surTitre')}</p>
      <h2 data-anime="lignes">${c.t('rubrique.etat.titre')}</h2>
      <p class="section-intro" data-anime>${c.t('rubrique.etat.texte')}</p>
    </div>
    <figure class="barres" data-visuel>
      <ul class="barres-liste" data-effet="barres">
        ${statuts.map((x) => html`<li class="barre barre--${x.s}"><span class="statut statut--${x.s}">${statutLibelle(c, x.s)}</span><svg class="barre-svg" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">${brut(`<path class="barre-fond" d="M0 5 H100"/><path class="barre-trait" d="M0 5 H${Math.max(4, (x.n / max) * 100).toFixed(1)}"/>`)}</svg><strong class="barre-n">${x.n}</strong></li>`)}
      </ul>
    </figure>
  </div>
</section>

<section class="pays pays--rubrique" id="plan">
  <div class="conteneur pays-grille">
    <header class="section-tete pays-tete">
      <p class="sur-titre">${c.t('rubrique.plan.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('rubrique.plan.titre'))}"><span class="impression-encre">${c.t('rubrique.plan.titre')}</span></h2>
      <p class="section-intro">${c.t('rubrique.plan.texte', { n: communes.filter((x) => x.n).length })}</p>
      <ul class="pays-liste" data-anime="cascade">
        ${communes.filter((x) => x.n).map((x) => html`<li><span>${x.nom}</span><span class="mono">${c.s(x.n > 1 ? 'accueil.pays.infos' : 'accueil.pays.info', { n: x.n })}</span></li>`)}
      </ul>
    </header>
    ${carteCommunes(c, { compte: (cid) => A.filter((a) => a.communes.includes(cid)).length, id: 'carte-rubrique', titre: c.s('rubrique.plan.alt') })}
  </div>
</section>

<section class="autres-rubriques" id="autres">
  <div class="conteneur">
    <p class="sur-titre">${c.t('rubrique.autres.surTitre')}</p>
    <h2 data-anime="lignes">${c.t('rubrique.autres.titre')}</h2>
    <p class="section-intro" data-anime>${c.t('rubrique.autres.texte')}</p>
    <ul class="autres-liste" data-anime="cascade">
      ${autres.map((x) => html`<li class="autre-rubrique">
        ${visuel(c, { nom: existe(`grok/rubrique-${x.id}`) ? `grok/rubrique-${x.id}` : '', alt: '', classe: 'autre-media', sizes: '(max-width: 760px) 44vw, 16vw', texteCode: x.nom })}
        <a class="autre-lien" href="${lienFil(c, `rubrique=${x.id}`)}" data-libelle="${c.s('pages.accueil.nav')}"><strong>${x.nom}</strong><span class="mono">${c.s(x.n > 1 ? 'rubrique.autres.n' : 'rubrique.autres.un', { n: x.n })}</span></a>
      </li>`)}
    </ul>
    <p class="filtres-bientot">${c.t('commun.bientot', { liste: rubriquesAVenir(c).map((r) => r.nom).join(', ') })}</p>
    <div class="appel-final" data-anime>
      <p class="appel-final-texte">${c.t(`${base}.appel`)}</p>
      ${c.lien('alertez-nous', { params: `type=info&rubrique=${id}`, ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t('commun.actionEntete'), attrs: 'data-survol="magnetique"' })}
    </div>
  </div>
</section>
`;
}
