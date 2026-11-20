/* ============================================================
   SISTEMA SOLAR 3D — Simulación orbital en HTML5 + WebGL (Three.js)
   Órbitas calculadas con elementos orbitales J2000 (Standish/JPL)
   y solución numérica de la ecuación de Kepler.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';

/* ---------------- Datos de los cuerpos ---------------- */

const PLANETS = [
  { key:'mercurio', name:'Mercurio', rKm:2439.7, day:1407.6, tilt:0.03, color:'#a8a29b', mass:1.66e-7,
    el:[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
    rate:[0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    tex:{ type:'rocky', c1:'#8c8177', c2:'#5d554e', c3:'#b3a89b', px:10, py:10, craters:46 },
    curio:'Sin atmósfera y con la órbita más excéntrica: su perihelio lo deja a 46 millones de km del Sol y su afelio a 70.' },

  { key:'venus', name:'Venus', rKm:6051.8, day:-5832.5, tilt:177.4, color:'#e6c07a', mass:2.447e-6, atmo:{ f:1.045, c:'#ffe3ad', i:0.95 },
    el:[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
    rate:[0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
    tex:{ type:'cloudy', c1:'#e8cf95', c2:'#c9a465', c3:'#f3e6bd', px:7, py:6 },
    curio:'Gira al revés y muy despacio (243 días de día solar). Su presión superficial es 92 veces la de la Tierra.' },

  { key:'tierra', name:'Tierra', rKm:6371.0, day:23.93447, tilt:23.44, color:'#4b8fd6', mass:3.003e-6, atmo:{ f:1.038, c:'#74a9ff', i:1.25 },
    el:[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
    rate:[0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    tex:{ type:'earth', file:'./textures/tierra-blue-marble.jpg', c1:'#1c5f9e', c2:'#3f8f42', c3:'#cbae72', px:9, py:6 },
    curio:'El único lugar conocido con agua líquida en la superficie. Su perihelio es en enero: el Sol parece más grande que en julio.' },

  { key:'marte', name:'Marte', rKm:3389.5, day:24.62, tilt:25.19, color:'#c1502e', mass:3.227e-7, atmo:{ f:1.028, c:'#ffb08a', i:0.5 },
    el:[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate:[0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    tex:{ type:'rocky', c1:'#b0522c', c2:'#6e3018', c3:'#d98d5f', px:9, py:9, craters:32 },
    curio:'Tuvo ríos, lagos y quizá un océano. Su día dura 24 h 37 min, casi como el nuestro.' },

  { key:'jupiter', name:'Júpiter', rKm:69911, rEq:71492, day:9.93, tilt:3.13, color:'#d6a86b', mass:9.545e-4,
    el:[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate:[-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    tex:{ type:'gas', c1:'#d9b183', c2:'#8f5f3c', c3:'#f0e0c4', px:8, py:14, bands:13,
          spot:{ lat:-0.36, lon:0.52, rx:0.075, ry:0.030, color:'#b8563a', rot:-0.12 } },
    curio:'Es 2,5 veces más masivo que todos los demás planetas juntos. Su Gran Mancha Roja es una tormenta más grande que la Tierra.' },

  { key:'saturno', name:'Saturno', rKm:58232, rEq:60268, day:10.66, tilt:26.73, color:'#e3d1a1', mass:2.858e-4,
    el:[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate:[-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
    tex:{ type:'gas', c1:'#e6d5a6', c2:'#c0a273', c3:'#f4ecd2', px:7, py:12, bands:9 },
    rings:[ {i:1.32,o:1.52,c:'#8d7b5e',o2:0.75}, {i:1.52,o:1.78,c:'#d9c9a3',o2:0.9},
            {i:1.78,o:1.92,c:'#6f6250',o2:0.55}, {i:1.92,o:2.25,c:'#e6dcc2',o2:0.85},
            {i:2.25,o:2.45,c:'#b8a884',o2:0.6} ],
    curio:'Sus anillos son hielo y roca, y miden 280.000 km de ancho pero solo unos 10 m de espesor. Su densidad es menor que la del agua.' },

  { key:'urano', name:'Urano', rKm:25362, rEq:25559, day:-17.24, tilt:97.77, color:'#8fd6dd', mass:4.366e-5, atmo:{ f:1.032, c:'#a6f2f7', i:0.75 },
    el:[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
    rate:[-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
    tex:{ type:'gas', c1:'#9fe0e6', c2:'#7cc6cf', c3:'#c9f0f3', px:6, py:8, bands:5 },
    rings:[ {i:1.6,o:1.72,c:'#5d7f88',o2:0.35}, {i:1.85,o:1.92,c:'#5d7f88',o2:0.3} ],
    curio:'Rueda tumbado de lado: su eje está inclinado 98°. Sus polos pasan 42 años bajo el Sol y otros 42 en la oscuridad.' },

  { key:'neptuno', name:'Neptuno', rKm:24622, rEq:24764, day:16.11, tilt:28.32, color:'#3f66d8', mass:5.151e-5, atmo:{ f:1.032, c:'#8fb0ff', i:0.85 },
    el:[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
    rate:[0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
    tex:{ type:'gas', c1:'#3d63d6', c2:'#26439c', c3:'#7fa0f2', px:6, py:8, bands:6 },
    curio:'Se descubrió con matemáticas antes que con un telescopio: Neptuno se predijo por las perturbaciones en la órbita de Urano.' },

  { key:'pluton', name:'Plutón', rKm:1188.3, day:-153.3, tilt:122.5, color:'#c8b49a', mass:6.55e-9,
    el:[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
    rate:[-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482],
    tex:{ type:'rocky', c1:'#c9b8a1', c2:'#7d6b58', c3:'#e8ddcc', px:8, py:8, craters:22 },
    curio:'Su órbita está inclinada 17° y es tan excéntrica que durante 20 años de cada 248 está más cerca del Sol que Neptuno.' }
];

const SUN = {
  name:'Sol', rKm:696000, color:'#ffcf6b',
  mass: 1,                       // masa relativa al Sol (1 = 1,9885·10³⁰ kg)
  day: 25.38,                    // periodo de rotación ecuatorial (días)
  tilt: 7.25,                    // inclinación del eje solar respecto a la eclíptica
  curio:'Contiene el 99,86 % de toda la masa del sistema solar. En su núcleo convierte 600 millones de toneladas de hidrógeno en helio cada segundo.'
};

/* Luna: se modela con las series abreviadas de Meeus (longitud y latitud
   eclípticas reales), no con elementos keplerianos simplificados: así la
   fase lunar, la distancia y la posición de la Luna son correctos. */
const MOON = {
  key:'luna', name:'Luna', rKm:1737.4, day:655.7, tilt:6.7, color:'#b9b9b4',
  a:384400, e:0.0549, inc:5.145,
  mass: 3.694e-8,               // 1/81,3 de la masa terrestre
  tex:{ type:'rocky', c1:'#b4b2ac', c2:'#7c7a75', c3:'#d3d1cb', px:8, py:8, craters:40 },
  curio:'Siempre nos muestra la misma cara: su rotación está bloqueada por la marea de la Tierra. Su período sidéreo es de 27,3 días, pero el mes sinódico (de fase a fase) dura 29,53.' };

/* ---------------- Constantes y utilidades ---------------- */

const DEG = Math.PI / 180;
const J2000 = 2451545.0;
const G_CONST = 6.67430e-11;          // constante de gravitación universal (m³·kg⁻¹·s⁻²)
const M_SUN  = 1.98847e30;            // masa solar (kg)
const AU_KM  = 149597870.7;
const DIST_SCALE = 11.0, DIST_EXP = 0.45;   // compresión radial (UA -> unidades de escena)
const R_SCALE = 0.30, R_EXP = 0.45;         // escala de radios planetarios
const TRAIL_SEGMENTS = 180;
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const qPrec = new THREE.Quaternion();
const qTilt = new THREE.Quaternion();
const qFocus = new THREE.Quaternion();
const moonBasisX = new THREE.Vector3();
const moonBasisY = new THREE.Vector3();
const moonBasisZ = new THREE.Vector3();
const moonMatrix = new THREE.Matrix4();
const moonQuat = new THREE.Quaternion();
const lunarData = { earthLon:0, moonLon:0, moonElong:0 };

const $ = id => document.getElementById(id);

function jdFromDate(d){ return d.getTime() / 86400000 + 2440587.5; }
function dateFromJD(jd){ return new Date((jd - 2440587.5) * 86400000); }
function centuriesSinceJ2000(jd){ return (jd - J2000) / 36525; }

/* ---------------- Magnitudes físicas derivadas ----------------
   Se calculan a partir de la masa (relativa al Sol) y el radio, de modo que
   los números coinciden con los valores reales de cada cuerpo. */

const num = (v, d = 2) => v.toFixed(d).replace('.', ',');

function gravityOf(massRel, rKm){
  const M = massRel * M_SUN, r = rKm * 1000;
  return G_CONST * M / (r * r);                       // m/s²
}
function escapeOf(massRel, rKm){
  const M = massRel * M_SUN, r = rKm * 1000;
  return Math.sqrt(2 * G_CONST * M / r) / 1000;        // km/s
}
/* Radio con el que se evalúa la gravedad: en los gigantes, que están
   achatados, el valor de manual corresponde al radio ecuatorial
   (Júpiter 71.492 km → 24,79 m/s²; Saturno 60.268 km → 10,44 m/s², etc.) */
function gravityRadius(d){ return d.rEq || d.rKm; }
/* Rotación propia: duración del día sidéreo y sentido de giro */
function rotationText(value, tilt, unit){
  const retro = value < 0;
  const h = Math.abs(value);
  let s;
  if (unit === 'd') s = num(h, 2) + ' d';
  else s = h < 48 ? num(h, 2) + ' h' : num(h / 24, 1) + ' d';
  if (retro) s += ' · retrógrada';
  if (tilt !== undefined) s += ' · eje ' + num(tilt, 1) + '°';
  return s;
}

/* ---------------- Efemérides: elementos + Kepler ---------------- */

function elementsAt(b, T){
  const a  = b.el[0] + b.rate[0] * T;
  const e  = b.el[1] + b.rate[1] * T;
  const inc= b.el[2] + b.rate[2] * T;
  const L  = b.el[3] + b.rate[3] * T;
  const peri = b.el[4] + b.rate[4] * T;
  const O  = b.el[5] + b.rate[5] * T;
  const w = peri - O;
  let M = L - peri;
  M = ((M + 180) % 360 + 360) % 360 - 180;   // normalizar a [-180,180]
  return { a, e, inc: inc * DEG, w: w * DEG, O: O * DEG, M: M * DEG, peri: peri % 360 };
}

function solveKepler(M, e){
  let E = M + e * Math.sin(M);
  for (let k = 0; k < 8; k++){
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

/* Posición heliocéntrica en UA (eclíptica J2000) */
function positionOf(b, T){
  const { a, e, inc, w, O, M } = elementsAt(b, T);
  const E = solveKepler(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w);
  const cO = Math.cos(O), sO = Math.sin(O);
  const ci = Math.cos(inc), si = Math.sin(inc);
  const x = (cw * cO - sw * sO * ci) * xv + (-sw * cO - cw * sO * ci) * yv;
  const y = (cw * sO + sw * cO * ci) * xv + (-sw * sO + cw * cO * ci) * yv;
  const z = ( sw * si) * xv + ( cw * si) * yv;
  return { x, y, z, r: Math.hypot(x, y, z), a, e };
}

/* Luna: efemérides reales (series abreviadas de Meeus).
   d = días desde J2000. Devuelve longitud/latitud eclípticas y distancia. */
function moonEcliptic(d){
  const Lp = 218.3164477 + 13.17639648 * d;   // longitud media
  const M  = 134.9633964 + 13.06499295 * d;   // anomalía media
  const F  =  93.2720950 + 13.22935024 * d;   // argumento de latitud
  const D  = 297.8501921 + 12.19074912 * d;   // elongación media
  const Ms = 357.5291092 +  0.98560028 * d;   // anomalía media del Sol
  const lon = Lp
    + 6.288774 * Math.sin(M * DEG)
    + 1.274027 * Math.sin((2 * D - M) * DEG)
    + 0.658314 * Math.sin(2 * D * DEG)
    + 0.213618 * Math.sin(2 * M * DEG)
    - 0.185116 * Math.sin(Ms * DEG)
    - 0.114332 * Math.sin(2 * F * DEG)
    + 0.058793 * Math.sin((2 * D - 2 * M) * DEG)
    + 0.057066 * Math.sin((2 * D - M - Ms) * DEG)
    + 0.053322 * Math.sin((2 * D + M) * DEG)
    + 0.045758 * Math.sin((2 * D - M - 2 * F) * DEG)
    - 0.040923 * Math.sin((M - Ms) * DEG)
    - 0.034720 * Math.sin(D * DEG)
    - 0.030383 * Math.sin((M + Ms) * DEG)
    + 0.015327 * Math.sin((2 * D - 2 * F) * DEG)
    - 0.012528 * Math.sin((M + 2 * F) * DEG);
  const lat = 5.128122 * Math.sin(F * DEG)
    + 0.280602 * Math.sin((M + F) * DEG)
    - 0.277693 * Math.sin((F - M) * DEG)
    - 0.173237 * Math.sin((F - 2 * D) * DEG)
    + 0.055413 * Math.sin((2 * D - M + F) * DEG)
    + 0.046271 * Math.sin((2 * D - M - F) * DEG)
    + 0.032573 * Math.sin((2 * D + F) * DEG)
    + 0.017198 * Math.sin((2 * M + F) * DEG);
  const dist = 385000.56
    - 20905.355 * Math.cos(M * DEG)
    - 3699.111 * Math.cos((2 * D - M) * DEG)
    - 2955.968 * Math.cos(2 * D * DEG)
    - 569.925 * Math.cos(2 * M * DEG)
    + 246.158 * Math.cos((2 * D - 2 * M) * DEG)
    - 152.138 * Math.cos((2 * D - M - Ms) * DEG)
    - 170.733 * Math.cos((2 * D + M) * DEG)
    - 204.586 * Math.cos((2 * D - M - 2 * F) * DEG)
    - 129.620 * Math.cos((D + M) * DEG)
    + 108.743 * Math.cos((D - M) * DEG);
  /* longitud normalizada a [0,360): Lp crece ~13,18°/día y sin reducir
     acabaría mostrando valores de cientos de miles de grados */
  const lonDeg = ((lon % 360) + 360) % 360;
  return { lon: lonDeg * DEG, lat: lat * DEG, dist };
}

/* Posición geocéntrica de la Luna (UA, marco eclíptico) */
function moonOffset(days){
  const m = moonEcliptic(days);
  const r = m.dist / 149597870.7;
  const cl = Math.cos(m.lat);
  return {
    x: r * cl * Math.cos(m.lon),
    y: r * cl * Math.sin(m.lon),
    z: r * Math.sin(m.lat),
    dist: m.dist,
    lon: m.lon,
    lat: m.lat
  };
}

/* Conversión a unidades de escena (compresión radial no lineal) */
const _tmp = new THREE.Vector3();
let scaleExp = DIST_EXP;          // exponente actual de compresión (animable)
function toScene(x, y, z, out){
  const r = Math.hypot(x, y, z);
  if (r < 1e-12){ out.set(0, 0, 0); return out; }
  const s = DIST_SCALE * Math.pow(r, scaleExp) / r;
  out.set(x * s, z * s, -y * s);           // eclíptica -> escena (Y arriba)
  return out;
}
function sceneRadius(km){ return R_SCALE * Math.pow(km / 6371, R_EXP); }

/* ---------------- Texturas procedurales ---------------- */

function makeNoise(period){
  const hash = (ix, iy) => {
    let n = (ix | 0) * 374761393 + (iy | 0) * 668265263;
    n = (n ^ (n >> 13)) | 0;
    n = Math.imul(n, 1274126177);
    n = (n ^ (n >> 16)) >>> 0;
    return n / 4294967296;
  };
  const wrap = (a, p) => ((a % p) + p) % p;
  const smooth = t => t * t * (3 - 2 * t);
  return function fbm(x, y, oct = 4){
    let sum = 0, amp = 0.5, f = 1, tot = 0;
    for (let i = 0; i < oct; i++){
      const X = x * f, Y = y * f;
      const ix = Math.floor(X), iy = Math.floor(Y);
      const fx = smooth(X - ix), fy = smooth(Y - iy);
      const P = Math.max(1, Math.round(period * f));
      const a = hash(wrap(ix, P), iy),      b = hash(wrap(ix + 1, P), iy);
      const c = hash(wrap(ix, P), iy + 1),  d = hash(wrap(ix + 1, P), iy + 1);
      sum += amp * (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy);
      tot += amp; amp *= 0.5; f *= 2;
    }
    return sum / tot;
  };
}

function rgb(hex){
  const h = hex.replace('#','');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function mix(c1, c2, t){ return [c1[0]+(c2[0]-c1[0])*t, c1[1]+(c2[1]-c1[1])*t, c1[2]+(c2[2]-c1[2])*t]; }

function planetTexture(o){
  const W = 1024, H = 512;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;

  const px = o.px || 8, py = o.py || 8;
  const n1 = makeNoise(px), n2 = makeNoise(px * 3), n3 = makeNoise(px * 7);
  const C1 = rgb(o.c1), C2 = rgb(o.c2), C3 = rgb(o.c3 || o.c2);

  for (let j = 0; j < H; j++){
    const v = j / H;
    const lat = (v - 0.5) * Math.PI;
    for (let i = 0; i < W; i++){
      const u = i / W;
      let col;
      if (o.type === 'gas'){
        const turb = n2(u * px * 0.6, v * py * 3.0, 4);
        const band = 0.5 + 0.5 * Math.sin(lat * (o.bands || 8) + (turb - 0.5) * 5.5);
        const fine = n1(u * px, v * py, 4);
        const t = Math.min(1, Math.max(0, band * 0.72 + (fine - 0.5) * 0.45));
        col = mix(C1, C2, t);
        if (fine > 0.74) col = mix(col, C3, (fine - 0.74) / 0.26 * 0.55);
      } else if (o.type === 'earth'){
        const cont = n1(u * px, v * py, 5);
        const detail = n2(u * px * 2, v * py * 2, 4);
        const land = cont * 0.75 + detail * 0.25;
        if (land > 0.545){
          const d2 = (land - 0.545) / 0.455;
          col = mix(C2, C3, Math.max(0, detail - 0.55) * 1.4);
          col = mix(col, C1, 0.15 * (1 - d2));
        } else {
          const depth = (0.545 - land) / 0.545;
          col = mix(C1, [11, 46, 92], Math.min(1, depth * 1.1));
        }
        const ice = Math.abs(lat) > 1.15 ? Math.min(1, (Math.abs(lat) - 1.15) / 0.32) : 0;
        const cloud = n3(u * px * 2.2, v * py * 1.4, 5);
        if (cloud > 0.62) col = mix(col, [246,248,252], (cloud - 0.62) / 0.38 * 0.7);
        col = mix(col, [238,244,250], ice * 0.9);
      } else if (o.type === 'cloudy'){
        const turb = n2(u * px, v * py * 2.4, 5);
        const swirl = n1(u * px * 1.6, v * py * 1.6, 4);
        const t = Math.min(1, Math.max(0, turb * 0.7 + swirl * 0.3));
        col = mix(C1, C2, t);
        if (swirl > 0.7) col = mix(col, C3, (swirl - 0.7) / 0.3 * 0.6);
      } else { // rocky / helado
        const g = n1(u * px, v * py, 5);
        const m = n2(u * px * 2.4, v * py * 2.4, 4);
        const t = Math.min(1, Math.max(0, g * 0.7 + m * 0.3));
        col = mix(C1, C2, t);
        if (m > 0.72) col = mix(col, C3, (m - 0.72) / 0.28 * 0.7);
      }
      const p = (j * W + i) * 4;
      d[p] = col[0]; d[p+1] = col[1]; d[p+2] = col[2]; d[p+3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  /* manchas características (ej. Gran Mancha Roja de Júpiter) */
  if (o.spot){
    const s = o.spot;
    const cx = (s.lon / (Math.PI * 2) + 0.5) * W;
    const cy = (0.5 - s.lat / Math.PI) * H;
    const rx = s.rx * W, ry = s.ry * H;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
    const c = s.color;
    g.addColorStop(0, c);
    g.addColorStop(.55, c);
    g.addColorStop(.85, 'rgba(190,120,80,.55)');
    g.addColorStop(1, 'rgba(190,120,80,0)');
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(s.rot || 0);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = g;
    ctx.translate(-cx, -cy);
    ctx.beginPath(); ctx.arc(cx, cy, rx, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* cráteres para cuerpos rocosos */
  if (o.craters){
    let seed = 1337;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let i = 0; i < o.craters; i++){
      const cx = rnd() * W, cy = rnd() * H, r = 2 + rnd() * 11;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(0,0,0,.30)');
      g.addColorStop(.72, 'rgba(0,0,0,.16)');
      g.addColorStop(.85, 'rgba(255,255,255,.14)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/* Textura de resplandor radial reutilizable */
function loadTexture(file){
  const t = new THREE.TextureLoader().load(file);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}
let _glowTex = null;
function glowTexture(){
  if (_glowTex) return _glowTex;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.18,'rgba(255,255,255,.62)');
  g.addColorStop(0.42,'rgba(255,255,255,.18)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  _glowTex = new THREE.CanvasTexture(cv);
  _glowTex.colorSpace = THREE.SRGBColorSpace;
  return _glowTex;
}

/* ---------------- Atmósferas ----------------
   Esfera ligeramente mayor que el planeta con dispersión tipo Rayleigh:
   el borde se ilumina y la cara nocturna queda en penumbra. */

const atmosphereMats = [];

function makeAtmosphere(radius, color, intensity){
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor:    { value: new THREE.Color(color) },
      uSunDir:   { value: new THREE.Vector3(1, 0, 0) },
      uIntensity:{ value: intensity }
    },
    vertexShader: `
      varying vec3 vNormalW;
      varying vec3 vWorld;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uSunDir;
      uniform float uIntensity;
      varying vec3 vNormalW;
      varying vec3 vWorld;
      void main(){
        vec3 V = normalize(cameraPosition - vWorld);
        vec3 N = normalize(vNormalW);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        float lit  = max(dot(N, uSunDir), 0.0);
        float a = fres * (0.18 + 0.82 * lit) * uIntensity;
        gl_FragColor = vec4(uColor * (0.55 + 0.45 * lit), a);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  atmosphereMats.push(mat);
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 32), mat);
}

/* ---------------- Escena ---------------- */

const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x04060c, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.05, 4000);
camera.position.set(72, 44, 88);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.9;
controls.minDistance = 0.08;   // permite acercarse mucho (p. ej. a la Luna)
controls.maxDistance = 2500;
controls.target.set(0, 0, 0);

/* iluminación */
scene.add(new THREE.AmbientLight(0x33507a, 0.6));
const sunLight = new THREE.PointLight(0xfff0d0, 4.2, 0, 0);
scene.add(sunLight);
/* luz de relleno desde la cámara: evita caras nocturnas totalmente negras */
const fillLight = new THREE.DirectionalLight(0x9db8ff, 0.9);
scene.add(fillLight);
scene.add(fillLight.target);

/* ---------------- Fondo galáctico ----------------
   Dos capas de estrellas con velocidades de rotación diferenciales (como el
   giro real de la galaxia): la capa cercana gira más rápido que la lejana.
   El conjunto está anclado al sistema solar, de modo que el fondo barre
   "por detrás" mientras el sistema avanza como un bloque. */

const GAL_AXIS = new THREE.Vector3(0.42, 0.86, 0.28).normalize();  // eje galáctico approx.
const OMEGA_NEAR = 0.0135;   // rad/s  (capa cercana)
const OMEGA_FAR  = 0.0052;   // rad/s  (capa lejana)

const skyRoot = new THREE.Group();
scene.add(skyRoot);

function makeStarShell(rMin, rMax, count, size){
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++){
    const r = rMin + Math.random() * (rMax - rMin);
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    pos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.cos(ph);
    pos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
    const t = Math.random();
    c.setHSL(0.55 + (Math.random() - 0.5) * 0.14, 0.22 + t * 0.38, 0.60 + Math.random() * 0.38);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size, sizeAttenuation:false, vertexColors:true, transparent:true, opacity:.95, depthWrite:false });
  return new THREE.Points(g, m);
}

const starFar  = makeStarShell(1400, 2100, 5200, 1.6);
const starNear = makeStarShell(620, 980, 1300, 2.1);
skyRoot.add(starFar, starNear);

/* ---------------- Sol ---------------- */

/* Grupo que transporta TODO el sistema solar como un bloque:
   el Sol y los planetas avanzan juntos por el espacio. */
const systemGroup = new THREE.Group();
scene.add(systemGroup);
const systemOffset = new THREE.Vector3();     // desplazamiento acumulado del sistema

const sunGroup = new THREE.Group();
systemGroup.add(sunGroup);
/* el eje del Sol está inclinado 7,25° respecto a la perpendicular de la eclíptica */
const sunTilt = new THREE.Group();
sunTilt.rotation.x = SUN.tilt * DEG;
sunGroup.add(sunTilt);
const sunR = sceneRadius(SUN.rKm);
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(sunR, 64, 48),
  new THREE.MeshBasicMaterial({ color:0xffd98a })
);
sunTilt.add(sunMesh);

/* halo solar */
const sunGlow = (function(){
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(128,128,0,128,128,128);
  g.addColorStop(0, 'rgba(255,240,200,1)');
  g.addColorStop(.18,'rgba(255,206,120,.72)');
  g.addColorStop(.45,'rgba(255,170,70,.20)');
  g.addColorStop(1, 'rgba(255,150,50,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
  const tex = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending }));
  sp.scale.setScalar(sunR * 9);
  sunGroup.add(sp);
  return sp;
})();

/* ---------------- Planetas ---------------- */

const orbitGroup = new THREE.Group();
const trailGroup = new THREE.Group();
systemGroup.add(orbitGroup, trailGroup);

const bodies = [];   // registro de objetos con estado
const pickables = [];

const ORBIT_SEGMENTS = 256;

/* La elipse de la órbita: se recalcula cuando cambia la escala de distancias */
function orbitPoint(b, E, out){
  const e = elementsAt(b, 0);
  const xv = e.a * (Math.cos(E) - e.e);
  const yv = e.a * Math.sqrt(1 - e.e * e.e) * Math.sin(E);
  const cw = Math.cos(e.w), sw = Math.sin(e.w);
  const cO = Math.cos(e.O), sO = Math.sin(e.O);
  const ci = Math.cos(e.inc), si = Math.sin(e.inc);
  const x = (cw * cO - sw * sO * ci) * xv + (-sw * cO - cw * sO * ci) * yv;
  const y = (cw * sO + sw * cO * ci) * xv + (-sw * sO + cw * cO * ci) * yv;
  const z = ( sw * si) * xv + ( cw * si) * yv;
  return toScene(x, y, z, out);
}

function makeOrbitLine(b){
  const pts = [], cols = [];
  const base = new THREE.Color(b.color);
  const SEG = ORBIT_SEGMENTS;
  const v = new THREE.Vector3();
  for (let i = 0; i <= SEG; i++){
    orbitPoint(b, (i / SEG) * Math.PI * 2, v);
    pts.push(v.clone());
    cols.push(base.r, base.g, base.b);
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({
    vertexColors:true, transparent:true, opacity:.30, depthWrite:false
  }));
  line.frustumCulled = false;
  orbitGroup.add(line);
  return { line, geo:g, def:b };
}

const orbitLines = [];
function updateOrbitLines(){
  const v = new THREE.Vector3();
  for (const o of orbitLines){
    const attr = o.geo.attributes.position;
    for (let i = 0; i <= ORBIT_SEGMENTS; i++){
      orbitPoint(o.def, (i / ORBIT_SEGMENTS) * Math.PI * 2, v);
      attr.setXYZ(i, v.x, v.y, v.z);
    }
    attr.needsUpdate = true;
  }
}

function makeTrail(b){
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(TRAIL_SEGMENTS * 3);
  const col = new Float32Array(TRAIL_SEGMENTS * 3);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:.95, depthWrite:false, blending:THREE.AdditiveBlending });
  const line = new THREE.Line(g, m);
  line.frustumCulled = false;
  trailGroup.add(line);
  return { geo:g, line, pos, col };
}

for (const b of PLANETS){
  const group = new THREE.Group();
  const tiltG = new THREE.Group();
  group.add(tiltG);

  const radius = sceneRadius(b.rKm);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 32),
    new THREE.MeshStandardMaterial({
      map: b.tex.file ? loadTexture(b.tex.file) : planetTexture(b.tex),
      roughness: b.tex.type === 'gas' ? 0.85 : 0.96,
      metalness: 0.0
    })
  );
  tiltG.add(mesh);

  /* anillos (Saturno, Urano) */
  if (b.rings){
    b.rings.forEach(r => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius * r.i, radius * r.o, 160, 1),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(r.c), transparent:true, opacity:r.o2,
          side: THREE.DoubleSide, depthWrite:false
        })
      );
      ring.rotation.x = Math.PI / 2;
      tiltG.add(ring);
    });
  }

  /* resplandor suave para cuerpos pequeños (sprite aditivo, no esfera sólida) */
  if (radius < 0.45){
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: new THREE.Color(b.color),
      transparent:true, opacity:.5, depthWrite:false, blending:THREE.AdditiveBlending
    }));
    sp.scale.setScalar(radius * 4.5);
    group.add(sp);
  }

  /* atmósfera */
  let atmoMat = null;
  if (b.atmo){
    const atmo = makeAtmosphere(radius * b.atmo.f, b.atmo.c, b.atmo.i);
    tiltG.add(atmo);
    atmoMat = atmo.material;
  }

  systemGroup.add(group);
  pickables.push(mesh);

  const rec = {
    kind:'planet', def:b, group, tiltG, mesh, radius, atmoMat,
    orbit: makeOrbitLine(b),
    trail: makeTrail(b),
    pos: new THREE.Vector3(), vel: new THREE.Vector3()
  };
  orbitLines.push(rec.orbit);
  mesh.userData.body = rec;
  bodies.push(rec);
}

/* Luna (satélite de la Tierra) */
/* Radio de la Tierra en la escena: la Luna se dibuja con su proporción real
   respecto a ella (27,3 % del diámetro). Si se usara el radio comprimido
   (r^0,45) la Luna parecería un planeta gemelo casi del tamaño de la Tierra. */
const EARTH_R_KM = 6371;
const MOON_SCENE_R = sceneRadius(EARTH_R_KM) * (MOON.rKm / EARTH_R_KM);
const moonGroup = new THREE.Group();
const moonTilt = new THREE.Group();
moonTilt.rotation.z = MOON.tilt * DEG;
moonGroup.add(moonTilt);
const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(MOON_SCENE_R, 32, 24),
  new THREE.MeshStandardMaterial({ map: planetTexture(MOON.tex), roughness:.97 })
);
moonTilt.add(moonMesh);
systemGroup.add(moonGroup);
const moonRec = { kind:'moon', def:MOON, group:moonGroup, tiltG:moonTilt, mesh:moonMesh,
                  radius: MOON_SCENE_R, pos:new THREE.Vector3(), parent:'tierra' };
moonMesh.userData.body = moonRec;
bodies.push(moonRec);

/* Órbita lunar: la curva real que describe la Luna alrededor de la Tierra
   (misma efeméride que la Luna, muestreada a lo largo de un mes sidéreo).
   Se apoya en la Tierra y se redibuja al ritmo de la simulación. */
const moonOrbitGroup = new THREE.Group();
const MOON_ORBIT_SEG = 96;
const moonOrbitGeo = new THREE.BufferGeometry();
moonOrbitGeo.setAttribute('position',
  new THREE.Float32BufferAttribute(new Float32Array((MOON_ORBIT_SEG + 1) * 3), 3));
const moonOrbitLine = new THREE.Line(moonOrbitGeo, new THREE.LineBasicMaterial({
  color:0x9fb4d8, transparent:true, opacity:.40, depthWrite:false
}));
moonOrbitLine.frustumCulled = false;
moonOrbitGroup.add(moonOrbitLine);
orbitGroup.add(moonOrbitGroup);

function updateMoonOrbit(){
  const arr = moonOrbitGeo.attributes.position.array;
  for (let i = 0; i <= MOON_ORBIT_SEG; i++){
    const day = state.jd + (i / MOON_ORBIT_SEG) * 27.321661;
    const m = moonEcliptic(day - J2000);
    const r = m.dist / AU_KM;
    const cl = Math.cos(m.lat);
    toScene(r * cl * Math.cos(m.lon), r * cl * Math.sin(m.lon), r * Math.sin(m.lat), _tmp);
    arr[i*3] = _tmp.x; arr[i*3+1] = _tmp.y; arr[i*3+2] = _tmp.z;
  }
  moonOrbitGeo.attributes.position.needsUpdate = true;
}

/* Registro del Sol (para el panel de datos y el enfoque de cámara) */
const sunRec = { kind:'sun', def:SUN, group:sunGroup, tiltG:sunTilt, mesh:sunMesh,
                 radius: sunR, pos: new THREE.Vector3() };

/* ---------------- Plano de la eclíptica ----------------
   Referencia geométrica: las órbitas de los planetas están inclinadas
   respecto a este plano, y el Sol y la Luna lo recorren casi por su centro.
   Se dibuja como una circunferencia con radios cada 30° y un disco muy tenue. */
const eclipticGroup = new THREE.Group();
eclipticGroup.visible = false;
systemGroup.add(eclipticGroup);
(function buildEcliptic(){
  const pts = [];
  for (let i = 0; i <= 256; i++){
    const a = (i / 256) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
  }
  eclipticGroup.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color:0x6fa8e8, transparent:true, opacity:.40, depthWrite:false })
  ));
  const spokes = [];
  for (let i = 0; i < 12; i++){
    const a = (i / 12) * Math.PI * 2;
    spokes.push(new THREE.Vector3(0,0,0), new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
  }
  eclipticGroup.add(new THREE.LineSegments(
    new THREE.BufferGeometry().setFromPoints(spokes),
    new THREE.LineBasicMaterial({ color:0x4f7fc0, transparent:true, opacity:.20, depthWrite:false })
  ));
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshBasicMaterial({ color:0x2f5c96, transparent:true, opacity:.05, side:THREE.DoubleSide, depthWrite:false })
  );
  disc.rotation.x = -Math.PI / 2;
  eclipticGroup.add(disc);
})();
/* radio del plano: la órbita de Neptuno, con la misma compresión que el resto */
const ECLIPTIC_A = 30.07;

/* ---------------- Estado de la simulación ---------------- */

const state = {
  jd: jdFromDate(new Date()),
  playing: true,
  daysPerSecond: 30,
  focus: null,
  showOrbits:true, showTrails:true, showLabels:true, showStars:true,
  skyMotion:true,   // fondo galáctico girando
  drift:true,       // el sistema solar avanza como un bloque por el espacio
  realScale:false,  // distancias a escala real (exponente 1.0)
  focusOffset: new THREE.Vector3(),
  focusOmega: 0,
  focusJD: 0
};

/* Dirección de la deriva del Sol por la galaxia (unidades de escena/segundo) */
const DRIFT_DIR = new THREE.Vector3(-0.34, 0.17, -0.92).normalize();
const DRIFT_SPEED = 11;

const speedSlider = $('speed');
function sliderToSpeed(v){
  const days = Math.pow(10, -1 + (v / 100) * 4.4);   // 0.1 d/s … ~2500 d/s
  return days;
}
function formatSpeed(d){
  if (d < 1) return d.toFixed(2) + ' d/s';
  if (d < 100) return d.toFixed(d < 10 ? 1 : 0) + ' d/s';
  if (d < 1000) return d.toFixed(0) + ' d/s';
  return (d / 365.25).toFixed(1) + ' años/s';
}
speedSlider.addEventListener('input', () => {
  state.daysPerSecond = sliderToSpeed(+speedSlider.value);
  $('speedLabel').textContent = formatSpeed(state.daysPerSecond);
});

/* ---------------- Etiquetas HTML ---------------- */

const labelLayer = $('labels');
const labels = new Map();
function makeLabel(text, cls){
  const el = document.createElement('div');
  el.className = 'label' + (cls ? ' ' + cls : '');
  el.textContent = text;
  labelLayer.appendChild(el);
  return el;
}
labels.set('Sol', makeLabel('Sol', 'sun'));
for (const r of bodies) if (r.kind === 'planet') labels.set(r.def.key, makeLabel(r.def.name));
labels.set('luna', makeLabel('Luna'));

/* ---------------- Posiciones por frame ---------------- */

const earthRec = bodies.find(b => b.def.key === 'tierra');
const sunPos = new THREE.Vector3();

/* Baricentro del sistema solar: el Sol no está fijo, orbita el baricentro
   (la suma ponderada por masa de los planetas). El efecto es pequeño pero real:
   el Sol se desplaza unos 1,3 millones de km. */
const barycenter = { x:0, y:0, z:0 };

function updatePositions(){
  const T = centuriesSinceJ2000(state.jd);

  /* 1) posiciones heliocéntricas (UA) */
  let msum = 0, bx = 0, by = 0, bz = 0;
  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    const p = positionOf(r.def, T);
    r.helio = p;
    const m = r.def.mass || 0;
    msum += m; bx += m * p.x; by += m * p.y; bz += m * p.z;
  }
  /* 2) baricentro (en unidades de masa solar) */
  const denom = 1 + msum;
  barycenter.x = bx / denom; barycenter.y = by / denom; barycenter.z = bz / denom;

  /* 3) posiciones en escena, referidas al baricentro */
  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    const p = r.helio;
    toScene(p.x - barycenter.x, p.y - barycenter.y, p.z - barycenter.z, r.pos);
    r.group.position.copy(r.pos);
  }
  /* 4) el Sol, orbitando el baricentro */
  toScene(-barycenter.x, -barycenter.y, -barycenter.z, sunPos);
  sunGroup.position.copy(sunPos);
  sunRec.pos.copy(sunPos);
  sunRec.baryKm = Math.hypot(barycenter.x, barycenter.y, barycenter.z) * AU_KM;

  /* el plano de la eclíptica se redimensiona con la compresión de distancias */
  eclipticGroup.scale.setScalar(DIST_SCALE * Math.pow(ECLIPTIC_A, scaleExp));

  /* 5) precesión de los ejes (ciclo de 25.772 años) */
  const prec = -T * 100 * (360 / 25772) * DEG;
  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    qPrec.setFromAxisAngle(AXIS_Y, prec);
    /* el eje inclinado se orienta hacia el equinoccio de verano (λ = 90°),
       de modo que el hemisferio norte reciba más luz en junio */
    qTilt.setFromAxisAngle(AXIS_X, -(r.def.tilt || 0) * DEG);
    r.tiltG.quaternion.copy(qPrec).multiply(qTilt);
  }

  /* Luna */
  const dias = state.jd - J2000;
  const m = moonOffset(dias);
  const off = toScene(m.x, m.y, m.z, _tmp);
  moonRec.pos.copy(earthRec.pos).add(off);
  moonGroup.position.copy(moonRec.pos);
  moonRec.dist = m.dist;
  moonRec.lon = m.lon;
  moonRec.lat = m.lat;
  moonOrbitGroup.position.copy(earthRec.pos);

  /* bloqueo tidal: la Luna siempre muestra la misma cara a la Tierra */
  tmpV.copy(earthRec.pos).sub(moonRec.pos).normalize();          // hacia la Tierra
  moonBasisZ.copy(tmpV);
  moonBasisY.copy(AXIS_Y).addScaledVector(moonBasisZ, -AXIS_Y.dot(moonBasisZ)).normalize();
  moonBasisX.crossVectors(moonBasisY, moonBasisZ).normalize();
  moonMatrix.makeBasis(moonBasisX, moonBasisY, moonBasisZ);
  moonQuat.setFromRotationMatrix(moonMatrix);
  moonTilt.quaternion.copy(moonQuat);

  /* datos lunares en UA (para la fase) */
  lunarData.earthLon = Math.atan2(earthRec.helio.y, earthRec.helio.x);
  lunarData.moonLon = m.lon;
  lunarData.moonElong = m.dist;   // distancia Tierra-Luna en km
}

/* Estelas: se recalculan analíticamente hacia el pasado */
const _pv = new THREE.Vector3();
function updateTrails(){
  const T = centuriesSinceJ2000(state.jd);
  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    const period = Math.pow(r.def.el[0], 1.5) * 365.25;             // días
    const span = Math.min(period * 0.32, 1400);                     // días de estela
    const { pos, col, geo } = r.trail;
    const base = new THREE.Color(r.def.color);
    const bright = new THREE.Color().copy(base).lerp(new THREE.Color(0xffffff), .45);
    for (let i = 0; i < TRAIL_SEGMENTS; i++){
      const f = i / (TRAIL_SEGMENTS - 1);
      const t = T - (f * span) / 36525;
      const p = positionOf(r.def, t);
      toScene(p.x, p.y, p.z, _pv);
      pos[i*3] = _pv.x; pos[i*3+1] = _pv.y; pos[i*3+2] = _pv.z;
      const fade = Math.pow(f, 2.1);
      col[i*3]   = base.r * fade;
      col[i*3+1] = base.g * fade;
      col[i*3+2] = base.b * fade;
      if (i === 0){ col[i*3] = bright.r; col[i*3+1] = bright.g; col[i*3+2] = bright.b; }
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }
}

/* ---------------- Rotación propia ---------------- */

function updateSpin(dt){
  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    if (r.def.key === 'tierra'){
      /* La Tierra gira según el tiempo sideral de Greenwich: de este modo el
         mapa real queda alineado con la longitud geográfica correcta
         (Greenwich corresponde a u = 0,5 de la textura). */
      const gmst = 280.46061837 + 360.98564736629 * (state.jd - J2000);
      r.mesh.rotation.y = (gmst % 360) * DEG;
      continue;
    }
    const period = r.def.day * 3600;                 // segundos
    const spin = ((state.jd - J2000) * 86400 / period) * Math.PI * 2;
    r.mesh.rotation.y = spin % (Math.PI * 2);
  }
  sunMesh.rotation.y = ((state.jd - J2000) * 86400 / (25.38 * 86400)) * Math.PI * 2;
}

/* ---------------- Cámara: vistas y enfoque ---------------- */

let camTween = null;
function tweenCamera(pos, target, ms = 1100){
  camTween = {
    t: 0, ms,
    fromPos: camera.position.clone(), toPos: pos.clone(),
    fromTgt: controls.target.clone(), toTgt: target.clone()
  };
}
/* Posición de escena de un cuerpo (incluye la deriva del sistema) */
function worldPosOf(rec){ return rec.pos.clone().add(systemOffset); }

function focusBody(rec){
  updatePositions();
  state.focus = rec;
  const tgt = worldPosOf(rec);

  if (rec.kind === 'moon'){
    /* La cámara se sitúa en el lado de la Luna que mira a la Tierra, a una
       distancia algo menor que la separación Tierra-Luna: así se ve exactamente
       la misma fase que ve un observador terrestre, sin meterse dentro de la
       atmósfera terrestre. */
    const toEarth = new THREE.Vector3().copy(earthRec.pos).sub(rec.pos).normalize();
    toEarth.y += 0.09; toEarth.normalize();
    state.focusOffset = toEarth.multiplyScalar(0.32);
    state.focusOmega = 2 * Math.PI / 27.3217;
    state.focusJD = state.jd;
    tweenCamera(tgt.clone().add(state.focusOffset.clone()), tgt);
    showInfo(rec);
    return;
  }

  const dist = rec.def.key === 'tierra' ? 3.2 : Math.max(rec.radius * 9 + 1.4, rec.kind === 'planet' ? 6.5 : 1.4);
  /* situar la cámara en ángulo respecto al Sol para ver la cara iluminada */
  const toSun = new THREE.Vector3().copy(rec.pos).negate().normalize();
  const a = 0.95;
  const dir = new THREE.Vector3(
    toSun.x * Math.cos(a) + toSun.z * Math.sin(a),
    0.42,
    -toSun.x * Math.sin(a) + toSun.z * Math.cos(a)
  ).normalize();
  /* el offset gira con el movimiento orbital del cuerpo: así la cámara
     conserva siempre el mismo ángulo de fase respecto al Sol */
  state.focusOffset = dir.multiplyScalar(dist);
  state.focusOmega = rec.kind === 'planet'
    ? 2 * Math.PI / (Math.pow(rec.def.el[0], 1.5) * 365.25)
    : 2 * Math.PI / 27.3217;
  state.focusJD = state.jd;
  tweenCamera(tgt.clone().add(state.focusOffset.clone()), tgt);
  updatePositions();          // la ficha se calcula con la posición ya actualizada
  showInfo(rec);
}
/* Enfoque del Sol: la cámara se sitúa cerca de la fotosfera */
function focusSun(){
  updatePositions();
  state.focus = sunRec;
  const tgt = worldPosOf(sunRec);
  const dist = Math.max(sunRec.radius * 6 + 3, 11);
  const dir = new THREE.Vector3(0.58, 0.40, 0.71).normalize();
  state.focusOffset = dir.multiplyScalar(dist);
  state.focusOmega = 0;
  state.focusJD = state.jd;
  tweenCamera(tgt.clone().add(state.focusOffset.clone()), tgt);
  updatePositions();          // la ficha se calcula con la posición ya actualizada
  showInfo(sunRec);
}
function viewTop(){
  tweenCamera(systemOffset.clone().add(new THREE.Vector3(0.01, 150, 0.01)), systemOffset.clone());
  state.focus = null; hideInfo();
}
function viewOblique(){
  tweenCamera(systemOffset.clone().add(new THREE.Vector3(72, 44, 88)), systemOffset.clone());
  state.focus = null; hideInfo();
}
function viewInner(){
  tweenCamera(systemOffset.clone().add(new THREE.Vector3(4, 20, 42)), systemOffset.clone());
  state.focus = null; hideInfo();
}

/* ---------------- Fase lunar ----------------
   Se calcula con la geometría real: elongación Sol-Tierra-Luna. */

const moonCanvas = $('moonCanvas');
const moonCtx = moonCanvas.getContext('2d');

function moonPhaseData(){
  /* longitud geocéntrica del Sol: la Tierra heliocéntrica, más 180° */
  const sunLon = lunarData.earthLon + Math.PI;
  /* longitud geocéntrica de la Luna: dirección Tierra→Luna */
  const moonLon = lunarData.moonLon;
  let elong = (moonLon - sunLon) % (Math.PI * 2);
  if (elong < 0) elong += Math.PI * 2;                     // 0 = Luna nueva
  const k = (1 - Math.cos(elong)) / 2;                     // fracción iluminada
  const waxing = elong < Math.PI;
  let name;
  const e = elong / (Math.PI * 2);
  if (e < 0.02 || e > 0.98)      name = 'Luna nueva';
  else if (e < 0.23)             name = waxing ? 'Creciente iluminante' : 'Creciente menguante';
  else if (e < 0.27)             name = waxing ? 'Cuarto creciente' : 'Cuarto menguante';
  else if (e < 0.48)             name = waxing ? 'Gibosa creciente' : 'Gibosa menguante';
  else if (e < 0.52)             name = 'Luna llena';
  else if (e < 0.73)             name = waxing ? 'Gibosa creciente' : 'Gibosa menguante';
  else if (e < 0.77)             name = waxing ? 'Cuarto creciente' : 'Cuarto menguante';
  else                           name = waxing ? 'Creciente iluminante' : 'Creciente menguante';
  const age = e * 29.530588;                               // edad lunar en días
  return { elong, k, waxing, name, age };
}

function drawMoonPhase(ph){
  const W = moonCanvas.width, H = moonCanvas.height;
  const cx = W / 2, cy = H / 2, R = W * 0.40;
  moonCtx.clearRect(0, 0, W, H);

  /* disco oscuro (parte no iluminada) */
  moonCtx.fillStyle = 'rgba(120,140,180,.10)';
  moonCtx.beginPath(); moonCtx.arc(cx, cy, R, 0, Math.PI * 2); moonCtx.fill();
  moonCtx.strokeStyle = 'rgba(150,170,210,.25)';
  moonCtx.lineWidth = 1.5;
  moonCtx.beginPath(); moonCtx.arc(cx, cy, R, 0, Math.PI * 2); moonCtx.stroke();

  /* parte iluminada */
  moonCtx.save();
  moonCtx.translate(cx, cy);
  if (!ph.waxing) moonCtx.scale(-1, 1);            // menguante: espejo
  const a = R * Math.abs(1 - 2 * ph.k);
  const g = moonCtx.createLinearGradient(-R, 0, R, 0);
  g.addColorStop(0, '#e9eef8'); g.addColorStop(1, '#ffffff');
  moonCtx.fillStyle = g;
  moonCtx.beginPath();
  moonCtx.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, false);
  moonCtx.ellipse(0, 0, a, R, 0, Math.PI / 2, -Math.PI / 2, ph.k < 0.5);
  moonCtx.closePath();
  moonCtx.fill();
  moonCtx.restore();
}

function updateMoonWidget(){
  const ph = moonPhaseData();
  drawMoonPhase(ph);
  $('moonPhase').textContent = ph.name;
  $('moonIllum').textContent = (ph.k * 100).toFixed(0) + ' % iluminada';
  $('moonAge').textContent = 'edad aproximada ' + ph.age.toFixed(1) + ' días';
  return ph;
}

/* ---------------- Panel de información ---------------- */

/* Efemérides terrestres: estación boreal, próximo hito del calendario solar
   y fecha del perihelio, calculadas con las efemérides reales. */
function earthEphemeris(){
  const T = centuriesSinceJ2000(state.jd);
  const el = elementsAt(earthRec.def, T);
  const lonE = Math.atan2(earthRec.helio.y, earthRec.helio.x) / DEG;
  const lonSun = ((lonE + 180) % 360 + 360) % 360;        // longitud geocéntrica del Sol
  let season, hito;
  if (lonSun < 90){        season = 'Primavera'; hito = 'Solsticio de verano'; }
  else if (lonSun < 180){  season = 'Verano';     hito = 'Equinoccio de otoño'; }
  else if (lonSun < 270){  season = 'Otoño';      hito = 'Solsticio de invierno'; }
  else {                   season = 'Invierno';   hito = 'Equinoccio de primavera'; }

  const RATE = 0.985647;                                   // °/día del Sol
  const next90 = (Math.floor(lonSun / 90) + 1) * 90;
  const dHito = (next90 - lonSun) / RATE;
  const fechaHito = dateFromJD(state.jd + dHito);

  let dPeri = (el.peri - lonE) % 360;
  if (dPeri < 0) dPeri += 360;
  const fechaPeri = dateFromJD(state.jd + dPeri / RATE);

  const fmt = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const sub = subsolarLongitude();
  const subTxt = `sol en el cénit a ${Math.abs(sub).toFixed(0)}° ${sub >= 0 ? 'E' : 'O'}`;
  return `${season} · ${hito.toLowerCase()} ${fmt(fechaHito)} · perihelio ${fmt(fechaPeri)} · ${subTxt}`;
}

/* Punto subsolar: la longitud geográfica donde el Sol está en el cénit.
   Coincide con el centro de la cara iluminada del mapa real. */
function subsolarLongitude(){
  const EPS = 23.4392911 * DEG;
  const lonE = Math.atan2(earthRec.helio.y, earthRec.helio.x);
  const lamSun = lonE + Math.PI;                                  // longitud eclíptica del Sol
  const ra = Math.atan2(Math.cos(EPS) * Math.sin(lamSun), Math.cos(lamSun));   // AR solar
  const gmst = (280.46061837 + 360.98564736629 * (state.jd - J2000)) * DEG;
  let lon = ra - gmst;
  lon = ((lon / DEG) % 360 + 540) % 360 - 180;                    // normalizar a (-180,180]
  return lon;
}

const infoPanel = $('infoPanel');
function showInfo(rec){
  infoPanel.classList.remove('hidden');
  const d = rec.def;
  $('infoName').textContent = d.name;
  $('infoDot').style.background = d.color;
  $('infoDot').style.color = d.color;

  if (rec.kind === 'planet'){
    const p = rec.helio;
    const periodYears = Math.pow(d.el[0], 1.5);
    const speed = 2 * Math.PI * (d.el[0] * 149597870.7) / (periodYears * 365.25 * 86400);
    $('infoDist').textContent = p.r.toFixed(3) + ' UA';
    $('infoPeriod').textContent = periodYears < 1
      ? (periodYears * 365.25).toFixed(1) + ' días'
      : periodYears.toFixed(2) + ' años';
    $('infoRadius').textContent = d.rKm.toLocaleString('es') + ' km';
    $('infoGrav').textContent = num(gravityOf(d.mass, gravityRadius(d)), 2) + ' m/s²';
    $('infoEscape').textContent = num(escapeOf(d.mass, gravityRadius(d)), 2) + ' km/s';
    $('infoSpin').textContent = rotationText(d.day, d.tilt);
    $('infoSpeed').textContent = speed.toFixed(2) + ' km/s';
    $('infoDistLabel').textContent = 'Distancia al Sol';
    $('infoPos').textContent = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
    $('infoOrbit').textContent = `e ${num(d.el[1], 3)} · incl ${num(d.el[2], 1)}°`;
    /* tercera ley de Kepler: T²/a³ debe valer 1 (T en años, a en UA) */
    const Ty = Math.pow(d.el[0], 1.5);
    $('infoKepler').textContent = (Ty * Ty / Math.pow(d.el[0], 3)).toFixed(4) + ' ≈ 1';
    /* efemérides */
    if (d.key === 'tierra'){
      $('infoExtra').textContent = earthEphemeris();
    } else {
      const peri = d.el[0] * (1 - d.el[1]);
      const aphe = d.el[0] * (1 + d.el[1]);
      $('infoExtra').textContent = `Perihelio ${peri.toFixed(3)} UA · Afelio ${aphe.toFixed(3)} UA`;
    }
  } else if (rec.kind === 'moon'){
    const ph = moonPhaseData();
    const dist = moonRec.dist || 384400;
    $('infoDistLabel').textContent = 'Distancia a la Tierra';
    $('infoDist').textContent = (dist).toLocaleString('es', { maximumFractionDigits:0 }) + ' km de la Tierra';
    $('infoPeriod').textContent = '27,32 d sidéreo · 29,53 d sinódico';
    $('infoRadius').textContent = d.rKm.toLocaleString('es') + ' km';
    $('infoGrav').textContent = num(gravityOf(d.mass, gravityRadius(d)), 2) + ' m/s²';
    $('infoEscape').textContent = num(escapeOf(d.mass, gravityRadius(d)), 2) + ' km/s';
    $('infoSpin').textContent = rotationText(d.day, d.tilt) + ' · bloqueo tidal';
    $('infoSpeed').textContent = '1,02 km/s';
    $('infoPos').textContent = `λ ${num(moonRec.lon / DEG, 1)}° · β ${num(moonRec.lat / DEG, 1)}°`;
    $('infoOrbit').textContent = `a 384.400 km · e 0,055 · incl 5,1°`;
    $('infoKepler').textContent = 'n/a · órbita a la Tierra';
    $('infoExtra').textContent = `Fase: ${ph.name.toLowerCase()} · ${(ph.k * 100).toFixed(0)} % iluminada · 27 % del diámetro terrestre`;
  } else if (rec.kind === 'sun'){
    $('infoDistLabel').textContent = 'Posición';
    $('infoDist').textContent = 'Centro del sistema solar';
    $('infoPeriod').textContent = '— (orbita la galaxia)';
    $('infoRadius').textContent = d.rKm.toLocaleString('es') + ' km';
    $('infoGrav').textContent = num(gravityOf(1, d.rKm), 1) + ' m/s²';
    $('infoEscape').textContent = num(escapeOf(1, d.rKm), 1) + ' km/s';
    $('infoSpin').textContent = rotationText(d.day, d.tilt, 'd');
    $('infoSpeed').textContent = '≈ 230 km/s (galaxia)';
    $('infoPos').textContent = num((rec.baryKm || 0) / 1e6, 2) + ' M km del baricentro';
    $('infoOrbit').textContent = 'e 0,000 · incl 0,0°';
    $('infoKepler').textContent = 'n/a · masa dominante';
    $('infoExtra').textContent = '99,86 % de la masa del sistema · 1.392.700 km de diámetro';
  }
  $('infoCurio').textContent = d.curio || '';
}
function hideInfo(){ infoPanel.classList.add('hidden'); }
$('btnDeselect').addEventListener('click', () => { state.focus = null; hideInfo(); viewOblique(); });

/* ---------------- Lista de planetas ---------------- */

const listEl = $('planetList');
const listItems = new Map();
function buildList(){
  const rows = [{ key:'Sol', name:'Sol', color:SUN.color, au:'0' }].concat(
    PLANETS.map(p => ({ key:p.key, name:p.name, color:p.color, au:p.el[0].toFixed(2) + ' UA' })),
    [{ key:'luna', name:'Luna', color:MOON.color, au:'0,0026 UA' }]
  );
  for (const r of rows){
    const li = document.createElement('li');
    li.innerHTML = `<span class="sw" style="background:${r.color};box-shadow:0 0 8px ${r.color}"></span>
                    <span class="nm">${r.name}</span><span class="au">${r.au}</span>`;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', 'Enfocar ' + r.name);
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); li.click(); }
    });
    li.addEventListener('click', () => {
      if (r.key === 'Sol'){ focusSun(); return; }
      const rec = bodies.find(b => b.def.key === r.key);
      if (rec) focusBody(rec);
    });
    listEl.appendChild(li);
    listItems.set(r.key, li);
  }
}
buildList();

/* ---------------- Selección con click (raycasting) ---------------- */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null;

renderer.domElement.addEventListener('pointerdown', e => { downPos = { x:e.clientX, y:e.clientY }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  downPos = null;
  if (moved > 5) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  if (hits.length){
    const rec = hits[0].object.userData.body;
    if (rec) focusBody(rec);
  } else {
    state.focus = null; hideInfo();
  }
});

/* ---------------- Controles de UI ---------------- */

$('btnPlay').addEventListener('click', () => {
  state.playing = !state.playing;
  $('btnPlay').textContent = state.playing ? '❚❚' : '▶';
  $('btnPlay').setAttribute('aria-label', state.playing ? 'Pausa' : 'Reproducir');
});
$('btnNow').addEventListener('click', () => {
  state.jd = jdFromDate(new Date());
  syncDateInputs();
});
$('tglOrbits').addEventListener('change', e => { state.showOrbits = e.target.checked; orbitGroup.visible = state.showOrbits; });
$('tglTrails').addEventListener('change', e => { state.showTrails = e.target.checked; trailGroup.visible = state.showTrails; });
$('tglLabels').addEventListener('change', e => { state.showLabels = e.target.checked; labelLayer.style.display = state.showLabels ? '' : 'none'; });
$('tglStars').addEventListener('change', e => { state.showStars = e.target.checked; skyRoot.visible = state.showStars; });
$('tglSky').addEventListener('change', e => { state.skyMotion = e.target.checked; });
$('tglDrift').addEventListener('change', e => { state.drift = e.target.checked; });
$('tglReal').addEventListener('change', e => {
  state.realScale = e.target.checked;
  $('scaleNote').classList.toggle('on', state.realScale);
});
$('tglEcliptic').addEventListener('change', e => {
  eclipticGroup.visible = e.target.checked;
});
document.querySelectorAll('[data-view]').forEach(b => {
  b.addEventListener('click', () => {
    if (b.dataset.view === 'top') viewTop();
    else if (b.dataset.view === 'oblique') viewOblique();
    else viewInner();
  });
});

const dateInput = $('dateInput'), timeInput = $('timeInput');
function syncDateInputs(){
  const d = dateFromJD(state.jd);
  const p = n => String(n).padStart(2, '0');
  dateInput.value = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  timeInput.value = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function applyDateInputs(){
  const dv = dateInput.value.split('-').map(Number);
  const tv = timeInput.value.split(':').map(Number);
  if (dv.length === 3 && !isNaN(dv[0])){
    const d = new Date(0);
    d.setFullYear(dv[0], dv[1]-1, dv[2]);
    d.setHours(tv[0]||0, tv[1]||0, tv[2]||0, 0);
    if (!Number.isFinite(d.getTime())) return;
    state.jd = jdFromDate(d);
    updateReadout();          // el readout inferior también se refresca al cambiar la fecha
  }
}
dateInput.addEventListener('change', applyDateInputs);
timeInput.addEventListener('change', applyDateInputs);

/* ---------------- Lectura inferior ---------------- */

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function updateReadout(){
  const d = dateFromJD(state.jd);
  const p = n => String(n).padStart(2, '0');
  $('readoutDate').textContent =
    `${p(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  $('modelRange').hidden = dateFromJD(state.jd).getFullYear() >= 1800 && dateFromJD(state.jd).getFullYear() <= 2050;
  $('readoutSpeed').textContent = state.playing
    ? `▶ ${formatSpeed(state.daysPerSecond)}`
    : `❚❚ en pausa · ${formatSpeed(state.daysPerSecond)}`;
}

/* ---------------- Bucle principal ---------------- */

const clock = new THREE.Clock();
const projV = new THREE.Vector3();
const qFar = new THREE.Quaternion();
const qNear = new THREE.Quaternion();
const frameDrift = new THREE.Vector3();
const tmpV = new THREE.Vector3();
const sunWorld = new THREE.Vector3();
let frame = 0;

function updateLabels(){
  if (!state.showLabels) return;

  const items = [];
  const place = (el, worldPos, offsetPx, opacity) => {
    projV.copy(worldPos).project(camera);
    if (projV.z > 1){ el.style.opacity = 0; return; }
    const x = (projV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-projV.y * 0.5 + 0.5) * window.innerHeight;
    if (x < -60 || x > window.innerWidth + 60 || y < -30 || y > window.innerHeight + 30){
      el.style.opacity = 0; return;
    }
    items.push({ el, x, y: y - offsetPx, opacity });
  };

  for (const r of bodies){
    if (r.kind !== 'planet') continue;
    const el = labels.get(r.def.key);
    const world = r.pos.clone().add(systemOffset);
    const dist = camera.position.distanceTo(world);
    /* radio proyectado en píxeles + margen */
    const px = r.radius * (window.innerHeight / 2) / (dist * Math.tan(camera.fov * DEG / 2));
    place(el, world, px + 7, (state.focus && state.focus !== r) ? 0.35 : 1);
  }
  place(labels.get('luna'), moonRec.pos.clone().add(systemOffset), 12, 0.7);
  place(labels.get('Sol'), systemOffset.clone(), 18, 1);

  /* evitar solapamiento: desplazar verticalmente las etiquetas */
  items.sort((a, b) => a.y - b.y);
  const placed = [];
  for (const it of items){
    let y = it.y, guard = 0;
    while (guard++ < 14 && placed.some(p => Math.abs(p.x - it.x) < 74 && Math.abs(p.y - y) < 13)) y -= 14;
    it.el.style.left = it.x + 'px';
    it.el.style.top = y + 'px';
    it.el.style.opacity = it.opacity;
    placed.push({ x: it.x, y });
  }
}

function tick(){
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (state.playing){
    state.jd += state.daysPerSecond * dt;
    if (frame % 4 === 0){ syncDateInputs(); updateReadout(); }
  }

  updatePositions();
  updateSpin(dt);
  if (state.showTrails && frame % 2 === 0) updateTrails();
  if (frame % 10 === 0) updateMoonOrbit();

  /* --- escala de distancias (comprimida ⇄ real) --- */
  const targetExp = state.realScale ? 1.0 : DIST_EXP;
  if (Math.abs(scaleExp - targetExp) > 1e-5){
    const prevExp = scaleExp;
    scaleExp += (targetExp - scaleExp) * Math.min(1, dt * 2.4);
    if (Math.abs(scaleExp - targetExp) < 1e-4) scaleExp = targetExp;
    /* la cámara se aleja en la misma proporción que las órbitas */
    const k = Math.pow(39.482, scaleExp - prevExp);
    tmpV.copy(camera.position).sub(controls.target).multiplyScalar(k);
    camera.position.copy(controls.target).add(tmpV);
    /* el fondo estelar acompaña esa misma proporción */
    skyRoot.scale.setScalar(skyRoot.scale.x * k);
    /* el Sol se encoge: a escala real ocuparía menos de un píxel */
    const t = (scaleExp - DIST_EXP) / (1 - DIST_EXP);
    const s = 1 - 0.66 * t;
    sunMesh.scale.setScalar(s);
    sunGlow.scale.setScalar(sunR * 9 * s);
    updateOrbitLines();
  }

  /* --- la luz viene del Sol real (que se mueve respecto al baricentro) --- */
  sunWorld.copy(sunPos).add(systemOffset);
  sunLight.position.copy(sunWorld);
  for (const r of bodies){
    if (!r.atmoMat) continue;
    tmpV.copy(sunPos).sub(r.pos).normalize();
    r.atmoMat.uniforms.uSunDir.value.copy(tmpV);
  }

  /* --- fase lunar --- */
  if (frame % 6 === 0) updateMoonWidget();

  /* --- deriva del sistema por el espacio + fondo galáctico girando --- */
  if (state.drift){
    frameDrift.copy(DRIFT_DIR).multiplyScalar(DRIFT_SPEED * dt);
    systemOffset.add(frameDrift);
    systemGroup.position.copy(systemOffset);
    /* la cámara acompaña al sistema al 97 %: el conjunto avanza lentamente a
       través del encuadre mientras el fondo estelar barre por detrás.
       Los botones de vista lo recentran. */
    tmpV.copy(frameDrift).multiplyScalar(0.97);
    controls.target.add(tmpV);
    camera.position.add(tmpV);
  } else {
    frameDrift.set(0, 0, 0);
  }
  if (state.skyMotion){
    qFar.setFromAxisAngle(GAL_AXIS, OMEGA_FAR * dt);
    qNear.setFromAxisAngle(GAL_AXIS, OMEGA_NEAR * dt);
    starFar.quaternion.premultiply(qFar);
    starNear.quaternion.premultiply(qNear);
  }
  skyRoot.position.copy(systemOffset);

  /* tween de cámara */
  if (camTween){
    camTween.t += dt * 1000;
    const k = Math.min(1, camTween.t / camTween.ms);
    const e = k < 0.5 ? 4*k*k*k : 1 - Math.pow(-2*k+2, 3)/2;
    camera.position.lerpVectors(camTween.fromPos, camTween.toPos, e);
    controls.target.lerpVectors(camTween.fromTgt, camTween.toTgt, e);
    /* durante el tween el sistema sigue desplazándose: se compensa */
    camera.position.add(frameDrift);
    controls.target.add(frameDrift);
    if (k >= 1) camTween = null;
  } else if (state.focus){
    /* seguimiento exacto: la cámara acompaña al cuerpo girando con su
       movimiento orbital, de modo que siempre se ve la cara iluminada */
    const tgt = state.focus.pos.clone().add(systemOffset);
    qFocus.setFromAxisAngle(AXIS_Y, state.focusOmega * (state.jd - state.focusJD));
    tmpV.copy(state.focusOffset).applyQuaternion(qFocus);
    controls.target.copy(tgt);
    camera.position.copy(tgt).add(tmpV);
  }

  controls.update();
  fillLight.position.copy(camera.position);
  fillLight.target.position.copy(controls.target);
  fillLight.target.updateMatrixWorld();
  if (state.focus && frame % 15 === 0) showInfo(state.focus);
  updateLabels();
  renderer.render(scene, camera);
  frame++;
}

/* ---------------- Redimensionado ---------------- */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---------------- Init ---------------- */

state.daysPerSecond = sliderToSpeed(+speedSlider.value);
$('speedLabel').textContent = formatSpeed(state.daysPerSecond);
syncDateInputs();
updateReadout();
updatePositions();
updateTrails();
updateMoonOrbit();
tick();

/* ocultar el tip tras unos segundos */
setTimeout(() => { const h = $('hint'); if (h) h.style.opacity = 0; }, 7000);
