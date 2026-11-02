/* Plan schématique des 11 communes (positions approximatives, d'après leurs coordonnées) :
   effet « radar-communes » (balayage au défilement, communes qui s'allument). Chaque commune porte
   son nom et son nombre d'infos, visibles sans interaction ; la toucher filtre le fil de l'accueil. */
import { html, brut } from '../../outils/gabarit.mjs';
import { lienFil } from '../gabarits/commun.mjs';

const LON = [-1.58, -1.25], LAT = [47.59, 47.87];
const KX = Math.cos((47.73 * Math.PI) / 180);
const S = 600 / ((LON[1] - LON[0]) * KX);
export const projeter = (lon, lat) => [(lon - LON[0]) * KX * S, (LAT[1] - lat) * S];
const H = Math.round((LAT[1] - LAT[0]) * S);

/* Placement des étiquettes (dx, dy, ancre) pour qu'aucune ne touche une voisine, sur ordinateur comme sur téléphone. */
const PLACE = {
  villepot: [-18, 0, 'end'], soudan: [-18, -16, 'end'], erbray: [-18, 0, 'end'], rouge: [-18, 0, 'end'],
  treffieux: [0, 44, 'middle'], soulvache: [18, -4, 'start'],
};

export function carteCommunes(c, { compte, id = 'carte', titre = '', libelle: etiquette } = {}) {
  const centre = c.donnees.communes.find((x) => x.id === 'chateaubriant');
  const [cx, cy] = projeter(centre.lon, centre.lat);
  const r = 560;
  const a0 = (-22 * Math.PI) / 180, a1 = (22 * Math.PI) / 180;
  const secteur = `M${cx.toFixed(1)} ${cy.toFixed(1)} L${(cx + r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(cx + r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`;
  const points = c.donnees.communes.map((x) => {
    const [px, py] = projeter(x.lon, x.lat);
    const n = compte(x.id);
    const angle = ((Math.atan2(py - cy, px - cx) * 180) / Math.PI + 360) % 360;
    const [dx, dy, ancre] = PLACE[x.id] || [18, 0, 'start'];
    const tx = px + dx;
    const libelle = etiquette ? etiquette(n) : n ? c.s(n > 1 ? 'accueil.pays.infos' : 'accueil.pays.info', { n }) : c.s('accueil.pays.aucune');
    const contenu = brut(`<rect class="commune-zone" x="${(px - 54).toFixed(1)}" y="${(py - 54).toFixed(1)}" width="108" height="108" rx="54"/>
      <circle class="commune-onde" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${n ? 22 : 14}"/>
      <circle class="commune-point" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${n ? 9 : 6}"/>`);
    const textes = html`<text class="commune-nom" x="${tx.toFixed(1)}" y="${(py - 2 + dy).toFixed(1)}" text-anchor="${ancre}">${x.nom}</text><text class="commune-n" x="${tx.toFixed(1)}" y="${(py + 24 + dy).toFixed(1)}" text-anchor="${ancre}">${libelle}</text>`;
    return n
      ? html`<a class="commune commune--active" href="${lienFil(c, `commune=${x.id}`)}" data-filtre-commune="${x.id}" data-angle="${angle.toFixed(1)}" data-libelle="${c.s('pages.accueil.nav')}" aria-label="${etiquette ? x.nom : `${x.nom} : ${libelle}`}">${contenu}${textes}</a>`
      : html`<g class="commune commune--vide" data-angle="${angle.toFixed(1)}" aria-hidden="true">${contenu}${textes}</g>`;
  });
  return html`<figure class="carte-communes" data-visuel>
  <svg id="${id}" class="radar" ${brut(`viewBox="-20 -20 640 ${H + 40}"`)} role="group" aria-label="${titre || c.s('accueil.pays.carteAlt')}" data-effet="radar-communes" data-centre="${cx.toFixed(1)} ${cy.toFixed(1)}" focusable="false">
    <defs>
      <radialGradient id="${id}-balayage" cx="${(cx / 600).toFixed(3)}" cy="${(cy / H).toFixed(3)}" r="0.9" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="currentColor" stop-opacity=".0"/><stop offset="1" stop-color="currentColor" stop-opacity=".22"/></radialGradient>
    </defs>
    <g class="radar-anneaux" aria-hidden="true">
      ${[110, 220, 330, 440].map((ra) => brut(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${ra}"/>`))}
      ${brut(`<path d="M${cx.toFixed(1)} -20 V${H + 20} M-20 ${cy.toFixed(1)} H620"/>`)}
    </g>
    ${brut(`<clipPath id="${id}-cercle"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="440"/></clipPath><g clip-path="url(#${id}-cercle)" aria-hidden="true"><g class="radar-balayage"><path d="${secteur}" fill="url(#${id}-balayage)"/><path class="radar-aiguille" d="M${cx.toFixed(1)} ${cy.toFixed(1)} L${(cx + r).toFixed(1)} ${cy.toFixed(1)}"/></g></g>`)}
    ${points}
  </svg>
  <figcaption class="note-source">${c.t('accueil.pays.note')}</figcaption>
</figure>`;
}
