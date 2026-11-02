/* Page type « formulaire » : Alertez-nous, envoyer une info en 4 étapes (simulé), récapitulatif en direct,
   choix déjà fait selon le lien d'origine (?type=video&rubrique=travaux&sujet=central-8), contact direct. */
import { html, brut, typo } from '../../outils/gabarit.mjs';
import { fleche } from '../gabarits/commun.mjs';
import { visuel } from '../modeles/outils.mjs';

export const page = { cle: 'alertez-nous', fichier: 'alertez-nous', modele: 'formulaire', imagePartage: 'grok/telephone-rue-1168.webp' };

const TYPES = ['info', 'photo', 'video', 'evenement', 'alerte', 'contact'];

export default (c) => {
  const etapes = ['quoi', 'ou', 'details', 'vous'];
  const sujets = Object.fromEntries(c.donnees.articles.map((a) => [a.slug, a.titre]));
  return html`
<section class="page-tete page-tete--image conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu">${c.t('alerte.surTitre')}</p>
    <h1 class="impression impression--tete" data-effet="impression" data-texte="${typo(c.s('alerte.titre'))}"><span class="impression-encre">${c.t('alerte.titre')}</span></h1>
    <p class="section-intro tete-anim" data-anime="gsap" data-tete="fondu">${c.t('alerte.intro')}</p>
    <p class="tete-infos mono tete-anim" data-anime="gsap" data-tete="fondu" data-info-cle><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu"><a class="bouton bouton--alerte" href="#formulaire" data-action-principale data-survol="magnetique">${c.t('alerte.commencer')}</a></p>
  </div>
  ${visuel(c, { nom: 'grok/telephone-rue', alt: c.s('images.telephone'), priorite: true, classe: 'page-tete-media tete-anim', sizes: '(max-width: 760px) 92vw, 46vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde"' })}
</section>

<section class="envoi" id="formulaire" data-masque-barre>
  <div class="conteneur envoi-grille">
    <div class="envoi-principal">
      <header class="section-tete">
        <p class="sur-titre">${c.t('alerte.form.surTitre')}</p>
        <h2 data-anime="lignes">${c.t('alerte.form.titre')}</h2>
      </header>
      <div class="etapes-visuel" data-visuel>
      <ol class="etapes" data-etapes-liste aria-label="${c.s('alerte.form.deroule')}">
        ${etapes.map((e, i) => html`<li class="etape-puce${i === 0 ? ' etape-puce--active' : ''}" data-etape-puce="${i}"${i === 0 ? brut(' aria-current="step"') : ''}><span class="mono">0${i + 1}</span>${c.t(`alerte.form.etapes.${e}`)}</li>`)}
      </ol>
      <svg class="etapes-trait" viewBox="0 0 1000 8" preserveAspectRatio="none" aria-hidden="true" data-fx="trace" focusable="false"><path d="M2 4 H998" fill="none" stroke="currentColor" stroke-width="3"/></svg>
      </div>

      <p class="note-demo">${c.t('alerte.form.demo')}</p>
      <form class="formulaire formulaire--etapes" data-formulaire data-etapes data-requis="${c.s('alerte.form.champRequis')}" data-email="${c.s('alerte.form.emailInvalide')}" action="#" novalidate>
        <input type="hidden" name="sujet" value="" data-sujet-champ data-sujets="${JSON.stringify(sujets)}">
        <p class="sujet-rappel" data-sujet-rappel data-modele="${typo(c.s('alerte.form.sujet'))}" hidden></p>
        <p class="visuellement-cache" role="status" data-etape-annonce data-modele="${c.s('alerte.form.etapeAnnonce')}"></p>

        <fieldset class="etape" data-etape="0">
          <legend class="etape-titre">${c.t('alerte.form.quoiTitre')}</legend>
          <div class="choix-types" role="radiogroup" aria-label="${c.s('alerte.form.type')}">
            ${TYPES.map((t, i) => html`<label class="choix-type"><input type="radio" name="type" value="${t}"${i === 0 ? brut(' checked') : ''} required><span class="choix-type-nom">${c.t(`alerte.types.${t}.nom`)}</span><span class="choix-type-texte">${c.t(`alerte.types.${t}.texte`)}</span></label>`)}
          </div>
          <div class="champ">
            <label for="f-rubrique">${c.t('alerte.form.rubrique')}</label>
            <select id="f-rubrique" name="rubrique">
              <option value="">${c.t('alerte.form.rubriqueAucune')}</option>
              ${c.donnees.rubriques.map((r) => html`<option value="${r.id}">${r.nom}</option>`)}
            </select>
          </div>
        </fieldset>

        <fieldset class="etape" data-etape="1" hidden>
          <legend class="etape-titre">${c.t('alerte.form.etapes.ou')}</legend>
          <div class="champ">
            <label for="f-commune">${c.t('alerte.form.commune')}</label>
            <select id="f-commune" name="commune" required>
              <option value="">${c.t('alerte.form.communeChoisir')}</option>
              ${c.donnees.communes.map((x) => html`<option value="${x.id}">${x.nom}</option>`)}
              <option value="autre">${c.t('alerte.form.communeAutre')}</option>
            </select>
          </div>
          <div class="champ"><label for="f-lieu">${c.t('alerte.form.lieu')}</label><input id="f-lieu" name="lieu" autocomplete="off" placeholder="${c.s('alerte.form.lieuExemple')}"></div>
        </fieldset>

        <fieldset class="etape" data-etape="2" hidden>
          <legend class="etape-titre">${c.t('alerte.form.etapes.details')}</legend>
          <div class="champ"><label for="f-titre">${c.t('alerte.form.titreInfo')}</label><input id="f-titre" name="titre" required maxlength="120"></div>
          <div class="champ"><label for="f-description">${c.t('alerte.form.description')}</label><textarea id="f-description" name="description" rows="5" required></textarea></div>
          <div class="champ"><label for="f-quand">${c.t('alerte.form.quand')}</label><input id="f-quand" name="quand" type="date"></div>
          <div class="champ"><label for="f-fichier">${c.t('alerte.form.fichier')}</label><input id="f-fichier" name="fichier" type="file" accept="image/*,video/*" multiple><p class="champ-aide">${c.t('alerte.form.fichierAide')}</p></div>
        </fieldset>

        <fieldset class="etape" data-etape="3" hidden>
          <legend class="etape-titre">${c.t('alerte.form.etapes.vous')}</legend>
          <div class="champs-duo">
            <div class="champ"><label for="f-prenom">${c.t('alerte.form.prenom')}</label><input id="f-prenom" name="prenom" autocomplete="given-name" required></div>
            <div class="champ"><label for="f-nom">${c.t('alerte.form.nom')}</label><input id="f-nom" name="nom" autocomplete="family-name"></div>
          </div>
          <div class="champs-duo">
            <div class="champ"><label for="f-email">${c.t('alerte.form.email')}</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
            <div class="champ"><label for="f-tel">${c.t('alerte.form.tel')}</label><input id="f-tel" name="tel" type="tel" autocomplete="tel"></div>
          </div>
          <div class="champ champ--case"><input id="f-accord" name="accord" type="checkbox" required><label for="f-accord">${c.t('alerte.form.accord')}</label></div>
          <p class="mention-donnees">${c.tb('alerte.form.donnees')}</p>
        </fieldset>

        <div class="etapes-actions">
          <button type="button" class="bouton bouton--contour" data-etape-precedente hidden>${c.t('alerte.form.precedent')}</button>
          <button type="button" class="bouton" data-etape-suivante>${c.t('alerte.form.suivant')}</button>
          <button type="submit" class="bouton bouton--alerte" data-etape-envoyer hidden>${c.t('alerte.form.envoyer')}</button>
        </div>
        <p data-message-envoi role="status" tabindex="-1" hidden data-texte="${typo(c.s('alerte.form.envoye'))}"></p>
      </form>
    </div>

    <aside class="recap" aria-labelledby="recap-titre" data-recap>
      <p class="sur-titre" id="recap-titre">${c.t('alerte.recap.titre')}</p>
      <dl class="recap-liste">
        <div><dt>${c.t('alerte.recap.type')}</dt><dd data-recap-champ="type">—</dd></div>
        <div><dt>${c.t('alerte.recap.rubrique')}</dt><dd data-recap-champ="rubrique">—</dd></div>
        <div><dt>${c.t('alerte.recap.ou')}</dt><dd data-recap-champ="commune,lieu">—</dd></div>
        <div><dt>${c.t('alerte.recap.titreInfo')}</dt><dd data-recap-champ="titre">—</dd></div>
        <div><dt>${c.t('alerte.recap.fichiers')}</dt><dd data-recap-champ="fichier">—</dd></div>
        <div><dt>${c.t('alerte.recap.contact')}</dt><dd data-recap-champ="prenom,email">—</dd></div>
      </dl>
      <p class="recap-note">${c.t('alerte.recap.note')}</p>
    </aside>
  </div>
</section>

<section class="contact-direct" id="contact">
  <div class="conteneur contact-grille">
    ${visuel(c, { nom: 'grok/rubrique-videos', alt: c.s('images.camera'), classe: 'contact-media', sizes: '(max-width: 760px) 92vw, 44vw', attrs: 'data-anime="rideau"' })}
    <div>
      <p class="sur-titre">${c.t('alerte.contact.surTitre')}</p>
      <h2 data-anime="lignes">${c.t('alerte.contact.titre')}</h2>
      <dl class="fiche fiche--contact" data-anime="cascade">
        <div><dt>${c.t('alerte.contact.email')}</dt><dd><a href="mailto:${c.site.contact.email}">${c.site.contact.email}</a></dd></div>
        <div><dt>${c.t('alerte.contact.tel')}</dt><dd><a href="tel:${c.site.contact.telephoneLien}">${c.site.contact.telephone}</a></dd></div>
        <div><dt>${c.t('alerte.contact.adresse')}</dt><dd>${c.t('commun.association')}, ${c.site.contact.adresse}</dd></div>
        <div><dt>${c.t('alerte.contact.reseaux')}</dt><dd><a href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')} ${fleche}</a></dd></div>
      </dl>
      <p class="note-source">${c.t('alerte.contact.note')}</p>
    </div>
  </div>
</section>
`;
};
