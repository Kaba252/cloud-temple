import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createMonk } from "./monk.js";
import { buildWorld } from "./world.js";
import { detectQuality, qualityOpts, loadAssets, buildMaterials, localPeriod, periodLooks, isMobile } from "./assets.js";

export { detectQuality };

export async function createGame(canvas, hooks = {}) {
  const mode0 = hooks.quality || detectQuality();
  let q = qualityOpts(mode0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: q.antialias,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(q.pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.82;
  renderer.shadowMap.enabled = q.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x6a4a3a, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.15, 260);

  hooks.onProgress?.(0.05, "展开画卷…");
  const assets = await loadAssets(renderer, q, (p, t) => hooks.onProgress?.(p, t));
  scene.environment = assets.env;
  if (assets.sky) {
    assets.sky.material.fog = false;
    assets.sky.renderOrder = -100;
    scene.add(assets.sky);
  }

  const mats = buildMaterials(assets.tex, q);
  hooks.onProgress?.(0.72, "起殿立柱…");
  const world = buildWorld(scene, mats, q);

  // lights
  const hemi = new THREE.HemisphereLight(0xffd4a8, 0x3a2a20, 0.55);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb070, 1.35);
  sun.position.set(18, 22, 12);
  if (q.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(q.shadowMap, q.shadowMap);
    sun.shadow.camera.near = 4;
    sun.shadow.camera.far = 90;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -36;
    sun.shadow.camera.right = sun.shadow.camera.top = 36;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
  }
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88a0c0, 0.25);
  fill.position.set(-16, 10, -8);
  scene.add(fill);
  const hallFill = new THREE.PointLight(0xffcc88, q.fluent ? 1.6 : 2.3, 20, 1.6);
  hallFill.position.set(0, 5.0, -26);
  scene.add(hallFill);
  const altarLight = new THREE.PointLight(0xffd090, q.fluent ? 1.1 : 1.9, 12, 1.8);
  altarLight.position.set(0, 4.2, -31.2);
  scene.add(altarLight);
  const hallSideL = new THREE.PointLight(0xffc090, q.fluent ? 0.5 : 0.85, 10, 2);
  hallSideL.position.set(-5.5, 4.0, -26);
  scene.add(hallSideL);
  const hallSideR = hallSideL.clone();
  hallSideR.position.x = 5.5;
  scene.add(hallSideR);

  function applyPeriod(period) {
    const L = periodLooks(period);
    renderer.toneMappingExposure = L.exposure;
    sun.color.setHex(L.sunColor);
    sun.intensity = L.sun;
    hemi.intensity = L.amb;
    scene.fog = new THREE.Fog(L.fog, L.fogNear, L.fogFar);
    scene.background = new THREE.Color(L.bg);
    mats.lantern.emissiveIntensity = L.lantern;
    if (world.decorations.moon) world.decorations.moon.visible = period === "night" || period === "dusk";
    if (assets.sky) {
      assets.sky.material.fog = false;
      assets.sky.material.color.setHex(L.sky);
    }
    hemi.color.setHex(period === "night" ? 0x8899bb : 0xffd4a8);
    return L;
  }
  let period = localPeriod();
  let looks = applyPeriod(period);

  // bloom
  let composer = null;
  function setupBloom() {
    if (composer) {
      composer.dispose();
      composer = null;
    }
    if (!q.bloom) return;
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        looks.bloom, 0.42, 0.82
      );
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
      composer.bloom = bloom;
    } catch (e) {
      composer = null;
    }
  }
  setupBloom();

  hooks.onProgress?.(0.82, "迎佛入殿…");
  // Procedural 横三世佛 are built in world.js — skip the shallow relief scan.

  // player
  const player = createMonk({ id: "self", name: "小沙弥" });
  player.group.position.set(0, 0, 24);
  player.group.rotation.y = 0;
  scene.add(player.group);
  const others = new Map();

  const cam = { yaw: 0, pitch: -0.34, dist: 9.2, min: 4, max: 16, follow: true };
  camera.position.set(0, 5.2, 24 + 9.2 * Math.cos(0.34));
  camera.lookAt(0, 1.25, 24);
  const look = new THREE.Vector3();
  const ideal = new THREE.Vector3();

  const keys = Object.create(null);
  const joy = { x: 0, y: 0 };
  const target = { active: false, x: 0, z: 0 };
  const speed = 4.6;
  let sitting = false;
  let bowingAuto = false;
  const circ = { last: null, acc: 0, laps: 0, inside: false };

  // smoke
  const smokeCanvas = document.createElement("canvas");
  smokeCanvas.width = smokeCanvas.height = 64;
  {
    const c = smokeCanvas.getContext("2d");
    const g = c.createRadialGradient(32, 32, 4, 32, 32, 30);
    g.addColorStop(0, "rgba(240,230,220,0.85)");
    g.addColorStop(1, "rgba(240,230,220,0)");
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  }
  const smokeTex = new THREE.CanvasTexture(smokeCanvas);
  const SMOKE_N = 56;
  const smokeGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(SMOKE_N * 3);
  const sLife = new Float32Array(SMOKE_N);
  smokeGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  const smokeMat = new THREE.PointsMaterial({
    map: smokeTex, color: 0xe8e0d6, size: 0.42, transparent: true,
    opacity: 0.45, depthWrite: false, sizeAttenuation: true,
  });
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
  function updateSmoke(dt) {
    smokeEmit += dt;
    if (smokeEmit > 0.22) {
      smokeEmit = 0;
      if (world.decorations.incensePos) emitSmoke(world.decorations.incensePos, 1);
    }
    for (let i = 0; i < SMOKE_N; i++) {
      if (sLife[i] <= 0) continue;
      sLife[i] -= dt * 0.32;
      sPos[i * 3 + 1] += dt * 0.55;
      sPos[i * 3] += dt * 0.08;
      if (sLife[i] <= 0) sPos[i * 3 + 1] = -10;
    }
    smokeGeo.attributes.position.needsUpdate = true;
  }

  function blocked(x, z) {
    if (Math.abs(x) > 52 || Math.abs(z) > 52) return true;
    if (world.wallBoxes) {
      for (const b of world.wallBoxes) {
        if (x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ) return true;
      }
    }
    for (const c of world.colliders) {
      const dx = x - c.x, dz = z - c.z;
      if (dx * dx + dz * dz < (c.r + 0.4) * (c.r + 0.4)) return true;
    }
    return false;
  }
  function groundY(x, z, extra = 0) {
    return (world.groundHeight ? world.groundHeight(x, z) : 0) + extra;
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

  const ptr = { down: false, id: null, x: 0, y: 0, lx: 0, ly: 0, dragged: false, pinching: false, pdist: 0 };
  canvas.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (ptr.down && e.pointerId !== ptr.id) {
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
  let periodTick = 0;

  function tick() {
    if (!running) return;
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;

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
    player.group.position.y = groundY(player.group.position.x, player.group.position.z, sitting ? 0 : (player.state.yOff || 0));
    updateSmoke(dt);
    updateCircumambulate();
    if (world.decorations.bellMesh) world.decorations.bellMesh.rotation.z *= 0.92;
    world.decorations.update?.(dt, t);

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
      const og = o.monk.group;
      og.position.y = groundY(og.position.x, og.position.z, o.monk.state.sitting ? 0 : (o.monk.state.yOff || 0));
    });

    if (cam.follow) {
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
    }

    areaTick += dt;
    if (areaTick > 0.25) {
      areaTick = 0;
      const area = currentArea();
      if (area !== lastArea) { lastArea = area; hooks.onArea?.(area); }
      const it = nearestInteract();
      const key = it ? it.id : null;
      if (key !== lastPrompt) { lastPrompt = key; hooks.onPrompt?.(it); }
    }
    periodTick += dt;
    if (periodTick > 30) {
      periodTick = 0;
      const np = localPeriod();
      if (np !== period) { period = np; looks = applyPeriod(period); if (composer && composer.bloom) composer.bloom.strength = looks.bloom; }
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);
    hooks.onFrame?.(dt);
  }

  function updateBot(o, dt) {
    const b = o.ai;
    b.t += dt;
    if (b.mode === "wait") {
      o.monk.update(dt, false);
      if (b.t > b.wait) {
        if (Math.random() < 0.2) { o.monk.setAction("bow"); b.t = 0; b.wait = 1.4; return; }
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
    renderer.setPixelRatio(q.pixelRatio);
    if (composer) composer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  hooks.onProgress?.(0.95, "迎客入山…");

  const api = {
    start() { running = true; clock.getDelta(); tick(); },
    setJoystick(x, y) { joy.x = x; joy.y = y; },
    setName(n, demo) { player.setName(n, demo); },
    setLabelVisible(v) { player.setLabelVisible?.(v); },
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
        quality: q.mode,
        period,
      };
    },
    getQuality() { return q.mode; },
    setQuality(mode) {
      const next = qualityOpts(mode === "fluent" ? "fluent" : "quality");
      q = next;
      try { localStorage.setItem("yunchan-quality", q.mode); } catch (_) {}
      renderer.shadowMap.enabled = q.shadows;
      sun.castShadow = q.shadows;
      renderer.setPixelRatio(q.pixelRatio);
      hallFill.intensity = q.fluent ? 1.6 : 2.3;
      altarLight.intensity = q.fluent ? 1.1 : 1.9;
      setupBloom();
      onResize();
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
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), new THREE.MeshStandardMaterial({
        color: col, emissive: col, emissiveIntensity: 1.1, roughness: 0.4,
      }));
      flame.position.y = 0.5;
      g.add(stand, flame);
      world.decorations.lamps.add(g);
      world.decorations.flickers.push(flame);
    },
    addRibbon() {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.7), new THREE.MeshStandardMaterial({
        color: 0xc4452a, side: THREE.DoubleSide, roughness: 0.7, metalness: 0,
      }));
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
    setPeriod(p) {
      period = p;
      looks = applyPeriod(period);
      if (composer && composer.bloom) composer.bloom.strength = looks.bloom;
    },
    setView(opts = {}) {
      if (opts.x != null) player.group.position.x = opts.x;
      if (opts.z != null) player.group.position.z = opts.z;
      if (opts.rot != null) player.group.rotation.y = opts.rot;
      if (opts.yaw != null) cam.yaw = opts.yaw;
      if (opts.pitch != null) cam.pitch = opts.pitch;
      if (opts.dist != null) cam.dist = opts.dist;
      if (opts.follow != null) cam.follow = !!opts.follow;
      if (opts.camPos && opts.lookAt) {
        cam.follow = false;
        camera.position.set(opts.camPos[0], opts.camPos[1], opts.camPos[2]);
        camera.lookAt(opts.lookAt[0], opts.lookAt[1], opts.lookAt[2]);
      }
    },
    canvas, camera, scene, player: player.group, getMonk() { return player; },
  };
  return api;
}
