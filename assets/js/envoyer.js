// Castel Actu — formulaire « Envoyer une info » (simulé : rien n'est envoyé)
import { demarrer, anime, defilerVers, echap, dateDuJour, trames } from './app.js?v=1';
import { RUBRIQUES, COMMUNES } from './data.js?v=1';

const g = window.gsap;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const form = $('[data-formulaire]');
const etapes = $$('[data-etape]', form);
const indic = $$('[data-etapes] li');
const resultat = $('[data-resultat]');
let courante = 0;
let fichiers = [];

// Rubriques et communes
$('[data-choix-rubrique]').innerHTML = RUBRIQUES.filter(r => r.id !== 'meteo').map((r, i) =>
  `<label><input type="radio" name="rubrique" id="rub-${r.id}" value="${echap(r.nom)}"${i === 0 ? '' : ''}>${echap(r.nom)}</label>`).join('');
$('[data-choix-commune]').innerHTML = '<option value="">Choisir une commune</option>' +
  COMMUNES.map(c => `<option value="${echap(c.nom)}">${echap(c.nom)}</option>`).join('') + '<option value="Autre commune">Autre commune</option>';

// Compteur de caractères
const zone = $('#envoi-texte'), cpt = $('[data-compteur-car]');
zone.addEventListener('input', () => { cpt.textContent = `${zone.value.length} / 2000`; });

