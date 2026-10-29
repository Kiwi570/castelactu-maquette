// Castel Actu — Agenda et infos pratiques
import { demarrer, anime, imageHTML, echap, trames, tampons, ancreInitiale } from './app.js?v=4';
import { AGENDA } from './data.js?v=4';
import { $, $$, etatEvenement, mentionEvenement, jauge } from './sections.js?v=4';

const g = window.gsap;
const ST = window.ScrollTrigger;

const fmt = (d, o) => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...o }).format(d);
// Le bloc date : « 11–14 / septembre 2026 », ou « sept.–juin / 2025-2026 » pour une saison
function blocDate(ev) {
  const d1 = new Date(ev.debut + 'T12:00:00'), d2 = new Date(ev.fin + 'T12:00:00');
  const memeMois = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  if (memeMois) return { grand: d1.getDate() === d2.getDate() ? `${d1.getDate()}` : `${d1.getDate()}–${d2.getDate()}`, petit: fmt(d1, { month: 'long', year: 'numeric' }) };
  const y1 = d1.getFullYear(), y2 = d2.getFullYear();
  return { grand: `${fmt(d1, { month: 'short' })}–${fmt(d2, { month: 'short' })}`, petit: y1 === y2 ? `${y1}` : `${y1}-${y2}` };
}

function evenements() {
  const box = $('[data-agenda]');
  const liste = AGENDA.map(ev => ({ ev, etat: etatEvenement(ev) }))
    // à venir d'abord (le plus proche en premier), puis les rendez-vous passés (le plus récent en premier)
    .sort((a, b) => (a.etat.id === 'passe') - (b.etat.id === 'passe') || (a.etat.id === 'passe' ? b.ev.fin.localeCompare(a.ev.fin) : a.ev.debut.localeCompare(b.ev.debut)));
  const avenir = liste.filter(x => x.etat.id !== 'passe').length;
  $('[data-a-venir]').innerHTML = avenir
    ? ''
    : `<div class="bloc-a-completer"><strong>Aucun rendez-vous à venir n’est encore annoncé.</strong><span>Prochaine Foire de Béré, saison 2026-2027 du Théâtre de Verre, fêtes des communes&nbsp;: dates à compléter par la rédaction.</span></div>`;
  box.innerHTML = liste.map(({ ev, etat }) => {
    const d = blocDate(ev);
    return `<article class="rdv${etat.id === 'passe' ? ' rdv--passe' : ''}">
      <div class="rdv__date"><span class="rdv__jours${d.grand.length > 6 ? ' rdv__jours--long' : ''}">${echap(d.grand)}</span><span class="rdv__mois">${echap(d.petit)}</span><span class="tampon ${etat.c}" data-tampon>${etat.t}</span></div>
      <div class="trame rdv__image" data-trame>${imageHTML(ev.image, { alt: ev.titre, sizes: '(min-width: 900px) 34vw, 100vw' })}${mentionEvenement(ev)}</div>
      <div class="rdv__corps">
        <p class="rdv__lieu">${echap(ev.lieu)}</p>
        <h3>${echap(ev.titre)}</h3>
        <p class="rdv__libelle">${echap(ev.libelle)}</p>
        <p class="rdv__note">${echap(ev.note)}</p>
        <a class="lien lien--externe" href="${ev.lien}" target="_blank" rel="noopener">Site officiel</a>
      </div>
    </article>`;
  }).join('');
  trames(box); tampons(box);
  if (anime()) $$('.rdv', box).forEach(r => g.from(r, { y: 50, opacity: 0, duration: .9, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: r, start: 'top 90%', once: true } }));
}

if (window.scrollY && location.hash) window.scrollTo(0, 0);
evenements();
jauge();
demarrer();
ST?.refresh();
ancreInitiale();
document.fonts?.ready.then(() => ST?.refresh());
