/* Mentions légales d'un service de presse en ligne : fiche à compléter, éditeur, directeur de la publication,
   hébergeur (adresse vérifiée sur vercel.com le 2 novembre 2026), droit de réponse, propriété, crédits,
   confidentialité. Barre de lecture et sommaire qui suit la lecture. Page de texte : dispensée d'effet par section. */
import { html } from '../../outils/gabarit.mjs';
import { visuel } from '../modeles/outils.mjs';

export const page = { cle: 'mentions-legales', fichier: 'mentions-legales', modele: 'legal', sansAction: true, sansEffet: true, imagePartage: 'grok/papier-vierge-1168.webp' };

const sections = ['editeur', 'publication', 'hebergeur', 'reponse', 'propriete', 'credits', 'confidentialite', 'cookies', 'fiche'];

export default (c) => html`
<div data-barre-lecture aria-hidden="true"></div>
<section class="page-tete page-tete--image page-tete--legal conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre">${c.t('mentions.surTitre')}</p>
    <h1>${c.t('mentions.titre')}</h1>
    <p class="section-intro">${c.t('mentions.intro')}</p>
    <nav data-sommaire aria-label="${c.s('commun.sommaire')}"><ul>${sections.map((s) => html`<li><a href="#${s}" data-sans-transition>${c.t(`mentions.${s}.titre`)}</a></li>`)}</ul></nav>
  </div>
  ${visuel(c, { nom: 'grok/papier-vierge', alt: c.s('images.papier'), priorite: true, classe: 'page-tete-media', sizes: '(max-width: 760px) 92vw, 40vw' })}
</section>
<div class="texte-long conteneur" data-sans-visuel>
  ${sections.map((s) => html`<section id="${s}" data-sans-visuel><h2>${c.t(`mentions.${s}.titre`)}</h2>${c.tb(`mentions.${s}.texte`)}</section>`)}
</div>
`;
