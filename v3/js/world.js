import * as THREE from "three";
import { boxGeo, cylGeo, planeGeo, ensureUv2 } from "./assets.js";
import { makeLabel } from "./monk.js";

function seedRng(seed = 20261111) {
  let _s = seed >>> 0;
  return () => {
    _s |= 0; _s = _s + 0x6D2B79F5 | 0;
    let t = Math.imul(_s ^ _s >>> 15, 1 | _s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function buildWorld(scene, mats, q) {
  const rng = seedRng(20261111);
  const root = new THREE.Group();
  scene.add(root);
  const colliders = [];
  const interactables = [];
  const cushions = [];
  const areas = [];
  const decorations = { lamps: new THREE.Group(), ribbons: new THREE.Group(), smoke: [], flickers: [], windy: [] };
  const addCol = (x, z, r) => colliders.push({ x, z, r });
  const shadows = q.shadows;

  const mesh = (geo, mat, x, y, z, parent = root, opts = {}) => {
    ensureUv2(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast ?? shadows;
    m.receiveShadow = opts.recv ?? shadows;
    parent.add(m);
    return m;
  };

  // grounds
  const earth = new THREE.Mesh(planeGeo(160, 160, 0.18), mats.earth);
  earth.rotation.x = -Math.PI / 2;
  earth.receiveShadow = true;
  root.add(earth);

  const court = new THREE.Mesh(planeGeo(42, 72, 0.55), mats.stonePath);
  court.rotation.x = -Math.PI / 2;
  court.position.set(0, 0.02, -4);
  court.receiveShadow = true;
  root.add(court);

  // formal path slabs
  for (let z = 28; z >= -30; z -= 2.05) {
    for (let i = -1; i <= 1; i++) {
      const s = mesh(boxGeo(1.95, 0.06, 1.95, 0.8), mats.stoneFine, i * 2.05, 0.06, z, root, { cast: false });
      s.rotation.y = (rng() - 0.5) * 0.04;
    }
  }

  function hipRoof(parent, w, d, y, deep = 2.4, mat = mats.roof, goldEnds = true) {
    const grp = new THREE.Group();
    const ow = 1.05, od = 1.05;
    const tw = w + ow * 2, td = d + od * 2;
    const ang = Math.atan2(deep, td / 2);
    const len = Math.hypot(td / 2, deep);
    const a = mesh(boxGeo(tw + 0.5, 0.12, len, 0.85), mat, 0, y + deep / 2, -td / 4 - 0.05, grp);
    a.rotation.x = -ang;
    const b = mesh(boxGeo(tw + 0.5, 0.12, len, 0.85), mat, 0, y + deep / 2, td / 4 + 0.05, grp);
    b.rotation.x = ang;
    // side hips
    const sideLen = Math.hypot(tw / 2, deep * 0.85);
    const sideAng = Math.atan2(deep * 0.85, tw / 2);
    const sl = mesh(boxGeo(sideLen, 0.1, td + 0.2, 0.85), mat, -tw / 4, y + deep * 0.42, 0, grp);
    sl.rotation.z = sideAng;
    const sr = mesh(boxGeo(sideLen, 0.1, td + 0.2, 0.85), mat, tw / 4, y + deep * 0.42, 0, grp);
    sr.rotation.z = -sideAng;
    const ridge = mesh(boxGeo(tw + 0.15, 0.18, 0.28, 0.7), mats.roofFine, 0, y + deep + 0.04, 0, grp);
    if (goldEnds) {
      mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.gold, -tw / 2 - 0.05, y + deep + 0.1, 0, grp, { cast: false });
      mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.gold, tw / 2 + 0.05, y + deep + 0.1, 0, grp, { cast: false });
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const c = mesh(boxGeo(0.18, 0.1, 1.15, 0.9), mat, sx * (tw / 2), y + deep * 0.32, sz * (td / 2 + 0.2), grp);
      c.rotation.x = sz * 0.5;
      c.rotation.z = -sx * 0.28;
      if (goldEnds) mesh(new THREE.SphereGeometry(0.07, 6, 5), mats.gold, sx * (tw / 2), y + deep * 0.32 + 0.15, sz * (td / 2 + 0.55), grp, { cast: false });
    }
    parent.add(grp);
    return grp;
  }

  function pillar(parent, x, y, z, h = 4.6, r = 0.28) {
    mesh(cylGeo(r + 0.08, r + 0.1, 0.22, 12, 2, 0.3), mats.stoneFine, x, y - h / 2 + 0.11, z, parent);
    const p = mesh(cylGeo(r, r + 0.04, h, 14, 1, 2.2), mats.pillar, x, y, z, parent);
    mesh(cylGeo(r + 0.05, r + 0.02, 0.12, 12, 2, 0.3), mats.gold, x, y + h / 2 - 0.02, z, parent, { cast: false });
    return p;
  }

  function addPaperLantern(parent, x, y, z, hanging = true) {
    const grp = new THREE.Group();
    grp.position.set(x, y, z);
    const paper = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mats.lantern);
    paper.scale.set(1, 1.3, 1);
    grp.add(paper);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.06, 8), mats.woodDark);
    cap.position.y = 0.28;
    grp.add(cap);
    if (hanging) {
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 5), mats.woodDark);
      str.position.y = 0.48;
      grp.add(str);
    }
    parent.add(grp);
    decorations.flickers.push(paper);
    return grp;
  }

  function addStoneLantern(parent, x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    mesh(boxGeo(0.55, 0.12, 0.55, 1.2), mats.stoneFine, 0, 0.06, 0, g);
    mesh(cylGeo(0.12, 0.14, 0.85, 8, 1, 2), mats.stoneFine, 0, 0.55, 0, g);
    const box = mesh(boxGeo(0.48, 0.42, 0.48, 1), mats.stoneFine, 0, 1.12, 0, g);
    // openings
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const hole = mesh(boxGeo(0.16, 0.22, 0.08, 1), mats.lantern, Math.sin(a) * 0.22, 1.12, Math.cos(a) * 0.22, g, { cast: false });
      decorations.flickers.push(hole);
    }
    const flame = mesh(new THREE.SphereGeometry(0.08, 8, 6), mats.lantern, 0, 1.12, 0, g, { cast: false });
    decorations.flickers.push(flame);
    mesh(boxGeo(0.7, 0.08, 0.7, 1), mats.stoneFine, 0, 1.36, 0, g);
    const cap = mesh(new THREE.ConeGeometry(0.42, 0.28, 8), mats.stoneFine, 0, 1.54, 0, g);
    mesh(new THREE.SphereGeometry(0.05, 6, 5), mats.stoneFine, 0, 1.7, 0, g, { cast: false });
    parent.add(g);
    return g;
  }

  // ===== 山门 =====
  const gate = new THREE.Group();
  gate.position.set(0, 0, 10);
  root.add(gate);
  mesh(boxGeo(11, 0.45, 3.4, 0.6), mats.stoneFine, 0, 0.22, 0, gate);
  mesh(boxGeo(3.2, 0.28, 1.6, 0.7), mats.stone, 0, 0.14, 2.2, gate);
  mesh(boxGeo(2.6, 0.2, 1.2, 0.7), mats.stone, 0, 0.1, 3.2, gate);
  for (const x of [-3.4, -1.15, 1.15, 3.4]) pillar(gate, x, 2.55, 0, 4.4, x === -1.15 || x === 1.15 ? 0.24 : 0.3);
  mesh(boxGeo(8.2, 0.28, 0.42, 0.8), mats.woodDark, 0, 4.5, 0, gate);
  mesh(boxGeo(8.2, 0.2, 0.32, 0.8), mats.wood, 0, 3.7, 0, gate);
  hipRoof(gate, 8.6, 2.8, 4.7, 1.7);
  mesh(boxGeo(2.7, 0.72, 0.08, 1), mats.plaque, 0, 4.05, 0.32, gate);
  const pLabel = makeLabel("云端禅院", "#f0e0a8");
  pLabel.scale.set(3.2, 0.8, 1);
  pLabel.position.set(0, 4.05, 0.4);
  gate.add(pLabel);
  for (const x of [-2.3, -0.8, 0.8, 2.3]) addPaperLantern(gate, x, 3.35, 0.65, true);
  areas.push({ name: "山门", x: 0, z: 10, r: 6 });
  areas.push({ name: "入口", x: 0, z: 22, r: 8 });

  // ===== 大雄宝殿 =====
  const hall = new THREE.Group();
  hall.position.set(0, 0, -28);
  root.add(hall);
  mesh(boxGeo(21, 0.95, 15, 0.45), mats.stoneFine, 0, 0.47, 0, hall);
  mesh(boxGeo(20.4, 0.18, 14.4, 0.5), mats.stone, 0, 0.98, 0, hall);
  mesh(boxGeo(4.8, 0.45, 3.2, 0.7), mats.stone, 0, 0.22, 8.3, hall);
  mesh(boxGeo(3.6, 0.32, 2.0, 0.7), mats.stone, 0, 0.16, 10.2, hall);
  mesh(boxGeo(18.6, 0.08, 12.4, 0.7), mats.plank, 0, 1.0, 0, hall, { cast: false });

  const pillarPos = [];
  for (const x of [-8, -4, 0, 4, 8]) {
    for (const z of [-5.4, 5.4]) {
      if (z > 0 && Math.abs(x) < 3) continue;
      pillarPos.push([x, z]);
    }
  }
  for (const x of [-8, 8]) pillarPos.push([x, 0]);
  for (const [x, z] of pillarPos) pillar(hall, x, 3.65, z, 5.1, 0.3);

  mesh(boxGeo(18.4, 4.6, 0.22, 0.25), mats.cream, 0, 3.3, -6.0, hall);
  mesh(boxGeo(0.22, 4.6, 11.6, 0.25), mats.cream, -8.85, 3.3, 0, hall);
  mesh(boxGeo(0.22, 4.6, 11.6, 0.25), mats.cream, 8.85, 3.3, 0, hall);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = -3.6 + i * 2.2;
      mesh(boxGeo(0.08, 2.3, 1.55, 1), mats.lattice, side * 8.98, 3.3, z, hall);
      for (let k = -1; k <= 1; k++) {
        mesh(boxGeo(0.05, 2.1, 0.05, 1), mats.woodDark, side * 9.04, 3.3, z + k * 0.4, hall, { cast: false });
      }
    }
  }
  hipRoof(hall, 20.6, 14.6, 6.1, 3.3);
  mesh(boxGeo(3.5, 0.88, 0.1, 1), mats.plaque, 0, 6.45, 7.55, hall);
  const hLab = makeLabel("大雄宝殿", "#f0e0a8");
  hLab.scale.set(3.6, 0.9, 1);
  hLab.position.set(0, 6.45, 7.68);
  hall.add(hLab);
  for (const x of [-6, -2, 2, 6]) addPaperLantern(hall, x, 5.55, 6.35, true);

  // Buddha pedestal + anchor (model loaded later)
  const buddha = new THREE.Group();
  buddha.position.set(0, 1.15, -4.15);
  hall.add(buddha);
  mesh(cylGeo(1.35, 1.55, 0.22, 24, 3, 0.4), mats.gold, 0, 0.14, 0, buddha);
  mesh(cylGeo(1.05, 1.25, 0.16, 24, 3, 0.4), mats.gold, 0, 0.3, 0, buddha);
  const petalGeo = new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const p = mesh(petalGeo, mats.gold, Math.cos(a) * 0.85, 0.32, Math.sin(a) * 0.85, buddha, { cast: false });
    p.scale.set(1.1, 0.45, 0.7);
    p.rotation.y = -a;
    p.rotation.x = 0.4;
  }
  const buddhaAnchor = new THREE.Group();
  buddhaAnchor.position.set(0, 0.42, 0);
  buddha.add(buddhaAnchor);
  decorations.buddhaAnchor = buddhaAnchor;
  decorations.buddhaGroup = buddha;

  const halo = mesh(new THREE.TorusGeometry(0.95, 0.045, 8, 28), mats.gold, 0, 2.05, -0.25, buddha, { cast: false });
  halo.rotation.x = -0.1;
  mesh(new THREE.PlaneGeometry(6.4, 5.2), mats.halo, 0, 3.5, -5.85, hall, { cast: false });

  hall.userData.aabb = { minX: -10, maxX: 10, minZ: -35, maxZ: -22 };
  interactables.push({ id: "buddha", type: "bow", x: 0, z: -22, r: 4, label: "向佛礼拜" });
  areas.push({ name: "大雄宝殿", x: 0, z: -28, r: 12 });

  function makeCushion() {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.14, 20), mats.cushion);
    top.position.y = 0.07;
    top.castShadow = shadows; top.receiveShadow = shadows;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 8, 20), mats.cushionDark);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.14;
    g.add(top, rim);
    return g;
  }
  for (let row = 0; row < 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const x = col * 1.5;
      const z = -19.2 - row * 1.5;
      const c = makeCushion();
      c.position.set(x, 0.06, z);
      root.add(c);
      cushions.push({ x, z, y: 0.06, occ: false });
    }
  }
  for (const [x, z] of [[-6, 4], [6, 4], [-7, -6], [7, -8]]) {
    const c = makeCushion();
    c.position.set(x, 0.06, z);
    root.add(c);
    cushions.push({ x, z, y: 0.06, occ: false });
  }

  // ===== 香炉 =====
  const ding = new THREE.Group();
  ding.position.set(0, 0, -18);
  root.add(ding);
  mesh(cylGeo(0.72, 0.88, 0.72, 16, 2, 1), mats.bronze, 0, 0.58, 0, ding);
  mesh(cylGeo(0.95, 0.95, 0.1, 16, 3, 0.3), mats.bronze, 0, 0.98, 0, ding);
  for (const a of [0, 2.1, 4.2]) {
    mesh(boxGeo(0.14, 0.42, 0.14, 1), mats.bronze, Math.cos(a) * 0.52, 0.22, Math.sin(a) * 0.52, ding);
  }
  // handles
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 12, Math.PI), mats.bronze, s * 0.9, 0.85, 0, ding);
    h.rotation.z = s * Math.PI / 2;
  }
  for (const x of [-0.22, 0, 0.22]) {
    mesh(cylGeo(0.018, 0.022, 0.72, 6, 1, 1), mats.woodDark, x, 1.38, 0, ding, { cast: false });
    mesh(new THREE.SphereGeometry(0.045, 8, 6), mats.lantern, x, 1.76, 0, ding, { cast: false });
  }
  interactables.push({ id: "incense", type: "incense", x: 0, z: -18, r: 2.4, label: "上香" });
  decorations.incensePos = new THREE.Vector3(0, 1.85, -18);
  addCol(0, -18, 0.9);

  // ===== 宝塔 =====
  const pagoda = new THREE.Group();
  pagoda.position.set(-16, 0, -6);
  root.add(pagoda);
  mesh(cylGeo(4.2, 4.6, 0.4, 8, 3, 0.4), mats.stoneFine, 0, 0.2, 0, pagoda);
  let size = 5.2, y = 0.4;
  for (let i = 0; i < 5; i++) {
    const h = 1.35 - i * 0.08;
    mesh(boxGeo(size, h, size, 0.5), mats.stone, 0, y + h / 2, 0, pagoda);
    hipRoof(pagoda, size - 0.4, size - 0.4, y + h - 0.15, 0.7, mats.roof, i === 4);
    y += h + 0.22;
    size *= 0.78;
  }
  mesh(cylGeo(0.08, 0.14, 1.7, 8, 1, 2), mats.bronze, 0, y + 0.95, 0, pagoda);
  mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.gold, 0, y + 1.85, 0, pagoda, { cast: false });
  addCol(-16, -6, 3.2);
  interactables.push({ id: "pagoda", type: "pagoda", x: -16, z: -6, r: 7.5, label: "绕塔" });
  areas.push({ name: "宝塔", x: -16, z: -6, r: 9 });
  decorations.pagoda = { x: -16, z: -6 };

  // ===== 莲池 =====
  const pond = new THREE.Group();
  pond.position.set(16, 0, -5);
  root.add(pond);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.42, 10, 36), mats.stoneFine);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.16;
  rim.castShadow = shadows; rim.receiveShadow = shadows;
  pond.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(6.1, 48), mats.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.1;
  pond.add(water);
  decorations.water = water;
  function addLotus(x, z, s = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0.12, z);
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.5 * s, 14), mats.leafG);
    leaf.material = new THREE.MeshStandardMaterial({ color: 0x2f6a3a, roughness: 0.55, metalness: 0, envMapIntensity: 0.4, side: THREE.DoubleSide });
    leaf.rotation.x = -Math.PI / 2;
    g.add(leaf);
    const bloom = new THREE.Group();
    bloom.position.y = 0.12 * s;
    for (let i = 0; i < 8; i++) {
      const pet = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 * s, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xf0c0cc, roughness: 0.45, metalness: 0, envMapIntensity: 0.5 })
      );
      const a = (i / 8) * Math.PI * 2;
      pet.position.set(Math.cos(a) * 0.08, 0.02, Math.sin(a) * 0.08);
      pet.rotation.x = 0.5;
      pet.rotation.y = -a;
      bloom.add(pet);
    }
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 8, 6), new THREE.MeshStandardMaterial({ color: 0xe0c050, roughness: 0.5 }));
    seed.position.y = 0.08;
    bloom.add(seed);
    g.add(bloom);
    pond.add(g);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const r = 1.4 + (i % 3) * 1.15;
    addLotus(Math.cos(a) * r, Math.sin(a) * r, 0.85 + (i % 3) * 0.15);
  }
  addCol(16, -5, 6.3);
  areas.push({ name: "莲池", x: 16, z: -5, r: 9 });

  // ===== 钟楼 =====
  const tower = new THREE.Group();
  tower.position.set(20, 0, -22);
  root.add(tower);
  mesh(boxGeo(5.2, 0.4, 5.2, 0.6), mats.stoneFine, 0, 0.2, 0, tower);
  for (const x of [-1.65, 1.65]) for (const z of [-1.65, 1.65]) pillar(tower, x, 2.4, z, 4.2, 0.2);
  mesh(boxGeo(4.4, 0.16, 4.4, 0.7), mats.woodDark, 0, 4.45, 0, tower);
  hipRoof(tower, 5.3, 5.3, 4.5, 1.55);
  const bell = new THREE.Mesh(cylGeo(0.42, 0.62, 1.15, 16, 2, 1), mats.bronze);
  bell.position.set(0, 3.15, 0);
  tower.add(bell);
  decorations.bellMesh = bell;
  mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.bronze, 0, 2.48, 0, tower);
  addPaperLantern(tower, 0, 4.2, 1.7, true);
  addCol(20, -22, 2.4);
  interactables.push({ id: "bell", type: "bell", x: 20, z: -22, r: 3, label: "撞钟" });
  areas.push({ name: "钟楼", x: 20, z: -22, r: 7 });

  // Trees
  function addMaple(x, z, h, leafMat) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    const trunk = mesh(cylGeo(0.1 + h * 0.03, 0.16 + h * 0.04, h, 9, 1, 2.4), mats.bark, 0, h / 2, 0, g);
    // branches
    const nBr = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < nBr; i++) {
      const a = rng() * Math.PI * 2;
      const by = h * (0.45 + rng() * 0.4);
      const bl = 0.6 + rng() * 0.9;
      const br = mesh(cylGeo(0.035, 0.06, bl, 6, 1, 1), mats.bark, Math.cos(a) * 0.2, by, Math.sin(a) * 0.2, g, { cast: false });
      br.rotation.z = Math.cos(a) * 0.8;
      br.rotation.x = Math.sin(a) * 0.8;
    }
    const count = Math.floor((14 + h * 3) * q.leafScale);
    const card = new THREE.PlaneGeometry(1.15, 1.15);
    const inst = new THREE.InstancedMesh(card, leafMat, count);
    inst.castShadow = false;
    inst.receiveShadow = false;
    inst.frustumCulled = false;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * (1.1 + h * 0.25);
      dummy.position.set(Math.cos(a) * r, h * 0.62 + rng() * h * 0.45, Math.sin(a) * r);
      dummy.rotation.set(rng() * 0.8, rng() * Math.PI * 2, rng() * 0.8);
      const sc = 0.7 + rng() * 0.6;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    g.add(inst);
    decorations.windy.push({ group: g, inst, base: inst.rotation.y, amp: 0.04 + rng() * 0.03, spd: 0.4 + rng() * 0.4 });
    root.add(g);
    return g;
  }

  function addPine(x, z, h) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    mesh(cylGeo(0.1, 0.18, h, 8, 1, 2.5), mats.bark, 0, h / 2, 0, g);
    const layers = 5 + Math.floor(h);
    const card = new THREE.PlaneGeometry(1.6, 1.3);
    const n = Math.floor(layers * 6 * q.leafScale);
    const inst = new THREE.InstancedMesh(card, mats.pine, n);
    inst.castShadow = false;
    inst.frustumCulled = false;
    const dummy = new THREE.Object3D();
    let k = 0;
    for (let i = 0; i < layers && k < n; i++) {
      const yy = h * 0.28 + (i / layers) * h * 0.75;
      const rad = (1.0 - i / layers) * (1.4 + h * 0.15) + 0.4;
      const around = 5 + (i % 2);
      for (let j = 0; j < around && k < n; j++, k++) {
        const a = (j / around) * Math.PI * 2 + i;
        dummy.position.set(Math.cos(a) * rad * 0.45, yy, Math.sin(a) * rad * 0.45);
        dummy.rotation.set(0.5, a, 0);
        dummy.scale.set(rad * 0.7, rad * 0.55, 1);
        dummy.updateMatrix();
        inst.setMatrixAt(k, dummy.matrix);
      }
    }
    inst.count = k;
    inst.instanceMatrix.needsUpdate = true;
    g.add(inst);
    decorations.windy.push({ group: g, inst, base: 0, amp: 0.02, spd: 0.3 });
    root.add(g);
    return g;
  }

  function addBambooClump(cx, cz, n = 10) {
    for (let i = 0; i < n; i++) {
      const x = cx + (rng() - 0.5) * 3.2;
      const z = cz + (rng() - 0.5) * 3.2;
      const h = 4.2 + rng() * 3.8;
      const stalk = mesh(cylGeo(0.045 + rng() * 0.02, 0.06, h, 7, 1, 4), mats.bamboo, x, h / 2, z, root, { cast: false });
      decorations.windy.push({ group: stalk, inst: null, base: 0, amp: 0.03 + rng() * 0.03, spd: 0.6 + rng() * 0.4 });
      for (let k = 1; k < 5; k++) {
        mesh(new THREE.TorusGeometry(0.07, 0.012, 4, 8), mats.bambooDark, x, k * (h / 5.2), z, root, { cast: false }).rotation.x = Math.PI / 2;
      }
      // a few leaf cards
      if (rng() > 0.35) {
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), mats.leafG);
        leaf.position.set(x + 0.2, h * 0.85, z);
        leaf.rotation.z = -0.4;
        root.add(leaf);
      }
    }
  }

  // wish tree – featured maple
  const wish = addMaple(-13, -17, 4.2, mats.leafO);
  interactables.push({ id: "wish", type: "wish", x: -13, z: -17, r: 3, label: "许愿挂红" });
  areas.push({ name: "许愿树", x: -13, z: -17, r: 6 });
  decorations.wishTree = { x: -13, z: -17, group: decorations.ribbons };
  decorations.ribbons.position.set(-13, 0, -17);
  root.add(decorations.ribbons);
  addCol(-13, -17, 1.1);

  // designed maples / pines, keep path clear (same rules as v2)
  const treeSpots = [];
  const pushTree = (x, z) => {
    if (Math.abs(x) < 10 && z < 32 && z > -36) return;
    if (Math.hypot(x - 16, z + 5) < 8) return;
    if (Math.hypot(x + 16, z + 6) < 7) return;
    if (Math.hypot(x, z + 28) < 14) return;
    if (Math.hypot(x - 20, z + 22) < 5) return;
    if (Math.hypot(x, z - 24) < 12) return;
    if (z > 8 && Math.abs(x) < 16) return;
    if (Math.hypot(x + 13, z + 17) < 4) return;
    treeSpots.push([x, z]);
  };
  for (let i = 0; i < 48; i++) {
    const a = rng() * Math.PI * 2;
    const r = 18 + rng() * 38;
    pushTree(Math.cos(a) * r, Math.sin(a) * r);
  }
  for (const [x, z] of [[-10, 6], [-12, 14], [-8, 18], [10, 16], [12, 8], [9, -12], [-20, 8], [8, -18], [-18, 16], [22, -30], [-22, 2], [14, 20], [-14, 22], [26, -12], [-28, -8]]) {
    pushTree(x, z);
  }
  const leafMats = [mats.leafR, mats.leafO, mats.leafY, mats.leafR, mats.leafO];
  treeSpots.forEach(([x, z], i) => {
    if (i % 4 === 0) addPine(x, z, 3.4 + rng() * 2.2);
    else addMaple(x, z, 2.6 + rng() * 2.0, leafMats[i % leafMats.length]);
  });
  areas.push({ name: "林间小路", x: -12, z: 16, r: 8 });

  // bamboo grove
  addBambooClump(-24, -24, 22);
  addBambooClump(-22, -18, 16);
  addBambooClump(-26, -12, 12);
  areas.push({ name: "竹林", x: -22, z: -22, r: 10 });

  // ===== 茶亭 =====
  const tea = new THREE.Group();
  tea.position.set(18, 0, 10);
  root.add(tea);
  mesh(boxGeo(4.4, 0.18, 4.4, 0.7), mats.stoneFine, 0, 0.09, 0, tea);
  for (const x of [-1.55, 1.55]) for (const z of [-1.55, 1.55]) pillar(tea, x, 1.5, z, 2.6, 0.14);
  hipRoof(tea, 4.3, 4.3, 2.75, 1.35);
  mesh(boxGeo(1.9, 0.1, 0.55, 0.8), mats.woodDark, 0, 0.55, 0, tea);
  areas.push({ name: "茶亭", x: 18, z: 10, r: 6 });

  // stream
  const stream = new THREE.Mesh(planeGeo(3.0, 36, 0.9), mats.water);
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(24, 0.07, -8);
  stream.rotation.z = -0.15;
  root.add(stream);
  decorations.stream = stream;
  areas.push({ name: "河边步道", x: 22, z: 0, r: 8 });

  // stone lanterns along path
  for (const [x, z] of [[-4.2, 18], [4.2, 18], [-4.2, 6], [4.2, 6], [-4.2, -8], [4.2, -8], [-8, -16], [8, -16]]) {
    addStoneLantern(root, x, z);
  }

  // benches
  for (const [x, z, ry] of [[10, -10, 0.4], [8, 2, -0.3], [-8, -10, 0.2]]) {
    const b = new THREE.Group();
    b.position.set(x, 0, z);
    b.rotation.y = ry;
    mesh(boxGeo(1.8, 0.1, 0.5, 0.8), mats.wood, 0, 0.45, 0, b);
    mesh(boxGeo(0.1, 0.45, 0.45, 0.8), mats.woodDark, -0.7, 0.22, 0, b);
    mesh(boxGeo(0.1, 0.45, 0.45, 0.8), mats.woodDark, 0.7, 0.22, 0, b);
    root.add(b);
  }

  // Horizon comes from the HDRI sky; no placeholder mountain cones.

  const moon = mesh(new THREE.SphereGeometry(3.0, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xf0e8d4, emissive: 0x887760, emissiveIntensity: 0.55, roughness: 1, metalness: 0 }),
    -22, 40, -48, root, { cast: false });
  decorations.moon = moon;

  decorations.lamps.position.set(0, 0, 0);
  root.add(decorations.lamps);

  // falling leaves
  const nFall = q.fallingLeaves;
  const fallGeo = new THREE.PlaneGeometry(0.22, 0.28);
  const fall = new THREE.InstancedMesh(fallGeo, mats.leafO, nFall);
  fall.frustumCulled = false;
  fall.castShadow = false;
  root.add(fall);
  const fallData = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < nFall; i++) {
    fallData.push({
      x: (rng() - 0.5) * 50,
      y: 2 + rng() * 9,
      z: (rng() - 0.5) * 50,
      s: 0.6 + rng() * 0.8,
      vy: 0.35 + rng() * 0.45,
      rot: rng() * Math.PI * 2,
      rs: (rng() - 0.5) * 2,
      ph: rng() * Math.PI * 2,
    });
  }
  decorations.falling = { mesh: fall, data: fallData, dummy };

  decorations.update = (dt, t) => {
    if (decorations.water && decorations.water.material.normalMap) {
      decorations.water.material.normalMap.offset.x = t * 0.03;
      decorations.water.material.normalMap.offset.y = t * 0.02;
    }
    if (decorations.stream && decorations.stream.material.normalMap) {
      decorations.stream.material.normalMap.offset.x = t * 0.06;
    }
    for (const w of decorations.windy) {
      const sway = Math.sin(t * w.spd + (w.group.position.x || 0)) * w.amp;
      if (w.inst) w.inst.rotation.y = w.base + sway;
      else w.group.rotation.z = sway;
    }
    const flick = 0.9 + Math.sin(t * 6) * 0.08 + Math.sin(t * 13) * 0.05;
    for (const f of decorations.flickers) {
      if (f.material && f.material.emissiveIntensity != null) f.material.emissiveIntensity = (f.userData.em0 || 1.2) * flick;
    }
    if (decorations.falling) {
      const { mesh: fm, data, dummy: d } = decorations.falling;
      for (let i = 0; i < data.length; i++) {
        const p = data[i];
        p.y -= p.vy * dt;
        p.x += Math.sin(t * 0.7 + p.ph) * dt * 0.4;
        p.rot += p.rs * dt;
        if (p.y < 0.05) { p.y = 8 + Math.random() * 5; p.x = (Math.random() - 0.5) * 50; p.z = (Math.random() - 0.5) * 50; }
        d.position.set(p.x, p.y, p.z);
        d.rotation.set(p.rot, p.ph, p.rot * 0.5);
        d.scale.setScalar(p.s);
        d.updateMatrix();
        fm.setMatrixAt(i, d.matrix);
      }
      fm.instanceMatrix.needsUpdate = true;
    }
  };

  return { root, colliders, interactables, cushions, areas, decorations, hallAABB: hall.userData.aabb, addLantern: addPaperLantern };
}

export function placeBuddha(model, anchor) {
  const wrap = new THREE.Group();
  wrap.add(model);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.position.y += size.y / 2;
  const s = 2.55 / Math.max(0.001, size.y);
  wrap.scale.setScalar(s);
  // Cosmic Buddha is a shallow relief; turn the broad carved face toward the courtyard (+Z).
  const dims = [size.x, size.y, size.z];
  // after centering, the original Z is usually the thin axis
  wrap.rotation.y = 0; // carved face toward courtyard (+Z / entrance)
  // try both later via userData
  wrap.userData.size = { x: size.x, y: size.y, z: size.z };
  anchor.add(wrap);
  return wrap;
}

export function gildBuddha(root, goldMat) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    const old = o.material;
    const mat = goldMat.clone();
    if (old && old.map) {
      mat.map = old.map;
      mat.color.set(0xffe2a0);
      mat.metalness = 0.72;
      mat.roughness = 0.38;
    }
    if (old && old.normalMap) {
      mat.normalMap = old.normalMap;
      mat.normalScale = new THREE.Vector2(0.85, 0.85);
    }
    o.material = mat;
    o.castShadow = true;
    o.receiveShadow = true;
  });
}
