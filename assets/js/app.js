// Castel Actu — socle commun à toutes les pages
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

export function defilerVers(cible, decalage = 0) {
  const el = typeof cible === 'string' ? document.querySelector(cible) : cible;
  if (!el) return;
  const off = -(hauteurEntete() + 12) + decalage;
  if (lenis) lenis.scrollTo(el, { offset: off, duration: 1.2 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: calme() ? 'auto' : 'smooth' });
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
  document.querySelectorAll('[data-calme]').forEach(b => {
    b.setAttribute('aria-pressed', calme() ? 'true' : 'false');
    b.addEventListener('click', () => {
      const actif = !calme();
      try { localStorage.setItem('ca-calme', actif ? '1' : '0'); } catch (e) {}
      racine.classList.toggle('calme', actif);
      window.location.reload();
    });
  });
}

/* Menu téléphone */
function menu() {
  const btn = document.querySelector('.burger');
  const m = document.getElementById('menu');
  if (!btn || !m) return;
  const fermer = () => { m.hidden = true; btn.setAttribute('aria-expanded', 'false'); lenis?.start(); document.body.style.overflow = ''; btn.focus(); };
  const ouvrir = () => {
    m.hidden = false; btn.setAttribute('aria-expanded', 'true'); lenis?.stop(); document.body.style.overflow = 'hidden';
    if (anime()) g.fromTo(m.querySelectorAll('a, .menu__calme'), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .04, duration: .5, ease: 'power3.out' });
    m.querySelector('a')?.focus();
  };
  btn.addEventListener('click', () => (m.hidden ? ouvrir() : fermer()));
  m.querySelector('[data-menu-fermer]')?.addEventListener('click', fermer);
  m.addEventListener('click', e => { if (e.target.closest('a')) { m.hidden = true; btn.setAttribute('aria-expanded', 'false'); lenis?.start(); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) fermer(); });
}

/* Copier une adresse ou un numéro */
function copier() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copier]');
    if (!b) return;
    const texte = b.dataset.copier;
    const ok = () => { const t = b.textContent; b.textContent = 'Copié'; setTimeout(() => { b.textContent = t; }, 1600); };
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

/* En-tête qui se range quand on descend */
function enteteAuto() {
  const e = document.querySelector('.entete');
  if (!e) return;
  let dernier = window.scrollY;
  const surScroll = () => {
    const y = window.scrollY;
    const menuOuvert = document.getElementById('menu') && !document.getElementById('menu').hidden;
    if (!menuOuvert) e.classList.toggle('cache', y > 240 && y > dernier + 4);
    if (y < dernier - 4 || y < 240) e.classList.remove('cache');
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

/* Ancres et transitions de page (la page qui tourne) */
function chemin(p) { return p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/'; }
function liens() {
  const tourne = document.querySelector('.tourne');
  let entrant = false;
  try { entrant = sessionStorage.getItem('ca-tourne') === '1'; sessionStorage.removeItem('ca-tourne'); } catch (e) {}
  if (tourne && entrant && anime()) {
    g.set(tourne, { visibility: 'visible', xPercent: 0 });
    g.to(tourne, { xPercent: -100, duration: .75, ease: 'power3.inOut', delay: .05, onComplete: () => g.set(tourne, { visibility: 'hidden' }) });
  }
  window.addEventListener('pageshow', e => { if (e.persisted && tourne && g) g.set(tourne, { visibility: 'hidden', xPercent: 0 }); });

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
      if (cible) { e.preventDefault(); defilerVers(cible); history.replaceState(null, '', url.hash); }
      return;
    }
    if (memePage) return;
    if (!tourne || !anime()) return;
    e.preventDefault();
    try { sessionStorage.setItem('ca-tourne', '1'); } catch (err) {}
    g.set(tourne, { visibility: 'visible', xPercent: 100 });
    g.to(tourne, { xPercent: 0, duration: .55, ease: 'power3.inOut', onComplete: () => { window.location.href = url.href; } });
  });

  // ancre présente à l'arrivée
  if (location.hash) {
    const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (cible) setTimeout(() => defilerVers(cible), 400);
  }
}

