// 3D-Spieltisch: die generierte Karte als Klemmbaustein-Diorama
// Jedes Feld = Bauplatte mit Gelände-Modell; Missionsziele als Fahnen, Startkanten als farbige Streifen.
// Antippen eines Feldes öffnet dieselbe Info wie in der 2D-Karte. Gerendert wird nur bei Bewegung (spart Akku).
import { THREE, brick, slope, plastic, insignia, buildUnit } from './modelle.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { GF } from './glbfig.js';
import { lights, envFor } from './foto.js';
import { TERRAIN, terrain, G, HALF, sandbag, R } from './gelaende.js';

const CELL = 1.6, GAP = .06;
function flag(g, y = 0, col = 0xc91a1a) {
  const f = G(); f.position.set(.55, y, -.55); g.add(f);
  brick(f, .05, 1.4, .05, 0xd8d0bc, 0, .7, 0, { studs: false });
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32, 8, 1), new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: .5 })); cloth.position.set(.26, 1.24, 0); f.add(cloth);
  f.userData.cloth = cloth; return f;
}
// Stacheldraht-Rolle wie im echten Aufbau: graue Drahtspirale zwischen zwei Kreuzen aus dunkelorangen 1x4-Platten (Noppen nach außen)
const WIRE_ORANGE = 0x9c5812, WIRE_GREY = 0x9ca1a5;
export function wireRoll(p, x, z, ry, s = .55) {
  const u = G(); u.position.set(x, 0, z); u.rotation.y = ry; u.scale.setScalar(s); p.add(u);
  const CY0 = .37, END = .36;
  for (const sx of [-1, 1]) {
    for (const a of [Math.PI / 4, -Math.PI / 4]) brick(u, .8, .08, .2, WIRE_ORANGE, sx * END, CY0, 0, { rot: [a, 0, -sx * HALF], r: .015 });
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .14, 12), plastic(WIRE_GREY)); pin.rotation.z = HALF; pin.position.set(sx * (END - .03), CY0, 0); u.add(pin);
  }
  const R0 = .27, n = 6, ring = new THREE.TorusGeometry(R0, .018, 6, 28), barb = new THREE.BoxGeometry(.03, .07, .03);
  for (let i = 0; i < n; i++) {
    const rg = G(); rg.position.set(-END + .1 + i * (2 * END - .2) / (n - 1), R0 + .03, 0); rg.rotation.set(i * .4, 0, .12); u.add(rg);   // leicht schräg = Spirale
    const m = new THREE.Mesh(ring, plastic(WIRE_GREY)); m.rotation.y = HALF; rg.add(m);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, b = new THREE.Mesh(barb, plastic(WIRE_GREY)); b.position.set(0, Math.cos(a) * R0, Math.sin(a) * R0); b.rotation.x = a; rg.add(b); }
  }
  return u;
}
// Oldtimer-Cabrio wie im echten Aufbau: weiße Karosserie mit Noppen, schwarze Kotflügel und Trittbretter, grauer Kühlergrill,
// runde weiße Scheinwerfer mit Glas, grauer Stoßfänger, Rahmen der Windschutzscheibe, braun-beige Sitze
export function oldCar(p, x, z, ry, s = .45) {
  const c = G(); c.position.set(x, 0, z); c.rotation.y = ry; c.scale.setScalar(s); p.add(c);
  const W = 0xf2eee2, K = 0x1b1b1b, LG = 0xa3a8ab, DG = 0x6b6e72, M = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, plastic(col)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); c.add(m); return m; };
  for (const wx of [-.52, .5]) for (const sz of [-1, 1]) {
    M(new THREE.CylinderGeometry(.19, .19, .14, 24), K, wx, .19, sz * .36, HALF);                 // Reifen
    M(new THREE.CylinderGeometry(.1, .1, .15, 20), LG, wx, .19, sz * .36, HALF);                  // Felge
    M(new THREE.CylinderGeometry(.24, .24, .2, 24, 1, true, -HALF, Math.PI), K, wx, .2, sz * .36, HALF, 0, 0).material = plastic(K, { side: THREE.DoubleSide });   // Kotflügel
  }
  for (const sz of [-1, 1]) brick(c, .62, .05, .16, K, -.01, .15, sz * .38, { studs: false });   // Trittbrett
  brick(c, 1.5, .24, .58, W, 0, .32, 0, { studs: false });                                     // Karosserie
  brick(c, .5, .1, .5, W, .5, .49, 0);                                                         // Motorhaube mit Noppen
  brick(c, .5, .12, .58, W, -.5, .5, 0);                                                       // Heck mit Noppen
  for (const sz of [-1, 1]) brick(c, .5, .12, .06, W, 0, .5, sz * .26, { studs: false });       // Seitenwände am Sitzraum
  brick(c, .5, .03, .46, 0xd9c08a, 0, .45, 0, { studs: false });                               // Boden
  brick(c, .14, .16, .46, 0x8a5a2e, -.16, .52, 0, { studs: false });                           // Sitzbank
  brick(c, .06, .14, .46, 0x8a5a2e, -.23, .62, 0, { studs: false });
  for (const sz of [-1, 1]) M(new THREE.CylinderGeometry(.018, .018, .26, 8), LG, .24, .68, sz * .22);   // Rahmen Windschutzscheibe
  M(new THREE.CylinderGeometry(.018, .018, .46, 8), LG, .24, .8, 0, HALF);
  M(new THREE.CylinderGeometry(.018, .018, .46, 8), LG, .24, .56, 0, HALF);
  brick(c, .06, .28, .24, DG, .78, .4, 0, { studs: false });                                  // Kühlergrill
  for (let i = 0; i < 5; i++) brick(c, .01, .025, .2, 0x2a2b2d, .815, .3 + i * .05, 0, { studs: false });
  for (const sz of [-1, 1]) {
    M(new THREE.SphereGeometry(.08, 18, 12, 0, Math.PI * 2, 0, HALF), W, .8, .46, sz * .21, 0, 0, -HALF);   // Scheinwerfergehäuse
    const gl = M(new THREE.CylinderGeometry(.055, .055, .03, 18), 0xffffff, .82, .46, sz * .21, 0, 0, HALF);
    gl.material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .02, transmission: .85, transparent: true, opacity: .7, clearcoat: 1 });
  }
  brick(c, .08, .07, .72, LG, .86, .2, 0, { studs: false });                                   // Stoßfänger
  brick(c, .03, .05, .05, 0xb01e2a, -.76, .4, .2, { studs: false });                           // Rücklicht
  c.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return c;
}
// Kutsche wie im echten Aufbau: brauner Wagen mit Wänden aus runden 1x1-Steinen (Noppen oben), sandfarbener Boden,
// vier goldene Speichenräder, graue Deichsel
export function cart(p, x, z, ry, s = .45) {
  const c = G(); c.position.set(x, 0, z); c.rotation.y = ry; c.scale.setScalar(s); p.add(c);
  const BR = 0x6a3a18, GO = 0xb89a2c, M = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, plastic(col)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; c.add(m); return m; };
  for (const wx of [-.42, .42]) for (const sz of [-1, 1]) {
    const w = G(); w.position.set(wx, .32, sz * .44); c.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .03, 8, 32), plastic(GO)); rim.castShadow = true; w.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .1, 14), plastic(GO)); hub.rotation.x = HALF; w.add(hub);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, sp = new THREE.Mesh(new THREE.BoxGeometry(.025, .26, .025), plastic(GO)); sp.position.set(Math.cos(a) * .15, Math.sin(a) * .15, 0); sp.rotation.z = a - HALF; w.add(sp); }
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, n = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 4), plastic(GO)); n.position.set(Math.cos(a) * .3, Math.sin(a) * .3, sz * .03); w.add(n); }   // Nieten am Reifen
  }
  M(new THREE.CylinderGeometry(.03, .03, .96, 8), 0x5a3a22, -.42, .32, 0, HALF); M(new THREE.CylinderGeometry(.03, .03, .96, 8), 0x5a3a22, .42, .32, 0, HALF);   // Achsen
  brick(c, 1.24, .06, .64, 0xd9c08a, 0, .42, 0, { studs: false });                                // Boden
  const log = new THREE.CylinderGeometry(.085, .085, .3, 16), stud = new THREE.CylinderGeometry(.05, .05, .04, 12);
  const post = (x, z) => { M(log, BR, x, .6, z); M(stud, BR, x, .77, z); };
  for (let i = 0; i < 7; i++) for (const sz of [-1, 1]) post(-.54 + i * .18, sz * .26);            // Seitenwände
  for (const sx of [-1, 1]) for (const z of [-.09, .09]) post(sx * .6, z);                          // Stirnwände
  for (const sz of [-1, 1]) for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(.04, .04, .06, 10), BR, sx * .66, .72, sz * .2, 0, 0, HALF);   // Ösen
  for (const sz of [-1, 1]) M(new THREE.BoxGeometry(.6, .05, .05), LGRC, .95, .38, sz * .13, 0, sz * .2, 0);   // Deichsel (Dreieck)
  M(new THREE.BoxGeometry(.3, .05, .05), LGRC, .85, .38, 0, 0, HALF, 0);
  M(new THREE.CylinderGeometry(.05, .05, .14, 12), LGRC, 1.26, .38, 0, 0, 0, HALF);
  return c;
}
const LGRC = 0xa3a8ab;
// Jeep mit Anhänger wie im echten Aufbau: oliv, weißer Stern auf der Haube, umgeklappte Windschutzscheibe, graue Sitze,
// Axt an der Seite, Antenne, Anhänger mit sandfarbenem Boden, Stern und rotem Rücklicht
export function jeep(p, x, z, ry, s = .4) {
  const j = G(); j.position.set(x, 0, z); j.rotation.y = ry; j.scale.setScalar(s); p.add(j);
  const OL = 0x5f5934, OL2 = 0x4c472a, GY = 0x6f6d66, K = 0x1b1b1b, M = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, plastic(col)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; j.add(m); return m; };
  const B = (a, b, c) => new THREE.BoxGeometry(a, b, c);
  const wheel = (wx, wz) => { M(new THREE.CylinderGeometry(.17, .17, .13, 24), K, wx, .17, wz, HALF); M(new THREE.CylinderGeometry(.1, .1, .135, 20), OL, wx, .17, wz, HALF); M(new THREE.CylinderGeometry(.03, .03, .14, 10), OL2, wx, .17, wz, HALF); };
  for (const sz of [-1, 1]) { wheel(.42, sz * .32); wheel(-.38, sz * .32); M(B(.42, .04, .16), OL, .42, .36, sz * .32); M(B(.36, .04, .16), OL, -.38, .36, sz * .32); }   // Räder + flache Kotflügel
  brick(j, .8, .22, .5, OL, -.15, .4, 0, { studs: false, r: .015 });                                 // Wanne
  for (const sz of [-1, 1]) { brick(j, .8, .06, .06, OL, -.15, .54, sz * .22, { studs: false }); for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(.025, .025, .02, 10), OL, -.5 + i * .23, .58, sz * .22); }   // Wannenrand mit kleinen Noppen
  brick(j, .5, .2, .48, OL, .45, .44, 0, { studs: false, r: .015 });                                 // Motorhaube
  insignia(j, 'al', .34, .45, .545, 0, 0, -HALF);                                                    // weißer Stern
  for (let i = 0; i < 6; i++) M(B(.01, .16, .025), OL2, .705, .42, -.13 + i * .052);                 // Kühlergrill
  M(B(.05, .05, .62), OL, .74, .25, 0); for (const sz of [-1, 1]) M(B(.1, .03, .03), OL, .7, .27, sz * .25, 0, 0, .3);   // Stoßstange
  M(B(.03, .03, .5), OL, .22, .56, 0); M(B(.22, .03, .03), OL, .33, .56, .23); M(B(.22, .03, .03), OL, .33, .56, -.23); M(B(.03, .03, .5), OL, .44, .56, 0); M(B(.03, .03, .5), OL, .33, .565, 0);   // umgeklappte Scheibe
  M(new THREE.TorusGeometry(.06, .012, 6, 16), K, .12, .6, -.1, 0, HALF, .5);                        // Lenkrad
  for (const sz of [-1, 1]) { M(B(.14, .05, .16), GY, .0, .52, sz * .12); M(B(.04, .16, .16), GY, -.08, .6, sz * .12, 0, 0, .15); }   // Vordersitze
  M(B(.16, .05, .4), GY, -.38, .52, 0); M(B(.04, .15, .4), GY, -.47, .6, 0);                         // Rückbank
  M(new THREE.CylinderGeometry(.012, .012, .32, 8), 0xb08a52, .2, .4, .255, 0, 0, HALF); M(B(.06, .07, .015), 0xb8bcc0, .05, .4, .258);   // Axt
  M(new THREE.CylinderGeometry(.008, .012, .55, 6), K, -.52, .78, .22, .15, 0, .15);                 // Antenne
  M(new THREE.CylinderGeometry(.02, .02, .3, 8), OL2, -.68, .3, 0, 0, 0, HALF);                      // Deichsel
  const tr = G(); tr.position.set(-1.12, 0, 0); j.add(tr);                                          // Anhänger
  const T = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, plastic(col)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; tr.add(m); return m; };
  T(B(.6, .04, .46), 0xc8a46a, 0, .3, 0);                                                            // Boden
  for (const sz of [-1, 1]) { T(B(.62, .2, .05), OL, 0, .38, sz * .235); T(B(.3, .04, .14), OL, 0, .3, sz * .3); }
  for (const sx of [-1, 1]) T(B(.05, .2, .42), OL, sx * .29, .38, 0);
  for (const sz of [-1, 1]) { T(new THREE.CylinderGeometry(.15, .15, .1, 22), K, 0, .15, sz * .3, HALF); T(new THREE.CylinderGeometry(.09, .09, .105, 18), OL, 0, .15, sz * .3, HALF); }
  insignia(tr, 'al', .14, .08, .36, .262); T(new THREE.CylinderGeometry(.035, .035, .02, 14), 0xff5a1a, -.316, .38, .17, 0, 0, HALF);   // Stern + Rücklicht
  return j;
}
// Flugzeugwrack wie im echten Aufbau: Sturzkampfbomber in Sand/Grün-Tarnung, zerbrochen in Nase, Mittelteil mit Kanzel, Heck,
// ein Flügel schräg aufgestellt, der zweite abgebrochen am Boden, Bombe, Fahrwerksverkleidung, lose Steine.
// Dazu Rauch aus runden grauen 1x1-Steinen (wie beim Feuer-Bildschirm), der auf der Karte langsam aufsteigt.
export function wreck(p, x, z, ry, s = .3, smokes = null) {
  const w = G(); w.position.set(x, 0, z); w.rotation.y = ry; w.scale.setScalar(s); p.add(w);
  const SA = 0xc9b77c, GR = 0x6b7d4e, M = (par, geo, col, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, typeof col === 'number' ? plastic(col) : col); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; par.add(m); return m; };
  const BX = (a, b, c) => new THREE.BoxGeometry(a, b, c);
  const camo = (par, L, D, y, pats) => { for (const [px, pz, pw, pd] of pats) M(par, BX(pw * L, .012, pd * D), GR, px * L, y, pz * D); };
  // 1) Flügel schräg aufgestellt, mit Balkenkreuz
  const wa = G(); wa.position.set(-.3, .55, -.9); wa.rotation.set(-.55, .5, 0); w.add(wa);
  M(wa, BX(1.0, .1, 2.2), SA, 0, 0, 0); camo(wa, 1.0, 2.2, .056, [[-.2, .3, .5, .25], [.25, -.1, .45, .3], [-.15, -.35, .6, .2], [.2, .4, .4, .15]]);
  insignia(wa, 'de', .5, 0, .065, .55, 0, -HALF);
  // 2) Mittelteil mit Glaskanzel
  const mid = G(); mid.position.set(.1, .22, 0); mid.rotation.set(.08, .5, .05); w.add(mid);
  M(mid, BX(1.1, .4, .42), SA, 0, 0, 0); M(mid, BX(.5, .41, .43), GR, .25, 0, 0);
  const can = M(mid, new THREE.CapsuleGeometry(.16, .6, 6, 14), new THREE.MeshPhysicalMaterial({ color: 0xe6f0f2, roughness: .05, transmission: .7, transparent: true, opacity: .5, clearcoat: 1 }), 0, .24, 0, 0, 0, HALF);
  for (let i = 0; i < 5; i++) M(mid, new THREE.TorusGeometry(.165, .012, 4, 16, Math.PI), SA, -.3 + i * .15, .24, 0, 0, HALF, 0);
  M(mid, new THREE.CylinderGeometry(.015, .015, .3, 6), 0x1b1b1b, -.45, .38, 0, 0, 0, -.6);   // MG des Bordschützen
  // 3) Nase abgerissen, mit Spinner und Propeller
  const nose = G(); nose.position.set(1.05, .2, .35); nose.rotation.set(0, .9, .15); w.add(nose);
  M(nose, BX(.8, .38, .4), SA, 0, 0, 0); M(nose, BX(.35, .385, .405), GR, -.15, 0, 0); M(nose, BX(.5, .1, .38), 0xe8e6e0, .05, -.2, 0);
  M(nose, new THREE.ConeGeometry(.15, .3, 18), 0xd23a14, .55, 0, 0, 0, 0, -HALF);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + .3, bl = G(); bl.position.set(.45, 0, 0); bl.rotation.x = a; nose.add(bl); M(bl, BX(.03, .7, .12), 0x1b1b1b, 0, .38, 0); }
  for (let i = 0; i < 5; i++) M(nose, new THREE.CylinderGeometry(.025, .025, .05, 8), 0x8a4f22, -.15 + i * .08, .02, .21, HALF);
  // 4) Heck abgeknickt mit Leitwerk
  const tail = G(); tail.position.set(-1.05, .14, -.25); tail.rotation.set(.05, -.35, -.06); w.add(tail);
  M(tail, BX(1.2, .24, .24), SA, 0, 0, 0); M(tail, BX(.4, .245, .245), GR, -.1, 0, 0); M(tail, BX(.12, .25, .25), 0xf4f4f0, .3, 0, 0);
  M(tail, BX(.4, .5, .04), SA, -.5, .3, 0, 0, 0, .2); M(tail, BX(.15, .3, .045), GR, -.55, .35, 0);
  M(tail, BX(.35, .04, 1.1), SA, -.48, .08, 0); camo(tail, .35, 1.1, .1, [[0, .3, .6, .25], [0, -.3, .6, .2]]);
  // 5) zweiter Flügel abgebrochen am Boden
  const wb = G(); wb.position.set(.35, .05, 1.05); wb.rotation.set(0, -.15, .04); w.add(wb);
  M(wb, BX(1.6, .08, .75), SA, 0, 0, 0); camo(wb, 1.6, .75, .046, [[-.3, 0, .3, .9], [.15, .2, .25, .5], [.35, -.2, .2, .5]]);
  insignia(wb, 'de', .42, .45, .05, 0, 0, -HALF);
  // 6) Bombe, Fahrwerk, lose Steine
  M(w, new THREE.CapsuleGeometry(.08, .3, 6, 12), 0x1b1b1b, .55, .08, -.45, 0, .4, HALF);
  const gear = G(); gear.position.set(.95, 0, 1.1); gear.rotation.y = .6; w.add(gear);
  M(gear, new THREE.CapsuleGeometry(.1, .25, 6, 12), SA, 0, .16, 0, 0, 0, HALF).scale.set(1, 1, .6);
  M(gear, new THREE.CylinderGeometry(.1, .1, .06, 16), 0x1b1b1b, .05, .1, .07, HALF); M(gear, new THREE.CylinderGeometry(.05, .05, .07, 12), LGRC, .05, .1, .07, HALF);
  for (const [bx, bz, c] of [[-.4, .75, SA], [.85, -.6, GR], [-1.4, .5, SA], [-.1, -1.5, GR]]) brick(w, .2, .06, .14, c, bx, .03, bz, { rot: [0, R() * 3, 0] });
  // 7) Rauch aus runden 1x1-Steinen über der Bruchstelle
  const puffGeo = new THREE.CylinderGeometry(.11, .11, .1, 18), studGeo = new THREE.CylinderGeometry(.06, .06, .05, 14);
  // drei Rauchsäulen: Rumpf (dick, dunkel), abgerissene Nase, Flügel – zusammen viel mehr Rauch
  for (const [cx, cz, n, h, s0, dark] of [[.1, 0, 18, 2.6, .9, 1], [1.05, .35, 12, 2.0, .7, 1], [-.3, -.9, 9, 1.6, .6, 0]]) {
    for (let i = 0; i < n; i++) {
      const c = dark ? [0x3e4044, 0x5b6066, 0x2a2c2e, 0x8a8f94][i % 4] : [0x8a8f94, 0xa6abaf, 0x5b6066, 0xc8ccce][i % 4], m = G(); m.userData.puff = true;
      m.add(new THREE.Mesh(puffGeo, plastic(c))); const st = new THREE.Mesh(studGeo, plastic(c)); st.position.y = .075; m.add(st); w.add(m);
      const pf = { m, ph: i / n, x0: cx + (R() - .5) * .25, z0: cz + (R() - .5) * .25, wob: R() * 6, h, s0 };
      const k = pf.ph; m.position.set(pf.x0, .3 + k * h, pf.z0); m.scale.setScalar(s0 + k * 1.4);
      if (smokes) smokes.push(pf);
    }
  }
  return w;
}
// Abtrünnige wie im echten Aufbau: zwei sandfarbene Platten auf einem Feld, links in Ruhestellung (Gewehr gesenkt), rechts im Anschlag
function renegade(p, x, z, aim) {
  const f = buildUnit('rif', 'al'); f.scale.setScalar(.17); f.position.set(x, .03, z); p.add(f);
  if (f.userData.shadow) f.remove(f.userData.shadow);
  if (GF.ok && GF.mats.ab) f.traverse(o => { if (o.material === GF.mats.al) o.material = GF.mats.ab; else if (o.material === GF.armMats.al) o.material = GF.armMats.ab; });
  const { armL, armR, weapon: w } = f.userData;   // das Gewehr hängt an der rechten Hand: Armwinkel + Gegendrehung in der Hand
  const pose = (r, l, wr) => { if (armR) armR.rotation.x = r; if (armL) armL.rotation.x = l; if (w) w.rotation.x += wr; };
  if (aim) { pose(-1.1, -1.2, 1.1); f.rotation.y = R() * .3 - .15; }   // im Anschlag: Gewehr waagerecht auf Schulterhöhe
  else pose(-.15, -.1, 1.55);                                          // Ruhe: Gewehr senkrecht nach unten
  return f;
}
export function renegades(g) {
  const TANP = 0xcfc39a;
  const a = G(); a.position.set(-.38, 0, .05); a.rotation.y = .08; g.add(a); brick(a, .66, .03, .48, TANP, 0, .015, 0);
  for (const [x, z] of [[-.24, -.12], [-.08, -.12], [.08, -.12], [.24, -.12], [-.18, .12], [0, .12], [.18, .12]]) renegade(a, x, z, false);
  const b = G(); b.position.set(.4, 0, .12); b.rotation.y = -.35; g.add(b); brick(b, .66, .03, .48, TANP, 0, .015, 0);
  for (const [x, z] of [[-.24, -.14], [-.08, -.16], [.08, -.14], [.24, -.16], [-.14, .1], [.04, .12], [.22, .1]]) renegade(b, x, z, true);
  return [a, b];
}
// Freien Platz für eine Felderweiterung suchen: nichts darf in Gebäuden, Bäumen, Fahrzeugen oder der Flagge stecken
function placeProp(g, e, w, d) {
  g.updateMatrixWorld(true);
  const gi = new THREE.Matrix4().copy(g.matrixWorld).invert(), obs = [], tmp = new THREE.Box3();
  g.traverse(o => { if (!o.isMesh || o.isSprite) return; for (let p = o; p && p !== g; p = p.parent) if (p === e) return;
    tmp.setFromObject(o).applyMatrix4(gi); if (tmp.max.y > .1) obs.push(tmp.clone()); });   // flaches Bodenzeug (Gras, Fliesen, Platte) zählt nicht
  // Raster (4 cm): belegte Zellen des Feldes und Umriss der Erweiterung; Lage und Drehung (8 Richtungen) durchprobieren
  const cs = .04, M = .03, nx = Math.floor(w / cs), nz = Math.floor(d / cs), cx = w / 2, cz = d / 2, x0 = e.position.x, z0 = e.position.z;
  const blocked = new Uint8Array(nx * nz);
  for (const b of obs) for (let i = Math.max(0, Math.floor((b.min.x - M + cx) / cs)); i <= Math.min(nx - 1, Math.floor((b.max.x + M + cx) / cs)); i++)
    for (let j = Math.max(0, Math.floor((b.min.z - M + cz) / cs)); j <= Math.min(nz - 1, Math.floor((b.max.z + M + cz) / cs)); j++) blocked[j * nx + i] = 1;
  let best = null;
  for (let k = 0; k < 8; k++) {
    e.rotation.y = k * Math.PI / 4; e.position.set(0, e.position.y, 0); g.updateMatrixWorld(true);
    const mask = new Set();
    e.traverse(o => { if (!o.isMesh || o.isSprite) return; tmp.setFromObject(o).applyMatrix4(gi); if (tmp.isEmpty() || tmp.max.y < .02) return;
      for (let i = Math.floor(tmp.min.x / cs); i <= Math.floor(tmp.max.x / cs); i++) for (let j = Math.floor(tmp.min.z / cs); j <= Math.floor(tmp.max.z / cs); j++) mask.add(i + ',' + j); });
    if (!mask.size) continue;
    const cells = [...mask].map(s => s.split(',').map(Number)); let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
    for (const [i, j] of cells) { i0 = Math.min(i0, i); i1 = Math.max(i1, i); j0 = Math.min(j0, j); j1 = Math.max(j1, j); }
    const oi = Math.floor(cx / cs), oj = Math.floor(cz / cs);   // Zelle der Feldmitte
    for (let si = -oi - i0; si + oi + i1 < nx; si++) for (let sj = -oj - j0; sj + oj + j1 < nz; sj++) {
      let s = 0; for (const [i, j] of cells) s += blocked[(j + sj + oj) * nx + (i + si + oi)];
      const x = si * cs, z = sj * cs, sc = s + Math.hypot(x - x0, z - z0) * .01 + (k ? .002 : 0);   // möglichst frei, sonst nah an der alten Ecke
      if (!best || sc < best.sc) best = { sc, x, z, ry: k * Math.PI / 4 };
    }
  }
  if (best) { e.rotation.y = best.ry; e.position.set(best.x, e.position.y, best.z); } else { e.rotation.y = 0; e.position.set(x0, e.position.y, z0); }
}
export function extProp(g, name, w = 1.54, d = 1.54) {
  // Mehrteilige Erweiterungen: jedes Teil sucht sich einzeln einen freien Platz (die schon gesetzten zählen als belegt)
  if (/Abtr/.test(name)) { const parts = renegades(g); for (const p of parts) placeProp(g, p, w, d); return parts[0]; }
  if (/Stachel/.test(name)) { const parts = [wireRoll(g, -.55, .52, .12), wireRoll(g, 0, .45, -.08), wireRoll(g, -.28, .08, .25)]; for (const p of parts) placeProp(g, p, w, d); return parts[0]; }
  const e = G(); e.position.set(-.5, 0, .5); g.add(e);
  if (/Auto/.test(name)) oldCar(e, .25, -.05, .3);
  else if (/Jeep/.test(name)) jeep(e, .55, -.15, .3, .38);
  else if (/Flugzeug/.test(name)) wreck(e, .4, -.35, .3, .32, S3 && S3.smokes);
  else if (/Kutsche/.test(name)) cart(e, .3, -.1, .35);
  else { for (let i = 0; i < 4; i++) sandbag(e, i * .17, .07, 0); }
  placeProp(g, e, w, d);
  return e;
}

