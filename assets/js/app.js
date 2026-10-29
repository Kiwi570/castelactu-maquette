// Castel Actu — socle commun à toutes les pages (v3)
// Principe : tout ce qui est visible au premier affichage est animé en CSS dès la première image
// (aucun éclair visible → caché → visible). Le JavaScript prend le relais pour le reste.
const g = window.gsap;
const ST = window.ScrollTrigger;
const racine = document.documentElement;

export const calme = () => racine.classList.contains('calme');
export const pointeurFin = window.matchMedia('(pointer: fine)').matches;
export const estMobile = () => window.matchMedia('(max-width: 899px)').matches;
export const anime = () => !!g && !calme();
export let lenis = null;

if (g) {
  const plugins = [ST, window.SplitText, window.Flip].filter(Boolean);
  g.registerPlugin(...plugins);
  g.config({ nullTargetWarn: false });
}

export function hauteurEntete() {
  const e = document.querySelector('.entete');
  return e ? e.getBoundingClientRect().height : 64;
}

/* ---------- Rideau : la page qui tourne (changement de page, grands sauts) ---------- */
const tourne = () => document.querySelector('.tourne');
let enRideau = false;
function libererEntree() { racine.classList.remove('tourne-entree'); }
export function rideau(action) {
  const t = tourne();
  if (!t || !anime()) { const r = action(); return Promise.resolve(r); }
  if (enRideau) return Promise.resolve();
  enRideau = true;
  libererEntree();
  return new Promise(resolve => {
    g.killTweensOf(t);
    g.set(t, { visibility: 'visible', xPercent: 100 });
    g.to(t, {
      xPercent: 0, duration: .38, ease: 'power3.in',
      onComplete: async () => {
        try { await action(); } catch (e) { /* on découvre quoi qu'il arrive */ }
        requestAnimationFrame(() => requestAnimationFrame(() => {
          g.to(t, { xPercent: -100, duration: .55, ease: 'power3.out', onComplete: () => { g.set(t, { visibility: 'hidden', xPercent: 0 }); enRideau = false; resolve(); } });
        }));
      },
    });
  });
}

/* ---------- Défilement programmé ---------- */
let defilAuto = 0;
function positionDe(el, decalage = 0) {
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - (hauteurEntete() + 12) + decalage);
}
function sauter(y) {
  // Lenis garde en mémoire la hauteur de page : on la remet à jour avant de sauter (sinon le saut est tronqué)
  if (lenis) { lenis.resize?.(); lenis.scrollTo(y, { immediate: true, force: true }); }
  else window.scrollTo(0, y);
  ST?.update();
}
export function defilerVers(cible, { decalage = 0, immediat = false } = {}) {
  const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
  if (!el) return Promise.resolve();
  defilAuto = performance.now();
  document.querySelector('.entete')?.classList.remove('cache');
  const y = positionDe(el, decalage);
  if (immediat || !anime()) { sauter(y); return Promise.resolve(); }
  // un long trajet passe sous le rideau plutôt que de faire défiler toute la page
  if (Math.abs(y - window.scrollY) > window.innerHeight * 2.4) {
    return rideau(() => { sauter(positionDe(el, decalage)); defilAuto = performance.now(); });
  }
  if (Math.abs(y - window.scrollY) < 4) return Promise.resolve();
  return new Promise(resolve => {
    if (lenis) { lenis.resize?.(); lenis.scrollTo(y, { duration: 1, onComplete: () => resolve() }); }
    else { window.scrollTo({ top: y, behavior: 'smooth' }); setTimeout(resolve, 900); }
  });
}

/* Date du jour et horloge (heure de Paris) */
function premiereMaj(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function dateDuJour(d = new Date()) {
  return premiereMaj(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(d));
}
function dates() {
  document.querySelectorAll('[data-date-jour]').forEach(el => { el.textContent = dateDuJour(); if (el.tagName === 'TIME') el.dateTime = new Date().toISOString().slice(0, 10); });
  const h = document.querySelectorAll('[data-horloge]');
  if (!h.length) return;
  const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Paris' });
  const tic = () => h.forEach(el => { el.textContent = fmt.format(new Date()); });
  tic(); setInterval(tic, 1000);
}

/* Mode calme */
function boutonsCalme() {
  const systeme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-calme]').forEach(b => {
    b.setAttribute('aria-pressed', calme() ? 'true' : 'false');
    if (systeme) b.title = 'Animations réduites par les réglages de votre appareil';
    b.addEventListener('click', () => {
      const actif = !calme();
      try { localStorage.setItem('ca-calme', actif ? '1' : '0'); } catch (e) {}
      window.location.reload();
    });
  });
}

