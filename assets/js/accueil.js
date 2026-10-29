// Castel Actu — page d'accueil
import { demarrer, anime, calme, pointeurFin, estMobile, defilerVers, odometre, trames, tampons, aimants, imageHTML, echap, tramesGL, hauteurEntete, lenis } from './app.js?v=2';
import { ARTICLES, AUDIENCE, COMMUNES, RUBRIQUES, AGENDA, PODCASTS, ALERTE, rubrique, commune, echeancePassee, nombre } from './data.js?v=2';

const g = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Outils d'affichage ---------- */
function tamponDe(a) {
  if (echeancePassee(a)) return { texte: 'Échéance passée', classe: 'tampon--passe' };
  if (!a.tampon) return null;
  const t = a.tampon;
  if (/annul/i.test(t)) return { texte: t, classe: 'tampon--annule' };
  if (/^(ouvert|nouveau|7j\/7)$/i.test(t)) return { texte: t, classe: 'tampon--bleu' };
  return { texte: t, classe: '' };
}
function phraseEcheance(a) {
  if (!a.echeance) return '';
  const quoi = a.echeance.quoi || 'Échéance annoncée';
  return echeancePassee(a) ? `${quoi} pour ${a.echeance.libelle} : échéance passée, statut à vérifier.` : `${quoi} : ${a.echeance.libelle}.`;
}
function mentionImage(a) {
  if (a.provisoire) return '';
  if (a.ia) return '<span class="mention-ia">Illustration IA</span>';
  return a.credit ? `<span class="mention-credit">${echap(a.credit)}</span>` : '';
}
const lienArticle = a => `article.html#${a.id}`;
const nomsCommunes = a => a.communes.map(c => commune(c).nom).join(', ');

/* ---------- Ouverture : la rotative ---------- */
function ouverture() {
  const r = $('.rotative');
  if (!r || !g || getComputedStyle(r).display === 'none') return Promise.resolve(false);
  try { sessionStorage.setItem('ca-vu', '1'); } catch (e) {}
  const titre = $('.rotative__titre', r);
  titre.innerHTML = [...titre.textContent].map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  return new Promise(resolve => {
    const tl = g.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { r.remove(); window.__ouvertureFin = performance.now(); } });
    tl.to('.rouleau__bandes', { x: -432, duration: 1.6, ease: 'power2.inOut' }, 0)
      .from('.rouleau--haut', { yPercent: -120, duration: .5 }, 0)
      .from('.rouleau--bas', { yPercent: 120, duration: .5 }, 0)
      .from(titre.children, { yPercent: 60, scaleY: 1.6, opacity: 0, transformOrigin: '50% 100%', stagger: .035, duration: .45 }, .1)
      .from(titre, { scaleX: .55, duration: .9, ease: 'power4.out' }, .1)
      .from('.rotative__date', { opacity: 0, y: 14, duration: .3 }, .65)
      .from('.rotative__date b', { scale: 2.4, rotate: -14, opacity: 0, duration: .3, ease: 'back.out(2.2)' }, .82)
      .to('.rouleau--haut', { yPercent: -320, duration: .5, ease: 'power3.in' }, 1.18)
      .to('.rouleau--bas', { yPercent: 320, duration: .5, ease: 'power3.in' }, 1.18)
      .to('.rotative__centre', { yPercent: -24, opacity: 0, duration: .4, ease: 'power3.in' }, 1.22)
      .set(r, { backgroundColor: 'transparent' }, 1.34)
      .to('.rotative__haut', { yPercent: -101, duration: .55, ease: 'power4.inOut' }, 1.34)
      .to('.rotative__bas', { yPercent: 101, duration: .55, ease: 'power4.inOut' }, 1.34)
      .add(() => resolve(true), 1.24);
  });
}