// Schwebendes Schild (zeigt immer zur Kamera, liegt über allem)
function tag(text, bg, fg = '#fff') {
  const c = document.createElement('canvas'), x = c.getContext('2d'), f = '700 44px "Stardos Stencil","Black Ops One",Impact,sans-serif';
  x.font = f; const tw = Math.ceil(x.measureText(text).width); c.width = tw + 56; c.height = 76;
  x.font = f; x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.roundRect(4, 8, c.width - 8, 64, 14); x.fill();
  x.fillStyle = bg; x.beginPath(); x.roundRect(2, 2, c.width - 8, 64, 14); x.fill(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 4; x.stroke();
  x.fillStyle = fg; x.textBaseline = 'middle'; x.fillText(text, 26, 36);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.renderOrder = 10;
  const h = .42; sp.scale.set(h * c.width / c.height, h, 1); return sp;
}
// ---------- Szene ----------
let S3 = null;
function setup(box) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });   // Bild bleibt stehen, auch wenn nur bei Bewegung gezeichnet wird
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = .95;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(r.domElement);
  const scene = new THREE.Scene(); lights(scene, r);
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(-6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); sun.shadow.bias = -.0008; scene.add(sun);
  const cam = new THREE.PerspectiveCamera(35, 1, 1, 120);   // größeres near = genauere Tiefe (weniger Flackern am Handy)
  const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = 1.35; ctl.minDistance = 4; ctl.maxDistance = 40; ctl.enablePan = true;
  ctl.addEventListener('change', () => S3 && (S3.dirty = true));
  S3 = { r, scene, cam, ctl, box, board: null, dirty: true, flags: [], smokes: [] };
  // Antippen = Feld-Info (nur wenn nicht gezogen wurde)
  let down = null;
  // Erst beim echten Klick öffnen: bei 'pointerup' würde am Handy der nachfolgende Klick das Fenster gleich wieder schließen
  let moved = 0, multi = false;
  r.domElement.addEventListener('pointerdown', e => { if (e.isPrimary) { down = [e.clientX, e.clientY]; moved = 0; multi = false; } else multi = true; });
  r.domElement.addEventListener('pointermove', e => { if (down && e.isPrimary) moved = Math.max(moved, Math.hypot(e.clientX - down[0], e.clientY - down[1])); });
  r.domElement.addEventListener('click', e => {
    if (!down || multi || Math.max(moved, Math.hypot(e.clientX - down[0], e.clientY - down[1])) > (e.pointerType === 'mouse' ? 6 : 14)) return;
    down = null;
    const rc = new THREE.Raycaster(), b = r.domElement.getBoundingClientRect();
    rc.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), cam);
    const hit = rc.intersectObjects(S3.board ? [S3.board] : [], true)[0]; if (!hit) return;
    let o = hit.object; while (o && o.userData.pi == null) o = o.parent;
    if (o && o.userData.tap) { const el = document.querySelector(`#map .cell[data-pi="${o.userData.pi}"]`); if (el) el.click(); }
  });
  new ResizeObserver(resize).observe(box); resize();
  (function loop() { requestAnimationFrame(loop); if (!S3 || box.offsetParent === null || document.hidden) return; const t = performance.now() / 1000; ctl.update();
    for (const pf of S3.smokes) { const k = (t * .22 + pf.ph) % 1; pf.m.position.set(pf.x0 + Math.sin(t * .8 + pf.wob) * .18 * k, .3 + k * (pf.h || 1.6), pf.z0 + k * .25); pf.m.scale.setScalar((pf.s0 || .7) + k * 1.4); pf.m.visible = !(S3.drops && S3.drops.length); S3.dirty = true; }   // Rauch steigt auf (während des Aufbaus versteckt)
    if (S3.drops && S3.drops.length) stepDrops(t - S3.dropT0);   // Aufbau Stein für Stein
    const L = S3.live; if (L) {
      for (const o of L.sway) { o.rotation.z = Math.sin(t * 1.3 + o.userData.sway) * .04; o.rotation.x = Math.cos(t * 1.1 + o.userData.sway) * .025; }
      for (const o of L.sweep) o.rotation.y = Math.sin(t * .6) * 1.1;
      for (const o of L.flutter) o.rotation.y = Math.sin(t * 3.1) * .3 + Math.sin(t * 7.3) * .08;
      for (const o of L.wave) { const k = (t * .3 + o.userData.wave.ph) % 1; o.position.x = o.userData.wave.x0 - k * .14; o.scale.z = 1 - k * .5; }
      for (const pf of L.puffs) { const k = (t * pf.sp + pf.ph) % 1;   // jeder Stein mit eigenem Versatz, Tempo und Schwanken
        pf.m.position.set(pf.p0.x + pf.ox * k * 3 - k * .16 + Math.sin(t * 1.3 + pf.wob) * pf.sw * 1.2 * k, pf.p0.y + k * .85, pf.p0.z + pf.oz * k * 3 + Math.cos(t * 1.1 + pf.wob) * pf.sw * .9 * k); pf.m.scale.setScalar(.6 + k * .8); pf.m.visible = k > .02 && k < .97 && !(S3.drops && S3.drops.length); }
      if (L.sway.length || L.sweep.length || L.flutter.length || L.wave.length || L.puffs.length) S3.dirty = true;
    }
    for (const f of S3.flags) { const p = f.userData.cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + .25; p.setZ(i, Math.sin(t * 5 + x * 9) * .05 * x * 2); } p.needsUpdate = true; S3.dirty = true; }
    if (S3.dirty) { r.render(scene, cam); S3.dirty = false; } })();
}
function stepDrops(t) {
  let busy = false;
  for (const dr of S3.drops) {
    for (const p of dr.pcs) { const e = t - p.t0; let f = 0;
      if (e <= 0) f = 1; else if (e < .3) { const k = e / .3; f = 1 - k * k; }
      p.c.visible = e > 0; p.c.position.copy(p.base).addScaledVector(p.dv, f); p.c.rotation.y = p.r0 + p.spin * f; }
    if (t < dr.end) busy = true; else for (const s of dr.sprites) s.visible = true;
  }
  if (!busy) { for (const dr of S3.drops) for (const p of dr.pcs) { p.c.visible = true; p.c.position.copy(p.base); p.c.rotation.y = p.r0; } S3.drops = []; }
  S3.dirty = true;
}
function resize() { if (!S3) return; const w = S3.box.clientWidth, h = S3.box.clientHeight; if (!w || !h) return; S3.r.setSize(w, h, false); S3.cam.aspect = w / h; S3.cam.updateProjectionMatrix(); S3.dirty = true; }

