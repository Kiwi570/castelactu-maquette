/* Lecteur des podcasts « En bref » : forme d'onde qui respire (effet « onde-podcast »).
   Les fichiers audio ne sont pas encore fournis : le bouton le dit, rien n'est lu. */
import { html } from '../../outils/gabarit.mjs';

export function lecteurPodcast(c, p, { grand = false } = {}) {
  return html`<article class="podcast${grand ? ' podcast--grand' : ''}" data-podcast="${p.id}">
  <button type="button" class="podcast-lecture" data-podcast-lecture aria-describedby="statut-${p.id}"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg><span class="visuellement-cache">${c.t('podcast.ecouter', { titre: p.titre })}</span></button>
  <div class="podcast-texte">
    <p class="sur-titre">${c.t('podcast.surTitre')}</p>
    <h3 class="podcast-titre">${p.titre}</h3>
    <p class="podcast-meta mono"><span>${p.duree}</span><span>${c.t('podcast.aFournir')}</span></p>
  </div>
  <canvas class="podcast-onde" data-effet="onde-podcast" width="640" height="96" aria-hidden="true"></canvas>
  <p class="podcast-statut" id="statut-${p.id}" role="status" data-podcast-statut data-message="${c.s('podcast.statut')}"></p>
</article>`;
}
