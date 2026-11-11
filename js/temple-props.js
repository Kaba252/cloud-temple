import * as THREE from "three";

function goldMat(opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: opts.color ?? 0xe8c75a,
    metalness: 0.95,
    roughness: opts.roughness ?? 0.28,
    envMapIntensity: 1.2,
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
    emissive: 0x3a2808,
    emissiveIntensity: 0.12,
  });
}

function skinGold(c = 0xe0b089) {
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.35 });
}

/** Rounded seated Buddha in meditation pose, facing +Z. */
export function makeSeatedBuddha(mats, opts = {}) {
  const s = opts.scale ?? 1;
  const seg = opts.seg ?? 12;
  const g = new THREE.Group();
  const gold = mats.gold || goldMat();
  const robe = gold;

  // lotus throne
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58 * s, 0.7 * s, 0.16 * s, 16), gold);
  base.position.y = 0.08 * s;
  g.add(base);
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.48 * s, 0.58 * s, 0.12 * s, 16), gold);
  mid.position.y = 0.2 * s;
  g.add(mid);
  const petalGeo = new THREE.SphereGeometry(0.24 * s, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const p = new THREE.Mesh(petalGeo, gold);
    p.position.set(Math.cos(a) * 0.48 * s, 0.18 * s, Math.sin(a) * 0.48 * s);
    p.scale.set(1.1, 0.48, 0.7);
    p.rotation.y = -a;
    p.rotation.x = 0.55;
    g.add(p);
  }

  const body = new THREE.Group();
  body.position.y = 0.28 * s;
  g.add(body);

  // crossed legs / robe skirt
  const skirt = new THREE.Mesh(new THREE.SphereGeometry(0.5 * s, seg, 10), robe);
  skirt.scale.set(1.2, 0.45, 1.0);
  skirt.position.set(0, 0.3 * s, 0.04 * s);
  body.add(skirt);
  const knee = new THREE.SphereGeometry(0.18 * s, 8, 6);
  const kL = new THREE.Mesh(knee, robe);
  kL.position.set(-0.4 * s, 0.3 * s, 0.14 * s);
  kL.scale.set(1.1, 0.7, 1.2);
  const kR = kL.clone();
  kR.position.x *= -1;
  body.add(kL, kR);

  // torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.38 * s, seg, 10), robe);
  torso.position.set(0, 0.72 * s, 0);
  torso.scale.set(0.95, 1.15, 0.75);
  body.add(torso);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.34 * s, 0.5 * s, seg), robe);
  chest.position.set(0, 0.7 * s, 0);
  body.add(chest);

  // arms, dhyana mudra (hands in lap)
  const upper = new THREE.CylinderGeometry(0.09 * s, 0.1 * s, 0.38 * s, 8);
  const uL = new THREE.Mesh(upper, robe);
  uL.position.set(-0.28 * s, 0.62 * s, 0.1 * s);
  uL.rotation.z = 1.15;
  uL.rotation.x = 0.95;
  const uR = uL.clone();
  uR.position.x *= -1;
  uR.rotation.z *= -1;
  body.add(uL, uR);
  const hands = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 8, 6), gold);
  hands.scale.set(1.35, 0.45, 0.8);
  hands.position.set(0, 0.44 * s, 0.24 * s);
  body.add(hands);

  // neck + head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * s, 0.12 * s, 0.12 * s, 8), gold);
  neck.position.set(0, 1.12 * s, 0);
  body.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3 * s, seg, 10), gold);
  head.position.set(0, 1.4 * s, 0.03 * s);
  head.scale.set(0.98, 1.06, 0.98);
  body.add(head);
  const ush = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 8, 6), gold);
  ush.position.set(0, 1.68 * s, 0);
  body.add(ush);
  // long ears
  const earGeo = new THREE.SphereGeometry(0.06 * s, 6, 6);
  const eL = new THREE.Mesh(earGeo, gold);
  eL.position.set(-0.28 * s, 1.36 * s, 0);
  eL.scale.set(0.55, 1.6, 0.5);
  const eR = eL.clone();
  eR.position.x *= -1;
  body.add(eL, eR);
  // 白毫
  const urna = new THREE.Mesh(new THREE.SphereGeometry(0.018 * s, 6, 4), gold);
  urna.position.set(0, 1.48 * s, 0.28 * s);
  body.add(urna);
  // closed eyes
  const lid = new THREE.Mesh(new THREE.TorusGeometry(0.05 * s, 0.008 * s, 4, 8, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: 0.7 }));
  const eyeL = lid.clone();
  eyeL.position.set(-0.09 * s, 1.44 * s, 0.28 * s);
  eyeL.rotation.set(0.2, 0, 0.1);
  const eyeR = lid.clone();
  eyeR.position.set(0.09 * s, 1.44 * s, 0.28 * s);
  eyeR.rotation.set(0.2, 0, -0.1);
  body.add(eyeL, eyeR);
  // slight smile
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045 * s, 0.007 * s, 4, 8, Math.PI), new THREE.MeshStandardMaterial({ color: 0x6a3a20, roughness: 0.7 }));
  mouth.position.set(0, 1.3 * s, 0.28 * s);
  mouth.rotation.set(Math.PI, 0, 0);
  mouth.scale.set(1, 0.5, 1);
  body.add(mouth);

  g.traverse((o) => { if (o.isMesh) { o.castShadow = !!opts.shadows; o.receiveShadow = !!opts.shadows; } });
  return g;
}