function build() {
  if (typeof current === 'undefined' || !current || current.error) return;
  const box = document.getElementById('map3d'); if (!box) return;
  if (!S3) setup(box);
  if (S3.board) { S3.scene.remove(S3.board); S3.board.traverse(o => { if (o.geometry && !o.geometry.parameters?.cached) o.geometry.dispose?.(); }); }
  S3.flags = []; S3.smokes = []; S3.live = { sway: [], sweep: [], flutter: [], wave: [], puffs: [] };
  const fresh = S3.seed !== current.seed; S3.seed = current.seed; S3.drops = [];   // neue Karte: Felder fallen nacheinander aufs Brett
  const board = G(); S3.board = board; S3.scene.add(board);
  const port = typeof isPortrait === 'function' ? isPortrait() : box.clientHeight > box.clientWidth;   // gleiche Drehung wie die 2D-Karte
  box.classList.toggle('quer', !port); resize();
  // Rastermaße; hochkant wird das Brett gedreht (lange Seite nach hinten)
  const W = COLS * CELL, D = ROWS * CELL;
  const toXZ = (r, c) => [(c + .5) * CELL - W / 2, (r + .5) * CELL - D / 2];
  // Tischplatte
  brick(board, W + 1.2, .2, D + 1.2, 0x3a2e22, 0, -.14, 0, { studs: false }).children[0].receiveShadow = true;
  for (const sz of [-1, 1]) { brick(board, W + 1.2, .22, .2, 0x5a4030, 0, .0, sz * (D / 2 + .5)); brick(board, .2, .22, D + .8, 0x5a4030, sz * (W / 2 + .5), .0, 0); }
  const ms = typeof missionSetup === 'function' ? missionSetup() : null;
  current.pieces.forEach((x, pi) => {
    const rs = x.cells.map(i => Math.floor(i / COLS)), cs = x.cells.map(i => i % COLS);
    const r0 = Math.min(...rs), r1 = Math.max(...rs), c0 = Math.min(...cs), c1 = Math.max(...cs);
    const w = (c1 - c0 + 1) * CELL - GAP, d = (r1 - r0 + 1) * CELL - GAP;
    const [x0, z0] = toXZ(r0, c0), [x1, z1] = toXZ(r1, c1);
    const g = G(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); board.add(g);
    if (fresh) S3.drops.push({ g, d: (r0 + c0) * .07 + Math.random() * .05 });
    const plate = brick(g, w, .08, d, TERRAIN[x.p.key] || 0x86a84a, 0, -.04, 0); plate.traverse(o => o.receiveShadow = true);
    const t = G(); t.position.y = .025; g.add(t); terrain(x.p.key, t, w, d);
    // Alle Felder ohne feste Ausrichtung zufällig drehen (fest je Karte): einzeln in 4 Richtungen, lange Teile um 0° oder 180°
    if (!['strand', 'zug', 'kirche', 'hafen', 'bunker'].includes(x.p.key)) {
      const hr = (((current.seed | 0) ^ Math.imul(pi + 7, 2246822519)) >>> 0) >>> 3;
      t.rotation.y = Math.abs(w - d) > .1 ? (hr % 2) * Math.PI : (hr % 4) * HALF;
    }
    if (x.p.key === 'strand' && g.position.x < 0) t.rotation.y = Math.PI;   // Wasser zum Kartenrand
    if (x.p.key === 'zug') { const p = w > d ? g.position.z : g.position.x; if (p > .01) t.rotation.y = Math.PI; }   // Gleis zum Kartenrand
    if (x.p.key === 'hafen') {   // Schiff liegt im Modell auf der langen Seite +z (quer: +x) – immer zum nächsten Spielfeldrand drehen
      const p = w > d ? g.position.z : g.position.x;
      if (p < -.01) t.rotation.y = Math.PI;                       // in der Mittelspalte gibt es keinen Rand an der langen Seite: bleibt wie gebaut
    }
    if (x.p.key === 'bunker') {   // zufällige Richtung (fest je Karte), die Schießscharte (+z im Modell) zeigt nie zum Spielfeldrand
      const ok = [0, HALF, Math.PI, -HALF].filter(a => { const dx = Math.round(Math.sin(a)), dz = Math.round(Math.cos(a));
        return !(dx > 0 && g.position.x + CELL / 2 > W / 2 - .05) && !(dx < 0 && g.position.x - CELL / 2 < -W / 2 + .05) && !(dz > 0 && g.position.z + CELL / 2 > D / 2 - .05) && !(dz < 0 && g.position.z - CELL / 2 < -D / 2 + .05); });
      // bevorzugt auf offenes Gelände zielen: Flachland, See, leere Straße, Strand oder Wald – sonst auf ein anderes Feld
      const OPEN = new Set(['flach', 'see', 'strasse', 'strand', 'wald']), cell = x.cells[0], r0 = Math.floor(cell / COLS), c0 = cell % COLS;
      const keyAt = (r, c) => { const i = r * COLS + c, q = current.pieces.find(pp => pp.cells.includes(i)); return q ? q.p.key : null; };
      const good = ok.filter(a => OPEN.has(keyAt(r0 + Math.round(Math.cos(a)), c0 + Math.round(Math.sin(a)))));
      const pick = good.length ? good : ok, h = (((current.seed | 0) ^ Math.imul(pi + 1, 2654435761)) >>> 0) % 1000;
      if (pick.length) t.rotation.y = pick[h % pick.length];
    }
    if (x.p.key === 'kirche') { const p = w > d ? g.position.z : g.position.x; if (p > .01) t.rotation.y = Math.PI; }   // Kirchenportal zur Kartenmitte drehen
    t.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const oi = ms ? ms.objectives.indexOf(x) : -1, ex = ms && ms.exts ? ms.exts.find(e => e.p === x) : null;
    if (oi >= 0) { const oc = typeof OBJ_COL !== 'undefined' ? OBJ_COL[oi % OBJ_COL.length] : '#b3261a', ot = typeof OBJ_TXT !== 'undefined' ? OBJ_TXT[oi % OBJ_TXT.length] : '#fff';   // Blau, Grün, Rot (+ Gelb, Pink)
      const f = flag(g, .02, new THREE.Color(oc).getHex()); f.scale.setScalar(1.35); S3.flags.push(f); const o = ms.objInfo[oi];
      const tg = tag('⚑ ' + (o.flex ? o.name : (x.p.name || 'Ziel')), oc, ot); tg.position.set(0, 2.3, 0); g.add(tg);
      if (o.flex && o.name === 'Artilleriegeschütz') {   // Batterie: drei Geschütze versetzt wie im echten Aufbau, zielen zur Kartenmitte
        const bat = G(); bat.position.set(-.15, .02, .1); bat.rotation.y = -g.position.z > 0 ? -HALF : HALF; g.add(bat);
        for (const [x, z] of [[.05, -.5], [-.3, 0], [.12, .5]]) { const gun = buildUnit('art', 'de'); gun.scale.setScalar(.25); gun.position.set(x, 0, z); bat.add(gun); } }
      if (o.flex && o.name === 'Flakgeschütz') { const fl = buildUnit('flak', 'de'); fl.scale.setScalar(.3); fl.position.set(-.2, .02, .2); fl.rotation.y = .6; g.add(fl); }
      if (o.flex && o.name === 'Transporter') { const tr = buildUnit('trans', 'de'); tr.scale.setScalar(.27); tr.position.set(-.15, .02, .2); tr.rotation.y = .5; g.add(tr); }
      if (o.flex && o.name === 'Kampfflieger') { const pl = buildUnit('flieger', 'al'); pl.userData.body.position.y = .74; pl.scale.setScalar(.27); pl.position.set(-.15, .02, .15); pl.rotation.y = .5; g.add(pl); } }
    if (ex) { extProp(g, ex.name, w, d); const tg = tag(ex.name, '#ffffff', '#111111'); tg.position.set(0, oi >= 0 ? 1.8 : 1.6, .2); g.add(tg); }
    const rule = typeof RULES !== 'undefined' && RULES.felder && RULES.felder[x.p.key] && RULES.felder[x.p.key].regel;
    g.userData.pi = pi; g.userData.tap = true;
  });
  // Startkanten: farbige Streifen am Brettrand
  if (ms) for (const side of ['de', 'al']) ms.edges[side].forEach((e, k) => {
    const col = side === 'de' ? 0x7d93ad : 0x9aae4a, long = e.e === 'top' || e.e === 'bottom', len = long ? (e.part === 'all' ? W : W / 2) : D;
    const off = long && e.part !== 'all' ? (e.part === 'start' ? -W / 4 : W / 4) : 0;
    const x = e.e === 'left' ? -W / 2 - .3 : e.e === 'right' ? W / 2 + .3 : off, z = e.e === 'top' ? -D / 2 - .3 : e.e === 'bottom' ? D / 2 + .3 : 0;
    brick(board, long ? len - .1 : .4, .12, long ? .4 : len - .1, col, x, .08, z);
    const inward = e.e === 'left' ? 0 : e.e === 'right' ? Math.PI : e.e === 'top' ? -HALF : HALF;   // Pfeile zeigen ins Feld
    const n = Math.max(2, Math.round(len / 1.6));
    for (let i = 0; i < n; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(.11, .22, 3), plastic(0xf4f0e0)); a.rotation.set(0, inward, -HALF); a.rotation.order = 'YXZ';
      const t = -len / 2 + (i + .5) * len / n; a.position.set(long ? x + t : x, .22, long ? z : z + t); board.add(a); }
    if (k === 0) { const ins = insignia(board, side, .36, x, .21, z, 0, -HALF); ins.position.set(long ? x + len * .5 / n : x, .22, long ? z : z + len * .5 / n); }
  });
  // Lebendige Details einsammeln: wiegende Bäume, Suchscheinwerfer, Windsack, Schaumkronen, Rauch aus dem Lok-Schornstein
  board.updateMatrixWorld(true);
  // Lebendige Details zuerst einsammeln (Lage des Schornsteins, bevor die Aufbau-Animation die Steine anhebt)
  const L = S3.live, puffGeo = new THREE.CylinderGeometry(.06, .06, .055, 14), studGeo = new THREE.CylinderGeometry(.033, .033, .03, 10);
  board.traverse(o => {
    const u = o.userData; if (u.sway != null) L.sway.push(o); if (u.sweep) L.sweep.push(o); if (u.flutter) L.flutter.push(o); if (u.wave) L.wave.push(o);
    if (u.chimney) { let p = o; while (p && p.userData.pi == null) p = p.parent; if (!p) return;
      const top = p.worldToLocal(o.getWorldPosition(new THREE.Vector3())); top.y += .03;
      for (let i = 0, NP = 20; i < NP; i++) { const c = [0x8a8f94, 0xa6abaf, 0x5b6066, 0x3e4044][i % 4], m = G(); m.userData.puff = true; m.add(new THREE.Mesh(puffGeo, plastic(c))); const st = new THREE.Mesh(studGeo, plastic(c)); st.position.y = .042; m.add(st); m.visible = false; p.add(m); L.puffs.push({ m, p0: top.clone(), ph: i / NP + (Math.random() - .5) * .04, wob: Math.random() * 6, ox: (Math.random() - .5) * .1, oz: (Math.random() - .5) * .1, sw: .06 + Math.random() * .08, sp: .28 + Math.random() * .08 }); } }
  });
  // Neue Karte: jedes Feld setzt sich Stein für Stein zusammen (von unten nach oben, jeder Stein fällt einzeln von oben ein)
  if (S3.drops.length && matchMedia('(prefers-reduced-motion:reduce)').matches) S3.drops = [];
  if (S3.drops.length) {
    const wp = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
    for (const dr of S3.drops) {
      const pcs = []; dr.sprites = [];
      (function walk(o) { for (const c of o.children) { if (c.userData.puff) continue; if (c.isSprite) { dr.sprites.push(c); continue; } if (c.userData.brick || c.isMesh) pcs.push(c); else walk(c); } })(dr.g);
      for (const c of pcs) c.userData._y = c.getWorldPosition(wp).y;
      pcs.sort((p, q) => p.userData._y - q.userData._y);
      const n = pcs.length, span = Math.min(1.5, .4 + n * .005);
      dr.pcs = pcs.map((c, i) => { c.getWorldPosition(wp); a.copy(wp); b.copy(wp).add(new THREE.Vector3((Math.random() - .5) * .5, 1.6 + Math.random() * 1.2, (Math.random() - .5) * .5));
        c.parent.worldToLocal(a); c.parent.worldToLocal(b);
        return { c, base: c.position.clone(), dv: b.clone().sub(a), r0: c.rotation.y, spin: (Math.random() - .5) * 4, t0: dr.d * 1.6 + i / n * span }; });
      dr.end = dr.d * 1.6 + span + .4;
      for (const s of dr.sprites) s.visible = false;
    }
    S3.dropT0 = performance.now() / 1000; stepDrops(0);
    try { if (typeof Sounds !== 'undefined' && Sounds.buildHold) Sounds.buildHold(Math.max(...S3.drops.map(d => d.end)) - .2); } catch (e) { }   // Bau-Geräusch läuft bis zum letzten Stein
  }
  // Kamera: Anflug von schräg oben
  const asp = box.clientWidth / Math.max(1, box.clientHeight), target = new THREE.Vector3(0, 0, 0), dist = Math.max(W, D) * (port ? 1.95 : 1.05 * Math.max(1, 1.8 / asp));   // Abstand passt sich dem Fenster an (auch gedreht)
  const endPos = port ? new THREE.Vector3(0, dist * .66, dist * .56) : new THREE.Vector3(0, dist * .62, dist * .62);
  if (port) board.rotation.y = HALF;
  S3.ctl.target.copy(target);
  if (window.gsap && !matchMedia('(prefers-reduced-motion:reduce)').matches) { S3.cam.position.set(endPos.x - dist * .6, endPos.y * 1.6, endPos.z + dist * .4); gsap.to(S3.cam.position, { x: endPos.x, y: endPos.y, z: endPos.z, duration: 1.1, ease: 'power3.out', onUpdate: () => { S3.cam.lookAt(target); S3.dirty = true; } }); }
  else S3.cam.position.copy(endPos);
  S3.cam.lookAt(target); S3.dirty = true;
}

