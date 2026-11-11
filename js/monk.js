import * as THREE from "three";

export function makeLabel(text, color = "#f0e0a8") {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const ctx = c.getContext("2d");
  const draw = (t, col = color) => {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = "600 28px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(12,10,8,0.45)";
    const w = Math.min(240, ctx.measureText(t).width + 24);
    ctx.beginPath();
    ctx.roundRect(128 - w / 2, 14, w, 36, 18);
    ctx.fill();
    ctx.fillStyle = col;
    ctx.fillText(t, 128, 34);
  };
  draw(text, color);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(1.45, 0.36, 1);
  spr.position.y = 2.05;
  spr.userData.setText = (t, col = color) => { draw(t, col); tex.needsUpdate = true; };
  return spr;
}

/** Flush plaque board: characters are evenly spaced and fully inside the board. */
export function makePlaqueMesh(text, w = 3.6, h = 0.95, opts = {}) {
  const W = 1024, H = 256;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  const bg = opts.bg || "#163526";
  const fg = opts.fg || "#f3d78a";
  const border = opts.border || "#c9a44a";

  function paint() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // gold frame
    ctx.strokeStyle = border;
    ctx.lineWidth = 18;
    ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.lineWidth = 6;
    ctx.strokeRect(32, 32, W - 64, H - 64);
    const chars = Array.from(text);
    const n = Math.max(1, chars.length);
    const fontPx = Math.floor(Math.min(168, (W - 120) / n * 0.92, H - 80));
    ctx.font = `700 ${fontPx}px "Noto Serif SC", "Noto Serif CJK SC", "Noto Sans SC", "Noto Sans CJK SC", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = fg;
    const inset = 70;
    const cell = (W - inset * 2) / n;
    for (let i = 0; i < n; i++) {
      ctx.fillText(chars[i], inset + cell * (i + 0.5), H / 2 + 4);
    }
  }
  paint();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.45, metalness: 0.08,
    envMapIntensity: 0.45, polygonOffset: true, polygonOffsetFactor: -2,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.userData.redraw = () => { paint(); tex.needsUpdate = true; };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => mesh.userData.redraw()).catch(() => {});
  }
  return mesh;
}

export function createMonk(opts = {}) {
  const robe = opts.robe ?? 0x6e7880;
  const sash = opts.sash ?? 0xd4a84e;
  const skin = opts.skin ?? 0xe0b089;
  const g = new THREE.Group();
  g.userData.kind = "monk";
  g.userData.id = opts.id || "self";

  const blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.42, 12),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
  );
  blob.rotation.x = -Math.PI / 2;
  blob.position.y = 0.02;
  g.add(blob);

  const skinM = new THREE.MeshStandardMaterial({ color: skin, roughness: 0.55, metalness: 0.02, envMapIntensity: 0.35 });
  const robeM = new THREE.MeshStandardMaterial({ color: robe, roughness: 0.92, metalness: 0, envMapIntensity: 0.22 });
  const sashM = new THREE.MeshStandardMaterial({ color: sash, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.45 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.5, metalness: 0 });
  const whiteM = new THREE.MeshStandardMaterial({ color: 0xf4efe8, roughness: 0.4, metalness: 0 });

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
  body.castShadow = true;
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
  const uL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.48, 8), robeM);
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
  skull.castShadow = true;
  const earL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), skinM);
  const earR = earL.clone();
  earL.position.set(-0.3, -0.02, 0);
  earR.position.set(0.3, -0.02, 0);
  const eyeWhiteL = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), whiteM);
  const eyeWhiteR = eyeWhiteL.clone();
  eyeWhiteL.position.set(-0.1, 0.0, 0.26);
  eyeWhiteR.position.set(0.1, 0.0, 0.26);
  eyeWhiteL.scale.set(1, 0.75, 0.5);
  eyeWhiteR.scale.set(1, 0.75, 0.5);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkM);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.1, 0.0, 0.29);
  eyeR.position.set(0.1, 0.0, 0.29);
  eyeL.scale.set(1, 0.7, 0.5);
  eyeR.scale.set(1, 0.7, 0.5);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 8, Math.PI), darkM);
  smile.position.set(0, -0.1, 0.29);
  smile.rotation.set(Math.PI, 0, 0);
  smile.scale.set(1, 0.6, 1);
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.014, 0.02), darkM);
  const browR = browL.clone();
  browL.position.set(-0.1, 0.055, 0.28);
  browR.position.set(0.1, 0.055, 0.28);
  browL.rotation.z = 0.12;
  browR.rotation.z = -0.12;
  head.add(skull, earL, earR, eyeWhiteL, eyeWhiteR, eyeL, eyeR, smile, browL, browR);
  g.add(head);

  // front 袈裟: a single sash from the left shoulder across the chest
  const drape = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.035), sashM);
  drape.position.set(0.04, 0.95, 0.30);
  drape.rotation.z = -0.52;
  g.add(drape);

  const label = makeLabel(opts.name || "小沙弥", opts.demo ? "#c8c0b0" : "#f0e0a8");
  g.add(label);

  const state = {
    action: "idle",
    sitting: false,
    phase: Math.random() * Math.PI * 2,
    bowT: 0,
    heshiT: 0,
    woodT: 0,
    yOff: 0,
  };

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
      state.yOff = -0.15;
      armL.rotation.set(0.6, 0.2, 0.5);
      armR.rotation.set(0.6, -0.2, -0.5);
      head.rotation.x = 0.08;
      g.rotation.x = 0;
      return;
    }
    hips.visible = true;
    state.yOff = moving ? Math.abs(Math.sin(state.phase)) * 0.06 : 0;
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

  return { group: g, state, setRobe, setName, setLabelVisible, setAction, update, mats: { robeM, sashM } };
}
