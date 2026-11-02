/* Outils partagés par les pages Castel Actu : visuels (image ou visuel dessiné en code si l'image manque),
   cartes de brèves, statuts des chantiers, liens vers les brèves (page de la maquette ou post Facebook). */
import { readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { html, brut } from '../../outils/gabarit.mjs';
import { fleche } from '../gabarits/commun.mjs';

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/* Vrai si l'image existe (au moins une taille WebP) dans assets/images. */
export function existe(nom) {
  if (!nom) return false;
  const dossier = join(racine, 'assets/images', dirname(nom));
  if (!existsSync(dossier)) return false;
  const base = nom.split('/').pop();
  return readdirSync(dossier).some((f) => f.startsWith(base + '-') && f.endsWith('.webp') && /-\d+\.webp$/.test(f) && !f.slice(base.length + 1).startsWith('mobile'));
}

const motif = (graine = 1) => {
  const traits = Array.from({ length: 9 }, (_, i) => {
    const y = 18 + i * 22 + ((graine * 7 + i * 3) % 9);
    return `<path d="M-10 ${y} C 90 ${y - 14 + (i % 3) * 6}, 210 ${y + 16}, 410 ${y - 4}" fill="none" stroke="currentColor" stroke-width="1" opacity="${0.18 + (i % 3) * 0.08}"/>`;
  }).join('');
  return brut(`<svg class="visuel-code-motif" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${traits}</svg>`);
};

/* Image du projet, ou visuel dessiné en code tant qu'elle manque (jamais un cadre vide). */
export function visuel(c, o) {
  if (existe(o.nom)) return c.media(o);
  const style = o.ratio ? brut(` style="aspect-ratio:${o.ratio}"`) : '';
  return html`<figure class="media visuel-code ${o.classe || ''}" data-visuel${o.alt ? html` role="img" aria-label="${o.alt}"` : brut(' aria-hidden="true"')}${brut(o.attrs ? ' ' + o.attrs : '')}${style}>
  ${motif((o.nom || '').length)}
  <figcaption class="visuel-code-texte">${o.texteCode || ''}</figcaption>
</figure>`;
}

export const STATUTS = ['construction', 'renovation', 'travaux', 'projet', 'prochainement', 'annule'];
export const statutLibelle = (c, s) => (s ? c.s(`statuts.${s}`) : '');

export const nomCommune = (c, id) => (c.donnees.communes.find((x) => x.id === id) || { nom: id }).nom;
export const nomRubrique = (c, id) => (c.donnees.rubriques.find((x) => x.id === id) || { nom: id }).nom;
export const communesTexte = (c, a) => a.communes.map((id) => nomCommune(c, id)).join(', ');

/* Lien d'une brève : sa page dans la maquette si elle existe, sinon son post Facebook (nouvel onglet), sinon rien.
   Le « nouvel onglet » est dit par une description commune (#note-facebook), pas par un texte caché dans le lien. */
export function lienBreve(c, a, contenu, { classe = 'carte-lien', attrs = '' } = {}) {
  if (a.page && c.pages[a.page]) return c.lien(a.page, { classe, texte: contenu, attrs });
  if (a.facebook) return html`<a class="${classe}" href="${a.facebook}" target="_blank" rel="noopener" aria-describedby="note-facebook"${brut(attrs ? ' ' + attrs : '')}>${contenu}</a>`;
  return html`<span class="${classe} carte-lien--inerte">${contenu}</span>`;
}

export const sourceLibelle = (c, a) => (a.page && c.pages[a.page] ? c.s('commun.lireBreve') : a.facebook ? c.s('commun.lireFacebook') : c.s('commun.lienAFournir'));

const format = (n) => new Intl.NumberFormat('fr-FR').format(n).replace(/\s/g, '\u00a0');
export const vues = (n) => format(n);

/* Visuel d'une brève : photo, perspective, illustration du client ou visuel typographique dessiné en code. */
export function visuelBreve(c, a, { classe = 'carte-media', sizes = '(max-width: 760px) 92vw, 30vw', attrs = '', priorite = false } = {}) {
  const img = a.image;
  if (img && existe(img.nom)) {
    const legende = img.type === 'perspective' ? c.s('commun.legendePerspective') : img.type === 'logo' ? c.s('commun.legendeLogo') : '';
    return c.media({ nom: img.nom, alt: img.alt, classe: `${classe} media--${img.type}`, sizes, attrs, priorite, cadrage: img.cadrage || '50% 50%', legende: legende || undefined });
  }
  return html`<figure class="media visuel-typo ${classe}" data-visuel role="img" aria-label="${c.s('commun.visuelTypo', { sujet: a.etiquette })}"${brut(attrs ? ' ' + attrs : '')}>
  ${motif(a.slug.length)}
  <span class="visuel-typo-mot" aria-hidden="true">${a.motVisuel || a.etiquette}</span>
  <span class="visuel-typo-lieu" aria-hidden="true">${communesTexte(c, a)}</span>
</figure>`;
}

/* Carte d'une brève. sansImage : version typographique (la brève a déjà son image ailleurs sur la page).
   La méta donne la rubrique (l'étiquette reste sur le visuel), la commune, l'état du chantier et le format. */
export function carteBreve(c, a, { sansImage = false, titre = 'h3', attrs = '', sizes } = {}) {
  const T = titre;
  const meta = html`<p class="carte-meta"><span class="etiquette">${nomRubrique(c, a.rubrique)}</span><span>${communesTexte(c, a)}</span>${a.statut ? html`<span class="statut statut--${a.statut}">${statutLibelle(c, a.statut)}</span>` : ''}${a.format === 'video' ? html`<span class="format-video">${c.t('commun.video')}</span>` : ''}</p>`;
  const lien = (a.page && c.pages[a.page]) || a.facebook;
  return html`<article class="carte-breve${sansImage ? ' carte-breve--texte' : ''}${a.statut === 'annule' ? ' carte-breve--annule' : ''}" data-breve="${a.slug}" data-rubrique="${a.rubrique}" data-communes="${a.communes.join(' ')}" data-format="${a.format}" data-statut="${a.statut || ''}" data-recherche-texte="${[a.titre, a.chapeau, a.etiquette, communesTexte(c, a), nomRubrique(c, a.rubrique)].join(' ')}"${brut(attrs ? ' ' + attrs : '')}>
  ${sansImage ? '' : visuelBreve(c, a, sizes ? { sizes } : {})}
  <div class="carte-corps">
    ${meta}
    <${brut(T)} class="carte-titre">${lienBreve(c, a, a.titre)}</${brut(T)}>
    ${a.chapeau ? html`<p class="carte-chapeau">${a.chapeau}</p>` : ''}
    ${lien ? html`<p class="carte-source">${sourceLibelle(c, a)}${a.facebook && !(a.page && c.pages[a.page]) ? fleche : ''}</p>` : ''}
  </div>
</article>`;
}
