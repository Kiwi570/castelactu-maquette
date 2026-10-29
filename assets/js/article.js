// Castel Actu — fiche article (gabarit : article.html#identifiant)
import { demarrer, anime, trames, tampons, imageHTML, echap, tramesGL, lenis, rideau } from './app.js?v=4';
import { ARTICLES, COMMUNES, rubrique, commune, echeancePassee, nombre } from './data.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;
const $ = (s, r = document) => r.querySelector(s);

function tamponDe(a) {
  if (echeancePassee(a)) return { texte: 'Échéance passée', classe: 'tampon--passe' };
  if (!a.tampon) return null;
  if (/annul/i.test(a.tampon)) return { texte: a.tampon, classe: 'tampon--annule' };
  if (/^(ouvert|nouveau|7j\/7)$/i.test(a.tampon)) return { texte: a.tampon, classe: 'tampon--bleu' };
  return { texte: a.tampon, classe: '' };
}
function phrase(a) {
  if (!a.echeance) return '';
  const quoi = a.echeance.quoi || 'Échéance annoncée';
  return echeancePassee(a) ? `${quoi} pour ${a.echeance.libelle} : échéance passée, statut à vérifier par la rédaction.` : `${quoi} : ${a.echeance.libelle}.`;
}
const noms = a => a.communes.map(c => commune(c).nom).join(', ');

