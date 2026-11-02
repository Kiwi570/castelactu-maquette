/* Tampon « 10 ans » : frappe la page au défilement (effet « tampon-10-ans »). Dates réelles :
   page Facebook créée le 13 novembre 2016, 10 ans le 13 novembre 2026. */
import { html, brut } from '../../outils/gabarit.mjs';

export function tampon(c, { id = 'tampon' } = {}) {
  return html`<div class="tampon" data-superpose data-effet="tampon-10-ans">
  <svg viewBox="0 0 320 320" role="img" aria-label="${c.s('tampon.alt')}" focusable="false">
    <defs><path id="${id}-cercle" d="M160 160 m-118 0 a118 118 0 1 1 236 0 a118 118 0 1 1 -236 0"/></defs>
    <circle cx="160" cy="160" r="150" class="tampon-bord"/>
    <circle cx="160" cy="160" r="98" class="tampon-bord tampon-bord--fin"/>
    <text class="tampon-cercle"><textPath href="#${id}-cercle" startOffset="0">${c.t('tampon.cercle')}</textPath></text>
    <text x="160" y="178" text-anchor="middle" class="tampon-dix">10</text>
    <text x="160" y="214" text-anchor="middle" class="tampon-ans">${c.t('tampon.ans')}</text>
    ${brut('<path class="tampon-etoile" d="M160 66l4 9 10 1-7.5 6.5 2.5 9.5-9-5-9 5 2.5-9.5L146 76l10-1z"/>')}
  </svg>
</div>`;
}
