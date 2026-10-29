// Castel Actu — Chantiers : les chiffres, la visite (galerie épinglée), le suivi statut par statut
import { demarrer, anime, pointeurFin, odometre, imageHTML, echap, trames, tampons, ancreInitiale } from './app.js?v=4';
import { ARTICLES, nombre } from './data.js?v=4';
import { $, $$, GROUPES, groupeDe, tamponDe, phraseEcheance, mentionImage, lienArticle, nomsCommunes, galerieChantiers } from './sections.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;

const TOUS = ARTICLES.filter(a => a.chantier);
const PAR_GROUPE = GROUPES.map(gr => ({ ...gr, liste: TOUS.filter(a => groupeDe(a) === gr.id) })).filter(gr => gr.liste.length);
const CLASSE = { travaux: '', projet: 'tampon--bleu', passee: 'tampon--passe', annule: 'tampon--annule' };

/* ---------- Les chiffres (liens vers chaque groupe du suivi) ---------- */
function chiffres() {
  const box = $('[data-chiffres]');
  box.innerHTML = `<a class="chiffre" href="#galerie"><span class="chiffre__nb" data-odo="${TOUS.length}">${TOUS.length}</span><span class="chiffre__txt">chantiers et projets suivis</span></a>` +
    PAR_GROUPE.map(gr => `<a class="chiffre" href="#suivi-${gr.id}"><span class="chiffre__nb" data-odo="${gr.liste.length}">${gr.liste.length}</span><span class="chiffre__txt">${echap(gr.liste.length > 1 ? gr.court : (gr.courtUn || gr.court))}</span></a>`).join('');
  $$('[data-odo]', box).forEach(el => odometre(el, { valeur: +el.dataset.odo }));
}

/* ---------- Le suivi ---------- */
function suivi() {
  const box = $('[data-suivi]');
  box.innerHTML = PAR_GROUPE.map(gr => `<div class="suivi__groupe" id="suivi-${gr.id}">
      <h3 class="suivi__titre"><span class="tampon ${CLASSE[gr.id]}" data-tampon>${echap(gr.nom)}</span><span class="suivi__nb">${gr.liste.length}</span></h3>
      <ol class="suivi__liste">${gr.liste.map(a => {
        const t = tamponDe(a), ech = phraseEcheance(a);
        return `<li><a class="suivi__ligne" href="${lienArticle(a)}" data-apercu-id="${a.id}">
          <span class="suivi__vignette trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '96px', largeur: 480 })}${a.ia ? '<span class="mention-ia">Illustration IA</span>' : ''}</span>
          <span class="suivi__nom">${echap(a.titre)}</span>
          <span class="suivi__commune">${echap(nomsCommunes(a))}</span>
          <span class="suivi__etat">${echap(ech || (t ? `Statut annoncé : ${t.texte.toLowerCase()}.` : 'Statut à compléter.'))}</span>
          <span class="suivi__vues">${a.vues ? `${nombre(a.vues)} vues` : ''}</span>
          <span class="suivi__fleche" aria-hidden="true">→</span>
        </a></li>`;
      }).join('')}</ol>
    </div>`).join('');
  trames(box); tampons(box);
  if (anime()) {
    $$('.suivi__liste', box).forEach(ol => g.from($$('li', ol), { opacity: 0, y: 18, duration: .6, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: ol, start: 'top 90%', once: true } }));
  }
  apercu(box);
}

/* Au survol d'une ligne, la photo du chantier suit le pointeur (souris seulement) */
function apercu(box) {
  const fl = $('[data-apercu]');
  if (!fl || !anime() || !pointeurFin) return;
  document.documentElement.classList.add('apercu-actif');
  fl.innerHTML = TOUS.map(a => `<figure data-pour="${a.id}">${imageHTML(a.image, { alt: '', sizes: '320px', largeur: 480 })}${mentionImage(a)}</figure>`).join('');
  const x = g.quickTo(fl, 'x', { duration: .45, ease: 'power3.out' });
  const y = g.quickTo(fl, 'y', { duration: .45, ease: 'power3.out' });
  const r = g.quickTo(fl, 'rotate', { duration: .6, ease: 'power3.out' });
  let px = 0, actif = null, visible = false;
  const montrer = id => {
    if (id === actif) return;
    actif = id;
    $$('figure', fl).forEach(f => f.classList.toggle('actif', f.dataset.pour === id));
    if (!visible) { visible = true; g.to(fl, { autoAlpha: 1, scale: 1, duration: .35, ease: 'power3.out', overwrite: 'auto' }); }
  };
  const cacher = () => { actif = null; visible = false; g.to(fl, { autoAlpha: 0, scale: .85, duration: .3, ease: 'power2.in', overwrite: 'auto' }); };
  g.set(fl, { autoAlpha: 0, scale: .85, xPercent: -50, yPercent: -50 });
  box.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const l = e.target.closest('[data-apercu-id]');
    if (!l) { if (visible) cacher(); return; }
    // tant que la photo n'est pas visible, elle se place directement sous le pointeur
    // la photo se place à droite du pointeur, ou à gauche près du bord de l'écran
    const cx = e.clientX > window.innerWidth - 380 ? e.clientX - 170 : e.clientX + 170;
    const cy = Math.max(124, Math.min(window.innerHeight - 124, e.clientY));
    if (!visible) { g.set(fl, { x: cx, y: cy }); px = e.clientX; }
    montrer(l.dataset.apercuId);
    x(cx); y(cy);
    r(Math.max(-8, Math.min(8, (e.clientX - px) * .6)));
    px = e.clientX;
  });
  box.addEventListener('pointerleave', cacher);
  window.addEventListener('scroll', () => { if (visible) cacher(); }, { passive: true });
}

/* ---------- La visite ---------- */
function visite() {
  const intro = `<div class="chantiers__intro">
      <div class="trame" data-trame>${imageHTML('img/grok/accueil-chantiers-ruban-16x9', { alt: '', sizes: '(min-width: 900px) 30vw, 78vw' })}<span class="mention-ia">Illustration IA</span></div>
      <p>${TOUS.length} chantiers et projets suivis par Castel Actu. Statut tel qu’annoncé sur le site actuel, à mettre à jour ; une échéance dépassée s’affiche d’elle-même.</p>
    </div>`;
  const fin = `<a class="chantiers__fin" href="#suivi">
      <span class="chantiers__fin-nb">${TOUS.length}</span>
      <span class="chantiers__fin-txt">chantiers classés par statut, de l’annonce à la livraison</span>
      <span class="chantiers__fin-cta">Voir le suivi</span>
    </a>`;
  galerieChantiers($('[data-chantiers]'), { liste: TOUS, intro, fin });
}

/* ---------- Démarrage ---------- */
// le navigateur a pu sauter à l'ancre avant le script : on construit depuis le haut, puis on y retourne
if (window.scrollY) window.scrollTo(0, 0);
chiffres();
suivi();
demarrer();
// la galerie épinglée est créée en dernier : les déclencheurs placés avant elle sont déjà en place
visite();
ST?.sort?.();
ST?.refresh();
ancreInitiale();
document.fonts?.ready.then(() => ST?.refresh());
