/* Effets propres à Castel Actu « La Une vivante ». Le socle gère l'ouverture, les transitions, l'en-tête,
   le menu, le mode calme, les boucles, les mesures et la bibliothèque d'effets (posés par attributs).
   Effets du plan, chacun marqué data-effet dans les pages :
   rotative (intro et voile), impression (titres encrés), ruban-alerte (CSS), radar-communes, coupures,
   frise-chantiers, tampon-10-ans, onde-podcast. Plus : fil filtrable, recherche, compte à rebours. */
import { demarrer, boucle, etat, quand, allerAncre, partir, rafraichir } from './socle/index.js?v=1';

const gsap = window.gsap;
const ST = () => window.ScrollTrigger;
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IVOIRE = '#f3eee4';
const ENCRE_DEPART = 'inset(-.15em 100% -.25em -.05em)';
const ENCRE_FIN = 'inset(-.15em -2% -.25em -.05em)';
const enPremierEcran = (el) => el.getBoundingClientRect().top + window.scrollY < window.innerHeight * 0.85;
const anime = () => !etat.calme && !html.classList.contains('secours') && !!gsap;

/* ---------- Date du jour et compte à rebours des 10 ans (heure de Paris) ---------- */

function joursParis(d) {
  const p = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return Math.round(Date.parse(p + 'T00:00:00Z') / 86400000);
}

function dates() {
  const d = $('[data-date-du-jour]');
  if (d) {
    const t = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date());
    const txt = t.charAt(0).toUpperCase() + t.slice(1);
    if (d.textContent !== txt) d.textContent = txt;
  }
  $$('[data-compte-a-rebours]').forEach((el) => {
    const cible = joursParis(new Date(el.dataset.compteARebours));
    const n = cible - joursParis(new Date());
    const chiffre = $('[data-compte-chiffre]', el), texte = $('[data-compte-texte]', el);
    const m = JSON.parse(el.dataset.textes || '{}');
    if (!chiffre || !texte || !m.avant) return;
    if (n > 0) { chiffre.textContent = m.jours.replace('{n}', n); texte.textContent = m.avant; }
    else if (n === 0) { chiffre.textContent = '10 ans'; texte.textContent = m.jour; }
    else { chiffre.textContent = '10 ans'; texte.textContent = m.apres; }
  });
}

/* ---------- Titres « impression » ---------- */

const encres = [];
function impression() {
  $$('.impression:not(.impression--tete) > .impression-encre').forEach((encre) => {
    const titre = encre.parentElement;
    const tw = gsap.fromTo(encre, { clipPath: ENCRE_DEPART }, { clipPath: ENCRE_FIN, duration: 0.8, ease: 'power2.inOut', paused: true, onComplete: () => { gsap.set(encre, { clipPath: 'none' }); titre.classList.add('encree'); } });
    encres.push(tw);
    if (enPremierEcran(titre)) {
      quand('pret', ({ mode }) => (mode === 'jouee' || mode === 'voile' ? tw.play(0) : tw.progress(1)));
      return;
    }
    ST().create({ trigger: titre, start: 'top 92%', once: true, onEnter: () => tw.play(0) });
  });
}

/* ---------- Intro « rotative » et arrivée du premier écran ---------- */

let decoupes = [];
function decouperTete() {
  if (!window.SplitText) return;
  $$('[data-tete="lignes"]').forEach((el) => {
    try { decoupes.push(new window.SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'fx-ligne' })); } catch (err) { console.error(err); }
  });
}
const rendreDecoupes = () => { decoupes.forEach((d) => { try { d.revert(); } catch {} }); decoupes = []; };