// Photos et vidéos : aperçus locaux uniquement
const entree = $('#envoi-fichiers'), depot = $('[data-depot]'), apercus = $('[data-apercus]');
function ajouter(liste) {
  for (const f of liste) {
    if (!/^(image|video)\//.test(f.type)) continue;
    if (fichiers.length >= 10) break;
    fichiers.push(f);
  }
  apercus.innerHTML = fichiers.map((f, i) => {
    const url = URL.createObjectURL(f);
    return `<figure>${f.type.startsWith('video') ? `<video src="${url}" muted playsinline></video>` : `<img src="${url}" alt="">`}<figcaption>${echap(f.name)}</figcaption></figure>`;
  }).join('');
  if (anime()) g.from($$('figure', apercus).slice(-liste.length), { scale: .6, opacity: 0, duration: .45, stagger: .05, ease: 'back.out(2)' });
}
entree.addEventListener('change', () => ajouter([...entree.files]));
['dragenter', 'dragover'].forEach(t => depot.addEventListener(t, e => { e.preventDefault(); depot.classList.add('survol'); }));
['dragleave', 'drop'].forEach(t => depot.addEventListener(t, e => { e.preventDefault(); depot.classList.remove('survol'); }));
depot.addEventListener('drop', e => ajouter([...e.dataTransfer.files]));

// Validation par étape
function erreur(et, texte, champ) {
  const p = $('[data-erreur]', et);
  if (p) { p.hidden = !texte; p.textContent = texte || ''; }
  $$('[aria-invalid]', et).forEach(c => c.removeAttribute('aria-invalid'));
  if (champ) { champ.setAttribute('aria-invalid', 'true'); champ.focus(); }
  return !texte;
}
function valider(i) {
  const et = etapes[i];
  if (i === 1) {
    if (!form.rubrique.value) return erreur(et, 'Choisissez la rubrique qui correspond le mieux à votre info.', $('input[name="rubrique"]', et));
    if (!form.commune.value) return erreur(et, 'Indiquez la commune concernée.', form.commune);
  }
  if (i === 2) {
    if (form.titre.value.trim().length < 5) return erreur(et, 'Donnez un titre d’au moins 5 caractères.', form.titre);
    if (form.texte.value.trim().length < 20) return erreur(et, 'Décrivez votre info en quelques phrases (20 caractères au moins).', form.texte);
  }
  if (i === 3 && fichiers.length && !form.droits.checked) return erreur(et, 'Cochez la case sur les droits des images pour continuer, ou retirez les fichiers.', form.droits);
  if (i === 4) {
    if (!form.prenom.value.trim()) return erreur(et, 'Indiquez votre prénom.', form.prenom);
    if (!form.email.value || !form.email.checkValidity()) return erreur(et, 'Saisissez une adresse e-mail complète, par exemple prenom@exemple.fr.', form.email);
    if (!form.rgpd.checked) return erreur(et, 'Cochez la case d’accord pour que la rédaction puisse traiter votre envoi.', form.rgpd);
  }
  return erreur(et, '');
}

function aller(n) {
  const avant = etapes[courante], apres = etapes[n];
  const sens = n > courante ? 1 : -1;
  courante = n;
  indic.forEach((li, i) => { li.classList.toggle('fait', i < n); li.classList.toggle('courant', i === n); if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
  const montrer = () => {
    avant.hidden = true; apres.hidden = false;
    if (anime()) g.fromTo(apres, { xPercent: 8 * sens, rotate: 1.2 * sens, opacity: 0 }, { xPercent: 0, rotate: 0, opacity: 1, duration: .5, ease: 'power3.out' });
    apres.querySelector('input, select, textarea, button')?.focus({ preventScroll: true });
    defilerVers('[data-etapes]');
  };
  if (anime()) g.to(avant, { xPercent: -10 * sens, rotate: -2 * sens, opacity: 0, duration: .3, ease: 'power2.in', onComplete: montrer });
  else montrer();
}

form.addEventListener('click', e => {
  if (e.target.closest('[data-suivant]')) { if (valider(courante)) aller(courante + 1); }
  if (e.target.closest('[data-precedent]')) aller(courante - 1);
});
form.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && courante < etapes.length - 1) {
    e.preventDefault(); if (valider(courante)) aller(courante + 1);
  }
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!valider(courante)) return;
  const d = Object.fromEntries(new FormData(form).entries());
  const photo = fichiers.find(f => f.type.startsWith('image'));
  const extrait = d.texte.trim().length > 220 ? d.texte.trim().slice(0, 220) + '…' : d.texte.trim();
  $('[data-mini-une]').innerHTML = `
    <div class="mini-une__titre-journal">Castel Actu</div>
    <div class="mini-une__date">${echap(dateDuJour())}</div>
    <div class="meta"><span class="rub">${echap(d.rubrique)}</span><span class="commune">${echap(d.commune)}</span></div>
    <h3>${echap(d.titre)}</h3>
    ${photo ? `<div class="trame" data-trame style="aspect-ratio:16/9"><img src="${URL.createObjectURL(photo)}" alt="Votre photo"></div>` : ''}
    <p>${echap(extrait)}</p>
    <span class="tampon" data-tampon-final>Envoi simulé</span>`;
  const lignes = [
    ['Vous êtes', d.profil], ['Rubrique', d.rubrique], ['Commune', d.commune], ['Quand', d.quand ? new Date(d.quand).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' }) : 'Non précisé'],
    ['Lieu', d.lieu || 'Non précisé'], ['Fichiers', fichiers.length ? `${fichiers.length} fichier${fichiers.length > 1 ? 's' : ''}` : 'Aucun'],
    ['Contact', `${d.prenom}${d.nom ? ' ' + d.nom : ''}, ${d.email}${d.tel ? ', ' + d.tel : ''}`], ['Publication', d.anonyme ? 'Sans citer votre nom' : 'Nom citable'],
  ];
  $('[data-recap]').innerHTML = lignes.map(([k, v]) => `<div><dt>${echap(k)}</dt><dd>${echap(v)}</dd></div>`).join('');
  form.hidden = true; $('[data-etapes]').hidden = true; resultat.hidden = false;
  trames(resultat);
  resultat.focus({ preventScroll: true });
  defilerVers(resultat);
  if (anime()) {
    const tl = g.timeline();
    tl.from('.mini-une', { rotateX: -80, transformOrigin: '50% 0%', transformPerspective: 1000, opacity: 0, duration: 1, ease: 'power4.out' })
      .from('.mini-une > *:not(.tampon)', { y: 16, opacity: 0, stagger: .06, duration: .45 }, .3)
      .from('[data-tampon-final]', { scale: 2.6, rotate: -20, opacity: 0, duration: .45, ease: 'back.out(2.4)' }, .9)
      .from('.recap > div', { x: -12, opacity: 0, stagger: .04, duration: .35 }, .6);
  }
});

$('[data-recommencer]').addEventListener('click', () => {
  form.reset(); fichiers = []; apercus.innerHTML = ''; cpt.textContent = '0 / 2000';
  resultat.hidden = true; form.hidden = false; $('[data-etapes]').hidden = false;
  etapes.forEach((et, i) => { et.hidden = i !== 0; g?.set(et, { clearProps: 'all' }); });
  courante = 0; indic.forEach((li, i) => { li.classList.toggle('fait', false); li.classList.toggle('courant', i === 0); });
  defilerVers('[data-etapes]');
});

demarrer();
