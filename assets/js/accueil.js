// Castel Actu — page d'accueil (la Une, puis un aperçu de chaque cahier)
import { demarrer, anime, odometre, echap, tramesGL, tampons, ancreInitiale } from './app.js?v=4';
import { ARTICLES, RUBRIQUES, AGENDA, ALERTE } from './data.js?v=4';
import { $, $$, tamponDe, phraseEcheance, lienArticle, filCourt, galerieChantiers, classement, podcasts, etatEvenement } from './sections.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;

/* ---------- Ouverture : la rotative ----------
   Elle est entièrement animée en CSS (aucune dépendance au chargement du script).
   Ici, on se cale seulement sur l'ouverture des volets pour lancer la suite. */
const OUVERTURE_VOLETS = 1340; // ms, identique au CSS
function ouverture() {
  const r = $('.rotative');
  if (!r || getComputedStyle(r).display === 'none') return Promise.resolve(false);
  const retirer = () => { r.remove(); window.__ouvertureFin = performance.now(); };
  r.addEventListener('animationend', e => { if (e.target === r && e.animationName === 'rotative-fin') retirer(); });
  setTimeout(retirer, 2600);
  return new Promise(resolve => {
    const volet = $('.rotative__haut', r);
    const a = volet.getAnimations ? volet.getAnimations()[0] : null;
    if (a && a.currentTime != null) {
      const reste = OUVERTURE_VOLETS - a.currentTime;
      setTimeout(() => resolve(true), Math.max(0, reste));
    } else {
      volet.addEventListener('animationstart', () => resolve(true), { once: true });
      setTimeout(() => resolve(true), 1600);
    }
  });
}

/* ---------- La Une ---------- */
function une() {
  const a = ARTICLES.find(x => x.une);
  const statut = $('[data-statut]');
  if (statut && a) {
    // le statut est déjà écrit dans la page ; on ne le réécrit que s'il a changé depuis
    const t = tamponDe(a);
    const tp = $('.tampon', statut), ph = $('p', statut);
    if (t && tp.textContent !== t.texte) { tp.textContent = t.texte; tp.className = `tampon ${t.classe}`; }
    const phrase = phraseEcheance(a);
    if (ph.textContent !== phrase) ph.textContent = phrase;
  }
  // défilant
  const ul = $('[data-ticker]');
  const items = ARTICLES.map(x => `<li><a href="${lienArticle(x)}" tabindex="-1">${echap(x.titre)}</a></li>`).join('');
  ul.innerHTML = items + items;
  if (anime()) {
    const tw = g.to(ul, { xPercent: -50, duration: ARTICLES.length * 5.2, ease: 'none', repeat: -1 });
    const piste = ul.parentElement;
    piste.addEventListener('pointerenter', () => g.to(tw, { timeScale: 0.15, duration: .5 }));
    piste.addEventListener('pointerleave', () => g.to(tw, { timeScale: 1, duration: .5 }));
    ST.create({ trigger: piste, start: 'top bottom', end: 'bottom top', onToggle: s => (s.isActive ? tw.resume() : tw.pause()) });
  } else {
    ul.parentElement.style.overflowX = 'auto';
  }

  // alerte : état réel + exemple
  const calmeEl = $('[data-alerte-calme]'), actif = $('[data-alerte-active]');
  const pastille = $('.etat-alerte');
  if (ALERTE) {
    calmeEl.hidden = true; actif.hidden = false;
    $('b', actif).textContent = ALERTE.titre; $('span', actif).textContent = ALERTE.texte;
    $('[data-alerte-fermer]', actif).remove();
    pastille.dataset.etat = 'alerte'; $('.etat-alerte__txt', pastille).textContent = 'Alerte en cours';
  }
  $('[data-alerte-demo]')?.addEventListener('click', () => {
    calmeEl.hidden = true; actif.hidden = false;
    pastille.dataset.etat = 'alerte'; $('.etat-alerte__txt', pastille).textContent = 'Exemple d’alerte';
    if (anime()) g.from(actif, { height: 0, paddingBlock: 0, opacity: 0, duration: .5, ease: 'power3.out', clearProps: 'all' });
    $('[data-alerte-fermer]', actif)?.focus();
  });
  $('[data-alerte-fermer]')?.addEventListener('click', () => {
    actif.hidden = true; calmeEl.hidden = false;
    pastille.dataset.etat = 'calme'; $('.etat-alerte__txt', pastille).textContent = 'Pas d’alerte';
    $('[data-alerte-demo]')?.focus();
  });
}