/** Standing attendant monk (阿难 / 迦叶), facing +Z. */
export function makeAttendant(mats, opts = {}) {
  const s = opts.scale ?? 0.85;
  const gold = mats.gold || goldMat();
  const g = new THREE.Group();
  const robe = gold;
  const feet = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.2 * s, 0.08 * s, 8), gold);
  feet.position.y = 0.04 * s;
  g.add(feet);
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.22 * s, 0.65 * s, 8), robe);
  legs.position.y = 0.4 * s;
  g.add(legs);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.26 * s, 0.65 * s, 10), robe);
  body.position.y = 1.02 * s;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24 * s, 10, 8), robe);
  belly.position.y = 0.85 * s;
  belly.scale.set(1, 0.85, 0.8);
  g.add(belly);
  const arms = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.09 * s, 0.5 * s, 6), robe);
  const aL = arms.clone();
  aL.position.set(-0.26 * s, 1.0 * s, 0.1 * s);
  aL.rotation.z = 0.55; aL.rotation.x = 0.7;
  const aR = arms.clone();
  aR.position.set(0.26 * s, 1.0 * s, 0.1 * s);
  aR.rotation.z = -0.55; aR.rotation.x = 0.7;
  g.add(aL, aR);
  const hands = new THREE.Mesh(new THREE.SphereGeometry(0.1 * s, 8, 6), gold);
  hands.position.set(0, 0.82 * s, 0.28 * s);
  g.add(hands);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2 * s, 10, 8), gold);
  head.position.set(0, 1.52 * s, 0.02 * s);
  g.add(head);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.045 * s, 6, 5), gold);
  earL.position.set(-0.2 * s, 1.5 * s, 0);
  earL.scale.set(0.6, 1.4, 0.5);
  const earR = earL.clone(); earR.position.x *= -1;
  g.add(earL, earR);
  if (opts.older) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16 * s, 0.02 * s, 0.04 * s), gold);
    brow.position.set(0, 1.58 * s, 0.16 * s);
    g.add(brow);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = !!opts.shadows; o.receiveShadow = !!opts.shadows; } });
  return g;
}

/** Simple seated 罗汉, facing toward +X or -X via rotation later. */
export function makeArhat(mats, opts = {}) {
  const s = opts.scale ?? 1;
  const gold = mats.gold || goldMat({ color: 0xd4b056, roughness: 0.38 });
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * s, 0.32 * s, 0.1 * s, 8), gold);
  base.position.y = 0.05 * s;
  g.add(base);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 10, 8), gold);
  body.position.y = 0.38 * s;
  body.scale.set(1.15, 0.95, 0.85);
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16 * s, 10, 8), gold);
  head.position.set(0, 0.72 * s, 0.04 * s);
  g.add(head);
  const tilt = opts.tilt ?? 0;
  head.rotation.y = tilt;
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055 * s, 0.065 * s, 0.3 * s, 6), gold);
  arm.position.set(0.24 * s * (opts.side || 1), 0.42 * s, 0.1 * s);
  arm.rotation.z = -0.85 * (opts.side || 1);
  g.add(arm);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 6, 5), gold);
  earL.position.set(-0.15 * s, 0.72 * s, 0);
  earL.scale.set(0.6, 1.3, 0.5);
  const earR = earL.clone(); earR.position.x *= -1;
  g.add(earL, earR);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = !!opts.shadows; } });
  return g;
}

export function makeCofferedCeiling(w, d, mats, y = 5.6) {
  const g = new THREE.Group();
  g.position.y = y;
  const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mats.lacquer || mats.woodDark);
  back.position.y = 0.12;
  g.add(back);
  const cols = 6, rows = 4;
  const cw = w / cols, cd = d / rows;
  const beam = mats.woodDark || mats.wood;
  const inset = mats.gold;
  for (let i = 0; i <= cols; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, d + 0.1), beam);
    b.position.set(-w / 2 + i * cw, 0, 0);
    g.add(b);
  }
  for (let j = 0; j <= rows; j++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.16, 0.1), beam);
    b.position.set(0, 0, -d / 2 + j * cd);
    g.add(b);
  }
  // central lotus caisson
  const caisson = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 12), inset);
  caisson.position.y = -0.06;
  g.add(caisson);
  const lotus = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), inset);
  lotus.rotation.x = Math.PI / 2;
  lotus.position.y = -0.1;
  g.add(lotus);
  return g;
}

