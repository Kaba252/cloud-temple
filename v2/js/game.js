import * as THREE from "three";

const MOBILE = () => window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 800;

function lamb(color, extra = {}) {
  return new THREE.MeshLambertMaterial({ color, ...extra });
}
function phong(color, extra = {}) {
  return new THREE.MeshPhongMaterial({ color, ...extra });
}

function makeLabel(text, color = "#f0e0a8") {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = "600 28px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(12,10,8,0.45)";
  const w = Math.min(240, ctx.measureText(text).width + 24);
  ctx.beginPath();
  ctx.roundRect(128 - w / 2, 14, w, 36, 18);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(1.45, 0.36, 1);
  spr.position.y = 2.05;
  spr.userData.canvas = c;
  spr.userData.ctx = ctx;
  spr.userData.tex = tex;
  spr.userData.setText = (t, col = color) => {
    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = "rgba(12,10,8,0.45)";
    const ww = Math.min(240, ctx.measureText(t).width + 24);
    ctx.beginPath();
    ctx.roundRect(128 - ww / 2, 14, ww, 36, 18);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.fillText(t, 128, 34);
    tex.needsUpdate = true;
  };
  return spr;
}

function createMonk(opts = {}) {
  const robe = opts.robe ?? 0xa8b0b4;
  const sash = opts.sash ?? 0xd4a84e;
  const skin = opts.skin ?? 0xe0b089;
  const g = new THREE.Group();
  g.userData.kind = "monk";
  g.userData.id = opts.id || "self";

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 12),
    lamb(0x000000, { transparent: true, opacity: 0.28 })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  g.add(blob);

  const skinM = lamb(skin);
  const robeM = lamb(robe);
  const sashM = lamb(sash);
  const darkM = lamb(0x3a2a1c);

  const hips = new THREE.Group();
  hips.position.y = 0.42;
  g.add(hips);

  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 8), robeM);
  const legR = legL.clone();
  legL.position.set(-0.14, -0.18, 0);
  legR.position.set(0.14, -0.18, 0);
  const footL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), skinM);
  const footR = footL.clone();
  footL.position.set(-0.14, -0.44, 0.04);
  footR.position.set(0.14, -0.44, 0.04);
  hips.add(legL, legR, footL, footR);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 10), robeM);
  body.position.y = 0.85;
  g.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), robeM);
  belly.position.y = 0.62;
  belly.scale.set(1, 0.7, 0.9);
  g.add(belly);

  const kasaya = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.06), sashM);
  kasaya.position.set(0, 0.95, -0.3);
  kasaya.rotation.x = 0.08;
  g.add(kasaya);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.04), sashM);
  strap.position.set(-0.18, 0.95, 0.05);
  strap.rotation.z = 0.35;
  g.add(strap);

  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(-0.34, 1.05, 0);
  armR.position.set(0.34, 1.05, 0);
  const uL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.45, 8), robeM);
  const uR = uL.clone();
  uL.position.y = -0.22; uR.position.y = -0.22;
  const hL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), skinM);
  const hR = hL.clone();
  hL.position.y = -0.46; hR.position.y = -0.46;
  armL.add(uL, hL); armR.add(uR, hR);
  g.add(armL, armR);

  const head = new THREE.Group();
  head.position.y = 1.42;
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), skinM);
  skull.scale.set(1.05, 1, 1);
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), skinM);
  const earR = earL.clone();
  earL.position.set(-0.3, -0.02, 0);
  earR.position.set(0.3, -0.02, 0);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkM);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.1, 0.0, 0.28);
  eyeR.position.set(0.1, 0.0, 0.28);
  eyeL.scale.set(1, 0.7, 0.5);
  eyeR.scale.set(1, 0.7, 0.5);
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.07, 0.012, 6, 8, Math.PI),
    darkM
  );
  smile.position.set(0, -0.1, 0.29);
  smile.rotation.set(Math.PI, 0, 0);
  smile.scale.set(1, 0.6, 1);
  head.add(skull, earL, earR, eyeL, eyeR, smile);
  g.add(head);

  const label = makeLabel(opts.name || "小沙弥", opts.demo ? "#c8c0b0" : "#f0e0a8");
  g.add(label);

  const state = {
    action: "idle",
    sitting: false,
    phase: Math.random() * Math.PI * 2,
    bowT: 0,
    heshiT: 0,
    woodT: 0,
  };

  function setRobe(r, s) {
    robeM.color.setHex(r);
    sashM.color.setHex(s);
  }
  function setName(n, demo) {
    label.userData.setText(n, demo ? "#c8c0b0" : "#f0e0a8");
  }
  function setAction(a) {
    if (a === "sit") {
      state.sitting = true;
      state.action = "sit";
    } else if (a === "stand") {
      state.sitting = false;
      state.action = "idle";
    } else {
      state.action = a;
      if (a === "bow") state.bowT = 0;
      if (a === "heshi") state.heshiT = 0;
      if (a === "woodfish") state.woodT = 0;
    }
  }
  function update(dt, moving) {
    state.phase += dt * (moving ? 9 : 1.6);
    const br = Math.sin(state.phase) * (moving ? 0.03 : 0.012);
    body.scale.y = 1 + (moving ? 0 : br);
    if (state.sitting) {
      hips.visible = false;
      g.position.y = -0.15;
      armL.rotation.set(0.6, 0.2, 0.5);
      armR.rotation.set(0.6, -0.2, -0.5);
      head.rotation.x = 0.08;
      g.rotation.x = 0;
      return;
    }
    hips.visible = true;
    g.position.y = moving ? Math.abs(Math.sin(state.phase)) * 0.06 : 0;
    if (state.action === "bow" || state.bowT > 0 && state.action !== "idle") {
      // handled below
    }
    if (state.action === "heshi" || (state.heshiT > 0 && state.heshiT < 0.8)) {
      state.heshiT += dt;
      const k = Math.min(1, state.heshiT / 0.2);
      armL.rotation.set(0.3, 0.15, 1.15 * k);
      armR.rotation.set(0.3, -0.15, -1.15 * k);
      armL.rotation.x = -0.9;
      armR.rotation.x = -0.9;
      if (state.heshiT > 0.8 && state.action === "heshi") state.action = "idle";
    } else if (state.action === "bow" || (state.bowT > 0 && state.bowT < 0.7)) {
      state.bowT += dt;
      const t = state.bowT;
      const k = t < 0.32 ? t / 0.32 : Math.max(0, 1 - (t - 0.32) / 0.38);
      g.rotation.x = k * 0.7;
      armL.rotation.set(-0.9, 0.1, 1.0);
      armR.rotation.set(-0.9, -0.1, -1.0);
      head.rotation.x = 0.15;
      if (t >= 0.7 && state.action === "bow") {
        state.action = "idle";
        g.rotation.x = 0;
      }
    } else if (state.action === "woodfish") {
      state.woodT += dt;
      armR.rotation.set(-1.0, 0, -0.2 + Math.sin(state.woodT * 14) * 0.5);
      armL.rotation.set(0.3, 0.2, 0.4);
      if (state.woodT > 0.6) state.action = "idle";
    } else if (moving) {
      const sw = Math.sin(state.phase);
      legL.rotation.x = sw * 0.7;
      legR.rotation.x = -sw * 0.7;
      armL.rotation.set(sw * 0.5, 0, 0.25);
      armR.rotation.set(-sw * 0.5, 0, -0.25);
      head.rotation.x = 0;
      g.rotation.x = 0;
    } else {
      const id = Math.sin(state.phase);
      legL.rotation.x = 0;
      legR.rotation.x = 0;
      armL.rotation.set(0.15, 0.05, 0.3 + id * 0.03);
      armR.rotation.set(0.15, -0.05, -0.3 - id * 0.03);
      head.rotation.x = 0;
      g.rotation.x = 0;
    }
  }

  return { group: g, state, setRobe, setName, setAction, update, mats: { robeM, sashM } };
}

