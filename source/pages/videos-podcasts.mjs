/* Page type « médias » : le direct, les podcasts « En bref », les vidéos en bref, Castel FM.
   Fichiers audio et lien du direct à fournir : rien n'est simulé comme réel. */
import { html, typo } from '../../outils/gabarit.mjs';
import { visuel, carteBreve } from '../modeles/outils.mjs';
import { lecteurPodcast } from '../modeles/podcast.mjs';

export const page = { cle: 'videos-podcasts', fichier: 'videos-et-podcasts', modele: 'medias', imagePartage: 'grok/studio-radio-1168.webp' };

export default (c) => {
  const videos = c.donnees.articles.filter((a) => a.format === 'video');
  return html`
<section class="page-tete page-tete--image conteneur" id="debut">
  <div class="page-tete-texte">
    <p class="sur-titre tete-anim" data-anime="gsap" data-tete="fondu">${c.t('medias.surTitre')}</p>
    <h1 class="impression impression--tete" data-effet="impression" data-texte="${typo(c.s('medias.titre'))}"><span class="impression-encre">${c.t('medias.titre')}</span></h1>
    <p class="section-intro tete-anim" data-anime="gsap" data-tete="fondu">${c.t('medias.intro')}</p>
    <p class="tete-infos mono tete-anim" data-anime="gsap" data-tete="fondu" data-info-cle><strong>${c.t('medias.nVideos', { n: videos.length })}</strong><span>${c.t('medias.nPodcasts', { n: c.donnees.podcasts.length })}</span></p>
    <p class="tete-actions tete-anim" data-anime="gsap" data-tete="fondu">
      ${c.lien('alertez-nous', { params: 'type=video', ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t('medias.envoyer'), attrs: 'data-action-principale data-survol="magnetique"' })}
      <a class="lien-fleche" href="#podcasts">${c.t('medias.ecouter')}</a>
    </p>
  </div>
  ${visuel(c, { nom: 'grok/studio-radio', alt: c.s('images.studio'), priorite: true, classe: 'page-tete-media tete-anim', sizes: '(max-width: 760px) 92vw, 46vw', attrs: 'data-anime="gsap" data-tete="media" data-fx="onde"' })}
</section>

<section class="direct" id="direct">
  <div class="conteneur direct-grille">
    ${visuel(c, { nom: 'grok/rubrique-videos', alt: c.s('images.camera'), classe: 'direct-media', sizes: '(max-width: 760px) 92vw, 50vw', attrs: 'data-fx="parallaxe" data-fx-force="9"' })}
    <div class="direct-texte">
      <p class="sur-titre"><span class="direct-pastille" aria-hidden="true"></span>${c.t('medias.direct.surTitre')}</p>
      <h2 data-anime="lignes">${c.t('medias.direct.titre')}</h2>
      <p data-anime>${c.t('medias.direct.texte')}</p>
      <p class="direct-attente mono" data-anime>${c.t('medias.direct.attente')}</p>
      <p data-anime><a class="bouton bouton--contour bouton--clair" href="${c.site.contact.facebook}" target="_blank" rel="noopener">${c.t('commun.facebook')}</a></p>
    </div>
  </div>
</section>

<section class="ecoute ecoute--page" id="podcasts">
  <div class="conteneur">
    <header class="section-tete">
      <p class="sur-titre">${c.t('medias.podcasts.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('medias.podcasts.titre'))}"><span class="impression-encre">${c.t('medias.podcasts.titre')}</span></h2>
      <p class="section-intro">${c.t('medias.podcasts.texte')}</p>
    </header>
    <div class="podcasts podcasts--grand">${c.donnees.podcasts.map((p) => lecteurPodcast(c, p, { grand: true }))}</div>
  </div>
</section>

<section class="videos" id="videos">
  <div class="conteneur">
    <header class="section-tete">
      <p class="sur-titre">${c.t('medias.videos.surTitre', { n: videos.length })}</p>
      <h2 data-anime="lignes">${c.t('medias.videos.titre')}</h2>
      <p class="section-intro" data-anime>${c.t('medias.videos.texte')}</p>
    </header>
    <div class="fil-grille videos-grille" data-anime="cascade">${videos.map((a, i) => carteBreve(c, a, { sizes: i ? '(max-width: 760px) 36vw, 30vw' : '(max-width: 760px) 36vw, 60vw' }))}</div>
    <div class="appel-final" data-anime>
      <p class="appel-final-texte">${c.t('medias.appel')}</p>
      ${c.lien('alertez-nous', { params: 'type=video', ancre: 'formulaire', classe: 'bouton bouton--alerte', texte: c.t('medias.envoyer'), attrs: 'data-survol="magnetique"' })}
    </div>
  </div>
</section>

<section class="castel-fm" id="castel-fm">
  <div class="conteneur fm-grille">
    <div>
      <p class="sur-titre">${c.t('medias.fm.surTitre')}</p>
      <h2 class="impression" data-effet="impression" data-texte="${typo(c.s('medias.fm.titre'))}"><span class="impression-encre">${c.t('medias.fm.titre')}</span></h2>
      <p class="section-intro">${c.t('medias.fm.texte')}</p>
    </div>
    ${visuel(c, { nom: 'grok/rubrique-medias', alt: c.s('images.medias'), classe: 'fm-media', sizes: '(max-width: 760px) 92vw, 40vw', attrs: 'data-fx="zoom"' })}
  </div>
</section>
`;
};
