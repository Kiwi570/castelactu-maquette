/* Image de partage 1200×630 de chaque page : bandeau d'encre avec le logo, l'accroche en Fraunces,
   la date de fondation, et la photo (ou l'illustration) de la page. outils/images-partage.mjs les photographie. */
import { html, brut } from '../../outils/gabarit.mjs';

export function page(c) {
  const cle = c.page.cle;
  const image = c.page.imagePartage || c.site.imagePartage;
  const ia = image.startsWith('grok/');
  return html`<!doctype html>
<html lang="${c.l}"><head><meta charset="utf-8">
<link rel="stylesheet" href="/assets/css/socle.css"><link rel="stylesheet" href="/assets/css/site.css">
<style>${brut(`:root{--fond:${c.site.couleurs.fond};--texte:${c.site.couleurs.texte}}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#141414;color:#f3eee4}
.carte{display:grid;grid-template-columns:560px 640px;width:1200px;height:630px}
.carte-texte{display:flex;flex-direction:column;justify-content:space-between;padding:52px 56px;background:#141414;border-right:8px solid #c8201a}
.carte-texte img{width:190px;height:auto}
.carte-titre{font-family:'Fraunces',Georgia,serif;font-weight:750;font-size:60px;line-height:1.02;letter-spacing:-.025em;margin:0;text-wrap:balance}
.carte-bas{display:flex;justify-content:space-between;font-family:'Plex Mono',monospace;font-size:19px;letter-spacing:.08em;text-transform:uppercase;color:#b9b2a6;margin:0}
.carte-image{position:relative;background:#000 center/cover no-repeat}
.carte-ia{position:absolute;right:16px;bottom:16px;padding:6px 14px;border-radius:999px;background:rgba(20,20,20,.74);color:#fff;font:600 18px/1.3 'Inter Tight',sans-serif}`)}</style>
</head><body>
<div class="carte">
  <div class="carte-texte">
    <img src="/assets/images/logo-castelactu-480.webp" alt="">
    <p class="carte-titre">${c.t(`pages.${cle}.accroche`)}</p>
    <p class="carte-bas"><span>${c.t('partage.zone')}</span><span>${c.t('partage.depuis')}</span></p>
  </div>
  <div class="carte-image" style="background-image:url('/assets/images/${image}')">${ia ? html`<span class="carte-ia">${c.t('commun.mentionIa')}</span>` : ''}</div>
</div>
</body></html>`;
}