function entreeTete(tl, t0) {
  const filets = $$('[data-tete="filet"]'), fondus = $$('[data-tete="fondu"]'), medias = $$('[data-tete="media"]');
  const lignes = decoupes.flatMap((d) => d.lines || []);
  const encre = $$('.impression--tete > .impression-encre');
  if (filets.length) tl.fromTo(filets, { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.12 }, t0);
  if (encre.length) tl.fromTo(encre, { clipPath: ENCRE_DEPART }, { clipPath: ENCRE_FIN, duration: 0.95, ease: 'power2.inOut' }, t0 + 0.05);
  if (medias.length) tl.fromTo(medias, { clipPath: 'inset(0 0 100% 0)', opacity: 1 }, { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: 0.95, ease: 'power4.out' }, t0 + 0.2);
  $$('[data-tete="lignes"]').forEach((el) => gsap.set(el, { opacity: 1 }));
  const blocsLignes = $$('[data-tete="lignes"]');
  if (lignes.length) tl.fromTo(lignes, { yPercent: 115 }, { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08 }, t0 + 0.25);
  else if (blocsLignes.length) tl.fromTo(blocsLignes, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, t0 + 0.25);
  if (fondus.length) tl.fromTo(fondus, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.06 }, t0 + 0.3);
  tl.call(() => {
    rendreDecoupes();
    const faits = [...filets, ...fondus, ...medias];
    if (faits.length) gsap.set(faits, { clearProps: 'transform,clipPath' });
    if (encre.length) gsap.set(encre, { clipPath: 'none' });
    encre.forEach((e) => e.parentElement.classList.add('encree'));
  }, null, '>');
  return tl;
}

function jouer() {
  if (!gsap) return null;
  const p = $('.ouverture-panneau');
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  if (p) {
    const bandes = $$('.ouverture-bande', p).filter((b) => getComputedStyle(b).display !== 'none');
    const textes = bandes.map((b) => b.firstElementChild);
    const alerte = $('.ouverture-alerte', p), centre = $('.ouverture-centre', p);
    bandes.forEach((b, i) => gsap.set(b, { x: 0, xPercent: i % 2 ? 102 : -102 }));
    gsap.set(alerte, { x: 0, y: 0, xPercent: 110, rotation: -4 });
    tl.fromTo(textes, { xPercent: 0 }, { xPercent: -22, duration: 2, ease: 'none' }, 0)
      .to(bandes, { xPercent: 0, duration: 0.62, ease: 'expo.out', stagger: 0.07 }, 0.16)
      .fromTo(alerte, { xPercent: 110, rotation: -4 }, { xPercent: -110, rotation: -4, duration: 0.95, ease: 'power2.inOut' }, 0.2)
      .call(() => { p.dataset.gouttiere = IVOIRE; }, null, 0.62)
      .set(p, { backgroundColor: 'transparent' }, 1.02)
      .set(centre, { autoAlpha: 0 }, 1.02)
      .to(bandes, { xPercent: (i) => (i % 2 ? -104 : 104), duration: 0.55, ease: 'power3.in', stagger: 0.045 }, 1.05);
  }
  entreeTete(tl, 1.15);
  return tl;
}

function arrivee() {
  if (!gsap) return;
  entreeTete(gsap.timeline(), 0.05);
}

function etatFinal() {
  html.classList.add('fx-final');
  if (!gsap) return;
  rendreDecoupes();
  encres.forEach((tw) => tw.progress(1));
  gsap.set('[data-tete]', { clearProps: 'transform,opacity,clipPath' });
  gsap.set('.impression-encre', { clipPath: 'none' });
  $$('[data-tete]').forEach((el) => el.classList.add('vu'));
  $$('.coupure').forEach((li, i) => gsap.set(li, { rotation: window.matchMedia('(max-width: 900px)').matches ? 0 : [-1, 0.8, -0.6][i] || 0, y: 0 }));
  $$('.tampon svg, .monogramme svg').forEach((s) => gsap.set(s, { opacity: 1, scale: 1, rotation: s.closest('.monogramme') ? 0 : -8 }));
  $$('[data-rature]').forEach((r) => r.classList.add('trace'));
  $$('.commune--active').forEach((c) => c.classList.add('allume'));
  $$('.frise-trait').forEach((t) => { t.style.strokeDashoffset = '0'; });
  $$('.barre-trait').forEach((t) => gsap.set(t, { scaleX: 1 }));
  $$('.radar-anneaux circle').forEach((r) => { r.style.strokeDashoffset = '0'; });
}

