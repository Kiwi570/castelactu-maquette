// Castel Actu — Le média : qui sommes-nous, l'audience, le podcast et la vidéo, soutenir et contact
import { demarrer, anime, odometre, echap, ancreInitiale } from './app.js?v=4';
import { AUDIENCE } from './data.js?v=4';
import { $, $$, podcasts } from './sections.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;

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

if (window.scrollY && location.hash) window.scrollTo(0, 0);
audience();
podcasts($('[data-podcasts]'));
demarrer();
ST?.refresh();
ancreInitiale();
document.fonts?.ready.then(() => ST?.refresh());
