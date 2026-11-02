/* Page type « article » : Central 8, la brève la plus lue. Les autres brèves (v2) reprennent ce modèle. */
import { pageArticle } from '../modeles/article.mjs';

export const page = { cle: 'article-central-8', fichier: 'articles/central-8', modele: 'article', ogType: 'article', imagePartage: 'articles/central-8-logo-785.webp' };

export default (c) => pageArticle(c, 'central-8', { lies: ['le-smash', 'zone-commerciale-8-mai', 'bijouterie-de-camille'] });
