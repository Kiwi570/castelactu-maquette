// Castel Actu — Toute l'actu : le fil filtrable, la carte des 11 communes, les plus lus
import { demarrer, anime, defilerVers, echap, ancreInitiale, trames, tampons } from './app.js?v=4';
import { ARTICLES, COMMUNES, RUBRIQUES, rubrique, commune } from './data.js?v=4';
import { $, $$, carteHTML, inclinaison, reveler, revelerAuDefilement, nomsCommunes, classement, nbInfos } from './sections.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;

/* ---------- État des filtres (repris de l'adresse : actu.html?rubrique=commerce&commune=erbray) ---------- */
const params = new URLSearchParams(location.search);
const etat = {
  rubrique: RUBRIQUES.some(r => r.id === params.get('rubrique')) ? params.get('rubrique') : '',
  commune: COMMUNES.some(c => c.id === params.get('commune')) ? params.get('commune') : '',
  q: (params.get('q') || '').slice(0, 80),
};
const norm = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function correspond(a) {
  if (etat.rubrique && a.rubrique !== etat.rubrique) return false;
  if (etat.commune && !a.communes.includes(etat.commune)) return false;
  if (etat.q) {
    const h = norm([a.titre, a.resume, rubrique(a.rubrique).nom, nomsCommunes(a), (a.infos || []).map(i => i[1]).join(' ')].join(' '));
    if (!norm(etat.q).split(/\s+/).filter(Boolean).every(m => h.includes(m))) return false;
  }
  return true;
}

// l'adresse suit les filtres : un lien partagé ou un retour arrière retrouve la même sélection
function memoriser() {
  const p = new URLSearchParams();
  if (etat.rubrique) p.set('rubrique', etat.rubrique);
  if (etat.commune) p.set('commune', etat.commune);
  if (etat.q) p.set('q', etat.q);
  const qs = p.toString();
  history.replaceState(null, '', `${location.pathname}${qs ? `?${qs}` : ''}${location.hash}`);
}

/* ---------- Le fil ---------- */
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
  q.value = etat.q;
  let tempo; q.addEventListener('input', () => { clearTimeout(tempo); tempo = setTimeout(() => { etat.q = q.value.trim(); appliquer(); }, 160); });

  appliquer(true);
  inclinaison(box);
  revelerAuDefilement($$('.carte', box));
  trames(box); tampons(box);
}

