/* Page 404 : titre propre au métier, image de la feuille froissée. Une seule version. */
import { html, typo } from '../../outils/gabarit.mjs';
import { visuel } from '../modeles/outils.mjs';

export const page = { cle: '404', fichier: '404', langues: ['fr'], partage: false };

export default (c) => html`
<section class="page-tete page-tete--image conteneur introuvable" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre">${c.t('introuvable.surTitre')}</p>
    <h1 class="impression impression--tete" data-effet="impression" data-texte="${typo(c.s('introuvable.titre'))}"><span class="impression-encre">${c.t('introuvable.titre')}</span></h1>
    <p class="section-intro tete-anim" data-anime="gsap" data-tete="fondu">${c.t('introuvable.texte')}</p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu">${c.lien('accueil', { classe: 'bouton', texte: c.t('introuvable.retour'), attrs: 'data-action-principale data-survol="magnetique"' })} <a class="lien-fleche" href="${c.url('accueil', 'fil')}">${c.t('introuvable.fil')}</a></p>
  </div>
  ${visuel(c, { nom: 'grok/feuille-froissee', alt: c.s('images.feuille'), priorite: true, classe: 'page-tete-media tete-anim', sizes: '(max-width: 760px) 92vw, 44vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde"' })}
</section>
`;