function miniPlan(a) {
  const W = 300, M = 46;
  const lat0 = COMMUNES.reduce((s, c) => s + c.lat, 0) / COMMUNES.length, k = Math.cos(lat0 * Math.PI / 180);
  const pts = COMMUNES.map(c => ({ ...c, x: c.lon * k, y: -c.lat }));
  const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x)), minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y));
  const e = (W - 2 * M) / Math.max(maxX - minX, maxY - minY);
  const ox = (W - (maxX - minX) * e) / 2, oy = (W - (maxY - minY) * e) / 2;
  let s = '';
  pts.forEach(p => {
    const x = ox + (p.x - minX) * e, y = oy + (p.y - minY) * e, actif = a.communes.includes(p.id);
    s += `<circle cx="${x}" cy="${y}" r="${actif ? 9 : 4}" fill="${actif ? '#E1201E' : '#0E1733'}" ${actif ? 'data-pin-actif' : ''}/>`;
    if (actif) s += `<text x="${x}" y="${y - 16}" text-anchor="middle" font-family="Archivo CA, Arial, sans-serif" font-weight="800" font-size="14" fill="#0E1733" paint-order="stroke" stroke="#F5F4EF" stroke-width="4">${p.nom}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Situation : ${echap(noms(a))}, Pays de Châteaubriant"><g fill="none" stroke="#0E1733" stroke-width="1"><circle cx="18" cy="18" r="7"/><path d="M6 18h24M18 6v24"/><circle cx="${W - 18}" cy="${W - 18}" r="7"/><path d="M${W - 30} ${W - 18}h24M${W - 18} ${W - 30}v24"/></g>${s}<text x="12" y="${W - 10}" font-family="Archivo CA, Arial, sans-serif" font-size="11" fill="#474D63">Carte schématique</text></svg>`;
}

let gl = null;
// Remplit la fiche (synchrone : rien ne s'affiche avant que le bon article soit en place)
function remplir(id) {
  const a = ARTICLES.find(x => x.id === id) || ARTICLES.find(x => x.id === 'central-8');
  document.title = `${a.titre} | Castel Actu`;
  const ariane = $('[data-ariane-rub]'); ariane.textContent = rubrique(a.rubrique).nom; ariane.href = `actu.html?rubrique=${a.rubrique}`;
  $('[data-ariane-titre]').textContent = a.titre;
  $('[data-a-meta]').innerHTML = `<span class="rub">${echap(rubrique(a.rubrique).nom)}</span><span class="commune">${echap(noms(a))}</span><span class="date-a-completer">Date de publication à compléter</span>${a.vues ? `<span><strong>${nombre(a.vues)}</strong> vues sur Facebook</span>` : ''}`;
  $('[data-a-titre]').textContent = a.titre;
  const chapo = $('[data-a-chapo]');
  chapo.textContent = a.resume || 'Chapô à compléter par la rédaction.';
  chapo.classList.toggle('date-a-completer', !a.resume);

  const t = tamponDe(a), statut = $('[data-a-statut]'), ph = phrase(a);
  statut.hidden = !t && !ph;
  statut.innerHTML = `${t ? `<span class="tampon ${t.classe}" data-tampon>${echap(t.texte)}</span>` : ''}${ph ? `<span>${echap(ph)}</span>` : ''}`;

  const vis = $('[data-a-image]');
  gl?.detruire(); gl = null;
  vis.classList.remove('gl', 'encree');
  vis.classList.toggle('trame--contain', a.cadrage === 'contain');
  if (a.cadrage === 'contain') { vis.dataset.cadrage = 'contain'; vis.dataset.fond = a.fond || '#0E1733'; vis.style.setProperty('--fond', a.fond || '#0E1733'); }
  else { delete vis.dataset.cadrage; delete vis.dataset.fond; vis.style.removeProperty('--fond'); }
  const mention = a.provisoire ? '' : a.ia ? '<span class="mention-ia">Illustration IA</span>' : (a.credit ? `<span class="mention-credit">${echap(a.credit)}</span>` : '');
  vis.innerHTML = imageHTML(a.image, { alt: a.titre, sizes: '100vw', lazy: false, largeur: 1600 }) + mention;

  const texte = $('[data-a-texte]');
  texte.innerHTML = (a.texte || (a.resume ? [a.resume] : [])).map(p => `<p>${echap(p)}</p>`).join('') +
    `<div class="bloc-a-completer"><strong>${a.texte ? 'Suite de l’article à compléter' : 'Texte de l’article à compléter'}</strong><span>La rédaction ajoute ici le texte complet, les citations et les photos du reportage.</span></div>`;

  const infos = [['Commune', noms(a)], ['Rubrique', rubrique(a.rubrique).nom], ...(a.infos || [])];
  $('[data-a-infos]').innerHTML = infos.map(([k, v, lien]) => `<div><dt>${echap(k)}</dt><dd>${lien ? `<a href="${lien}" target="_blank" rel="noopener">${echap(v)}</a>` : echap(v)}</dd></div>`).join('');
  $('[data-a-plan]').innerHTML = miniPlan(a);

  const fb = $('[data-a-fb]');
  fb.hidden = !a.fb; if (a.fb) fb.href = a.fb;
  $('[data-partage-fb]').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`;

  // À lire aussi : même rubrique, sinon chantiers
  const autres = ARTICLES.filter(x => x.id !== a.id);
  const proches = [...autres.filter(x => x.rubrique === a.rubrique), ...autres.filter(x => x.chantier && x.rubrique !== a.rubrique), ...autres].filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 3);
  $('[data-a-lire]').innerHTML = proches.map(x => {
    const tt = tamponDe(x);
    const m = x.provisoire ? '' : x.ia ? '<span class="mention-ia">Illustration IA</span>' : '';
    return `<article class="carte"><a class="carte__lien" href="article.html#${x.id}">
      <div class="trame" data-trame>${imageHTML(x.image, { alt: '', sizes: '(min-width: 900px) 30vw, 100vw' })}${m}</div>
      <div class="meta"><span class="rub">${echap(rubrique(x.rubrique).nom)}</span><span class="commune">${echap(noms(x))}</span></div>
      <h3>${echap(x.titre)}</h3></a>${tt ? `<span class="carte__tampon tampon ${tt.classe}" data-tampon>${echap(tt.texte)}</span>` : ''}</article>`;
  }).join('');

  trames(document); tampons(document);
  ST?.refresh();
  return vis;
}

// La photo sort de presse : trame d'impression, puis la couleur
async function imprimer(vis, delai) {
  const [inst] = await tramesGL([vis]);
  gl = inst || null;
  if (!gl) return;
  if (!anime()) { gl.progression(1); return; }
  gl.progression(0);
  const o = { v: 0 };
  g.to(o, { v: 1, duration: 1.8, delay: delai, ease: 'power2.inOut', onUpdate: () => gl?.progression(o.v) });
}

function progression() {
  const barre = $('[data-progression]');
  if (!barre) return;
  if (anime()) {
    g.to(barre, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '[data-a-texte]', start: 'top 70%', end: 'bottom 50%', scrub: true } });
  } else {
    const maj = () => { const el = $('[data-a-texte]'); const r = el.getBoundingClientRect(); const p = Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / (r.height))); barre.style.transform = `scaleX(${p})`; };
    addEventListener('scroll', maj, { passive: true }); maj();
  }
}

function partage() {
  const b = $('[data-partage-copier]'), msg = $('[data-partage-msg]');
  b?.addEventListener('click', () => {
    const ok = () => { msg.textContent = 'Lien copié.'; };
    const ko = () => { msg.textContent = `Copiez ce lien : ${location.href}`; };
    try { navigator.clipboard.writeText(location.href).then(ok, ko); } catch (e) { ko(); }
  });
}

const id = () => decodeURIComponent(location.hash.slice(1)) || 'central-8';
const premierVisuel = remplir(id());
document.body.classList.add('pret');
demarrer();
progression();
partage();
imprimer(premierVisuel, document.documentElement.classList.contains('tourne-entree') ? .75 : .55);

// Changer d'article sous le rideau : la page tourne, le nouvel article est déjà en haut
function enHaut() { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else window.scrollTo(0, 0); }
let courant = id();
function changer(cible, pousser) {
  if (cible === courant) return;
  courant = cible;
  let vis;
  rideau(() => {
    gl?.detruire(); gl = null;
    if (pousser) history.pushState(null, '', `#${cible}`);
    vis = remplir(cible);
    enHaut();
  }).then(() => { if (vis) imprimer(vis, .1); });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="article.html#"]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  changer(a.getAttribute('href').split('#')[1], true);
}, true);
window.addEventListener('popstate', () => changer(id(), false));
window.addEventListener('hashchange', () => changer(id(), false));