/* ---------- Radar des communes ---------- */

function radar() {
  $$('svg.radar').forEach((svg) => {
    const balayage = $('.radar-balayage', svg);
    const [cx, cy] = svg.dataset.centre.split(' ').map(Number);
    const communes = $$('.commune', svg).map((c) => {
      const a = parseFloat(c.dataset.angle);
      return { c, a: a >= 270 ? a - 360 : a, active: c.classList.contains('commune--active') };
    });
    const anneaux = $$('.radar-anneaux circle', svg);
    anneaux.forEach((r) => { r.setAttribute('pathLength', '1'); r.style.strokeDasharray = '1 1.2'; r.style.strokeDashoffset = '1.1'; });
    /* Les anneaux se tracent une fois (ils ne s'effacent jamais) ; l'aiguille suit le défilement. */
    const traces = gsap.to(anneaux, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power2.inOut', paused: true });
    ST().create({ trigger: svg, start: 'top 80%', once: true, onEnter: () => traces.play() });
    quand('retour', () => traces.progress(1));
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 88%', end: 'bottom 20%', scrub: 0.6 } });
    tl.fromTo(balayage, { rotation: -90 }, {
        rotation: 270, duration: 1, ease: 'none', svgOrigin: `${cx} ${cy}`,
        onUpdate() {
          const r = gsap.getProperty(balayage, 'rotation');
          communes.forEach((x) => { if (x.active && r >= x.a && !x.c.classList.contains('allume')) x.c.classList.add('allume'); });
        },
      }, 0);
  });
}

/* ---------- Les plus lus : coupures qui se redressent ---------- */

function coupures() {
  const liste = $('.coupures');
  if (!liste) return;
  /* Sur une colonne (téléphone, tablette), les coupures finissent droites : pleine largeur, la moindre pente déborderait. */
  gsap.matchMedia().add({ large: '(min-width: 901px)', etroit: '(max-width: 900px)' }, (ctx) => {
    const depart = ctx.conditions.large ? [-3.5, 3, -2.5] : [-0.6, 0.5, -0.4];
    const fin = ctx.conditions.large ? [-1, 0.8, -0.6] : [0, 0, 0];
    $$('.coupure', liste).forEach((li, i) => {
      gsap.fromTo(li, { rotation: depart[i] || 0, y: 26 + i * 12 }, {
        rotation: fin[i] || 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: li, start: 'top 98%', end: 'top 62%', scrub: 0.6 },
      });
    });
  });
}

/* ---------- Chantiers : règle qui se trace, projet annulé raturé ---------- */