function buildWorld(scene, mats) {
  let _s = 20261111 >>> 0;
  const rng = () => {
    _s |= 0; _s = _s + 0x6D2B79F5 | 0;
    let t = Math.imul(_s ^ _s >>> 15, 1 | _s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const root = new THREE.Group();
  scene.add(root);
  const colliders = [];
  const interactables = [];
  const cushions = [];
  const areas = [];
  const decorations = { lamps: new THREE.Group(), ribbons: new THREE.Group(), smoke: [] };

  const addCol = (x, z, r) => colliders.push({ x, z, r });
  const mesh = (geo, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  // ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), mats.earth);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);
  ground.name = "ground";

  const pathMat = mats.stone;
  for (let z = 28; z >= -30; z -= 2.15) {
    for (let i = -1; i <= 1; i++) {
      const w = 1.9 + Math.random() * 0.25;
      const d = 1.95 + Math.random() * 0.2;
      const s = mesh(new THREE.BoxGeometry(w, 0.08, d), pathMat, i * 2.05 + (Math.random() - 0.5) * 0.15, 0.04, z + (Math.random() - 0.5) * 0.1);
      s.rotation.y = (Math.random() - 0.5) * 0.06;
      s.receiveShadow = true;
      s.castShadow = false;
    }
  }
  // cracked sticks
  for (let i = 0; i < 18; i++) {
    const tw = mesh(new THREE.BoxGeometry(0.04, 0.03, 0.5 + Math.random()), mats.woodDark, (Math.random() - 0.5) * 5, 0.07, -10 + Math.random() * 30);
    tw.rotation.y = Math.random() * Math.PI;
  }

  function hipRoof(parent, w, d, y, deep = 2.4, color = mats.roof) {
    const grp = new THREE.Group();
    const ow = 1.0, od = 1.0;
    const tw = w + ow * 2, td = d + od * 2;
    const ang = Math.atan2(deep, td / 2);
    const len = Math.hypot(td / 2, deep);
    const a = new THREE.Mesh(new THREE.BoxGeometry(tw + 0.4, 0.14, len), color);
    a.rotation.x = -ang;
    a.position.set(0, y + deep / 2, -td / 4 - 0.05);
    const b = a.clone();
    b.rotation.x = ang;
    b.position.z = td / 4 + 0.05;
    grp.add(a, b);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(tw + 0.2, 0.22, 0.3), color);
    ridge.position.set(0, y + deep + 0.05, 0);
    grp.add(ridge);
    // upturned corners
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 1.1), color);
        c.position.set(sx * (tw / 2), y + deep * 0.35, sz * (td / 2 + 0.15));
        c.rotation.x = sz * 0.45;
        c.rotation.z = -sx * 0.25;
        grp.add(c);
      }
    }
    parent.add(grp);
    return grp;
  }

  // ===== 山门 =====
  const gate = new THREE.Group();
  gate.position.set(0, 0, 10);
  root.add(gate);
  mesh(new THREE.BoxGeometry(10, 0.4, 3.2), mats.stoneLight, 0, 0.2, 0, gate);
  for (const x of [-3.2, 3.2]) {
    const p = mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.6, 10), mats.pillar, x, 2.5, 0, gate);
    p.castShadow = true;
  }
  mesh(new THREE.BoxGeometry(7.4, 0.28, 0.36), mats.woodDark, 0, 4.4, 0, gate);
  mesh(new THREE.BoxGeometry(7.4, 0.22, 0.3), mats.wood, 0, 3.6, 0, gate);
  hipRoof(gate, 8.2, 2.6, 4.6, 1.6);
  // plaque
  const plaque = mesh(new THREE.BoxGeometry(2.6, 0.7, 0.08), mats.plaque, 0, 3.95, 0.28, gate);
  const pLabel = makeLabel("云端禅院", "#f0e0a8");
  pLabel.scale.set(3.2, 0.8, 1);
  pLabel.position.set(0, 3.95, 0.36);
  gate.add(pLabel);
  // hanging lanterns on gate
  for (const x of [-2.2, -0.75, 0.75, 2.2]) addLantern(gate, x, 3.3, 0.6, true);
  areas.push({ name: "山门", x: 0, z: 10, r: 6 });
  areas.push({ name: "入口", x: 0, z: 22, r: 8 });

  // ===== 大雄宝殿 =====
  const hall = new THREE.Group();
  hall.position.set(0, 0, -28);
  root.add(hall);
  mesh(new THREE.BoxGeometry(20, 0.9, 14), mats.stoneLight, 0, 0.45, 0, hall);
  mesh(new THREE.BoxGeometry(4.5, 0.5, 3.2), mats.stone, 0, 0.25, 8, hall);
  mesh(new THREE.BoxGeometry(3.6, 0.35, 2), mats.stone, 0, 0.18, 10, hall);
  // floor
  mesh(new THREE.BoxGeometry(18.4, 0.08, 12.2), mats.wood, 0, 0.94, 0, hall);
  // pillars
  const pillarPos = [];
  for (const x of [-8, -4, 0, 4, 8]) {
    for (const z of [-5.2, 5.2]) {
      if (z > 0 && Math.abs(x) < 3) continue; // open front center
      pillarPos.push([x, z]);
    }
  }
  for (const x of [-8, 8]) pillarPos.push([x, 0]);
  for (const [x, z] of pillarPos) {
    mesh(new THREE.CylinderGeometry(0.28, 0.32, 5.2, 10), mats.pillar, x, 3.5, z, hall);
  }
  // walls
  mesh(new THREE.BoxGeometry(18.2, 4.4, 0.2), mats.cream, 0, 3.1, -5.8, hall);
  mesh(new THREE.BoxGeometry(0.2, 4.4, 11.4), mats.cream, -8.6, 3.1, 0, hall);
  mesh(new THREE.BoxGeometry(0.2, 4.4, 11.4), mats.cream, 8.6, 3.1, 0, hall);
  // lattice windows
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const z = -3.5 + i * 2.2;
      mesh(new THREE.BoxGeometry(0.08, 2.2, 1.5), mats.lattice, side * 8.72, 3.2, z, hall);
      for (let k = -1; k <= 1; k++) {
        mesh(new THREE.BoxGeometry(0.06, 2.0, 0.05), mats.woodDark, side * 8.78, 3.2, z + k * 0.4, hall);
      }
    }
  }
  hipRoof(hall, 20, 14, 5.8, 3.2);
  // hall plaque
  mesh(new THREE.BoxGeometry(3.4, 0.85, 0.1), mats.plaque, 0, 6.3, 7.4, hall);
  const hLab = makeLabel("大雄宝殿", "#f0e0a8");
  hLab.scale.set(3.6, 0.9, 1);
  hLab.position.set(0, 6.3, 7.5);
  hall.add(hLab);
  // hanging lanterns
  for (const x of [-6, -2, 2, 6]) addLantern(hall, x, 5.4, 6.2, true);

  // golden Buddha
  const buddha = new THREE.Group();
  buddha.position.set(0, 1.15, -4.2);
  hall.add(buddha);
  mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.25, 16), mats.gold, 0, 0.15, 0, buddha);
  mesh(new THREE.CylinderGeometry(0.9, 1.15, 0.2, 16), mats.gold, 0, 0.32, 0, buddha);
  const lotus = mesh(new THREE.SphereGeometry(0.7, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), mats.gold, 0, 0.35, 0, buddha);
  lotus.scale.set(1.4, 0.4, 1.4);
  mesh(new THREE.SphereGeometry(0.7, 12, 10), mats.gold, 0, 1.15, 0, buddha).scale.set(1.05, 0.9, 0.85);
  mesh(new THREE.SphereGeometry(0.38, 12, 10), mats.gold, 0, 1.85, 0.05, buddha);
  mesh(new THREE.SphereGeometry(0.1, 8, 6), mats.gold, 0, 2.22, 0, buddha);
  // halo
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 20), mats.gold);
  halo.position.set(0, 1.85, -0.2);
  buddha.add(halo);
  // glow
  const glow = new THREE.PointLight(0xffdd99, 2.2, 22, 2);
  glow.position.set(0, 3.2, 0);
  hall.add(glow);
  const backGlow = mesh(new THREE.PlaneGeometry(6, 5), lamb(0xffe2a0, { emissive: 0xaa7722, emissiveIntensity: 0.55, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }), 0, 3.4, -5.65, hall);

  addCol(0, -28, 8);
  // open the front: use AABB later — circle is coarse; we'll use a custom check
  colliders.pop();
  // AABB collider for hall except front steps
  hall.userData.aabb = { minX: -10, maxX: 10, minZ: -35, maxZ: -22 };
  interactables.push({ id: "buddha", type: "bow", x: 0, z: -22, r: 4, label: "向佛礼拜" });
  areas.push({ name: "大雄宝殿", x: 0, z: -28, r: 12 });

  // 蒲团 inside / in front of hall
  for (let row = 0; row < 2; row++) {
    for (let col = -2; col <= 2; col++) {
      const x = col * 1.5;
      const z = -19.2 - row * 1.5;
      const c = makeCushion(mats);
      c.position.set(x, 0.06, z);
      root.add(c);
      cushions.push({ x, z, y: 0.06, occ: false });
    }
  }
  // outdoor cushions near path
  for (const [x, z] of [[-6, 4], [6, 4], [-7, -6], [7, -8]]) {
    const c = makeCushion(mats);
    c.position.set(x, 0.06, z);
    root.add(c);
    cushions.push({ x, z, y: 0.06, occ: false });
  }

  // ===== 香炉 =====
  const ding = new THREE.Group();
  ding.position.set(0, 0, -18);
  root.add(ding);
  mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.7, 12), mats.bronze, 0, 0.55, 0, ding);
  mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 12), mats.bronze, 0, 0.95, 0, ding);
  for (const a of [0, 2.1, 4.2]) {
    const leg = mesh(new THREE.BoxGeometry(0.12, 0.4, 0.12), mats.bronze, Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.5, ding);
  }
  for (const x of [-0.2, 0, 0.2]) {
    const st = mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.7, 6), lamb(0xc4a882), x, 1.35, 0, ding);
    mesh(new THREE.SphereGeometry(0.04, 6, 6), lamb(0xffaa44, { emissive: 0xff6600, emissiveIntensity: 0.8 }), x, 1.72, 0, ding);
  }
  interactables.push({ id: "incense", type: "incense", x: 0, z: -18, r: 2.4, label: "上香" });
  decorations.incensePos = new THREE.Vector3(0, 1.8, -18);
  addCol(0, -18, 0.9);

  // ===== 宝塔 =====
  const pagoda = new THREE.Group();
  pagoda.position.set(-16, 0, -6);
  root.add(pagoda);
  mesh(new THREE.CylinderGeometry(4.2, 4.6, 0.4, 8), mats.stone, 0, 0.2, 0, pagoda);
  let size = 5.2;
  let y = 0.4;
  for (let i = 0; i < 5; i++) {
    const h = 1.35 - i * 0.08;
    mesh(new THREE.BoxGeometry(size, h, size), mats.stoneLight, 0, y + h / 2, 0, pagoda);
    // eaves
    mesh(new THREE.BoxGeometry(size + 1.1, 0.12, size + 1.1), mats.roof, 0, y + h + 0.04, 0, pagoda);
    // small corner lifts
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const e = mesh(new THREE.BoxGeometry(0.16, 0.1, 0.7), mats.roof, sx * (size / 2 + 0.4), y + h + 0.1, sz * (size / 2 + 0.2), pagoda);
      e.rotation.x = sz * 0.3;
    }
    y += h + 0.18;
    size *= 0.78;
  }
  mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.6, 8), mats.bronze, 0, y + 0.9, 0, pagoda);
  mesh(new THREE.SphereGeometry(0.18, 8, 6), mats.bronze, 0, y + 1.7, 0, pagoda);
  addCol(-16, -6, 3.2);
  interactables.push({ id: "pagoda", type: "pagoda", x: -16, z: -6, r: 7.5, label: "绕塔" });
  areas.push({ name: "宝塔", x: -16, z: -6, r: 9 });
  decorations.pagoda = { x: -16, z: -6 };

  // ===== 莲池 =====
  const pond = new THREE.Group();
  pond.position.set(16, 0, -5);
  root.add(pond);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.45, 8, 24), mats.stone);
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = 0.15;
  pond.add(rim);
  const water = new THREE.Mesh(new THREE.CircleGeometry(6.1, 24), mats.water);
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.08;
  pond.add(water);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r = 1.5 + (i % 3) * 1.2;
    addLotus(pond, Math.cos(a) * r, 0.1, Math.sin(a) * r, mats);
  }
  addCol(16, -5, 6.3);
  areas.push({ name: "莲池", x: 16, z: -5, r: 9 });

  // ===== 钟楼 =====
  const tower = new THREE.Group();
  tower.position.set(20, 0, -22);
  root.add(tower);
  mesh(new THREE.BoxGeometry(5, 0.4, 5), mats.stoneLight, 0, 0.2, 0, tower);
  for (const x of [-1.6, 1.6]) for (const z of [-1.6, 1.6]) {
    mesh(new THREE.CylinderGeometry(0.2, 0.22, 4.2, 8), mats.pillar, x, 2.3, z, tower);
  }
  hipRoof(tower, 5.2, 5.2, 4.3, 1.5);
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 1.1, 12), mats.bronze);
  bell.position.set(0, 3.1, 0);
  tower.add(bell);
  decorations.bellMesh = bell;
  const clapper = mesh(new THREE.SphereGeometry(0.12, 8, 6), mats.bronze, 0, 2.45, 0, tower);
  addCol(20, -22, 2.4);
  interactables.push({ id: "bell", type: "bell", x: 20, z: -22, r: 3, label: "撞钟" });
  areas.push({ name: "钟楼", x: 20, z: -22, r: 7 });

  // ===== 许愿树 =====
  const tree = addTree(root, -13, -17, 3.4, mats.leafO, mats, true);
  interactables.push({ id: "wish", type: "wish", x: -13, z: -17, r: 3, label: "许愿挂红" });
  areas.push({ name: "许愿树", x: -13, z: -17, r: 6 });
  decorations.wishTree = { x: -13, z: -17, group: decorations.ribbons };
  decorations.ribbons.position.set(-13, 0, -17);
  root.add(decorations.ribbons);
  addCol(-13, -17, 1.1);

  // ===== 竹林 =====
  const bambooMat = lamb(0x3d6a40);
  const bambooDark = lamb(0x2a4a2c);
  for (let i = 0; i < 55; i++) {
    const x = -26 + Math.random() * 10;
    const z = -28 + Math.random() * 16;
    const h = 4 + Math.random() * 3.5;
    const stalk = mesh(new THREE.CylinderGeometry(0.07, 0.09, h, 6), bambooMat, x, h / 2, z);
    stalk.castShadow = false;
    for (let k = 1; k < 4; k++) {
      mesh(new THREE.TorusGeometry(0.09, 0.015, 4, 8), bambooDark, x, k * (h / 4), z).rotation.x = Math.PI / 2;
    }
  }
  areas.push({ name: "竹林", x: -22, z: -22, r: 10 });

  // ===== 茶亭 =====
  const tea = new THREE.Group();
  tea.position.set(18, 0, 10);
  root.add(tea);
  for (const x of [-1.5, 1.5]) for (const z of [-1.5, 1.5]) {
    mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.6, 8), mats.wood, x, 1.3, z, tea);
  }
  hipRoof(tea, 4.2, 4.2, 2.6, 1.3);
  mesh(new THREE.BoxGeometry(1.8, 0.12, 0.5), mats.woodDark, 0, 0.55, 0, tea);
  areas.push({ name: "茶亭", x: 18, z: 10, r: 6 });

  // ===== 小溪 =====
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 36), mats.water);
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(24, 0.06, -8);
  stream.rotation.z = -0.15;
  root.add(stream);
  areas.push({ name: "河边步道", x: 22, z: 0, r: 8 });

  // ===== trees (instanced-ish batches) =====
  const treeSpots = [];
  const pushTree = (x, z) => {
    if (Math.abs(x) < 10 && z < 32 && z > -36) return; // keep the main path + start clear
    if (Math.hypot(x - 16, z + 5) < 8) return; // pond
    if (Math.hypot(x + 16, z + 6) < 7) return; // pagoda
    if (Math.hypot(x, z + 28) < 14) return; // hall
    if (Math.hypot(x - 20, z + 22) < 5) return; // bell
    if (Math.hypot(x, z - 24) < 8) return; // spawn
    treeSpots.push([x, z]);
  };
  for (let i = 0; i < 70; i++) {
    const a = rng() * Math.PI * 2;
    const r = 18 + rng() * 38;
    pushTree(Math.cos(a) * r, Math.sin(a) * r);
  }
  // designed clusters (autumn left/right of path)
  for (const [x, z] of [[-10, 6], [-12, 14], [-8, 18], [10, 16], [12, 8], [9, -12], [-20, 8], [8, -18], [-18, 16], [22, -30], [-22, 2], [14, 20], [-14, 22]]) {
    pushTree(x, z);
  }
  const leafMats = [mats.leafR, mats.leafO, mats.leafY, mats.leafR, mats.leafO];
  treeSpots.forEach(([x, z], i) => {
    addTree(root, x, z, 2.2 + Math.random() * 1.8, leafMats[i % leafMats.length], mats, false);
  });
  areas.push({ name: "林间小路", x: -12, z: 16, r: 8 });

  // stone lanterns along path
  for (const [x, z] of [[-4.2, 18], [4.2, 18], [-4.2, 6], [4.2, 6], [-4.2, -8], [4.2, -8], [-8, -16], [8, -16]]) {
    addStoneLantern(root, x, z, mats);
  }

  // benches
  for (const [x, z, ry] of [[10, -10, 0.4], [8, 2, -0.3], [-8, -10, 0.2]]) {
    const b = new THREE.Group();
    b.position.set(x, 0, z);
    b.rotation.y = ry;
    mesh(new THREE.BoxGeometry(1.8, 0.1, 0.5), mats.wood, 0, 0.45, 0, b);
    mesh(new THREE.BoxGeometry(0.1, 0.45, 0.45), mats.woodDark, -0.7, 0.22, 0, b);
    mesh(new THREE.BoxGeometry(0.1, 0.45, 0.45), mats.woodDark, 0.7, 0.22, 0, b);
    root.add(b);
  }

  // distant mountains
  const mtnMat = lamb(0x4a3d3a, { emissive: 0x0a0c12, emissiveIntensity: 0.15 });
  for (const [x, z, s] of [[-40, -70, 28], [-10, -80, 36], [30, -75, 30], [55, -60, 22], [-60, -50, 24]]) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(s * 0.7, s, 5), mtnMat);
    m.position.set(x, s * 0.28, z);
    m.castShadow = false;
    root.add(m);
  }

  // moon
  const moon = mesh(new THREE.SphereGeometry(3.2, 12, 10), lamb(0xe8e0c8, { emissive: 0x887760, emissiveIntensity: 0.4 }), -20, 38, -40);
  moon.castShadow = false;

  decorations.lamps.position.set(0, 0, 0);
  root.add(decorations.lamps);

  function addLantern(parent, x, y, z, hanging) {
    const grp = new THREE.Group();
    grp.position.set(x, y, z);
    const paper = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), mats.lantern);
    paper.scale.set(1, 1.25, 1);
    grp.add(paper);
    if (hanging) {
      const str = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 5), mats.woodDark);
      str.position.y = 0.4;
      grp.add(str);
    }
    parent.add(grp);
    return grp;
  }

  return { root, colliders, interactables, cushions, areas, decorations, hallAABB: hall.userData.aabb, addLantern };
}