export function makeBanner(mats, h = 2.4) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), mats.woodDark || mats.wood);
  pole.position.y = 0.15;
  g.add(pole);
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(0.38, h),
    new THREE.MeshStandardMaterial({
      color: 0x9c1c1c, roughness: 0.7, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.4,
    })
  );
  cloth.position.y = -h / 2;
  g.add(cloth);
  const trim = new THREE.Mesh(
    new THREE.PlaneGeometry(0.08, h),
    new THREE.MeshStandardMaterial({ color: 0xd4b056, roughness: 0.45, metalness: 0.3, side: THREE.DoubleSide })
  );
  trim.position.set(0, -h / 2, 0.005);
  trim.scale.set(4.6, 1, 1);
  // gold edge as thin boxes
  const edge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.02), mats.gold);
  edge.position.y = -0.02;
  g.add(edge);
  const bot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.02), mats.gold);
  bot.position.y = -h - 0.08;
  g.add(cloth, bot);
  return g;
}

export function makeOfferingTable(mats, shadows) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.9), mats.lacquer || mats.pillar);
  top.position.y = 0.72;
  const apron = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.16, 0.85), mats.woodDark);
  apron.position.y = 0.6;
  g.add(top, apron);
  for (const x of [-1.55, 1.55]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.12), mats.woodDark);
    leg.position.set(x, 0.32, 0.28);
    const leg2 = leg.clone(); leg2.position.z = -0.28;
    g.add(leg, leg2);
  }
  // incense burner
  const ding = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.22, 12), mats.bronze || mats.gold);
  ding.position.set(0, 0.9, 0);
  g.add(ding);
  for (const x of [-0.08, 0, 0.08]) {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.28, 5), mats.woodDark);
    st.position.set(x, 1.12, 0);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), mats.lantern);
    tip.position.set(x, 1.28, 0);
    g.add(st, tip);
  }
  // candles
  for (const x of [-1.2, 1.2]) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0xf2e6c8, roughness: 0.5 }));
    stick.position.set(x, 0.98, 0);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), mats.lantern);
    flame.position.set(x, 1.18, 0);
    const hold = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.08, 8), mats.bronze || mats.gold);
    hold.position.set(x, 0.8, 0);
    g.add(stick, flame, hold);
  }
  // 长明灯 bowls
  for (const x of [-1.55, 1.55]) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.08, 10), mats.bronze || mats.gold);
    bowl.position.set(x, 0.82, 0.22);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mats.lantern);
    glow.position.set(x, 0.9, 0.22);
    g.add(bowl, glow);
  }
  // fruit
  const fruitCols = [0xc43c2a, 0xe0a430, 0x6aaa3a, 0xf2e0c0];
  for (let i = 0; i < 6; i++) {
    const fr = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 6),
      new THREE.MeshStandardMaterial({ color: fruitCols[i % 4], roughness: 0.55, envMapIntensity: 0.5 })
    );
    fr.position.set(-0.55 + (i % 3) * 0.2, 0.86, (i < 3 ? -0.18 : 0.18));
    g.add(fr);
  }
  // flower vases
  for (const x of [-0.85, 0.85]) {
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.18, 8), mats.bronze || mats.gold);
    vase.position.set(x, 0.88, -0.22);
    const bloom = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 6),
      new THREE.MeshStandardMaterial({ color: 0xe8a0b4, roughness: 0.5 })
    );
    bloom.position.set(x, 1.05, -0.22);
    g.add(vase, bloom);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = !!shadows; o.receiveShadow = !!shadows; } });
  g.userData.incenseLocal = new THREE.Vector3(0, 1.3, 0);
  return g;
}

export function makeFishAndQing(mats) {
  const g = new THREE.Group();
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.4), mats.woodDark);
  stand.position.y = 0.55;
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), mats.wood);
  const l1 = leg.clone(); l1.position.set(-0.5, 0.25, 0.12);
  const l2 = leg.clone(); l2.position.set(0.5, 0.25, 0.12);
  const l3 = leg.clone(); l3.position.set(-0.5, 0.25, -0.12);
  const l4 = leg.clone(); l4.position.set(0.5, 0.25, -0.12);
  g.add(stand, l1, l2, l3, l4);
  // 木鱼
  const fish = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.woodDark);
  fish.scale.set(1.3, 0.85, 1);
  fish.position.set(-0.28, 0.72, 0);
  const hole = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 1 }));
  hole.position.set(-0.22, 0.76, 0.1);
  g.add(fish, hole);
  // 磬 (inverted bowl)
  const qing = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.bronze || mats.gold);
  qing.rotation.x = Math.PI;
  qing.position.set(0.32, 0.78, 0);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.015, 6, 12), mats.wood);
  frame.position.set(0.32, 0.86, 0);
  g.add(qing, frame);
  return g;
}
