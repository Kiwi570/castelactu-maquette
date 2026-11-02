/* Page type « rubrique » : Travaux et projets. Les autres rubriques (v2) reprennent ce modèle. */
import { pageRubrique } from '../modeles/rubrique.mjs';

export const page = { cle: 'rubrique-travaux', fichier: 'rubriques/travaux-et-projets', modele: 'rubrique', imagePartage: 'grok/grue-aube-1168.webp' };

export default (c) => pageRubrique(c, 'travaux', { image: 'grok/grue-aube', alt: c.s('images.grue') });
