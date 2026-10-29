// Castel Actu — blocs partagés entre les pages (cartes, galerie des chantiers, classement, podcast, agenda)
import { anime, pointeurFin, estMobile, odometre, trames, tampons, imageHTML, echap, hauteurEntete } from './app.js?v=4';
import { ARTICLES, PODCASTS, rubrique, commune, echeancePassee, nombre } from './data.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Outils d'affichage ---------- */
export function tamponDe(a) {
  if (echeancePassee(a)) return { texte: 'Échéance passée', classe: 'tampon--passe' };
  if (!a.tampon) return null;
  const t = a.tampon;
  if (/annul/i.test(t)) return { texte: t, classe: 'tampon--annule' };
  if (/^(ouvert|nouveau|7j\/7)$/i.test(t)) return { texte: t, classe: 'tampon--bleu' };
  return { texte: t, classe: '' };
}
export function phraseEcheance(a) {
  if (!a.echeance) return '';
  const quoi = a.echeance.quoi || 'Échéance annoncée';
  return echeancePassee(a) ? `${quoi} pour ${a.echeance.libelle} : échéance passée, statut à vérifier.` : `${quoi} : ${a.echeance.libelle}.`;
}
export function mentionImage(a) {
  if (a.provisoire) return '';
  if (a.ia) return '<span class="mention-ia">Illustration IA</span>';
  return a.credit ? `<span class="mention-credit">${echap(a.credit)}</span>` : '';
}
export const lienArticle = a => `article.html#${a.id}`;
export const nomsCommunes = a => a.communes.map(c => commune(c).nom).join(', ');
export const nbInfos = n => `${n} info${n > 1 ? 's' : ''}`;

/* Statut d'un chantier, regroupé pour le suivi */
export const GROUPES = [
  { id: 'travaux', nom: 'En travaux', court: 'en travaux' },
  { id: 'projet', nom: 'En projet', court: 'en projet' },
  { id: 'passee', nom: 'Échéance passée', court: 'échéances passées', courtUn: 'échéance passée' },
  { id: 'annule', nom: 'Annulé', court: 'projets annulés', courtUn: 'projet annulé' },
];
export function groupeDe(a) {
  if (echeancePassee(a)) return 'passee';
  if (/annul/i.test(a.tampon || '')) return 'annule';
  if (/projet|prochainement|bientôt/i.test(a.tampon || '')) return 'projet';
  return 'travaux';
}