/* Menu téléphone : le volet se déroule, puis les rubriques montent */
function menu() {
  const btn = document.querySelector('.burger');
  const m = document.getElementById('menu');
  if (!btn || !m) return;
  const items = () => m.querySelectorAll('a, .menu__calme');
  let ouvert = false;
  const fermer = (rendreFocus = true) => {
    if (!ouvert) return;
    ouvert = false;
    btn.setAttribute('aria-expanded', 'false');
    lenis?.start(); document.body.style.overflow = '';
    const fin = () => { m.hidden = true; g?.set(m, { clearProps: 'clipPath' }); };
    if (anime()) { g.killTweensOf([m, ...items()]); g.to(m, { clipPath: 'inset(0% 0% 100% 0%)', duration: .32, ease: 'power3.in', onComplete: fin }); }
    else fin();
    if (rendreFocus) btn.focus();
  };
  const ouvrir = () => {
    ouvert = true;
    m.hidden = false; btn.setAttribute('aria-expanded', 'true'); lenis?.stop(); document.body.style.overflow = 'hidden';
    if (anime()) {
      g.killTweensOf([m, ...items()]);
      g.fromTo(m, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .42, ease: 'power3.inOut' });
      g.fromTo(items(), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .035, duration: .45, ease: 'power3.out', delay: .14 });
    }
    m.querySelector('a')?.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => (ouvert ? fermer() : ouvrir()));
  m.querySelector('[data-menu-fermer]')?.addEventListener('click', () => fermer());
  m.addEventListener('click', e => { if (e.target.closest('a')) fermer(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ouvert) fermer(); });
  window.matchMedia('(min-width: 1100px)').addEventListener?.('change', ev => { if (ev.matches && ouvert) fermer(false); });
}

/* Copier une adresse ou un numéro */
function copier() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copier]');
    if (!b) return;
    const texte = b.dataset.copier;
    const ok = () => { b.textContent = 'Copié'; setTimeout(() => { b.textContent = 'Copier'; }, 1600); };
    const repli = () => {
      const cible = b.previousElementSibling;
      if (cible) { const r = document.createRange(); r.selectNodeContents(cible); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
      b.textContent = 'Sélectionné';
      setTimeout(() => { b.textContent = 'Copier'; }, 1600);
    };
    try { navigator.clipboard.writeText(texte).then(ok, repli); } catch (err) { repli(); }
  });
}

/* Lettre d'info (simulée) */
function lettre() {
  const f = document.querySelector('[data-lettre]');
  if (!f) return;
  const msg = f.querySelector('[data-lettre-msg]');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const champ = f.querySelector('input[type="email"]');
    if (!champ.value || !champ.checkValidity()) { msg.textContent = 'Saisissez une adresse e-mail complète, par exemple prenom@exemple.fr.'; champ.setAttribute('aria-invalid', 'true'); champ.focus(); return; }
    champ.removeAttribute('aria-invalid');
    msg.textContent = 'Inscription simulée : aucune adresse n’est enregistrée dans cette maquette.';
    f.reset();
  });
}

/* En-tête qui se range quand on descend (et reste visible pendant un défilement programmé) */
function enteteAuto() {
  const e = document.querySelector('.entete');
  if (!e) return;
  let dernier = window.scrollY;
  const surScroll = () => {
    const y = window.scrollY;
    const menuOuvert = document.getElementById('menu') && !document.getElementById('menu').hidden;
    if (performance.now() - defilAuto < 1400 || menuOuvert) { e.classList.remove('cache'); dernier = y; return; }
    if (y > 240 && y > dernier + 6) e.classList.add('cache');
    else if (y < dernier - 6 || y < 240) e.classList.remove('cache');
    dernier = y;
  };
  window.addEventListener('scroll', surScroll, { passive: true });
}

/* Défilement fluide */
function lisse() {
  if (!window.Lenis || !g) return;
  lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true, autoRaf: false });
  lenis.on('scroll', ST.update);
  g.ticker.add(t => lenis.raf(t * 1000));
  g.ticker.lagSmoothing(0);
}