function frise() {
  const section = $('.chantiers');
  if (!section) return;
  const piste = $('[data-galerie]', section), trait = $('.frise-trait', section);
  const crans = $$('.frise-cran', section);
  if (trait) { trait.setAttribute('pathLength', '1'); trait.style.strokeDasharray = '1 1'; trait.style.strokeDashoffset = '1'; }
  const allumer = (p) => {
    if (trait) trait.style.strokeDashoffset = String(1 - p);
    crans.forEach((c, i) => c.classList.toggle('frise-cran--passe', (i + 0.5) / crans.length <= p + 0.001));
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('trace'); io.unobserve(e.target); }
  }), { threshold: 0.9 });
  $$('[data-rature]', section).forEach((r) => io.observe(r));
  gsap.matchMedia().add({ grand: '(min-width: 761px)', petit: '(max-width: 760px)' }, (ctx) => {
    if (ctx.conditions.grand) {
      const distance = () => Math.max(0, piste.scrollWidth - document.documentElement.clientWidth);
      const st = ST().create({ trigger: section, start: 'top top', end: () => '+=' + distance(), onUpdate: (s) => allumer(s.progress), invalidateOnRefresh: true });
      return () => st.kill();
    }
    /* Téléphone : la piste glisse en place au défilement (elle se parcourt ensuite au doigt), la règle suit. */
    let max = 1, entree = 0;
    const mesurer = () => { max = Math.max(1, piste.scrollWidth - piste.clientWidth); };
    const defiler = () => allumer(Math.max(entree * 0.12, Math.min(1, piste.scrollLeft / max)));
    const glisse = gsap.fromTo(piste, { x: 64 }, { x: 0, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 35%', scrub: 0.5, onUpdate: (st) => { entree = st.progress; defiler(); } } });
    mesurer(); defiler();
    piste.addEventListener('scroll', defiler, { passive: true });
    window.addEventListener('resize', mesurer);
    return () => { glisse.scrollTrigger?.kill(); glisse.kill(); gsap.set(piste, { clearProps: 'transform' }); piste.removeEventListener('scroll', defiler); window.removeEventListener('resize', mesurer); };
  });
}

/* ---------- Rubrique : barres de l'état des chantiers, tracées une fois ---------- */

function barres() {
  $$('[data-effet="barres"]').forEach((liste) => {
    const traits = $$('.barre-trait', liste);
    const tw = gsap.fromTo(traits, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08, paused: true });
    ST().create({ trigger: liste, start: 'top 82%', once: true, onEnter: () => tw.play(0) });
  });
}

/* ---------- Tampon des 10 ans ---------- */

function tampon() {
  $$('.tampon svg, .monogramme svg').forEach((svg) => {
    const fin = svg.closest('.monogramme') ? 0 : -8;
    const tl = gsap.timeline({ paused: true })
      .fromTo(svg, { opacity: 0, scale: 2.3, rotation: -32 }, { opacity: 1, scale: 1, rotation: fin, duration: 0.42, ease: 'power4.in' })
      .fromTo(svg.closest('section'), { y: 0 }, { y: 4, duration: 0.05, yoyo: true, repeat: 3, ease: 'none', clearProps: 'transform' });
    ST().create({ trigger: svg, start: 'top 82%', once: true, onEnter: () => tl.play(0) });
  });
}

/* ---------- Podcasts : forme d'onde qui respire ---------- */

function podcasts() {
  $$('[data-podcast]').forEach((carte, k) => {
    const canvas = $('canvas', carte);
    const ctx = canvas.getContext('2d');
    const n = 72;
    const base = Array.from({ length: n }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + k * 2.1) * Math.cos(i * 0.37 + k)));
    let w = 0, h = 0, dpr = 1;
    const mesurer = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width * dpr)); h = Math.max(1, Math.round(r.height * dpr));
      canvas.width = w; canvas.height = h;
    };
    mesurer();
    new ResizeObserver(mesurer).observe(canvas);
    const couleur = getComputedStyle(canvas).color;
    const accent = getComputedStyle(html).getPropertyValue('--accent').trim();
    const dessiner = (dt, t) => {
      ctx.clearRect(0, 0, w, h);
      const pas = w / n, l = Math.max(1, pas * 0.5);
      for (let i = 0; i < n; i++) {
        const v = base[i] * (0.55 + 0.45 * Math.sin(t * 1.8 + i * 0.32 + k));
        const bh = Math.max(2 * dpr, v * h * 0.92);
        ctx.fillStyle = i < n * 0.18 ? accent : couleur;
        ctx.globalAlpha = i < n * 0.18 ? 1 : 0.78;
        ctx.fillRect(i * pas, (h - bh) / 2, l, bh);
      }
      ctx.globalAlpha = 1;
    };
    boucle(canvas, dessiner);
    if (etat.calme) new ResizeObserver(() => requestAnimationFrame(() => dessiner(0, 0))).observe(canvas);
    const bouton = $('[data-podcast-lecture]', carte), statut = $('[data-podcast-statut]', carte);
    bouton.addEventListener('click', () => {
      statut.textContent = statut.dataset.message;
      if (gsap && !etat.calme) gsap.fromTo(bouton, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .5)' });
    });
  });
}