/* ---------- La Une ---------- */
function une() {
  const a = ARTICLES.find(x => x.une);
  const statut = $('[data-statut]');
  if (statut && a) {
    const t = tamponDe(a);
    const tp = $('[data-tampon]', statut);
    if (t) { tp.textContent = t.texte; tp.className = `tampon ${t.classe}`; }
    $('p', statut).textContent = phraseEcheance(a);
  }
  const odo = $('[data-odo]');
  if (odo) odometre(odo, { valeur: +odo.dataset.odo });

  const aussi = $('[data-une-aussi]');
  ['le-smash', 'credit-mutuel', 'bijouterie-camille'].map(id => ARTICLES.find(x => x.id === id)).filter(Boolean).forEach(x => {
    aussi.insertAdjacentHTML('beforeend', `<a href="${lienArticle(x)}"><div class="trame" data-trame>${imageHTML(x.image, { alt: '', sizes: '120px', largeur: 480 })}</div><span>${echap(x.titre)}</span></a>`);
  });

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

function animationsUne(apresOuverture) {
  if (!anime()) return;
  const plaque = $('.titre-journal__plaque');
  const tl = g.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { window.__uneFin = performance.now(); } });
  tl.fromTo(plaque, { '--rx': '14px', '--ry': '-9px' }, { '--rx': '0px', '--ry': '0px', duration: .8, ease: 'power4.out' }, 0)
    .from('.une__bandeau > *', { y: -14, opacity: 0, stagger: .04, duration: .35 }, 0)
    .from('.une__sous > *', { y: 16, opacity: 0, stagger: .05, duration: .4 }, .06)
    .from('.une__texte > *', { y: 24, opacity: 0, stagger: .035, duration: .4 }, .08)
    .from('.une__visuel', { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power4.inOut' }, 0)
    .from('.une__aussi > *', { y: 20, opacity: 0, stagger: .05, duration: .4 }, .2)
    .from('.ticker', { yPercent: 100, opacity: 0, duration: .4 }, .3);

  // le titre du journal se resserre au défilement, les plaques se décalent
  g.to('.titre-journal', { fontStretch: '92%', ease: 'none', scrollTrigger: { trigger: '.une', start: 'top top', end: 'bottom top', scrub: true } });
  g.to(plaque, { '--rx': '6px', '--ry': '3px', ease: 'none', scrollTrigger: { trigger: '.une', start: 'top top', end: 'bottom top', scrub: true } });
}

/* ---------- Audience ---------- */
function audience() {
  const box = $('[data-compteurs]');
  AUDIENCE.forEach(c => {
    const d = document.createElement('div'); d.className = 'compteur';
    d.innerHTML = `<span class="odo"></span><span class="compteur__libelle">${echap(c.libelle)}</span><span class="compteur__source">${echap(c.source)}</span>`;
    box.appendChild(d);
    odometre($('.odo', d), c);
  });
  if (anime()) {
    $$('[data-parallaxe]').forEach(el => g.fromTo(el, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  }
}

/* ---------- Le fil ---------- */
const etat = { rubrique: '', commune: '', q: '' };
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function carteHTML(a) {
  const t = tamponDe(a);
  const vues = a.vues ? `<span><strong>${nombre(a.vues)}</strong> vues</span>` : '';
  return `<article class="carte" data-id="${a.id}">
    <a class="carte__lien" href="${lienArticle(a)}">
      <div class="trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '(min-width: 1100px) 25vw, (min-width: 640px) 50vw, 100vw' })}${mentionImage(a)}</div>
      <div class="meta"><span class="rub">${echap(rubrique(a.rubrique).nom)}</span><span class="commune">${echap(nomsCommunes(a))}</span></div>
      <h3>${echap(a.titre)}</h3>
      ${a.resume ? `<p class="carte__resume">${echap(a.resume)}</p>` : ''}
    </a>
    ${t ? `<span class="carte__tampon tampon ${t.classe}" data-tampon>${echap(t.texte)}</span>` : ''}
    ${vues ? `<div class="carte__pied">${vues}</div>` : ''}
  </article>`;
}

function correspond(a) {
  if (etat.rubrique && a.rubrique !== etat.rubrique) return false;
  if (etat.commune && !a.communes.includes(etat.commune)) return false;
  if (etat.q) {
    const h = norm([a.titre, a.resume, rubrique(a.rubrique).nom, nomsCommunes(a), (a.infos || []).map(i => i[1]).join(' ')].join(' '));
    if (!norm(etat.q).split(/\s+/).filter(Boolean).every(m => h.includes(m))) return false;
  }
  return true;
}

function fil() {
  const box = $('[data-fil]');
  box.innerHTML = ARTICLES.map(carteHTML).join('') + `<div class="fil__vide" data-fil-vide hidden><p data-fil-vide-txt></p><a class="btn btn--rouge" href="envoyer-une-info.html">Envoyer une info</a></div>`;

  // puces de rubriques
  const puces = $('[data-filtres-rubriques]');
  const nb = id => ARTICLES.filter(a => a.rubrique === id).length;
  const ordre = [...RUBRIQUES.filter(r => nb(r.id)), ...RUBRIQUES.filter(r => !nb(r.id))];
  puces.innerHTML = `<button class="puce" type="button" data-rub="" aria-pressed="true">Toutes <small>${ARTICLES.length}</small></button>` +
    ordre.map(r => nb(r.id)
      ? `<button class="puce" type="button" data-rub="${r.id}" aria-pressed="false">${echap(r.nom)} <small>${nb(r.id)}</small></button>`
      : `<button class="puce" type="button" data-rub="${r.id}" disabled title="Aucune info dans cette rubrique pour l’instant">${echap(r.nom)} <small>0</small></button>`).join('');
  puces.addEventListener('click', e => {
    const b = e.target.closest('[data-rub]'); if (!b) return;
    etat.rubrique = b.dataset.rub; appliquer();
  });

  // communes
  const sel = $('[data-filtre-commune]');
  COMMUNES.forEach(c => sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${echap(c.nom)} (${ARTICLES.filter(a => a.communes.includes(c.id)).length})</option>`));
  sel.addEventListener('change', () => { etat.commune = sel.value; appliquer(); });

  // recherche
  const q = $('[data-filtre-recherche]');
  let tempo; q.addEventListener('input', () => { clearTimeout(tempo); tempo = setTimeout(() => { etat.q = q.value.trim(); appliquer(); }, 160); });

  appliquer(true);
  inclinaison(box);
  if (anime()) {
    ST.batch('.carte', {
      start: 'top 92%', once: true,
      onEnter: lot => g.from(lot, { rotateX: -62, y: 40, opacity: 0, transformOrigin: '50% 0%', transformPerspective: 900, duration: 1, ease: 'power3.out', stagger: .08, clearProps: 'transform,opacity' }),
    });
  }
  trames(box); tampons(box);
}

function appliquer(initial = false) {
  const box = $('[data-fil]');
  const cartes = $$('.carte', box);
  const etatFlip = (!initial && anime() && window.Flip) ? window.Flip.getState(cartes) : null;
  let visibles = 0;
  cartes.forEach(c => {
    const a = ARTICLES.find(x => x.id === c.dataset.id);
    const ok = correspond(a);
    c.hidden = !ok;
    c.classList.remove('carte--grande');
    if (ok) visibles++;
  });
  const uneId = (ARTICLES.find(x => x.une) || {}).id;
  const premiere = cartes.find(c => !c.hidden && c.dataset.id !== uneId);
  if (premiere && !etat.rubrique && !etat.commune && !etat.q) premiere.classList.add('carte--grande');

  $$('[data-rub]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rub === etat.rubrique ? 'true' : 'false'));
  $('[data-filtre-commune]').value = etat.commune;
  $$('.communes-liste button').forEach(b => b.classList.toggle('actif', b.dataset.commune === etat.commune));

  const vide = $('[data-fil-vide]');
  vide.hidden = visibles > 0;
  if (!visibles) {
    const ou = etat.commune ? ` à ${commune(etat.commune).nom}` : '';
    const quoi = etat.rubrique ? ` en ${rubrique(etat.rubrique).nom.toLowerCase()}` : '';
    $('[data-fil-vide-txt]').textContent = etat.q
      ? `Aucune info ne contient « ${etat.q} »${quoi}${ou}. Vous avez une info sur le sujet ? Envoyez-la à la rédaction.`
      : `Aucune info${quoi}${ou} pour l’instant. Vous avez une info ? Envoyez-la à la rédaction.`;
  }
  const filtre = etat.rubrique || etat.commune || etat.q;
  const txt = `${visibles} info${visibles > 1 ? 's' : ''}` + (filtre ? ' pour votre sélection.' : ' au total. Dates de publication à compléter.');
  $('[data-filtres-etat]').innerHTML = echap(txt) + (filtre ? ' <button type="button" data-reset>Tout afficher</button>' : '');
  $('[data-reset]')?.addEventListener('click', () => { etat.rubrique = ''; etat.commune = ''; etat.q = ''; $('[data-filtre-recherche]').value = ''; appliquer(); });

  if (etatFlip) {
    window.Flip.from(etatFlip, {
      duration: .6, ease: 'power3.inOut', stagger: .015, absolute: true, nested: true,
      onEnter: els => g.fromTo(els, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .45 }),
      onLeave: els => g.to(els, { opacity: 0, scale: .9, duration: .3 }),
      onComplete: () => ST.refresh(),
    });
  } else if (!initial) {
    ST?.refresh();
  }
  trames(box);
}

function inclinaison(box) {
  if (!anime() || !pointeurFin) return;
  box.addEventListener('pointermove', e => {
    const l = e.target.closest('.carte__lien'); if (!l) return;
    const r = l.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    g.to(l, { rotateY: x * 7, rotateX: -y * 6, transformPerspective: 900, duration: .5, ease: 'power3.out' });
  });
  box.addEventListener('pointerout', e => {
    const l = e.target.closest('.carte__lien'); if (!l || l.contains(e.relatedTarget)) return;
    g.to(l, { rotateY: 0, rotateX: 0, duration: .8, ease: 'elastic.out(1, .5)' });
  });
}

function filtrerCommune(id) {
  etat.commune = etat.commune === id ? '' : id;
  appliquer();
  defilerVers('#actu');
}

/* ---------- Carte des 11 communes ---------- */
function plan() {
  const svg = $('[data-plan-svg]');
  const W = 600, M = (svg.getBoundingClientRect().width || 600) < 420 ? 56 : 80;
  const lat0 = COMMUNES.reduce((s, c) => s + c.lat, 0) / COMMUNES.length;
  const k = Math.cos(lat0 * Math.PI / 180);
  const pts = COMMUNES.map(c => ({ ...c, x: c.lon * k, y: -c.lat }));
  const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x));
  const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y));
  const ech = (W - 2 * M) / Math.max(maxX - minX, maxY - minY);
  const ox = (W - (maxX - minX) * ech) / 2, oy = (W - (maxY - minY) * ech) / 2;
  pts.forEach(p => { p.px = ox + (p.x - minX) * ech; p.py = oy + (p.y - minY) * ech; p.nb = ARTICLES.filter(a => a.communes.includes(p.id)).length; });
  const centre = pts.find(p => p.centre);

  let html = '';
  // repères d'imprimerie
  [[28, 28], [W - 28, 28], [28, W - 28], [W - 28, W - 28]].forEach(([x, y]) => {
    html += `<g class="reperage"><circle cx="${x}" cy="${y}" r="9"/><path d="M${x - 15} ${y}H${x + 15}M${x} ${y - 15}V${y + 15}"/></g>`;
  });
  // routes
  pts.filter(p => !p.centre).forEach((p, i) => {
    const mx = (centre.px + p.px) / 2, my = (centre.py + p.py) / 2;
    const dx = p.px - centre.px, dy = p.py - centre.py;
    const qx = mx - dy * .18, qy = my + dx * .18;
    const d = `M${centre.px.toFixed(1)} ${centre.py.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
    html += `<path class="route route--trace" d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" data-route/><path class="route" d="${d}" data-route-pointille/>`;
  });
  // pastilles (tailles et étiquettes calculées par placer())
  pts.forEach(p => {
    html += `<g class="pin${p.nb ? '' : ' vide'}${p.centre ? ' centre' : ''}" tabindex="0" role="button" data-commune="${p.id}" aria-label="${p.nom}, ${p.nb} info${p.nb > 1 ? 's' : ''}">
      <circle class="halo" cx="${p.px}" cy="${p.py}" r="20" fill="transparent" stroke="transparent"/>
      <g class="pin__goutte" style="transform-origin:${p.px}px ${p.py}px"><circle class="goutte" cx="${p.px}" cy="${p.py}" r="10"/>
      <text class="compte" x="${p.px}" y="${p.py}" text-anchor="middle">${p.nb}</text></g>
      <text class="etiquette" x="${p.px}" y="${p.py}">${p.nom}</text>
    </g>`;
  });
  svg.innerHTML = html;

  // Taille lisible quelle que soit la largeur, étiquettes sans chevauchement
  function placer() {
    const e = (svg.getBoundingClientRect().width || W) / W;
    const u = px => px / e;
    const petit = e * W < 420;
    const fs = u(petit ? 12.5 : 15), fsC = u(petit ? 15 : 19), cpt = u(12), cptC = u(15);
    const boites = [];
    const chevauche = b => b.x0 < 6 || b.x1 > W - 6 || b.y0 < 6 || b.y1 > W - 6 || boites.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    pts.forEach(p => {
      p.r = p.centre ? Math.max(26, u(22)) : Math.max(p.nb ? 14 : 10, u(p.nb ? 12 : 10));
      const g = svg.querySelector(`.pin[data-commune="${p.id}"]`);
      g.querySelector('.goutte').setAttribute('r', p.r.toFixed(1));
      g.querySelector('.halo').setAttribute('r', Math.max(p.r + 6, u(22)).toFixed(1));
      const c = g.querySelector('.compte');
      c.setAttribute('font-size', (p.centre ? cptC : cpt).toFixed(1));
      c.setAttribute('y', (p.py + (p.centre ? cptC : cpt) * .36).toFixed(1));
      boites.push({ x0: p.px - p.r - 2, x1: p.px + p.r + 2, y0: p.py - p.r - 2, y1: p.py + p.r + 2 });
    });
    const ordre = [centre, ...pts.filter(p => !p.centre).sort((a, b) => Math.hypot(a.px - centre.px, a.py - centre.py) - Math.hypot(b.px - centre.px, b.py - centre.py))];
    ordre.forEach(p => {
      const t = svg.querySelector(`.pin[data-commune="${p.id}"] .etiquette`);
      const f = p.centre ? fsC : fs;
      const lw = p.nom.length * f * .6, gap = u(6);
      const dg = p.r * .7 + gap;
      const cands = [
        { a: 'start', x: p.px + p.r + gap, y: p.py + f * .35 },
        { a: 'end', x: p.px - p.r - gap, y: p.py + f * .35 },
        { a: 'middle', x: p.px, y: p.py + p.r + gap + f * .8 },
        { a: 'middle', x: p.px, y: p.py - p.r - gap },
        { a: 'start', x: p.px + dg, y: p.py - dg },
        { a: 'start', x: p.px + dg, y: p.py + dg + f * .7 },
        { a: 'end', x: p.px - dg, y: p.py - dg },
        { a: 'end', x: p.px - dg, y: p.py + dg + f * .7 },
      ];
      if (p.centre) cands.unshift(cands.splice(2, 1)[0]);
      const boite = c => {
        const x0 = c.a === 'start' ? c.x : c.a === 'end' ? c.x - lw : c.x - lw / 2;
        return { x0, x1: x0 + lw, y0: c.y - f * .8, y1: c.y + f * .25 };
      };
      const choix = cands.find(c => !chevauche(boite(c))) || cands[0];
      boites.push(boite(choix));
      t.setAttribute('x', choix.x.toFixed(1)); t.setAttribute('y', choix.y.toFixed(1));
      t.setAttribute('text-anchor', choix.a); t.setAttribute('font-size', f.toFixed(1));
      if (p.centre) t.setAttribute('font-weight', '900');
      t.style.strokeWidth = `${u(4).toFixed(1)}px`;
    });
  }
  placer();
  let largeurPlan = svg.getBoundingClientRect().width;
  new ResizeObserver(() => { const w = svg.getBoundingClientRect().width; if (Math.abs(w - largeurPlan) > 4) { largeurPlan = w; placer(); } }).observe(svg);

  const activer = el => filtrerCommune(el.dataset.commune);
  svg.addEventListener('click', e => { const p = e.target.closest('.pin'); if (p) activer(p); });
  svg.addEventListener('keydown', e => { const p = e.target.closest('.pin'); if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); activer(p); } });

  // liste
  const ul = $('[data-communes-liste]');
  ul.innerHTML = [...pts].sort((a, b) => (b.centre - a.centre) || a.nom.localeCompare(b.nom, 'fr')).map(p =>
    `<li><button type="button" data-commune="${p.id}"${p.nb ? '' : ' class="zero"'}>${p.nom}<small>${p.nb ? `${p.nb} info${p.nb > 1 ? 's' : ''}` : 'aucune info'}</small></button></li>`).join('');
  ul.addEventListener('click', e => { const b = e.target.closest('[data-commune]'); if (b) filtrerCommune(b.dataset.commune); });

  if (anime()) {
    const tl = g.timeline({ scrollTrigger: { trigger: '[data-plan]', start: 'top 75%', once: true } });
    tl.fromTo($$('[data-route]', svg), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: .06, ease: 'power2.inOut' })
      .from($$('[data-route-pointille]', svg), { opacity: 0, duration: .6, stagger: .04 }, .5)
      .from($$('.pin__goutte', svg), { scale: 0, duration: .7, stagger: .05, ease: 'elastic.out(1, .45)' }, .2)
      .from($$('.pin .etiquette', svg), { opacity: 0, duration: .4, stagger: .04 }, .6)
      .from($$('.reperage', svg), { rotate: 90, opacity: 0, transformOrigin: '50% 50%', duration: .8, stagger: .1 }, 0);
  }
}