function appliquer(initial = false) {
  const box = $('[data-fil]');
  const cartes = $$('.carte', box);
  // après un filtre, plus aucune carte n'attend son apparition : on les montre avant de les déplacer
  if (!initial) reveler(cartes.filter(c => !c.dataset.revele), false);
  const etatFlip = (!initial && anime() && window.Flip) ? window.Flip.getState(cartes) : null;
  let visibles = 0;
  cartes.forEach(c => {
    const a = ARTICLES.find(x => x.id === c.dataset.id);
    const ok = correspond(a);
    c.hidden = !ok;
    c.classList.remove('carte--grande');
    if (ok) visibles++;
  });
  const filtre = etat.rubrique || etat.commune || etat.q;
  const premiere = cartes.find(c => !c.hidden);
  if (premiere && !filtre) premiere.classList.add('carte--grande');

  $$('[data-rub]').forEach(b => b.setAttribute('aria-pressed', b.dataset.rub === etat.rubrique ? 'true' : 'false'));
  $('[data-filtre-commune]').value = etat.commune;
  $$('.communes-liste button').forEach(b => b.classList.toggle('actif', b.dataset.commune === etat.commune));
  $$('[data-plan-svg] .pin').forEach(p => p.classList.toggle('actif', p.dataset.commune === etat.commune));

  const vide = $('[data-fil-vide]');
  vide.hidden = visibles > 0;
  if (!visibles) {
    const ou = etat.commune ? ` à ${commune(etat.commune).nom}` : '';
    const quoi = etat.rubrique ? ` en ${rubrique(etat.rubrique).nom.toLowerCase()}` : '';
    $('[data-fil-vide-txt]').textContent = etat.q
      ? `Aucune info ne contient « ${etat.q} »${quoi}${ou}. Vous avez une info sur le sujet ? Envoyez-la à la rédaction.`
      : `Aucune info${quoi}${ou} pour l’instant. Vous avez une info ? Envoyez-la à la rédaction.`;
  }
  const txt = `${nbInfos(visibles)}` + (filtre ? ' pour votre sélection.' : ' au total. Dates de publication à compléter.');
  $('[data-filtres-etat]').innerHTML = echap(txt) + (filtre ? ' <button type="button" data-reset>Tout afficher</button>' : '');
  $('[data-reset]')?.addEventListener('click', () => { etat.rubrique = ''; etat.commune = ''; etat.q = ''; $('[data-filtre-recherche]').value = ''; appliquer(); });
  if (!initial) memoriser();

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

function filtrerCommune(id) {
  etat.commune = etat.commune === id ? '' : id;
  appliquer();
  defilerVers('#recherche');
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
  pts.filter(p => !p.centre).forEach(p => {
    const mx = (centre.px + p.px) / 2, my = (centre.py + p.py) / 2;
    const dx = p.px - centre.px, dy = p.py - centre.py;
    const qx = mx - dy * .18, qy = my + dx * .18;
    const d = `M${centre.px.toFixed(1)} ${centre.py.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${p.px.toFixed(1)} ${p.py.toFixed(1)}`;
    html += `<path class="route route--trace" d="${d}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" data-route/><path class="route" d="${d}" data-route-pointille/>`;
  });
  // pastilles (tailles et étiquettes calculées par placer())
  pts.forEach(p => {
    html += `<g class="pin${p.nb ? '' : ' vide'}${p.centre ? ' centre' : ''}" tabindex="0" role="button" data-commune="${p.id}" aria-label="${p.nom}, ${nbInfos(p.nb)}">
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
      const pin = svg.querySelector(`.pin[data-commune="${p.id}"]`);
      pin.querySelector('.goutte').setAttribute('r', p.r.toFixed(1));
      pin.querySelector('.halo').setAttribute('r', Math.max(p.r + 6, u(22)).toFixed(1));
      const c = pin.querySelector('.compte');
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
    `<li><button type="button" data-commune="${p.id}"${p.nb ? '' : ' class="zero"'}>${p.nom}<small>${p.nb ? nbInfos(p.nb) : 'aucune info'}</small></button></li>`).join('');
  ul.addEventListener('click', e => { const b = e.target.closest('[data-commune]'); if (b) filtrerCommune(b.dataset.commune); });

  if (anime()) {
    const tl = g.timeline({ scrollTrigger: { trigger: '[data-plan]', start: 'top 85%', once: true } });
    tl.fromTo($$('[data-route]', svg), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: .06, ease: 'power2.inOut' })
      .from($$('[data-route-pointille]', svg), { opacity: 0, duration: .6, stagger: .04 }, .5)
      .from($$('.pin__goutte', svg), { scale: 0, duration: .7, stagger: .05, ease: 'elastic.out(1, .45)' }, .2)
      .from($$('.pin .etiquette', svg), { opacity: 0, duration: .4, stagger: .04 }, .6)
      .from($$('.reperage', svg), { rotate: 90, opacity: 0, transformOrigin: '50% 50%', duration: .8, stagger: .1 }, 0);
  }
}

/* ---------- Recherche depuis l'en-tête ---------- */
function rechercheEntete() {
  const champ = $('[data-filtre-recherche]');
  const aller = () => { defilerVers('#recherche'); setTimeout(() => champ?.focus({ preventScroll: true }), 900); };
  $$('[data-recherche]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); history.replaceState(null, '', `${location.search}#recherche`); aller(); }));
  if (location.hash === '#recherche') setTimeout(() => champ?.focus({ preventScroll: true }), 700);
}

/* ---------- Démarrage ---------- */
$$('[data-total-infos]').forEach(el => { el.textContent = String(ARTICLES.length); });
if (window.scrollY && location.hash) window.scrollTo(0, 0);
plan();
fil();
classement($('[data-classement]'), { nombreMax: 5 });
demarrer();
rechercheEntete();
ST?.refresh();
ancreInitiale();
document.fonts?.ready.then(() => ST?.refresh());