/* Ancres et changements de page */
function chemin(p) { return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/'; }
function liens() {
  const t = tourne();
  // le rideau d'arrivée est animé en CSS ; on rend la main au JavaScript à la fin
  if (t && racine.classList.contains('tourne-entree')) {
    t.addEventListener('animationend', libererEntree, { once: true });
    setTimeout(libererEntree, 1400);
  }
  let depart = false;
  window.addEventListener('pageshow', e => {
    if (e.persisted && t && g) { libererEntree(); g.killTweensOf(t); g.set(t, { visibility: 'hidden', xPercent: 0 }); depart = false; }
  });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin) return;
    const memePage = chemin(url.pathname) === chemin(location.pathname);
    if (memePage && url.hash) {
      const cible = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (cible) {
        e.preventDefault();
        history.replaceState(null, '', url.hash);
        defilerVers(cible).then(() => { if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1'); cible.focus({ preventScroll: true }); });
      }
      return;
    }
    if (memePage) return;
    if (!t || !anime()) return;
    e.preventDefault();
    if (depart) return;
    depart = true;
    try { sessionStorage.setItem('ca-tourne', '1'); } catch (err) {}
    libererEntree();
    g.killTweensOf(t);
    g.set(t, { visibility: 'visible', xPercent: 100 });
    g.to(t, { xPercent: 0, duration: .5, ease: 'power3.inOut', onComplete: () => { window.location.href = url.href; } });
    setTimeout(() => { depart = false; }, 5000);
  });
}

/* Arrivée sur une ancre (#actu, #agenda…) : saut direct, une fois la page construite */
export function ancreInitiale() {
  if (!location.hash) return;
  const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!cible) return;
  const y0 = window.scrollY;
  const aller = () => defilerVers(cible, { immediat: true });
  requestAnimationFrame(() => { ST?.refresh(); aller(); });
  // les polices changent la hauteur des blocs : on recale si personne n'a touché à la page
  document.fonts?.ready.then(() => requestAnimationFrame(() => { if (Math.abs(window.scrollY - positionDe(cible)) < 400 || window.scrollY === y0) aller(); }));
}

/* Curseur point d'encre (caché au-dessus du compte-fils) */
function curseur() {
  const c = document.querySelector('.curseur');
  if (!c || !pointeurFin) return;
  const x = g.quickTo(c, 'x', { duration: .25, ease: 'power3.out' });
  const y = g.quickTo(c, 'y', { duration: .25, ease: 'power3.out' });
  window.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; c.classList.add('actif'); x(e.clientX); y(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    c.classList.toggle('lien', !!e.target.closest('a, button, label, select, input, textarea, [role="button"], .pin'));
    c.classList.toggle('cache', !!e.target.closest('.trame.gl, input, textarea, select'));
  });
  document.documentElement.addEventListener('pointerleave', () => c.classList.remove('actif'));
}

/* Boutons magnétiques */
export function aimants(racineEl = document) {
  if (!anime() || !pointeurFin) return;
  racineEl.querySelectorAll('[data-magnet]').forEach(el => {
    if (el.dataset.aimant) return; el.dataset.aimant = '1';
    el.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      g.to(el, { x: (e.clientX - (r.left + r.width / 2)) * .28, y: (e.clientY - (r.top + r.height / 2)) * .35, duration: .4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => g.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }));
  });
}

/* Titres qui s'impriment : les mots montent, le filet au-dessus se trace en même temps */
export function titres(racineEl = document) {
  const els = [...racineEl.querySelectorAll('[data-split]')];
  if (!anime() || !window.SplitText) { els.forEach(el => { el.style.visibility = 'visible'; }); racine.classList.add('titres-prets'); return; }
  els.forEach(el => {
    if (el.dataset.splitFait) return; el.dataset.splitFait = '1';
    const tete = el.parentElement && el.parentElement.classList.contains('section__tete') ? el.parentElement : null;
    window.SplitText.create(el, {
      type: 'lines,words', mask: 'lines', autoSplit: true, reduceWhiteSpace: false,
      onSplit: self => {
        const tl = g.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        tl.from(self.words, { yPercent: 115, rotate: 3, duration: .95, stagger: .035, ease: 'power4.out' }, 0);
        if (tete) tl.fromTo(tete, { '--regle': 0 }, { '--regle': 1, duration: .9, ease: 'power3.inOut' }, 0);
        return tl;
      },
    });
    el.style.visibility = 'visible';
  });
  racine.classList.add('titres-prets');
}