// ---------- Einbau in den Karte-Tab: 2D ist Standard, kleiner Umschalter oben rechts ----------
const KEY = 'sitzkrieg-3d';
let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) { }
const map = document.getElementById('map');
const box = document.createElement('div'); box.id = 'map3d';
// Karte + 3D-Tisch in einer gemeinsamen Hülle; Knöpfe (Drehen + 2D/3D) sitzen oben rechts auf der Ecke, in beiden Ansichten an derselben Stelle
const wrap = document.createElement('div'); wrap.id = 'map-wrap'; map.before(wrap); wrap.append(map, box);
const tools = document.createElement('div'); tools.id = 'map-tools'; (document.querySelector('#tab-gen .bar') || wrap).appendChild(tools);   // neben Normal/Episch: stört die Karte nicht, gleiche Stelle in 2D und 3D
const rot = document.getElementById('rot'); if (rot) { rot.textContent = '↻'; rot.title = 'Karte drehen'; rot.setAttribute('aria-label', 'Karte drehen'); tools.appendChild(rot); }
const sw = document.createElement('button'); sw.type = 'button'; sw.className = 'sec v3d-sw'; tools.appendChild(sw);
sw.onclick = e => { e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (er) { } apply(); };
function apply() { document.body.classList.toggle('map3d-on', on); sw.textContent = on ? '2D' : '3D'; sw.title = on ? 'Zurück zur 2D-Karte' : 'Als 3D-Spieltisch anzeigen'; if (on) requestAnimationFrame(build); else if (typeof render === 'function') requestAnimationFrame(() => render()); }   // 2D neu vermessen
let t = null; new MutationObserver(() => { if (!on) return; clearTimeout(t); t = setTimeout(build, 30); }).observe(map, { childList: true });
apply();