function addLotus(parent, x, y, z, mats) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.45, 10), lamb(0x3a6a40));
  leaf.rotation.x = -Math.PI / 2;
  g.add(leaf);
  const petal = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lamb(0xe8b0c0));
  petal.position.y = 0.18;
  petal.scale.set(1, 0.8, 1);
  g.add(petal);
  parent.add(g);
}

function addTree(parent, x, z, h, leafMat, mats, solid) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, h, 6), mats.woodDark);
  trunk.position.y = h / 2;
  trunk.castShadow = false;
  g.add(trunk);
  const col = leafMat;
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.9 + Math.random() * 0.6, 8, 6), col);
    s.position.set((Math.random() - 0.5) * 1.4, h * 0.7 + Math.random() * 0.8, (Math.random() - 0.5) * 1.4);
    s.castShadow = false;
    g.add(s);
  }
  parent.add(g);
  return g;
}

function addStoneLantern(parent, x, z, mats) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9, 0.22), mats.stone);
  post.position.y = 0.45;
  g.add(post);
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), mats.lantern);
  box.position.y = 1.15;
  g.add(box);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), mats.stone);
  cap.position.y = 1.45;
  g.add(cap);
  parent.add(g);
}

function makeCushion(mats) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.14, 16), mats.cushion);
  top.position.y = 0.07;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 16), mats.cushionDark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.14;
  g.add(top, rim);
  return g;
}