/* Tampons de statut : coup de tampon quand ils entrent à l'écran */
export function tampons(racineEl = document) {
  if (!anime()) return;
  racineEl.querySelectorAll('[data-tampon]').forEach(el => {
    if (el.dataset.tamponFait) return; el.dataset.tamponFait = '1';
    g.from(el, { scale: 2.2, opacity: 0, rotate: '-=12', duration: .5, ease: 'back.out(2.4)', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}

/* Trame d'impression en CSS : la photo s'encre quand elle entre à l'écran */
let obsTrames = null;
export function trames(racineEl = document) {
  const els = racineEl.querySelectorAll('[data-trame]:not(.encree):not([data-gl])');
  if (calme() || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('encree')); return; }
  if (!obsTrames) {
    obsTrames = new IntersectionObserver(entrees => {
      entrees.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        obsTrames.unobserve(el);
        setTimeout(() => el.classList.add('encree'), 180 + Math.random() * 260);
      });
    }, { threshold: .3 });
  }
  els.forEach(el => obsTrames.observe(el));
}

/* Compteur mécanique (odomètre) */
export function odometre(el, { valeur, decimales = 0, prefixe = '', suffixe = '', annee = false, immediat = false, manuel = false } = {}) {
  const chiffres = annee ? String(valeur) : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valeur);
  const texte = prefixe + chiffres + suffixe;
  el.classList.add('odo');
  el.setAttribute('aria-label', texte.replace(/ /g, ' '));
  el.setAttribute('role', 'text');
  el.textContent = '';
  const rails = [];
  for (const ch of texte) {
    if (/\d/.test(ch)) {
      const col = document.createElement('span'); col.className = 'odo__col'; col.setAttribute('aria-hidden', 'true');
      const rail = document.createElement('span'); rail.className = 'odo__rail';
      for (let k = 0; k < 20; k++) { const s = document.createElement('span'); s.textContent = k % 10; rail.appendChild(s); }
      col.appendChild(rail); el.appendChild(col); rails.push({ rail, d: +ch });
    } else {
      const s = document.createElement('span'); s.className = 'odo__fixe'; s.setAttribute('aria-hidden', 'true');
      s.textContent = /\s/.test(ch) ? ' ' : ch; el.appendChild(s);
    }
  }
  const fin = r => -((10 + r.d) / 20) * 100;
  const poser = () => rails.forEach(r => { r.rail.style.transform = `translateY(${fin(r)}%)`; });
  const jouer = () => rails.forEach((r, i) => g.to(r.rail, { yPercent: fin(r), duration: 1.4 + i * .14, ease: 'power3.out' }));
  if (!anime() || immediat) { poser(); return () => {}; }
  g.set(rails.map(r => r.rail), { yPercent: 0 });
  if (manuel) return jouer;
  ST.create({ trigger: el, start: 'top 98%', once: true, onEnter: jouer });
  return jouer;
}

/* Image (srcset) */
export function imageHTML(base, { alt = '', sizes = '100vw', lazy = true, largeur = 960 } = {}) {
  return `<img src="${base}-${largeur}.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w, ${base}-1600.webp 1600w" sizes="${sizes}" alt="${echap(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;
}
export function echap(s = '') { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

/* Pied de page : le titre sort de presse */
function piedTitre() {
  const p = document.querySelector('[data-pied-titre]');
  if (!p || !anime()) return;
  const t = p.querySelector('.pied__mesure') || p;
  t.innerHTML = [...t.textContent].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  g.from(t.children, { yPercent: 105, duration: 1, stagger: .05, ease: 'power4.out', scrollTrigger: { trigger: t, start: 'top 95%', once: true } });
}

/* Trame WebGL (chargée à la demande) */
export async function tramesGL(liste) {
  const els = [...(liste || document.querySelectorAll('[data-gl]'))];
  if (!els.length) return [];
  if (calme()) { els.forEach(el => el.classList.add('encree')); return []; }
  try {
    const mod = await import('./halftone.js?v=3');
    return els.map(el => {
      const inst = mod.monter(el);
      if (!inst) el.classList.add('encree');
      return inst;
    });
  } catch (e) {
    els.forEach(el => el.classList.add('encree'));
    return [];
  }
}

export function demarrer() {
  dates();
  boutonsCalme();
  menu();
  copier();
  lettre();
  enteteAuto();
  if (anime()) { lisse(); curseur(); aimants(); tampons(); piedTitre(); }
  titres();
  liens();
  trames();
  window.addEventListener('pageshow', e => { if (e.persisted) ST?.refresh(); });
}
