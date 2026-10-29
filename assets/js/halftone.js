// Trame d'impression WebGL (OGL) : la photo est imprimée en points d'encre bleue,
// puis se résout en couleur ; au survol, un compte-fils d'imprimeur grossit l'image et sa trame.
import { Renderer, Program, Mesh, Triangle, Texture } from '../vendor/ogl.min.mjs';

const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uProgress;
uniform float uCell;
uniform vec2 uMouse;
uniform float uHover;
uniform float uRayon;
uniform float uContain;
uniform vec3 uFond;
varying vec2 vUv;

const vec3 PAPIER = vec3(0.906, 0.894, 0.859);
const vec3 ENCRE = vec3(0.078, 0.165, 0.420);
const float ZOOM = 1.9;

// Cadrage « cover » ou « contain » de la photo dans le bloc
vec2 cadre(vec2 uv) {
  float rc = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rc > ri ? vec2(1.0, ri / rc) : vec2(rc / ri, 1.0);
  if (uContain > 0.5) s = rc > ri ? vec2(rc / ri, 1.0) : vec2(1.0, ri / rc);
  return (uv - 0.5) * s + 0.5;
}
vec3 lire(vec2 uv) {
  vec2 q = cadre(uv);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return uFond;
  return texture2D(uTex, q).rgb;
}

void main() {
  vec2 px = vUv * uRes;
  float dm = distance(px, uMouse);
  // Compte-fils : dans la loupe, l'image est agrandie et la trame réapparaît
  float dans = uHover * (1.0 - smoothstep(uRayon - 2.0, uRayon, dm));
  vec2 pz = mix(px, uMouse + (px - uMouse) / ZOOM, dans);
  float r = uProgress * (1.0 - dans);
  vec3 couleur = lire(pz / uRes);
  // Rien à tramer : on sort tout de suite.
  if (r >= 0.995) { gl_FragColor = vec4(couleur, 1.0); return; }

  // Une seule cellule, celle du pixel, sur une grille tournée à 45°.
  float cellPx = uCell * mix(1.0, ZOOM, dans);
  float c = 0.70710678;
  vec2 p = mat2(c, -c, c, c) * px;
  vec2 cellule = (floor(p / cellPx) + 0.5) * cellPx;
  vec2 centre = mat2(c, c, -c, c) * cellule;
  vec2 cz = mix(centre, uMouse + (centre - uMouse) / ZOOM, dans);
  vec3 echant = lire(clamp(cz / uRes, 0.0, 1.0));
  float lum = dot(echant, vec3(0.299, 0.587, 0.114));
  float rayon = sqrt(max(1.0 - lum, 0.0)) * 0.64;
  float d = length(p - cellule) / cellPx;
  float aa = 1.25 / cellPx;
  float encre = 1.0 - smoothstep(rayon - aa, rayon + aa, d);
  vec3 trame = mix(PAPIER, ENCRE, encre);
  vec3 sortie = mix(trame, couleur, smoothstep(0.05, 1.0, r));
  // Bord de la loupe
  float anneau = uHover * smoothstep(uRayon - 7.0, uRayon - 4.5, dm) * (1.0 - smoothstep(uRayon - 2.5, uRayon - 0.5, dm));
  gl_FragColor = vec4(mix(sortie, vec3(0.055, 0.09, 0.2), anneau * 0.92), 1.0);
}`;

function hexVersRvb(h) {
  const v = h.replace('#', '');
  return [0, 2, 4].map(i => parseInt(v.slice(i, i + 2), 16) / 255);
}

export function monter(el, { progression = 0, contain = false, fond = null } = {}) {
  const img = el.querySelector('img');
  if (!img) return null;
  contain = contain || el.dataset.cadrage === 'contain';
  fond = fond || el.dataset.fond || null;
  const mobile = window.matchMedia('(max-width: 899px)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.25);
  const test = document.createElement('canvas');
  if (!(test.getContext('webgl2') || test.getContext('webgl'))) return null;
  let renderer;
  try {
    renderer = new Renderer({ dpr, alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  } catch (e) { return null; }
  const gl = renderer.gl;
  if (!gl) return null;
  gl.clearColor(0.906, 0.894, 0.859, 1);

  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
  const uniforms = {
    uTex: { value: texture }, uRes: { value: [1, 1] }, uImg: { value: [1, 1] },
    uProgress: { value: progression }, uCell: { value: 7 }, uMouse: { value: [-9999, -9999] }, uHover: { value: 0 }, uRayon: { value: 160 },
    uContain: { value: contain ? 1 : 0 }, uFond: { value: hexVersRvb(fond || '#0E1733') },
  };
  let program;
  try { program = new Program(gl, { vertex, fragment, uniforms, depthTest: false, depthWrite: false }); } catch (e) { return null; }
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  const canvas = gl.canvas;
  canvas.setAttribute('aria-hidden', 'true');

  let pret = false, visible = false, sale = true, raf = 0;
  let survolCible = 0, progressionCible = progression;

  function taille() {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height);
    uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    uniforms.uCell.value = (mobile ? 5.5 : 6.5) * dpr;
    uniforms.uRayon.value = Math.max(70, Math.min(r.width, r.height) * 0.2) * dpr;
    sale = true; boucle();
  }

  function rendu() {
    raf = 0;
    if (!pret || !visible) return;
    const h = uniforms.uHover.value, p = uniforms.uProgress.value;
    uniforms.uHover.value += (survolCible - h) * 0.14;
    uniforms.uProgress.value += (progressionCible - p) * 0.18;
    const enMouvement = Math.abs(survolCible - uniforms.uHover.value) > 0.002 || Math.abs(progressionCible - uniforms.uProgress.value) > 0.002;
    if (sale || enMouvement) {
      renderer.render({ scene: mesh }); sale = false;
      // première image dessinée : la plaque s'efface sous l'impression
      if (!el.classList.contains('gl')) { void canvas.offsetWidth; el.classList.add('gl'); }
    }
    if (enMouvement) raf = requestAnimationFrame(rendu);
  }
  function boucle() { if (!raf && visible && pret) raf = requestAnimationFrame(rendu); }

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    texture.image = image;
    uniforms.uImg.value = [image.naturalWidth, image.naturalHeight];
    el.appendChild(canvas);
    pret = true; taille();
  };
  image.onerror = () => { el.classList.add('encree'); };
  image.src = img.currentSrc || img.src;

  const ro = new ResizeObserver(taille);
  ro.observe(el);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { sale = true; boucle(); } }, { rootMargin: '80px' });
  io.observe(el);

  function bouger(x, y) {
    const r = el.getBoundingClientRect();
    uniforms.uMouse.value = [(x - r.left) * renderer.dpr, (r.height - (y - r.top)) * renderer.dpr];
    sale = true; boucle();
  }
  // compte-fils à la souris seulement : au doigt, il suivrait le défilement de la page
  el.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; survolCible = 1; bouger(e.clientX, e.clientY); });
  el.addEventListener('pointerleave', () => { survolCible = 0; boucle(); });

  return {
    el,
    progression(v) { progressionCible = Math.max(0, Math.min(1, v)); boucle(); },
    detruire() { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); canvas.remove(); el.classList.remove('gl'); renderer.gl.getExtension('WEBGL_lose_context')?.loseContext(); },
  };
}