/* ---------- Chantiers : galerie horizontale épinglée ---------- */
function chantiers() {
  const sec = $('[data-chantiers]');
  const piste = $('[data-chantiers-piste]');
  const defile = $('[data-chantiers-defile]');
  const liste = ARTICLES.filter(a => a.chantier);
  piste.innerHTML = `<div class="chantiers__intro">
      <div class="trame" data-trame>${imageHTML('img/grok/accueil-chantiers-ruban-16x9', { alt: '', sizes: '(min-width: 900px) 30vw, 78vw' })}<span class="mention-ia">Illustration IA</span></div>
      <p>${liste.length} chantiers et projets suivis par Castel Actu. Statut tel qu’annoncé sur le site actuel, à mettre à jour&nbsp;; une échéance dépassée s’affiche d’elle-même.</p>
    </div>` + liste.map(a => {
    const t = tamponDe(a);
    const ech = phraseEcheance(a);
    return `<a class="chantier" href="${lienArticle(a)}">
      <div class="trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '(min-width: 900px) 32vw, 78vw' })}${mentionImage(a)}</div>
      ${t ? `<span class="chantier__tampon tampon ${t.classe}" data-tampon>${echap(t.texte)}</span>` : ''}
      <h3>${echap(a.titre)}</h3>
      <p class="chantier__info"><span>${echap(nomsCommunes(a))}</span>${ech ? `<span>${echap(ech)}</span>` : ''}${a.vues ? `<span>${nombre(a.vues)} vues</span>` : ''}</p>
    </a>`;
  }).join('');
  $('[data-chantiers-total]').textContent = String(liste.length);
  trames(piste); tampons(piste);

  const pos = $('[data-chantiers-pos]'), barre = $('[data-chantiers-barre]');
  const maj = p => { pos.textContent = String(Math.min(liste.length, 1 + Math.round(p * (liste.length - 1)))); if (barre) barre.style.transform = `scaleX(${p})`; };

  const ruban = $('[data-ruban]');
  if (anime()) {
    g.from(ruban, { scaleX: 0, duration: 1.1, ease: 'power4.inOut', scrollTrigger: { trigger: ruban, start: 'top 85%', once: true } });
    g.to(ruban, { backgroundPositionX: '-260px', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const peutEpingler = () => anime() && !estMobile();
  let st = null, tw = null;

  const zone = $('[data-chantiers-zone]');
  function mise() {
    sec.classList.remove('chantiers--epingle');
    sec.style.removeProperty('--trame-h');
    zone.style.removeProperty('padding-top');
    if (!peutEpingler()) return false;
    sec.classList.add('chantiers--epingle');
    zone.style.paddingTop = `${Math.round(hauteurEntete() + 16)}px`;
    const h = 0;
    const mesurer = trameH => {
      sec.style.setProperty('--trame-h', `${trameH}px`);
      const haut = piste.getBoundingClientRect().top - zone.getBoundingClientRect().top;
      const texte = Math.max(...$$('.chantier, .chantiers__intro', piste).map(c => c.getBoundingClientRect().height - $('.trame', c).getBoundingClientRect().height));
      const cpt = $('.chantiers__compteur', sec);
      const bas = cpt.getBoundingClientRect().height + parseFloat(getComputedStyle(cpt).marginTop) + 16;
      return Math.floor(window.innerHeight - h - haut - texte - bas);
    };
    let dispo = mesurer(240);
    dispo = mesurer(Math.max(60, Math.min(dispo, 460)));
    dispo = Math.min(dispo, mesurer(Math.max(60, Math.min(dispo, 460))));
    if (dispo < 120) { sec.classList.remove('chantiers--epingle'); sec.style.removeProperty('--trame-h'); zone.style.removeProperty('padding-top'); return false; }
    sec.style.setProperty('--trame-h', `${Math.round(Math.min(dispo, 440, window.innerWidth * 0.26))}px`);
    return true;
  }

  function installer() {
    st?.kill(); tw?.kill(); st = null; tw = null; g?.set(piste, { x: 0 });
    if (!mise()) {
      defile.addEventListener('scroll', () => { const m = defile.scrollWidth - defile.clientWidth; maj(m > 0 ? defile.scrollLeft / m : 0); }, { passive: true });
      maj(0);
      return;
    }
    const distance = () => Math.max(0, piste.scrollWidth - defile.clientWidth);
    tw = g.to(piste, { x: () => -distance(), ease: 'none' });
    st = ST.create({
      trigger: zone, start: 'top top', end: () => `+=${distance()}`, pin: zone, scrub: 0.8, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => maj(s.progress),
    });
  }
  installer();
  let largeur = window.innerWidth;
  window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - largeur) > 40) { largeur = window.innerWidth; installer(); ST.refresh(); } });
}