/* ---------- Fil : filtres (rubrique, commune, format), recherche, « afficher plus » ---------- */

const normaliser = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’'\-]/g, ' ');
const racineMot = (m) => (m.length > 3 ? m.replace(/(aux|eaux)$/, 'al').replace(/[sx]$/, '') : m);
const mots = (s) => normaliser(s).split(/[^a-z0-9]+/).filter(Boolean).map(racineMot);

let fil = null;
/* Un seul fil par page : l'accueil (rubrique, commune, format, recherche) ou une rubrique (statut, commune, recherche).
   Les filtres restent dans l'adresse de la page, pour partager une sélection. */
function initFil() {
  const section = $('[data-fil]');
  if (!section) return;
  const ancre = '#' + section.id;
  const cartes = $$('[data-breve]', section);
  const index = cartes.map((c) => ({ c, mots: mots(c.dataset.rechercheTexte).join(' ') }));
  const resultat = $('[data-fil-resultat]', section), vide = $('[data-fil-vide]', section);
  const plus = $('[data-fil-plus]', section), grille = $('[data-fil-grille]', section);
  const selects = $$('[data-filtre-select]', section), champ = $('[data-filtre-q]', section);
  const cles = [...new Set([...$$('[data-filtre]', section).map((b) => b.dataset.filtre), ...selects.map((x) => x.dataset.filtreSelect), 'q'])];
  const vierge = () => Object.fromEntries(cles.map((k) => [k, '']));
  const lire = () => { const u = new URLSearchParams(location.search); return Object.fromEntries(cles.map((k) => [k, u.get(k) || ''])); };
  let e = lire();

  const correspond = (x) => {
    const d = x.c.dataset;
    for (const k of cles) {
      const v = e[k];
      if (!v) continue;
      if (k === 'q') { const q = mots(v); if (q.length && !q.every((m) => x.mots.includes(m))) return false; }
      else if (k === 'commune') { if (!(d.communes || '').split(' ').includes(v)) return false; }
      else if ((d[k] || '') !== v) return false;
    }
    return true;
  };

  const ecrireAdresse = () => {
    const u = new URLSearchParams();
    cles.forEach((k) => e[k] && u.set(k, e[k]));
    const s = u.toString();
    /* Pas d'ancre dans l'adresse : recharger la page repart du haut (avec l'intro), le fil reste filtré. */
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  };

  const appliquer = ({ animer = false, adresse = true } = {}) => {
    const filtre = cles.some((k) => e[k]);
    $$('[data-filtre]', section).forEach((b) => b.setAttribute('aria-pressed', String((e[b.dataset.filtre] || '') === b.dataset.valeur)));
    selects.forEach((x) => { x.value = e[x.dataset.filtreSelect] || ''; });
    if (champ && champ.value !== e.q) champ.value = e.q;
    const faire = () => {
      let n = 0, u = 0;
      index.forEach((x) => { const ok = correspond(x); if (ok) { n++; if (x.c.hasAttribute('data-hors-defaut')) u++; } if (x.c.hidden === ok) x.c.hidden = !ok; });
      section.classList.toggle('fil--filtre', filtre);
      if (plus) plus.parentElement.hidden = filtre || section.classList.contains('fil--deplie');
      vide.hidden = n > 0;
      resultat.textContent = !filtre && u ? resultat.dataset.modeleDefaut.replace('{n}', n).replace('{u}', u) : n === 1 ? resultat.dataset.modeleUn : resultat.dataset.modele.replace('{n}', n);
    };
    if (adresse) ecrireAdresse();
    if (!animer || !anime()) { faire(); rafraichir(); return; }
    gsap.to(grille, { opacity: 0.3, duration: 0.14, ease: 'none', onComplete: () => {
      faire();
      gsap.to(grille, { opacity: 1, duration: 0.2 });
      const visibles = cartes.filter((c) => !c.hidden && getComputedStyle(c).display !== 'none').slice(0, 12);
      gsap.fromTo(visibles, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power3.out', clearProps: 'transform,opacity' });
      if (section.getBoundingClientRect().top < -40) allerAncre(ancre, { pousser: false });
      rafraichir();
    } });
  };

  section.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-filtre]');
    if (b && !b.disabled) { e[b.dataset.filtre] = b.dataset.valeur; appliquer({ animer: true }); return; }
    if (ev.target.closest('[data-fil-reinit]')) { e = vierge(); appliquer({ animer: true }); }
    if (ev.target.closest('[data-fil-plus]')) {
      section.classList.add('fil--deplie');
      plus.parentElement.hidden = true;
      const suite = $$('[data-fil-suite], [data-fil-tel-suite]', section).filter((c) => !c.hidden && getComputedStyle(c).display !== 'none');
      if (anime()) gsap.fromTo(suite, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, clearProps: 'transform,opacity' });
      if (suite[0]) { suite[0].setAttribute('tabindex', '-1'); suite[0].focus({ preventScroll: true }); }
      rafraichir();
    }
  });
  selects.forEach((x) => x.addEventListener('change', () => { e[x.dataset.filtreSelect] = x.value; appliquer({ animer: true }); }));
  if (champ) {
    let t = 0;
    champ.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { e.q = champ.value.trim(); appliquer({ animer: true }); }, 220); });
  }
  $('[data-filtres]', section).addEventListener('submit', (ev) => { ev.preventDefault(); if (champ) { e.q = champ.value.trim(); appliquer({ animer: true }); } });

  appliquer({ adresse: false });
  fil = {
    ancre,
    regler(params) {
      e = { ...vierge(), ...Object.fromEntries(Object.entries(params).filter(([k]) => cles.includes(k))) };
      appliquer({ animer: true });
      allerAncre(ancre, { pousser: false });
      /* Venu d'un lien vers le fil : l'adresse garde l'ancre, comme tout lien vers une section de la page. */
      history.replaceState(null, '', location.pathname + location.search + ancre);
    },
  };
}

