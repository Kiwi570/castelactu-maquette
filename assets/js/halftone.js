// Trame d'impression WebGL (OGL) : la photo est imprimée en points d'encre bleue,
// puis se résout en couleur au défilement ; une loupe de couleur suit le pointeur.
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
varying vec2 vUv;

const vec3 PAPIER = vec3(0.906, 0.894, 0.859);
const vec3 ENCRE = vec3(0.078, 0.165, 0.420);

vec2 cover(vec2 uv) {
  float rc = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rc > ri ? vec2(1.0, ri / rc) : vec2(rc / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 px = vUv * uRes;
  float loupe = uHover * (1.0 - smoothstep(uRayon * 0.45, uRayon, distance(px, uMouse)));
  float r = clamp(uProgress + loupe, 0.0, 1.0);
  vec3 couleur = texture2D(uTex, cover(vUv)).rgb;
  // Rien à tramer : on sort tout de suite.
  if (r >= 0.995) { gl_FragColor = vec4(couleur, 1.0); return; }

  // Une seule cellule, celle du pixel, sur une grille tournée à 45°.
  float c = 0.70710678;
  vec2 p = mat2(c, -c, c, c) * px;
  vec2 cellule = (floor(p / uCell) + 0.5) * uCell;
  vec2 centre = mat2(c, c, -c, c) * cellule;
  vec3 echant = texture2D(uTex, cover(clamp(centre / uRes, 0.0, 1.0))).rgb;
  float lum = dot(echant, vec3(0.299, 0.587, 0.114));
  float rayon = sqrt(max(1.0 - lum, 0.0)) * 0.64;
  float d = length(p - cellule) / uCell;
  float aa = 1.25 / uCell;
  float encre = 1.0 - smoothstep(rayon - aa, rayon + aa, d);
  vec3 trame = mix(PAPIER, ENCRE, encre);
  gl_FragColor = vec4(mix(trame, couleur, smoothstep(0.05, 1.0, r)), 1.0);
}`;

export function monter(el, { progression = 0 } = {}) {
  const img = el.querySelector('img');
  if (!img) return null;
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
    uniforms.uRayon.value = Math.max(110, Math.min(r.width, r.height) * 0.32) * dpr;
    sale = true; boucle();
  }

  function rendu() {
    raf = 0;
    if (!pret || !visible) return;
    const h = uniforms.uHover.value, p = uniforms.uProgress.value;
    uniforms.uHover.value += (survolCible - h) * 0.14;
    uniforms.uProgress.value += (progressionCible - p) * 0.18;
    const enMouvement = Math.abs(survolCible - uniforms.uHover.value) > 0.002 || Math.abs(progressionCible - uniforms.uProgress.value) > 0.002;
    if (sale || enMouvement) { renderer.render({ scene: mesh }); sale = false; }
    if (enMouvement) raf = requestAnimationFrame(rendu);
  }
  function boucle() { if (!raf && visible && pret) raf = requestAnimationFrame(rendu); }

  const image = new Image();
  image.decoding = 'async';
  image.onload = () => {
    texture.image = image;
    uniforms.uImg.value = [image.naturalWidth, image.naturalHeight];
    el.appendChild(canvas);
    el.classList.add('gl');
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
  el.addEventListener('pointermove', e => { survolCible = 1; bouger(e.clientX, e.clientY); });
  el.addEventListener('pointerleave', () => { survolCible = 0; boucle(); });
  el.addEventListener('touchstart', e => { survolCible = 1; const t = e.touches[0]; bouger(t.clientX, t.clientY); }, { passive: true });
  el.addEventListener('touchend', () => { survolCible = 0; boucle(); }, { passive: true });

  return {
    el,
    progression(v) { progressionCible = Math.max(0, Math.min(1, v)); boucle(); },
    detruire() { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); canvas.remove(); el.classList.remove('gl'); },
  };
}