export function createGame(canvas, hooks = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !MOBILE(), alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MOBILE() ? 1.4 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !MOBILE();
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x151c28, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x151c28, 45, 120);
  scene.background = new THREE.Color(0x151c28);

  const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.15, 200);

  const mats = {
    earth: lamb(0x6a5340),
    stone: lamb(0x5e6368),
    stoneLight: lamb(0x8a8e92),
    wood: lamb(0x4a3224),
    woodDark: lamb(0x2a1c14),
    pillar: lamb(0x7a2a24),
    roof: lamb(0x2a272c),
    gold: phong(0xe0c060, { emissive: 0x664410, emissiveIntensity: 0.45, shininess: 90 }),
    bronze: phong(0x8a6a32, { shininess: 50 }),
    water: phong(0x2a5558, { transparent: true, opacity: 0.78, shininess: 90, emissive: 0x082018, emissiveIntensity: 0.2 }),
    leafR: lamb(0xb43a22),
    leafO: lamb(0xd46a28),
    leafY: lamb(0xe0a040),
    cream: lamb(0xe6d9c4),
    lattice: lamb(0x2a2018),
    lantern: lamb(0xffe2a0, { emissive: 0xcc8844, emissiveIntensity: 0.85 }),
    plaque: lamb(0x1e3a2a),
    cushion: lamb(0x8c2f28),
    cushionDark: lamb(0x5a1c18),
  };

  hooks.onProgress?.(0.15, "布置殿宇…");
  const world = buildWorld(scene, mats);
  hooks.onProgress?.(0.55, "点亮灯火…");

  // lights
  scene.add(new THREE.AmbientLight(0x4a5568, 0.75));
  const hemi = new THREE.HemisphereLight(0x8a9bb0, 0x5a4030, 0.85);
  scene.add(hemi);
  const moonL = new THREE.DirectionalLight(0xd4dce8, 0.55);
  moonL.position.set(-20, 30, 10);
  if (!MOBILE()) {
    moonL.castShadow = true;
    moonL.shadow.mapSize.set(1024, 1024);
    moonL.shadow.camera.near = 4;
    moonL.shadow.camera.far = 80;
    moonL.shadow.camera.left = moonL.shadow.camera.bottom = -30;
    moonL.shadow.camera.right = moonL.shadow.camera.top = 30;
  }
  scene.add(moonL);
  const warm = new THREE.DirectionalLight(0xffcc88, 0.55);
  warm.position.set(6, 12, -20);
  scene.add(warm);
  const pathLight = new THREE.PointLight(0xffcc88, 0.8, 16, 2);
  pathLight.position.set(0, 3, 8);
  scene.add(pathLight);

  // player
  const player = createMonk({ id: "self", name: "小沙弥" });
  player.group.position.set(0, 0, 24);
  player.group.rotation.y = Math.PI; // face -Z? group forward is +Z by default, we want to look at hall (-Z)
  // In three.js, object default looks down -Z. rotation.y=0 faces -Z. Good. So rotation.y should be 0.
  player.group.rotation.y = 0;
  scene.add(player.group);

  const others = new Map(); // id -> {monk, target, ai?}

  // camera rig
  const cam = { yaw: 0, pitch: -0.34, dist: 9.2, min: 4, max: 16 };
  camera.position.set(0, 5.2, 24 + 9.2 * Math.cos(0.34));
  camera.lookAt(0, 1.25, 24);
  const look = new THREE.Vector3();
  const ideal = new THREE.Vector3();

  // movement
  const keys = Object.create(null);
  const joy = { x: 0, y: 0 };
  const target = { active: false, x: 0, z: 0 };
  let speed = 4.6;
  const vel = new THREE.Vector3();
  let sitting = false;
  let bowingAuto = false;

  // 绕塔
  const circ = { last: null, acc: 0, laps: 0, inside: false };

  // smoke particles
  const smokeGeo = new THREE.BufferGeometry();
  const SMOKE_N = 48;
  const sPos = new Float32Array(SMOKE_N * 3);
  const sLife = new Float32Array(SMOKE_N);
  smokeGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const smokeMat = new THREE.PointsMaterial({ color: 0xccc4b8, size: 0.18, transparent: true, opacity: 0.35, depthWrite: false });
  const smokePts = new THREE.Points(smokeGeo, smokeMat);
  scene.add(smokePts);
  let smokeEmit = 0;

  function emitSmoke(origin, n = 3) {
    for (let i = 0; i < n; i++) {
      let idx = 0;
      for (let k = 0; k < SMOKE_N; k++) if (sLife[k] <= 0) { idx = k; break; }
      sPos[idx * 3] = origin.x + (Math.random() - 0.5) * 0.2;
      sPos[idx * 3 + 1] = origin.y;
      sPos[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.2;
      sLife[idx] = 1;
    }
  }
  // idle incense trickle
  function updateSmoke(dt) {
    smokeEmit += dt;
    if (smokeEmit > 0.25) {
      smokeEmit = 0;
      if (world.decorations.incensePos) emitSmoke(world.decorations.incensePos, 1);
    }
    for (let i = 0; i < SMOKE_N; i++) {
      if (sLife[i] <= 0) continue;
      sLife[i] -= dt * 0.35;
      sPos[i * 3 + 1] += dt * 0.55;
      sPos[i * 3] += dt * 0.08;
      if (sLife[i] <= 0) sPos[i * 3 + 1] = -10;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  }

  function blocked(x, z) {
    if (Math.abs(x) > 52 || Math.abs(z) > 52) return true;
    const a = world.hallAABB;
    if (a && x > a.minX && x < a.maxX && z > a.minZ && z < a.maxZ) {
      // allow front porch / interior along center aisle? block walls, allow interior z > -33 and |x|<7 if z < -22 (inside)
      // simpler: block the building volume except a doorway |x|<2.2 and z > -23 (steps) or already inside
      const inside = z < -22.2 && z > -33 && Math.abs(x) < 7.5;
      const door = Math.abs(x) < 2.4 && z > -23 && z < -20;
      if (!inside && !door && z < -21) return true;
    }
    for (const c of world.colliders) {
      const dx = x - c.x, dz = z - c.z;
      if (dx * dx + dz * dz < (c.r + 0.4) * (c.r + 0.4)) return true;
    }
    return false;
  }

  function tryMove(nx, nz) {
    if (!blocked(nx, nz)) { player.group.position.x = nx; player.group.position.z = nz; return true; }
    const x = player.group.position.x, z = player.group.position.z;
    if (!blocked(nx, z)) { player.group.position.x = nx; return true; }
    if (!blocked(x, nz)) { player.group.position.z = nz; return true; }
    return false;
  }

  function currentArea() {
    const x = player.group.position.x, z = player.group.position.z;
    let best = { name: "禅院", d: 1e9 };
    for (const a of world.areas) {
      const d = Math.hypot(x - a.x, z - a.z);
      if (d < a.r && d < best.d) best = { name: a.name, d };
    }
    return best.name;
  }

  function nearestInteract() {
    const x = player.group.position.x, z = player.group.position.z;
    let best = null, bd = 1e9;
    for (const it of world.interactables) {
      const d = Math.hypot(x - it.x, z - it.z);
      if (d < it.r && d < bd) { best = it; bd = d; }
    }
    // cushions
    if (!sitting) {
      for (const c of world.cushions) {
        const d = Math.hypot(x - c.x, z - c.z);
        if (d < 1.15 && d < bd) { best = { id: "sit", type: "sit", x: c.x, z: c.z, r: 1.15, label: "坐下", cushion: c }; bd = d; }
      }
    } else {
      best = { id: "stand", type: "stand", label: "起身" };
    }
    return best;
  }

  // pagoda laps
  function updateCircumambulate() {
    const p = world.decorations.pagoda;
    const dx = player.group.position.x - p.x;
    const dz = player.group.position.z - p.z;
    const dist = Math.hypot(dx, dz);
    const inside = dist > 3.4 && dist < 8;
    if (!inside) { circ.inside = false; circ.last = null; circ.acc = 0; return; }
    const ang = Math.atan2(dz, dx);
    if (circ.last != null) {
      let d = ang - circ.last;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      circ.acc += d;
      if (Math.abs(circ.acc) >= Math.PI * 2) {
        circ.laps += 1;
        circ.acc = 0;
        hooks.onLap?.(circ.laps);
      }
    }
    circ.last = ang;
    circ.inside = true;
  }

  let lastPrompt = null;
  let lastArea = "";

  // pointer
  const ptr = { down: false, id: null, x: 0, y: 0, lx: 0, ly: 0, dragged: false, pinching: false, pdist: 0 };
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (ptr.down && e.pointerId !== ptr.id) {
      // second finger = pinch
      const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
      ptr.pinching = true;
      ptr.pdist = Math.hypot(dx, dy);
      return;
    }
    ptr.down = true; ptr.id = e.pointerId; ptr.dragged = false;
    ptr.x = ptr.lx = e.clientX; ptr.y = ptr.ly = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener("pointermove", (e) => {
    if (ptr.pinching) {
      const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
      const d = Math.hypot(dx, dy);
      if (ptr.pdist > 0) cam.dist = Math.min(cam.max, Math.max(cam.min, cam.dist * (ptr.pdist / Math.max(40, d))));
      ptr.pdist = d;
      return;
    }
    if (!ptr.down || e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.lx, dy = e.clientY - ptr.ly;
    ptr.lx = e.clientX; ptr.ly = e.clientY;
    if (Math.abs(e.clientX - ptr.x) + Math.abs(e.clientY - ptr.y) > 8) ptr.dragged = true;
    if (ptr.dragged) {
      cam.yaw -= dx * 0.005;
      cam.pitch -= dy * 0.004;
      cam.pitch = Math.max(-1.15, Math.min(-0.12, cam.pitch));
    }
  });
  function endPtr(e) {
    if (ptr.pinching && e.pointerId !== ptr.id) { ptr.pinching = false; return; }
    if (e.pointerId !== ptr.id) return;
    if (ptr.down && !ptr.dragged && !ptr.pinching) onTap(e.clientX, e.clientY);
    ptr.down = false; ptr.pinching = false; ptr.id = null;
  }
  canvas.addEventListener("pointerup", endPtr);
  canvas.addEventListener("pointercancel", endPtr);
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    cam.dist = Math.min(cam.max, Math.max(cam.min, cam.dist + e.deltaY * 0.01));
  }, { passive: false });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  function onTap(cx, cy) {
    ndc.x = (cx / window.innerWidth) * 2 - 1;
    ndc.y = -(cy / window.innerHeight) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    // monks first
    const monkMeshes = [];
    others.forEach((o) => monkMeshes.push(o.monk.group));
    const mh = ray.intersectObjects(monkMeshes, true);
    if (mh.length) {
      let obj = mh[0].object;
      while (obj && obj.userData.kind !== "monk") obj = obj.parent;
      if (obj) { hooks.onTapMonk?.(obj.userData.id, obj.userData); return; }
    }
    if (ray.ray.intersectPlane(groundPlane, hit)) {
      if (sitting) standUp();
      target.active = true;
      target.x = hit.x;
      target.z = hit.z;
    }
  }

  window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    if (e.code === "Digit1" || e.code === "KeyE" || e.code === "Space") hooks.onHotkey?.("bow");
    if (e.code === "Digit2") hooks.onHotkey?.("beads");
    if (e.code === "Digit3") hooks.onHotkey?.("heshi");
    if (e.code === "Digit5") hooks.onHotkey?.("woodfish");
  });
  window.addEventListener("keyup", (e) => { keys[e.code] = false; });

  function standUp() {
    sitting = false;
    player.setAction("stand");
    hooks.onState?.();
  }
  function sitAt(c) {
    sitting = true;
    target.active = false;
    player.group.position.x = c.x;
    player.group.position.z = c.z;
    player.setAction("sit");
    hooks.onState?.();
  }

  const clock = new THREE.Clock();
  let running = true;
  let areaTick = 0;

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, clock.getDelta());

    let ix = joy.x, iz = joy.y;
    if (keys.KeyW || keys.ArrowUp) iz += 1;
    if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1;
    const usingKey = Math.abs(ix) + Math.abs(iz) > 0.05;
    if (usingKey && sitting) standUp();
    if (usingKey) target.active = false;

    let moving = false;
    if (!sitting && !bowingAuto) {
      if (usingKey) {
        const len = Math.hypot(ix, iz) || 1;
        ix /= len; iz /= len;
        const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw);
        const rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
        const dx = (fx * iz + rx * ix) * speed * dt;
        const dz = (fz * iz + rz * ix) * speed * dt;
        tryMove(player.group.position.x + dx, player.group.position.z + dz);
        player.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
        moving = true;
      } else if (target.active) {
        const dx = target.x - player.group.position.x;
        const dz = target.z - player.group.position.z;
        const d = Math.hypot(dx, dz);
        if (d < 0.15) target.active = false;
        else {
          const step = Math.min(d, speed * dt);
          tryMove(player.group.position.x + (dx / d) * step, player.group.position.z + (dz / d) * step);
          player.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
          moving = true;
        }
      }
    }

    player.update(dt, moving);
    updateSmoke(dt);
    updateCircumambulate();
    if (world.decorations.bellMesh) {
      world.decorations.bellMesh.rotation.z *= 0.92;
    }

    // others
    others.forEach((o) => {
      if (o.ai) updateBot(o, dt);
      else if (o.goal) {
        const dx = o.goal.x - o.monk.group.position.x;
        const dz = o.goal.z - o.monk.group.position.z;
        const d = Math.hypot(dx, dz);
        const movingO = d > 0.08;
        if (movingO) {
          const step = Math.min(d, 4.2 * dt);
          o.monk.group.position.x += (dx / d) * step;
          o.monk.group.position.z += (dz / d) * step;
          o.monk.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
        }
        o.monk.update(dt, movingO);
      } else {
        o.monk.update(dt, false);
      }
    });

    // camera
    const p = player.group.position;
    look.set(p.x, p.y + 1.25, p.z);
    const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    ideal.set(
      look.x + Math.sin(cam.yaw) * cam.dist * cp,
      look.y + cam.dist * (-sp),
      look.z + Math.cos(cam.yaw) * cam.dist * cp
    );
    camera.position.lerp(ideal, 1 - Math.exp(-dt * 6));
    camera.lookAt(look);

    // prompts
    areaTick += dt;
    if (areaTick > 0.25) {
      areaTick = 0;
      const area = currentArea();
      if (area !== lastArea) { lastArea = area; hooks.onArea?.(area); }
      const it = nearestInteract();
      const key = it ? it.id : null;
      if (key !== lastPrompt) { lastPrompt = key; hooks.onPrompt?.(it); }
    }

    renderer.render(scene, camera);
    hooks.onFrame?.(dt);
  }

  function updateBot(o, dt) {
    const b = o.ai;
    b.t += dt;
    if (b.mode === "wait") {
      o.monk.update(dt, false);
      if (b.t > b.wait) {
        if (Math.random() < 0.2) { o.monk.setAction("bow"); b.t = 0; b.wait = 1.2; return; }
        if (Math.random() < 0.15) { o.monk.setAction("heshi"); b.t = 0; b.wait = 1; return; }
        if (Math.random() < 0.12 && world.cushions.length) {
          const c = world.cushions[Math.floor(Math.random() * world.cushions.length)];
          b.tx = c.x; b.tz = c.z; b.mode = "walk"; b.sitWhen = true; b.t = 0;
          return;
        }
        const wp = world.areas[Math.floor(Math.random() * world.areas.length)];
        const ang = Math.random() * Math.PI * 2;
        b.tx = wp.x + Math.cos(ang) * (wp.r * 0.4);
        b.tz = wp.z + Math.sin(ang) * (wp.r * 0.4);
        if (blocked(b.tx, b.tz)) { b.tx = (Math.random() - 0.5) * 20; b.tz = Math.random() * 20; }
        b.mode = "walk"; b.sitWhen = false; b.t = 0;
        if (o.monk.state.sitting) o.monk.setAction("stand");
      }
      return;
    }
    const dx = b.tx - o.monk.group.position.x;
    const dz = b.tz - o.monk.group.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.2) {
      o.monk.update(dt, false);
      if (b.sitWhen) o.monk.setAction("sit");
      b.mode = "wait"; b.t = 0; b.wait = 2 + Math.random() * 6;
      return;
    }
    const step = Math.min(d, 2.2 * dt);
    o.monk.group.position.x += (dx / d) * step;
    o.monk.group.position.z += (dz / d) * step;
    o.monk.group.rotation.y = Math.atan2(dx, dz) + Math.PI;
    o.monk.update(dt, true);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  hooks.onProgress?.(0.9, "迎客入山…");

  const api = {
    start() { running = true; clock.getDelta(); tick(); },
    setJoystick(x, y) { joy.x = x; joy.y = y; },
    setName(n, demo) { player.setName(n, demo); },
    setRobe(r, s) { player.setRobe(r, s); },
    playAction(a) {
      if (a === "sit") {
        const it = nearestInteract();
        if (it && it.type === "sit") sitAt(it.cushion);
        return;
      }
      if (a === "stand") { standUp(); return; }
      if (sitting && a !== "heshi") standUp();
      player.setAction(a);
    },
    setBowingAuto(v) { bowingAuto = v; },
    getState() {
      return {
        x: player.group.position.x,
        z: player.group.position.z,
        rot: player.group.rotation.y,
        action: player.state.action,
        sitting,
        area: lastArea,
        laps: circ.laps,
      };
    },
    setPeer(id, st) {
      let o = others.get(id);
      if (!o) {
        const m = createMonk({ id, name: st.name, robe: st.robe, sash: st.sash, demo: st.demo });
        if (st.demo) m.setName((st.name || "同修") + " · 演示", true);
        m.group.position.set(st.x || 0, 0, st.z || 0);
        m.group.rotation.y = st.rot || 0;
        m.group.userData.id = id;
        scene.add(m.group);
        o = { monk: m, goal: { x: st.x || 0, z: st.z || 0 }, ai: st.ai ? { mode: "wait", t: 0, wait: Math.random() * 3, tx: 0, tz: 0 } : null };
        others.set(id, o);
      }
      if (st.name) o.monk.setName(st.demo ? st.name + " · 演示" : st.name, st.demo);
      if (st.robe) o.monk.setRobe(st.robe, st.sash ?? 0xd4a84e);
      if (st.ai) return;
      if (st.x != null) o.goal = { x: st.x, z: st.z };
      if (st.rot != null && !o.goal) o.monk.group.rotation.y = st.rot;
      if (st.action) o.monk.setAction(st.action);
      if (st.sitting) o.monk.setAction("sit");
    },
    removePeer(id) {
      const o = others.get(id);
      if (!o) return;
      scene.remove(o.monk.group);
      others.delete(id);
    },
    peerIds() { return [...others.keys()]; },
    addLamp(type = "changming") {
      const colors = { changming: 0xffe08a, pingan: 0xffb07a, wenchang: 0xdfe9ff };
      const col = colors[type] || 0xffe08a;
      const n = world.decorations.lamps.children.length;
      const x = ((n % 6) - 2.5) * 0.7;
      const z = -19.5 - Math.floor(n / 6) * 0.5;
      const g = new THREE.Group();
      g.position.set(x, 0.2, z);
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.4, 8), mats.bronze);
      stand.position.y = 0.2;
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), lamb(col, { emissive: col, emissiveIntensity: 0.9 }));
      flame.position.y = 0.5;
      g.add(stand, flame);
      world.decorations.lamps.add(g);
    },
    addRibbon() {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.7), lamb(0xc4452a, { side: THREE.DoubleSide }));
      const a = Math.random() * Math.PI * 2;
      r.position.set(Math.cos(a) * 0.9, 1.4 + Math.random() * 1.2, Math.sin(a) * 0.9);
      r.rotation.y = a;
      world.decorations.ribbons.add(r);
    },
    strikeIncense() {
      if (world.decorations.incensePos) emitSmoke(world.decorations.incensePos, 8);
    },
    strikeBell() {
      if (world.decorations.bellMesh) world.decorations.bellMesh.rotation.z = 0.35;
    },
    getMinimap() {
      const pts = [{ id: "self", x: player.group.position.x, z: player.group.position.z, self: true }];
      others.forEach((o, id) => pts.push({ id, x: o.monk.group.position.x, z: o.monk.group.position.z, demo: !!o.ai }));
      return { pts, areas: world.areas, decorations: world.decorations };
    },
    interactNearest() { return nearestInteract(); },
    sitNearest() {
      const it = nearestInteract();
      if (it && it.type === "sit") sitAt(it.cushion);
    },
    canvas, camera, scene,
  };
  return api;
}