/* ---------- Les plus lus ---------- */
function plusLus() {
  const ol = $('[data-classement]');
  const top = ARTICLES.filter(a => a.vues).sort((a, b) => b.vues - a.vues).slice(0, 5);
  const max = top[0].vues;
  ol.innerHTML = top.map((a, i) => `<li>
    <span class="classement__rang" aria-hidden="true">${i + 1}</span>
    <div class="trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '150px', largeur: 480 })}</div>
    <div><div class="meta" style="margin-bottom:8px"><span class="rub">${echap(rubrique(a.rubrique).nom)}</span><span class="commune">${echap(nomsCommunes(a))}</span></div><h3><a href="${lienArticle(a)}">${echap(a.titre)}</a></h3></div>
    <div class="classement__vues"><strong data-vues="${a.vues}">${nombre(a.vues)}</strong><span class="barre" aria-hidden="true"><i style="--w:${(a.vues / max * 100).toFixed(1)}%"></i></span><span class="petit">vues sur Facebook</span></div>
  </li>`).join('');
  $$('[data-vues]', ol).forEach(el => odometre(el, { valeur: +el.dataset.vues }));
  trames(ol);
  if (anime()) {
    $$('.barre i', ol).forEach(b => g.from(b, { scaleX: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 92%', once: true } }));
    $$('.classement__rang', ol).forEach(r => g.from(r, { yPercent: 60, opacity: 0, duration: .8, ease: 'power4.out', scrollTrigger: { trigger: r, start: 'top 90%', once: true } }));
  }
}

/* ---------- Podcast ---------- */
function podcasts() {
  const box = $('[data-podcasts]');
  box.innerHTML = PODCASTS.map(p => `<div class="episode" data-episode="${p.id}">
    <button class="episode__jouer" type="button" aria-pressed="false" aria-label="Écouter ${echap(p.titre)}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg></button>
    <div><span class="episode__titre">${echap(p.titre)}</span><canvas width="600" height="68" aria-hidden="true"></canvas></div>
    <span class="episode__duree">${p.duree}</span>
    <p class="episode__msg" hidden></p>
  </div>`).join('');

  let courant = null;
  $$('.episode', box).forEach((ep, idx) => {
    const p = PODCASTS[idx];
    const cv = $('canvas', ep), ctx = cv.getContext('2d');
    const barres = Array.from({ length: 60 }, (_, i) => .25 + .75 * Math.abs(Math.sin(i * 1.7 + idx * 2) * Math.cos(i * .37 + idx)));
    let avance = 0, trace = 0;
    const dessiner = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const w = cv.width / barres.length;
      barres.forEach((v, i) => {
        const visible = Math.min(1, Math.max(0, trace * barres.length - i));
        const h = v * cv.height * visible;
        ctx.fillStyle = i / barres.length < avance ? '#E1201E' : 'rgba(245,244,239,.55)';
        ctx.fillRect(i * w + 1, (cv.height - h) / 2, w - 3, h);
      });
    };
    if (anime()) {
      const o = { t: 0 };
      g.to(o, { t: 1, duration: 1.4, ease: 'power2.out', onUpdate: () => { trace = o.t; dessiner(); }, scrollTrigger: { trigger: ep, start: 'top 90%', once: true } });
    } else { trace = 1; dessiner(); }

    const btn = $('button', ep), msg = $('.episode__msg', ep);
    let audio = null;
    btn.addEventListener('click', () => {
      if (courant && courant !== audio) { courant.pause(); }
      if (!audio) {
        audio = new Audio(p.audio);
        audio.addEventListener('timeupdate', () => { avance = audio.duration ? audio.currentTime / audio.duration : 0; dessiner(); });
        audio.addEventListener('ended', () => { btn.setAttribute('aria-pressed', 'false'); avance = 0; dessiner(); });
        audio.addEventListener('pause', () => btn.setAttribute('aria-pressed', 'false'));
      }
      if (!audio.paused) { audio.pause(); return; }
      audio.play().then(() => { courant = audio; btn.setAttribute('aria-pressed', 'true'); msg.hidden = true; })
        .catch(() => { btn.setAttribute('aria-pressed', 'false'); msg.hidden = false; msg.textContent = `Extrait audio à fournir : déposez le fichier ${p.audio} dans le site.`; });
    });
  });
}

/* ---------- Agenda ---------- */
function agenda() {
  const box = $('[data-agenda]');
  const maintenant = new Date();
  box.innerHTML = AGENDA.map(ev => {
    const fin = new Date(ev.fin + 'T23:59:59'), debut = new Date(ev.debut + 'T00:00:00');
    const etat = fin < maintenant ? { t: 'Terminé', c: 'tampon--passe' } : (debut <= maintenant ? { t: 'En cours', c: '' } : { t: 'À venir', c: 'tampon--bleu' });
    const mention = ev.ia ? '<span class="mention-ia">Illustration IA</span>' : (ev.credit ? `<span class="mention-credit">${echap(ev.credit)}</span>` : '');
    return `<article class="evenement">
      <div class="trame" data-trame>${imageHTML(ev.image, { alt: ev.titre, sizes: '(min-width: 900px) 33vw, 100vw' })}${mention}</div>
      <div class="evenement__corps">
        <h3>${echap(ev.titre)}</h3>
        <p class="evenement__date">${echap(ev.libelle)} <span class="tampon ${etat.c}" data-tampon>${etat.t}</span></p>
        <p class="evenement__note">${echap(ev.note)}</p>
        <a class="lien lien--externe" href="${ev.lien}" target="_blank" rel="noopener">Site officiel</a>
      </div>
    </article>`;
  }).join('');
  trames(box); tampons(box);
  const aig = $('[data-aiguille]');
  if (aig && anime()) g.fromTo(aig, { rotate: -70 }, { rotate: 48, duration: 1.6, ease: 'elastic.out(1, .4)', scrollTrigger: { trigger: aig, start: 'top 90%', once: true } });
}

/* ---------- Démarrage ---------- */
function lancer() {
  une();
  audience();
  fil();
  plan();
  chantiers();
  plusLus();
  podcasts();
  agenda();
  demarrer();
  rechercheEntete();
  aimants();

  ST?.refresh();
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

/* ---------- Recherche depuis l'en-tête ---------- */
function rechercheEntete() {
  const champ = $('[data-filtre-recherche]');
  const aller = () => { defilerVers('#recherche'); setTimeout(() => champ?.focus({ preventScroll: true }), 900); };
  $$('[data-recherche]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', '#recherche'); aller(); }));
  if (location.hash === '#recherche') setTimeout(aller, 500);
}

const ouvertureEnCours = ouverture();
lancer();
ouvertureEnCours.then(apres => {
  animationsUne(apres);
  // la trame WebGL démarre après l'ouverture
  setTimeout(monterGL, anime() ? 250 : 0);
});