/* Liens vers le fil filtré (communes, rubriques, recherche) : sur la page du fil, il est filtré sans recharger.
   Les liens du plan sont des liens SVG (href n'y est pas une chaîne) : leur adresse est lue dans l'attribut. */
const memePage = (u) => u.pathname.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '') === location.pathname.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '');
function liensFil() {
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a[href]');
    if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const svg = typeof a.href !== 'string';
    const u = new URL(svg ? a.getAttribute('href') : a.href, location.href);
    if (u.origin !== location.origin) return;
    if (fil && u.hash === fil.ancre && memePage(u)) {
      ev.preventDefault();
      fil.regler(Object.fromEntries(new URLSearchParams(u.search)));
      return;
    }
    if (svg) { ev.preventDefault(); partir(u, a.dataset.libelle || ''); }
  }, true);
}

/* ---------- Recherche de l'en-tête ---------- */

function recherche() {
  const bouton = $('[data-recherche-bouton]'), panneau = $('[data-recherche]');
  if (!bouton || !panneau) return;
  const champ = $('input', panneau), form = $('form', panneau);
  const ouvrir = () => {
    panneau.hidden = false; bouton.setAttribute('aria-expanded', 'true');
    if (anime()) gsap.fromTo(panneau, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.4, ease: 'power3.out', clearProps: 'clipPath' });
    requestAnimationFrame(() => champ.focus());
  };
  const fermer = (rendre = true) => { panneau.hidden = true; bouton.setAttribute('aria-expanded', 'false'); if (rendre) bouton.focus(); };
  bouton.addEventListener('click', () => (panneau.hidden ? ouvrir() : fermer()));
  $('[data-recherche-fermer]', panneau).addEventListener('click', () => fermer());
  document.addEventListener('keydown', (e) => {
    if (panneau.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); fermer(); }
    if (e.key === 'Tab') {
      const f = [...panneau.querySelectorAll('input, button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  document.addEventListener('pointerdown', (e) => { if (!panneau.hidden && !panneau.contains(e.target) && !bouton.contains(e.target)) fermer(false); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = champ.value.trim();
    fermer(false);
    if (fil && fil.ancre === '#fil') { fil.regler(q ? { q } : {}); return; }
    const u = new URL(form.action, location.href);
    if (q) u.searchParams.set('q', q);
    u.hash = 'fil';
    partir(u, bouton.textContent.trim());
  });
}

/* ---------- Alertez-nous : formulaire en 4 étapes, récapitulatif en direct, sujet d'origine ---------- */

function etapes() {
  const form = $('[data-etapes]');
  if (!form) return;
  const blocs = $$('[data-etape]', form), puces = $$('[data-etape-puce]');
  const prec = $('[data-etape-precedente]', form), suiv = $('[data-etape-suivante]', form), env = $('[data-etape-envoyer]', form);
  const annonce = $('[data-etape-annonce]');
  const T = { requis: form.dataset.requis, email: form.dataset.email };
  let i = 0;

  const erreur = (champ, msg) => {
    const id = 'erreur-' + (champ.id || champ.name);
    let p = document.getElementById(id);
    if (!msg) { if (p) p.textContent = ''; champ.removeAttribute('aria-invalid'); return; }
    if (!p) {
      p = document.createElement('p'); p.id = id; p.className = 'champ-erreur'; p.setAttribute('aria-live', 'polite');
      (champ.closest('.champ') || champ.closest('.choix-types') || champ.parentElement).appendChild(p);
      champ.setAttribute('aria-describedby', [champ.getAttribute('aria-describedby'), id].filter(Boolean).join(' '));
    }
    p.textContent = msg; champ.setAttribute('aria-invalid', 'true');
  };
  const valider = (bloc) => {
    let premier = null;
    const vus = new Set();
    $$('input, select, textarea', bloc).forEach((c) => {
      if (!c.name || (c.type === 'radio' && vus.has(c.name))) return;
      vus.add(c.name);
      const v = (c.value || '').trim();
      let m = '';
      if (c.required && (c.type === 'checkbox' ? !c.checked : c.type === 'radio' ? !form.querySelector(`[name="${c.name}"]:checked`) : !v)) m = T.requis;
      else if (v && c.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) m = T.email;
      erreur(c, m);
      if (m && !premier) premier = c;
    });
    if (premier) premier.focus();
    return !premier;
  };
  const aller = (n) => {
    const avant = form.offsetHeight;
    blocs.forEach((b, k) => { b.hidden = k !== n; });
    i = n;
    puces.forEach((p, k) => {
      p.classList.toggle('etape-puce--active', k === n);
      p.classList.toggle('etape-puce--faite', k < n);
      if (k === n) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
    });
    prec.hidden = n === 0;
    suiv.hidden = n === blocs.length - 1;
    env.hidden = n !== blocs.length - 1;
    if (annonce) annonce.textContent = annonce.dataset.modele.replace('{n}', n + 1).replace('{titre}', $('legend', blocs[n]).textContent);
    const apres = form.offsetHeight;
    if (anime() && Math.abs(apres - avant) > 2) gsap.fromTo(form, { height: avant }, { height: apres, duration: 0.45, ease: 'power3.out', clearProps: 'height', onComplete: rafraichir });
    else rafraichir();
    const premier = $('input:not([type="hidden"]), select, textarea', blocs[n]);
    if (premier) premier.focus({ preventScroll: true });
    if (form.getBoundingClientRect().top < 0) allerAncre('#formulaire', { pousser: false });
  };
  suiv.addEventListener('click', () => { if (valider(blocs[i])) aller(i + 1); });
  prec.addEventListener('click', () => aller(i - 1));
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'submit' && i < blocs.length - 1) { e.preventDefault(); if (valider(blocs[i])) aller(i + 1); }
  });
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid')) valider(e.target.closest('[data-etape]')); });

  /* Récapitulatif : chaque ligne lit ses champs (nom de choix, option, nombre de fichiers, texte). */
  const valeur = (nom) => {
    const c = form.querySelector(`[name="${nom}"]`);
    if (!c) return '';
    if (c.type === 'radio') { const x = form.querySelector(`[name="${nom}"]:checked`); return x ? x.closest('label').querySelector('.choix-type-nom').textContent : ''; }
    if (c.tagName === 'SELECT') return c.value ? c.selectedOptions[0].textContent : '';
    if (c.type === 'file') return c.files && c.files.length ? [...c.files].map((f) => f.name).join(', ') : '';
    return (c.value || '').trim();
  };
  const recap = () => $$('[data-recap-champ]').forEach((dd) => { dd.textContent = dd.dataset.recapChamp.split(',').map(valeur).filter(Boolean).join(' · ') || '—'; });
  form.addEventListener('input', recap);
  form.addEventListener('change', recap);

  /* Venu d'une brève : le sujet d'origine est rappelé en tête du formulaire. */
  const sujet = $('[data-sujet-champ]', form), rappel = $('[data-sujet-rappel]', form);
  if (sujet && rappel && sujet.value) {
    let titres = {};
    try { titres = JSON.parse(sujet.dataset.sujets || '{}'); } catch {}
    if (titres[sujet.value]) { rappel.textContent = rappel.dataset.modele.replace('{titre}', titres[sujet.value]); rappel.hidden = false; }
    else sujet.value = '';
  }
  recap();
}