/* Le titre du journal se resserre au défilement, les plaques couleur se décalent */
function defilementUne() {
  if (!anime()) return;
  const plaque = $('.titre-journal__plaque');
  g.to('.titre-journal', { fontStretch: '92%', ease: 'none', scrollTrigger: { trigger: '.une', start: 'top top', end: 'bottom top', scrub: true } });
  g.fromTo(plaque, { '--rx': '0px', '--ry': '0px' }, { '--rx': '6px', '--ry': '3px', ease: 'none', scrollTrigger: { trigger: '.une', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------- Dernières infos : 6 cartes, puis l'accès au fil complet ---------- */
const auxUne = () => [(ARTICLES.find(x => x.une) || {}).id, ...$$('[data-une-aussi] a').map(l => l.getAttribute('href').split('#')[1])];
function dernieres() {
  const vus = auxUne();
  const liste = ARTICLES.filter(a => !vus.includes(a.id)).slice(0, 6);
  filCourt($('[data-fil-court]'), liste);
  $('[data-total-infos]').textContent = String(ARTICLES.length);
  const nb = id => ARTICLES.filter(a => a.rubrique === id).length;
  $('[data-raccourcis]').innerHTML = RUBRIQUES.filter(r => nb(r.id)).sort((x, y) => nb(y.id) - nb(x.id)).slice(0, 6)
    .map(r => `<a class="puce" href="actu.html?rubrique=${r.id}">${echap(r.nom)} <small>${nb(r.id)}</small></a>`).join('')
    + '<a class="puce puce--creuse" href="actu.html#communes">Par commune</a>';
  return liste.map(a => a.id);
}

/* ---------- Chantiers : une sélection, puis le suivi complet ---------- */
function chantiers(dejaVus) {
  const tous = ARTICLES.filter(a => a.chantier);
  const liste = tous.filter(a => !a.provisoire && !dejaVus.includes(a.id)).slice(0, 5);
  $('[data-chantiers-intro]').textContent = `${tous.length} chantiers et projets suivis par Castel Actu. Statut tel qu’annoncé, à mettre à jour\u00a0; une échéance dépassée s’affiche d’elle-même.`;
  const fin = `<a class="chantiers__fin" href="chantiers.html">
      <span class="chantiers__fin-nb">${tous.length}</span>
      <span class="chantiers__fin-txt">chantiers suivis, statut par statut</span>
      <span class="chantiers__fin-cta">Voir tous les chantiers</span>
    </a>`;
  galerieChantiers($('[data-chantiers]'), { liste, fin });
}

/* ---------- Agenda en bref ---------- */
function agendaBref() {
  const ul = $('[data-agenda-bref]');
  const evs = AGENDA.map(ev => ({ ev, etat: etatEvenement(ev) }));
  const avenir = evs.filter(x => x.etat.id !== 'passe');
  const ligne = ({ ev, etat }) => `<li><a href="agenda.html"><span class="bref__date">${echap(ev.libelle)}</span><span class="bref__quoi">${echap(ev.titre)}</span></a><span class="tampon ${etat.c}" data-tampon>${etat.t}</span></li>`;
  ul.innerHTML = (avenir.length ? '' : '<li class="bref__vide"><span class="bref__date">Prochains rendez-vous</span><span class="bref__quoi">Dates à compléter par la rédaction</span></li>')
    + [...avenir, ...evs.filter(x => x.etat.id === 'passe')].slice(0, 3).map(ligne).join('');
  tampons(ul);
}

/* ---------- Démarrage ---------- */
function lancer() {
  // le navigateur a pu sauter à l'ancre avant le script : on construit depuis le haut, puis on y retourne
  if (window.scrollY) window.scrollTo(0, 0);
  une();
  const montres = dernieres();
  classement($('[data-classement]'), { nombreMax: 3, images: false });
  podcasts($('[data-podcasts]'));
  agendaBref();
  demarrer();
  defilementUne();
  // la galerie épinglée est créée en dernier : les déclencheurs placés avant elle sont déjà en place
  chantiers([...auxUne(), ...montres]);
  ST?.sort?.();
  ST?.refresh();
  ancreInitiale();
  document.fonts?.ready.then(() => ST?.refresh());
}

async function monterGL() {
  const [gl] = await tramesGL($$('[data-gl]'));
  if (!gl) return;
  if (!anime()) { gl.progression(1); return; }
  // la Une sort de presse : trame d'abord, puis la couleur s'imprime
  gl.progression(0);
  const o = { v: 0 };
  g.to(o, { v: 1, duration: 1.8, delay: .15, ease: 'power2.inOut', onUpdate: () => gl.progression(o.v) });
}

const premiereVisite = !document.documentElement.classList.contains('deja-vu') && anime();
// le compteur de la Une tourne après l'ouverture ; aux visites suivantes il est déjà en place
const odoUne = $('[data-odo]');
const jouerOdoUne = odoUne ? odometre(odoUne, { valeur: +odoUne.dataset.odo, manuel: true, immediat: !premiereVisite && !document.documentElement.classList.contains('entree') }) : () => {};
const ouvertureEnCours = ouverture();
// le gros de la construction attend que la première image soit affichée : l'ouverture démarre sans à-coup
requestAnimationFrame(() => setTimeout(lancer, 0));
ouvertureEnCours.then(apres => {
  // volets ouverts (ou visite suivante) : la Une s'imprime
  setTimeout(jouerOdoUne, apres ? 380 : 260);
  monterGL();
});
