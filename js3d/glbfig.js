// Fertiges Soldaten-Modell (assets/modelle/soldat.glb) als Grundlage für alle Infanterie-Figuren.
// Das Modell ist ein Stück; hier werden die Arme abgetrennt (damit sie Waffen halten können)
// und je Seite umgefärbt: Deutsche feldgrau, Alliierte oliv. Die offene Brust wird zur geschlossenen Jacke.
import * as THREE from '../vendor/three.module.min.js';
import { GLTFLoader } from '../vendor/GLTFLoader.js';

export const GF = { ok: false };
export const SCALE = .83;                    // Modell (Höhe 2) -> unsere Figur, Füße auf 0
const SHOULDER = new THREE.Vector3(.37, .24, 0);

function torsoHalf(y) { return .245 + (.35 - y) / .8 * .09; }
const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3();
function split(geo) {
  const p = geo.attributes.position, idx = geo.index.array, parts = { body: [], l: [], r: [], head: [], legs: [], torso: [] };
  for (let t = 0; t < idx.length; t += 3) {
    let x = 0, y = 0; for (let k = 0; k < 3; k++) { x += p.getX(idx[t + k]); y += p.getY(idx[t + k]); } x /= 3; y /= 3;
    const th = y > .12 ? .335 : y < -.45 ? .37 : torsoHalf(y) + .025;
    let arm = y < .38 && y > -.62 && Math.abs(x) > th;   // oben bleibt die Rumpfschulter am Körper
    if (arm && y > -.3 && y < .12 && Math.abs(x) < .38) { A.fromBufferAttribute(p, idx[t]); B.fromBufferAttribute(p, idx[t + 1]); C.fromBufferAttribute(p, idx[t + 2]); N.subVectors(C, B).cross(A.clone().sub(B)).normalize(); if (N.x * Math.sign(x) > -.35) arm = false; }   // Rumpf-Seitenwand (zeigt nach außen) bleibt am Körper, sonst hängen Fetzen am gehobenen Arm
    (arm ? (x > 0 ? parts.r : parts.l) : parts.body).push(idx[t], idx[t + 1], idx[t + 2]);
    if (!arm) (y > .4 ? parts.head : y < -.5 ? parts.legs : parts.torso).push(idx[t], idx[t + 1], idx[t + 2]);   // für das Auseinanderfallen
  }
  const mk = list => { const g = new THREE.BufferGeometry(); for (const k of Object.keys(geo.attributes)) g.setAttribute(k, geo.attributes[k].clone()); g.setIndex(list); return g; };
  return { body: mk(parts.body), r: mk(parts.r), l: mk(parts.l), pieces: [mk(parts.legs), mk(parts.torso), mk(parts.head)] };
}
// Hand = unterster Teil des Arms
function handCenter(geo) {
  const p = geo.attributes.position, idx = geo.index.array, v = new THREE.Vector3(); let n = 0, ymin = 1e9;
  for (const i of idx) ymin = Math.min(ymin, p.getY(i));
  for (const i of idx) if (p.getY(i) < ymin + .14) { v.x += p.getX(i); v.y += p.getY(i); v.z += p.getZ(i); n++; }
  return v.multiplyScalar(1 / n);
}
// Umfärben im Shader: Grüntöne -> Uniformfarbe der Seite, Haut auf der Brust -> geschlossene Jacke
function faction(base, side, arm = false, noHelm = false) {   // noHelm: Stahlhelm ausblenden (Generäle tragen eine Schirmmütze)
  const m = base.clone();
  const uni = new THREE.Color(side === 'de' ? 0x8a8f78 : side === 'ab' ? 0xb4ad78 : 0x8c8452);   // ab = Abtrünnige (helles Sand)
  const helm = new THREE.Color(side === 'de' ? 0x6e7363 : side === 'ab' ? 0xbab27c : 0x707040);
  m.onBeforeCompile = sh => {
    sh.uniforms.uUni = { value: uni }; sh.uniforms.uHelm = { value: helm }; sh.uniforms.uArm = { value: arm ? 1 : 0 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vOP; uniform vec3 uUni; uniform vec3 uHelm; uniform int uArm;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        vec3 c = diffuseColor.rgb; float L = dot(c, vec3(.299,.587,.114));
        bool green = c.g > c.r * 1.05 && c.g > c.b * 1.1;
        bool skin = c.r > c.g * 1.12 && c.r > c.b * 1.35;
        bool chest = uArm == 0 ? (vOP.y > -.5 && vOP.y < .4) : (vOP.y > -.47);   // Rumpf rundum (Brust, Schultern, Rücken) und Ärmel bekleiden
        vec3 tgt = (uArm == 0 && vOP.y > .62) ? uHelm : uUni;
        ${noHelm ? 'if (uArm == 0 && !skin && vOP.y > .62) discard;' : ''}
        if (green) c = tgt * (.35 + L * 1.9);
        else if (skin && chest) c = uUni * (.55 + L * 1.1);
        diffuseColor.rgb = c;`);
  };
  m.customProgramCacheKey = () => 'fac-' + side + (arm ? 'a' : '') + (noHelm ? 'g' : '');
  return m;
}

export const GFREADY = (async () => {
  try {
    const gl = await new GLTFLoader().loadAsync(new URL('../assets/modelle/soldat.glb', import.meta.url).href);
    let mesh = null; gl.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; });
    mesh.updateWorldMatrix(true, false);
    const geo = mesh.geometry.clone(); geo.applyMatrix4(mesh.matrixWorld);
    const sp = split(geo);
    const shR = SHOULDER.clone(), shL = SHOULDER.clone().setX(-SHOULDER.x);
    const hR = handCenter(sp.r).sub(shR), hL = handCenter(sp.l).sub(shL);
    sp.r.translate(-shR.x, -shR.y, -shR.z); sp.l.translate(-shL.x, -shL.y, -shL.z);
    for (const g of [sp.body, sp.r, sp.l, ...sp.pieces]) g.computeBoundingSphere();
    const mats = { de: faction(mesh.material, 'de'), al: faction(mesh.material, 'al'), ab: faction(mesh.material, 'ab'), deG: faction(mesh.material, 'de', false, true), alG: faction(mesh.material, 'al', false, true), mod: mesh.material }, armMats = { de: faction(mesh.material, 'de', true), al: faction(mesh.material, 'al', true), ab: faction(mesh.material, 'ab', true) };
    Object.assign(GF, { armMats, pieces: sp.pieces, body: sp.body, armR: sp.r, armL: sp.l, shR, shL, hR, hL, mats, ok: true });
  } catch (e) { console.warn('Soldaten-Modell nicht geladen', e); }
  return GF;
})();