/* Curseur point d'encre */
function curseur() {
  const c = document.querySelector('.curseur');
  if (!c || !pointeurFin) return;
  const x = g.quickTo(c, 'x', { duration: .25, ease: 'power3.out' });
  const y = g.quickTo(c, 'y', { duration: .25, ease: 'power3.out' });
  window.addEventListener('pointermove', e => { c.classList.add('actif'); x(e.clientX); y(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => { c.classList.toggle('lien', !!e.target.closest('a, button, label, select, input, [role="button"], .pin')); });
  document.addEventListener('pointerleave', () => c.classList.remove('actif'));
}

/* Boutons magnétiques */
export function aimants(racineEl = document) {
  if (!anime() || !pointeurFin) return;
  racineEl.querySelectorAll('[data-magnet]').forEach(el => {
    if (el.dataset.aimant) return; el.dataset.aimant = '1';
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      g.to(el, { x: (e.clientX - (r.left + r.width / 2)) * .28, y: (e.clientY - (r.top + r.height / 2)) * .35, duration: .4, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => g.to(el, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .4)' }));
  });
}

/* Titres qui s'impriment */
export function titres(racineEl = document) {
  if (!anime() || !window.SplitText) return;
  racineEl.querySelectorAll('[data-split]').forEach(el => {
    if (el.dataset.splitFait) return; el.dataset.splitFait = '1';
    window.SplitText.create(el, {
      type: 'lines,words', mask: 'lines', autoSplit: true, reduceWhiteSpace: false,
      onSplit: self => g.from(self.words, { yPercent: 115, rotate: 3, duration: .95, stagger: .035, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }),
    });
  });
}

/* Tampons de statut */
export function tampons(racineEl = document) {
  const liste = racineEl.querySelectorAll('[data-tampon]');
  if (!anime()) return;
  liste.forEach(el => {
    if (el.dataset.tamponFait) return; el.dataset.tamponFait = '1';
    const rot = getComputedStyle(el).transform;
    g.from(el, { scale: 2.2, opacity: 0, rotate: -16, duration: .5, ease: 'back.out(2.4)', clearProps: rot === 'none' ? 'transform' : '', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}

/* Trame d'impression en CSS : la photo s'encre quand elle entre à l'écran */
let obsTrames = null;
export function trames(racineEl = document) {
  const els = racineEl.querySelectorAll('[data-trame]:not(.encree)');
  if (calme() || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('encree')); return; }
  if (!obsTrames) {
    obsTrames = new IntersectionObserver(entrees => {
      entrees.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.hasAttribute('data-gl') && el.classList.contains('gl')) { obsTrames.unobserve(el); return; }
        setTimeout(() => el.classList.add('encree'), 260 + Math.random() * 360);
        obsTrames.unobserve(el);
      });
    }, { threshold: .35 });
  }
  els.forEach(el => { if (!el.hasAttribute('data-gl')) obsTrames.observe(el); });
}

/* Compteur mécanique (odomètre) */
export function odometre(el, { valeur, decimales = 0, prefixe = '', suffixe = '', annee = false } = {}) {
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
  if (!anime()) { rails.forEach(r => { r.rail.style.transform = `translateY(${fin(r)}%)`; }); return; }
  g.set(rails.map(r => r.rail), { yPercent: 0 });
  ST.create({
    trigger: el, start: 'top 98%', once: true,
    onEnter: () => rails.forEach((r, i) => g.to(r.rail, { yPercent: fin(r), duration: 1.4 + i * .14, ease: 'power3.out' })),
  });
}

/* Image (srcset) */
export function imageHTML(base, { alt = '', sizes = '100vw', lazy = true, largeur = 960 } = {}) {
  return `<img src="${base}-${largeur}.webp" srcset="${base}-480.webp 480w, ${base}-960.webp 960w, ${base}-1600.webp 1600w" sizes="${sizes}" alt="${echap(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ''}>`;
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
    const mod = await import('./halftone.js?v=2');
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

/* Titres ajustés à la largeur de la page (titre du journal, pied de page) */
export function ajusterTitres() {
  const els = [...document.querySelectorAll('[data-ajuste]')];
  const faire = () => els.forEach(el => {
    const cible = el.firstElementChild || el;
    const etirement = el.style.fontStretch;
    el.style.fontStretch = '125%';
    const dispo = el.clientWidth;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const larg = cible.getBoundingClientRect().width;
    if (dispo && larg) el.style.fontSize = `${Math.min(fs * (dispo / larg) * 0.995, 260)}px`;
    el.style.fontStretch = etirement;
  });
  faire();
  document.fonts?.ready.then(() => { faire(); ST?.refresh(); });
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(faire, 120); });
}

export function demarrer() {
  ajusterTitres();
  dates();
  boutonsCalme();
  menu();
  copier();
  lettre();
  enteteAuto();
  if (anime()) { lisse(); curseur(); aimants(); titres(); tampons(); piedTitre(); }
  liens();
  trames();
}