/* ---------- Cartes d'info ---------- */
export function carteHTML(a) {
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

// Fait apparaître des cartes une seule fois (au défilement, ou tout de suite après un filtre)
export function reveler(cartes, anim) {
  if (!cartes.length) return;
  cartes.forEach(c => { c.dataset.revele = '1'; });
  if (anim && anime()) g.to(cartes, { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: 'power3.out', stagger: .08, overwrite: true, clearProps: 'transform,opacity' });
  else g?.set(cartes, { clearProps: 'transform,opacity' });
}
// état de départ posé dans la même tâche que la création des cartes : rien ne s'affiche avant
export function revelerAuDefilement(cartes) {
  if (!anime() || !cartes.length) return;
  g.set(cartes, { opacity: 0, y: 40, rotateX: -62, transformOrigin: '50% 0%', transformPerspective: 900 });
  ST.batch(cartes, { start: 'top 94%', once: true, onEnter: lot => reveler(lot.filter(c => !c.dataset.revele), true) });
}

export function inclinaison(box) {
  if (!anime() || !pointeurFin) return;
  box.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
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

/* Fil court (accueil) : quelques cartes, sans filtres */
export function filCourt(box, liste) {
  box.innerHTML = liste.map(carteHTML).join('');
  const cartes = $$('.carte', box);
  cartes[0]?.classList.add('carte--grande');
  inclinaison(box);
  revelerAuDefilement(cartes);
  trames(box); tampons(box);
}

/* ---------- Chantiers : galerie horizontale épinglée ---------- */
function chantierHTML(a) {
  const t = tamponDe(a);
  const ech = phraseEcheance(a);
  return `<a class="chantier" href="${lienArticle(a)}">
      <div class="trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '(min-width: 900px) 32vw, 78vw' })}${mentionImage(a)}</div>
      ${t ? `<span class="chantier__tampon tampon ${t.classe}" data-tampon>${echap(t.texte)}</span>` : ''}
      <h3>${echap(a.titre)}</h3>
      <p class="chantier__info"><span>${echap(nomsCommunes(a))}</span>${ech ? `<span>${echap(ech)}</span>` : ''}${a.vues ? `<span>${nombre(a.vues)} vues</span>` : ''}</p>
    </a>`;
}

// À créer en dernier sur la page : les déclencheurs placés avant elle sont déjà en place.
// vitesse < 1 : la galerie avance un peu plus vite que le défilement (moins de hauteur de page)
export function galerieChantiers(sec, { liste, intro = '', fin = '', vitesse = .75 }) {
  const piste = $('[data-chantiers-piste]', sec);
  const defile = $('[data-chantiers-defile]', sec);
  const zone = $('[data-chantiers-zone]', sec);
  piste.innerHTML = intro + liste.map(chantierHTML).join('') + fin;
  $('[data-chantiers-total]', sec).textContent = String(liste.length);
  trames(piste); tampons(piste);

  const pos = $('[data-chantiers-pos]', sec), barre = $('[data-chantiers-barre]', sec);
  const maj = p => { pos.textContent = String(Math.min(liste.length, 1 + Math.round(p * (liste.length - 1)))); if (barre) barre.style.transform = `scaleX(${p})`; };

  const ruban = $('[data-ruban]', sec);
  if (anime() && ruban) {
    g.from(ruban, { scaleX: 0, duration: 1.1, ease: 'power4.inOut', scrollTrigger: { trigger: ruban, start: 'top 85%', once: true } });
    g.to(ruban, { backgroundPositionX: '-260px', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  const peutEpingler = () => anime() && !estMobile();
  let st = null, tw = null;
  const enleverMise = () => { sec.classList.remove('chantiers--epingle'); sec.style.removeProperty('--trame-h'); zone.style.removeProperty('padding-top'); };

  function mise() {
    enleverMise();
    if (!peutEpingler()) return false;
    sec.classList.add('chantiers--epingle');
    zone.style.paddingTop = `${Math.round(hauteurEntete() + 16)}px`;
    const mesurer = trameH => {
      sec.style.setProperty('--trame-h', `${trameH}px`);
      const haut = piste.getBoundingClientRect().top - zone.getBoundingClientRect().top;
      const texte = Math.max(...$$('.chantier, .chantiers__intro', piste).map(c => c.getBoundingClientRect().height - $('.trame', c).getBoundingClientRect().height));
      const cpt = $('.chantiers__compteur', sec);
      const bas = cpt.getBoundingClientRect().height + parseFloat(getComputedStyle(cpt).marginTop) + 16;
      return Math.floor(window.innerHeight - haut - texte - bas);
    };
    let dispo = mesurer(240);
    dispo = mesurer(Math.max(60, Math.min(dispo, 460)));
    dispo = Math.min(dispo, mesurer(Math.max(60, Math.min(dispo, 460))));
    if (dispo < 120) { enleverMise(); return false; }
    sec.style.setProperty('--trame-h', `${Math.round(Math.min(dispo, 440, window.innerWidth * 0.26))}px`);
    return true;
  }

  let ecouteDefile = false;
  function installer() {
    st?.kill(); tw?.kill(); st = null; tw = null; g?.set(piste, { x: 0 });
    if (!mise()) {
      if (!ecouteDefile) {
        ecouteDefile = true;
        defile.addEventListener('scroll', () => { const m = defile.scrollWidth - defile.clientWidth; maj(m > 0 ? defile.scrollLeft / m : 0); }, { passive: true });
      }
      maj(0);
      return;
    }
    const distance = () => Math.max(0, piste.scrollWidth - defile.clientWidth);
    tw = g.to(piste, { x: () => -distance(), ease: 'none' });
    st = ST.create({
      trigger: zone, start: 'top top', end: () => `+=${Math.round(distance() * vitesse)}`, pin: zone, scrub: 0.8, animation: tw, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => maj(s.progress),
    });
  }
  installer();
  // les images de la galerie se chargent avant d'arriver à l'écran (elles sont décalées hors champ)
  ST?.create({ trigger: sec, start: 'top bottom+=900', once: true, onEnter: () => $$('img[loading="lazy"]', piste).forEach(i => { i.loading = 'eager'; }) });
  let largeur = window.innerWidth, hauteur = window.innerHeight, tempo;
  window.addEventListener('resize', () => {
    clearTimeout(tempo);
    tempo = setTimeout(() => {
      if (Math.abs(window.innerWidth - largeur) > 40 || Math.abs(window.innerHeight - hauteur) > 80) {
        largeur = window.innerWidth; hauteur = window.innerHeight; installer(); ST?.refresh();
      }
    }, 150);
  });
}

/* ---------- Les plus lus ---------- */
export function classement(ol, { nombreMax = 5, images = true } = {}) {
  const top = ARTICLES.filter(a => a.vues).sort((a, b) => b.vues - a.vues).slice(0, nombreMax);
  const max = top[0].vues;
  ol.innerHTML = top.map((a, i) => `<li>
    <span class="classement__rang" aria-hidden="true">${i + 1}</span>
    ${images ? `<div class="trame" data-trame>${imageHTML(a.image, { alt: '', sizes: '150px', largeur: 480 })}${a.ia ? '<span class="mention-ia">Illustration IA</span>' : ''}</div>` : ''}
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
let audioCourant = null;
export function podcasts(box) {
  box.innerHTML = PODCASTS.map(p => `<div class="episode" data-episode="${p.id}">
    <button class="episode__jouer" type="button" aria-pressed="false" aria-label="Écouter ${echap(p.titre)}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg></button>
    <div><span class="episode__titre">${echap(p.titre)}</span><canvas width="600" height="68" aria-hidden="true"></canvas></div>
    <span class="episode__duree">${p.duree}</span>
    <p class="episode__msg" hidden></p>
  </div>`).join('');

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
      if (audioCourant && audioCourant !== audio) audioCourant.pause();
      if (!audio) {
        audio = new Audio(p.audio);
        audio.addEventListener('timeupdate', () => { avance = audio.duration ? audio.currentTime / audio.duration : 0; dessiner(); });
        audio.addEventListener('ended', () => { btn.setAttribute('aria-pressed', 'false'); avance = 0; dessiner(); });
        audio.addEventListener('pause', () => btn.setAttribute('aria-pressed', 'false'));
      }
      if (!audio.paused) { audio.pause(); return; }
      audio.play().then(() => { audioCourant = audio; btn.setAttribute('aria-pressed', 'true'); msg.hidden = true; })
        .catch(() => { btn.setAttribute('aria-pressed', 'false'); msg.hidden = false; msg.textContent = `Extrait audio à fournir : déposez le fichier ${p.audio} dans le site.`; });
    });
  });
}

/* ---------- Agenda ---------- */
export function etatEvenement(ev, maintenant = new Date()) {
  const fin = new Date(ev.fin + 'T23:59:59'), debut = new Date(ev.debut + 'T00:00:00');
  if (fin < maintenant) return { id: 'passe', t: 'Terminé', c: 'tampon--passe' };
  if (debut <= maintenant) return { id: 'cours', t: 'En cours', c: '' };
  return { id: 'venir', t: 'À venir', c: 'tampon--bleu' };
}
export function mentionEvenement(ev) {
  return ev.ia ? '<span class="mention-ia">Illustration IA</span>' : (ev.credit ? `<span class="mention-credit">${echap(ev.credit)}</span>` : '');
}

/* Aiguille de la jauge carburants */
export function jauge(racine = document) {
  const aig = $('[data-aiguille]', racine);
  if (aig && anime()) g.fromTo(aig, { rotate: -70 }, { rotate: 48, duration: 1.6, ease: 'elastic.out(1, .4)', scrollTrigger: { trigger: aig, start: 'top 90%', once: true } });
}
