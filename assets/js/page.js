// Castel Actu — pages simples (404)
import { demarrer, anime } from './app.js?v=1';

demarrer();
const g = window.gsap;
const plaque = document.querySelector('.titre-journal__plaque');
if (plaque && anime()) {
  g.fromTo(plaque, { '--rx': '18px', '--ry': '-10px' }, { '--rx': '0px', '--ry': '0px', duration: 1.4, ease: 'power4.out' });
  g.from('.page-404 p, .page-404 .une__liens', { y: 20, opacity: 0, stagger: .1, duration: .6, delay: .2, ease: 'power3.out' });
}
