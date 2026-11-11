import * as THREE from "three";

export function makeLabel(text, color = "#f0e0a8") {
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
  spr.position.y = 1.85;
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

function clothNormal() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * 128;
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, "#6a6aff");
    g.addColorStop(0.5, "#9a9aff");
    g.addColorStop(1, "#6a6aff");
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, 128);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(2, 3);
  return t;
}

const CLOTH_NOR = clothNormal();

function robeMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0.0,
    envMapIntensity: 0.45,
    normalMap: CLOTH_NOR,
    normalScale: new THREE.Vector2(0.12, 0.12),
  });
}

function latheRobe() {
  const pts = [
    new THREE.Vector2(0.22, 0.02),
    new THREE.Vector2(0.26, 0.08),
    new THREE.Vector2(0.28, 0.28),
    new THREE.Vector2(0.26, 0.55),
    new THREE.Vector2(0.25, 0.78),
    new THREE.Vector2(0.27, 1.05),
    new THREE.Vector2(0.24, 1.22),
    new THREE.Vector2(0.18, 1.32),
    new THREE.Vector2(0.14, 1.36),
  ];
  const g = new THREE.LatheGeometry(pts, 16);
  g.computeVertexNormals();
  return g;
}

export function createMonk(opts = {}) {
  const robeCol = opts.robe ?? 0xa8b0b4;
  const sashCol = opts.sash ?? 0xd4a84e;
  const skinCol = opts.skin ?? 0xe0b089;
  const g = new THREE.Group();
  g.userData.kind = "monk";
  g.userData.id = opts.id || "self";

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  g.add(blob);

  const skinM = new THREE.MeshStandardMaterial({ color: skinCol, roughness: 0.52, metalness: 0.02, envMapIntensity: 0.35 });
  const scalpM = new THREE.MeshStandardMaterial({ color: 0xc49874, roughness: 0.72, metalness: 0, envMapIntensity: 0.25 });
  const robeM = robeMat(robeCol);
  const sashM = robeMat(sashCol);
  sashM.roughness = 0.55;
  const darkM = new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.5, metalness: 0 });
  const whiteM = new THREE.MeshStandardMaterial({ color: 0xf4efe8, roughness: 0.35, metalness: 0 });

  const root = new THREE.Group();
  g.add(root);

  const hips = new THREE.Group();
  hips.position.y = 0.52;
  root.add(hips);

  function limb(rTop, rBot, h, mat, segs = 10) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  const thighL = new THREE.Group(); const thighR = new THREE.Group();
  thighL.position.set(-0.13, 0, 0);
  thighR.position.set(0.13, 0, 0);
  const thL = limb(0.1, 0.09, 0.38, robeM); thL.position.y = -0.19;
  const thR = thL.clone();
  thighL.add(thL); thighR.add(thR);
  const shinL = new THREE.Group(); const shinR = new THREE.Group();
  shinL.position.y = -0.38; shinR.position.y = -0.38;
  const shL = limb(0.085, 0.075, 0.36, robeM); shL.position.y = -0.18;
  const shR = shL.clone();
  shinL.add(shL); shinR.add(shR);
  const footL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skinM);
  const footR = footL.clone();
  footL.scale.set(1, 0.55, 1.35); footR.scale.set(1, 0.55, 1.35);
  footL.position.set(0, -0.38, 0.04); footR.position.set(0, -0.38, 0.04);
  shinL.add(footL); shinR.add(footR);
  thighL.add(shinL); thighR.add(shinR);
  hips.add(thighL, thighR);

  const spine = new THREE.Group();
  spine.position.y = 0.52;
  root.add(spine);

  const robe = new THREE.Mesh(latheRobe(), robeM);
  robe.position.y = -0.5;
  robe.castShadow = true;
  robe.receiveShadow = true;
  spine.add(robe);

  const kasaya = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.7, 0.08), sashM);
  kasaya.position.set(0.08, 0.78, -0.16);
  kasaya.scale.set(0.9, 0.85, 0.7);
  kasaya.rotation.x = 0.12;
  kasaya.castShadow = true;
  spine.add(kasaya);
  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.045), sashM);
  strap.position.set(-0.16, 0.72, 0.04);
  strap.rotation.z = 0.38;
  spine.add(strap);

  const armL = new THREE.Group(); const armR = new THREE.Group();
  armL.position.set(-0.28, 1.08, 0.04);
  armR.position.set(0.28, 1.08, 0.04);
  const uL = limb(0.075, 0.07, 0.32, robeM); uL.position.y = -0.16;
  const uR = uL.clone();
  armL.add(uL); armR.add(uR);
  const foreL = new THREE.Group(); const foreR = new THREE.Group();
  foreL.position.y = -0.32; foreR.position.y = -0.32;
  const fL = limb(0.065, 0.055, 0.28, robeM); fL.position.y = -0.14;
  const fR = fL.clone();
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), skinM);
  const handR = handL.clone();
  handL.position.y = -0.30; handR.position.y = -0.30;
  handL.castShadow = true; handR.castShadow = true;
  foreL.add(fL, handL); foreR.add(fR, handR);
  armL.add(foreL); armR.add(foreR);
  spine.add(armL, armR);

  const neck = new THREE.Group();
  neck.position.y = 1.34;
  spine.add(neck);
  const neckM = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 10), skinM);
  neckM.position.y = 0.02;
  neck.add(neckM);

  const head = new THREE.Group();
  head.position.y = 0.18;
  neck.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 14), skinM);
  skull.scale.set(0.96, 1.05, 0.95);
  skull.castShadow = true;
  const scalp = new THREE.Mesh(new THREE.SphereGeometry(0.177, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.48), scalpM);
  scalp.scale.set(0.97, 1.02, 0.96);
  scalp.position.y = 0.01;
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), skinM);
  const earR = earL.clone();
  earL.position.set(-0.15, -0.02, 0);
  earR.position.set(0.15, -0.02, 0);
  earL.scale.set(0.7, 1.1, 0.8); earR.scale.set(0.7, 1.1, 0.8);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), skinM);
  nose.position.set(0, -0.03, 0.14);
  nose.scale.set(0.8, 0.9, 1.1);

  const eyeWhiteL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), whiteM);
  const eyeWhiteR = eyeWhiteL.clone();
  eyeWhiteL.position.set(-0.055, 0.01, 0.13);
  eyeWhiteR.position.set(0.055, 0.01, 0.13);
  eyeWhiteL.scale.set(1, 0.7, 0.5); eyeWhiteR.scale.set(1, 0.7, 0.5);
  const irisL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), darkM);
  const irisR = irisL.clone();
  irisL.position.set(-0.055, 0.01, 0.145);
  irisR.position.set(0.055, 0.01, 0.145);
  irisL.scale.set(1, 0.85, 0.5); irisR.scale.set(1, 0.85, 0.5);

  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.015, 0.02), skinM);
  brow.position.set(0, 0.05, 0.13);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 8, Math.PI), darkM);
  mouth.position.set(0, -0.08, 0.135);
  mouth.rotation.set(Math.PI, 0, 0);
  mouth.scale.set(1, 0.5, 1);

  head.add(skull, scalp, earL, earR, nose, eyeWhiteL, eyeWhiteR, irisL, irisR, brow, mouth);

  const label = makeLabel(opts.name || "小沙弥", opts.demo ? "#c8c0b0" : "#f0e0a8");
  g.add(label);

  const bones = { root, hips, spine, thighL, thighR, shinL, shinR, armL, armR, foreL, foreR, neck, head };

  const state = {
    action: "idle",
    sitting: false,
    phase: Math.random() * Math.PI * 2,
    bowT: 0,
    heshiT: 0,
    woodT: 0,
  };

  function resetPose() {
    root.position.y = 0;
    root.rotation.set(0, 0, 0);
    hips.rotation.set(0, 0, 0);
    spine.rotation.set(0, 0, 0);
    neck.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    thighL.rotation.set(0, 0, 0.04);
    thighR.rotation.set(0, 0, -0.04);
    shinL.rotation.set(0, 0, 0);
    shinR.rotation.set(0, 0, 0);
    armL.rotation.set(0.35, 0.05, 0.12);
    armR.rotation.set(0.35, -0.05, -0.12);
    foreL.rotation.set(0.15, 0, 0);
    foreR.rotation.set(0.15, 0, 0);
  }

  function setRobe(r, s) {
    robeM.color.setHex(r);
    sashM.color.setHex(s);
  }
  function setName(n, demo) {
    label.userData.setText(n, demo ? "#c8c0b0" : "#f0e0a8");
  }
  function setLabelVisible(v) { label.visible = !!v; }
  function setAction(a) {
    if (a === "sit") {
      state.sitting = true;
      state.action = "sit";
    } else if (a === "stand") {
      state.sitting = false;
      state.action = "idle";
      resetPose();
    } else {
      state.action = a;
      if (a === "bow") state.bowT = 0;
      if (a === "heshi") state.heshiT = 0;
      if (a === "woodfish") state.woodT = 0;
    }
  }

  function poseSit() {
    root.position.y = -0.32;
    thighL.rotation.set(1.35, 0, 0.15);
    thighR.rotation.set(1.35, 0, -0.15);
    shinL.rotation.x = -2.35;
    shinR.rotation.x = -2.35;
    spine.rotation.x = 0.12;
    armL.rotation.set(-0.85, 0.2, 0.85);
    armR.rotation.set(-0.85, -0.2, -0.85);
    foreL.rotation.x = 0.4;
    foreR.rotation.x = 0.4;
    head.rotation.x = 0.08;
  }

  function poseBow(k) {
    // k 0..1: 0 stand, 0.35 kneel, 0.7 full prostration, 1 rise
    const kneel = Math.min(1, k / 0.3);
    const down = k < 0.3 ? 0 : (k < 0.7 ? (k - 0.3) / 0.4 : Math.max(0, 1 - (k - 0.7) / 0.3));
    const kn = k < 0.7 ? kneel : Math.max(0, 1 - (k - 0.7) / 0.3);
    root.position.y = -0.42 * kn - 0.38 * down;
    root.rotation.x = 0.35 * down;
    thighL.rotation.set(1.5 * kn, 0, 0.1);
    thighR.rotation.set(1.5 * kn, 0, -0.1);
    shinL.rotation.x = -2.45 * kn;
    shinR.rotation.x = -2.45 * kn;
    spine.rotation.x = 0.2 * kn + 1.15 * down;
    neck.rotation.x = 0.25 * down;
    head.rotation.x = 0.2 + 0.35 * down;
    armL.rotation.set(-0.2 - 1.5 * down, 0.1, 0.15 + 0.35 * down);
    armR.rotation.set(-0.2 - 1.5 * down, -0.1, -0.15 - 0.35 * down);
    foreL.rotation.x = 0.15 + 0.7 * down;
    foreR.rotation.x = 0.15 + 0.7 * down;
  }

  function update(dt, moving) {
    state.phase += dt * (moving ? 9.2 : 1.5);
    const ph = state.phase;

    if (state.sitting && state.action !== "bow") {
      poseSit();
      const br = Math.sin(ph) * 0.01;
      spine.position.y = 0.52 + br;
      if (state.action === "heshi" || (state.heshiT > 0 && state.heshiT < 1)) {
        state.heshiT += dt;
        const k = Math.min(1, state.heshiT / 0.2);
        armL.rotation.set(-1.15, 0.15, 0.95 * k);
        armR.rotation.set(-1.15, -0.15, -0.95 * k);
        if (state.heshiT > 1 && state.action === "heshi") state.action = "sit";
      }
      return;
    }

    spine.position.y = 0.52;

    if (state.action === "heshi" || (state.heshiT > 0 && state.heshiT < 0.9)) {
      resetPose();
      state.heshiT += dt;
      const k = Math.min(1, state.heshiT / 0.18);
      const hold = state.heshiT < 0.7 ? k : Math.max(0, 1 - (state.heshiT - 0.7) / 0.2);
      armL.rotation.set(-1.2, 0.12, 0.95 * hold);
      armR.rotation.set(-1.2, -0.12, -0.95 * hold);
      foreL.rotation.x = 0.15;
      foreR.rotation.x = 0.15;
      head.rotation.x = 0.12 * hold;
      if (state.heshiT > 0.9 && state.action === "heshi") state.action = "idle";
      return;
    }

    if (state.action === "bow" || (state.bowT > 0 && state.bowT < 1.15)) {
      state.bowT += dt;
      const t = Math.min(1, state.bowT / 1.15);
      poseBow(t);
      if (state.bowT >= 1.15 && state.action === "bow") {
        state.action = "idle";
        resetPose();
      }
      return;
    }

    if (state.action === "woodfish") {
      resetPose();
      state.woodT += dt;
      armR.rotation.set(-1.05, 0, -0.15 + Math.sin(state.woodT * 14) * 0.55);
      foreR.rotation.x = 0.4;
      armL.rotation.set(0.3, 0.15, 0.35);
      if (state.woodT > 0.65) { state.action = "idle"; resetPose(); }
      return;
    }

    resetPose();
    if (moving) {
      const sw = Math.sin(ph);
      const sw2 = Math.sin(ph + Math.PI);
      thighL.rotation.x = sw * 0.7;
      thighR.rotation.x = sw2 * 0.7;
      shinL.rotation.x = Math.max(0, -sw) * 0.45;
      shinR.rotation.x = Math.max(0, -sw2) * 0.45;
      armL.rotation.set(sw2 * 0.45, 0.05, 0.22);
      armR.rotation.set(sw * 0.45, -0.05, -0.22);
      spine.rotation.y = sw * 0.05;
      root.position.y = Math.abs(Math.sin(ph)) * 0.04;
      head.rotation.x = -0.05;
    } else {
      const id = Math.sin(ph);
      armL.rotation.set(0.35, 0.04, 0.12 + id * 0.03);
      armR.rotation.set(0.35, -0.04, -0.12 - id * 0.03);
      spine.rotation.x = id * 0.012;
      head.rotation.y = Math.sin(ph * 0.5) * 0.06;
    }
  }

  resetPose();
  return { group: g, state, setRobe, setName, setAction, setLabelVisible, update, bones, mats: { robeM, sashM } };
}