/* ---------- Partager une brève ---------- */

function partage() {
  $$('[data-partager]').forEach((b) => {
    const statut = b.closest('.page-tete-texte')?.querySelector('[data-partage-statut]');
    b.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) { await navigator.share({ title: b.dataset.titre, url }); return; }
      } catch (err) { if (err && err.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(url); if (statut) statut.textContent = b.dataset.message; }
      catch { if (statut) statut.textContent = url; }
    });
  });
}

/* ---------- Frise de l'histoire : statuts calculés à la date du jour (heure de Paris) ---------- */

function jalons() {
  const liste = $('[data-jalons]');
  if (!liste) return;
  let libelles = {};
  try { libelles = JSON.parse(liste.dataset.jalons); } catch { return; }
  const auj = joursParis(new Date());
  $$('[data-jalon]', liste).forEach((li) => {
    const d = joursParis(new Date(li.dataset.jalon + 'T12:00:00+01:00'));
    const etatJ = d < auj ? 'passe' : d === auj ? 'jour' : 'avenir';
    li.className = li.className.replace(/jalon--\w+/, 'jalon--' + etatJ);
    const lib = $('.jalon-etat', li);
    if (lib && libelles[etatJ]) lib.textContent = libelles[etatJ];
  });
}

/* ---------- Démarrage ---------- */

demarrer({
  preparer() {
    dates();
    jalons();
    etapes();
    partage();
    initFil();
    liensFil();
    recherche();
    podcasts();
    if (!anime() || !ST()) return;
    decouperTete();
    radar();
    coupures();
    frise();
    /* Page déjà peinte (retour arrière rechargé, retour à la section) : titres encrés et tampon posés d'office. */
    let dejaPeinte = etat.arrivee === 'retour';
    try { dejaPeinte = dejaPeinte || !!sessionStorage.getItem('socle:calme-retour'); } catch {}
    if (dejaPeinte) { html.classList.add('fx-final'); return; }
    impression();
    tampon();
    barres();
  },
  jouer,
  etatFinal,
  arrivee,
});
