import * as THREE from "three";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

export const BASE = new URL("../assets/", import.meta.url).href;

export function isMobile() {
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 800;
}

export function detectQuality() {
  try {
    const saved = localStorage.getItem("yunchan-quality");
    if (saved === "fluent" || saved === "quality") return saved;
  } catch (_) {}
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const save = !!(navigator.connection && navigator.connection.saveData);
  const mobile = isMobile();
  if (save || mem <= 4 || (mobile && (mem <= 6 || cores <= 4))) return "fluent";
  return "quality";
}

export function qualityOpts(mode) {
  const fluent = mode === "fluent";
  const mobile = isMobile();
  return {
    mode,
    fluent,
    shadows: !fluent,
    bloom: !fluent,
    reflector: !fluent,
    pixelRatio: Math.min(window.devicePixelRatio || 1, fluent ? 1.05 : mobile ? 1.45 : 1.75),
    shadowMap: fluent ? 0 : mobile ? 1024 : 2048,
    envSize: fluent ? 256 : 512,
    antialias: !fluent && !mobile,
    leafScale: fluent ? 0.5 : 1,
    fallingLeaves: fluent ? 36 : 110,
    buddha: fluent ? "models/buddha_lo.glb" : "models/buddha.glb",
  };
}

export function ensureUv2(geo) {
  if (geo.attributes && geo.attributes.uv && !geo.attributes.uv2) {
    geo.setAttribute("uv2", geo.attributes.uv);
  }
  return geo;
}

export function scaleBoxUVs(geo, w, h, d, s = 0.7) {
  const faceSizes = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  const uv = geo.attributes.uv;
  for (let f = 0; f < 6; f++) {
    const fw = faceSizes[f][0] * s, fh = faceSizes[f][1] * s;
    for (let i = 0; i < 4; i++) {
      const idx = f * 4 + i;
      uv.setXY(idx, uv.getX(idx) * fw, uv.getY(idx) * fh);
    }
  }
  uv.needsUpdate = true;
  ensureUv2(geo);
  return geo;
}

export function boxGeo(w, h, d, s = 0.7) {
  return scaleBoxUVs(new THREE.BoxGeometry(w, h, d), w, h, d, s);
}

export function scaleCylUVs(geo, u = 2, v = 1) {
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * u, uv.getY(i) * v);
  uv.needsUpdate = true;
  ensureUv2(geo);
  return geo;
}

export function cylGeo(rt, rb, h, seg = 12, u = 2, v = 1) {
  return scaleCylUVs(new THREE.CylinderGeometry(rt, rb, h, seg), u, v);
}

export function planeGeo(w, h, s = 0.7) {
  const g = new THREE.PlaneGeometry(w, h);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * h * s);
  uv.needsUpdate = true;
  ensureUv2(g);
  return g;
}

function prepTex(tex, { color = false, wrap = true, repeat = [1, 1], anisotropy = 8 } = {}) {
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  if (wrap) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

function cloneTex(src, repeat) {
  const t = src.clone();
  t.repeat = new THREE.Vector2(repeat[0], repeat[1]);
  t.needsUpdate = true;
  return t;
}

export function makeStandard(maps, opts = {}) {
  const Ctor = opts.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const mat = new Ctor({
    color: opts.color ?? 0xffffff,
    roughness: opts.roughness ?? 1,
    metalness: opts.metalness ?? 0,
    envMapIntensity: opts.envMapIntensity ?? 1,
    side: opts.side ?? THREE.FrontSide,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    depthWrite: opts.depthWrite ?? true,
  });
  if (opts.physical) {
    if (opts.clearcoat != null) mat.clearcoat = opts.clearcoat;
    if (opts.clearcoatRoughness != null) mat.clearcoatRoughness = opts.clearcoatRoughness;
    if (opts.transmission != null) mat.transmission = opts.transmission;
    if (opts.ior != null) mat.ior = opts.ior;
    if (opts.thickness != null) mat.thickness = opts.thickness;
    if (opts.specularIntensity != null) mat.specularIntensity = opts.specularIntensity;
  }
  if (maps.map) mat.map = maps.map;
  if (maps.normal) {
    mat.normalMap = maps.normal;
    const ns = opts.normalScale ?? 1;
    mat.normalScale = new THREE.Vector2(ns, ns);
  }
  if (maps.arm) {
    mat.aoMap = maps.arm;
    mat.roughnessMap = maps.arm;
    if (opts.metalMap) mat.metalnessMap = maps.arm;
    mat.aoMapIntensity = opts.ao ?? 0.85;
  }
  if (maps.alpha) {
    mat.alphaMap = maps.alpha;
    mat.transparent = true;
    mat.alphaTest = opts.alphaTest ?? 0.4;
    mat.side = THREE.DoubleSide;
  }
  if (opts.repeat && maps.map) {
    const r = opts.repeat;
    if (mat.map) mat.map = cloneTex(maps.map, r);
    if (mat.normalMap) mat.normalMap = cloneTex(maps.normal, r);
    if (mat.aoMap) {
      const a = cloneTex(maps.arm, r);
      mat.aoMap = mat.roughnessMap = a;
      if (opts.metalMap) mat.metalnessMap = a;
    }
    if (mat.alphaMap && maps.alpha) mat.alphaMap = cloneTex(maps.alpha, r);
  }
  return mat;
}

function rotateEnv(renderer, hdr, size, rotY) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const tmp = new THREE.Scene();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.MeshBasicMaterial({ map: hdr, side: THREE.BackSide, depthWrite: false })
  );
  sky.scale.set(-1, 1, 1);
  sky.rotation.y = rotY;
  tmp.add(sky);
  const rt = pmrem.fromScene(tmp, 0, 0.1, 120);
  pmrem.dispose();
  tmp.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  return rt.texture;
}

export function makeLoaders() {
  const manager = new THREE.LoadingManager();
  const texLoader = new THREE.TextureLoader(manager);
  const rgbe = new RGBELoader(manager);
  const draco = new DRACOLoader();
  draco.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/libs/draco/gltf/");
  const gltf = new GLTFLoader(manager);
  gltf.setDRACOLoader(draco);
  return { manager, texLoader, rgbe, gltf, draco };
}

export async function loadAssets(renderer, q, onProgress) {
  const { texLoader, rgbe, gltf } = makeLoaders();
  const loadTex = (path, opts) => new Promise((resolve, reject) => {
    texLoader.load(BASE + path, (t) => resolve(prepTex(t, opts)), undefined, reject);
  });

  const jobs = [
    ["tex/stone_diff.jpg", "stoneDiff", { color: true }],
    ["tex/stone_nor.jpg", "stoneNor", {}],
    ["tex/stone_arm.jpg", "stoneArm", {}],
    ["tex/roof_diff.jpg", "roofDiff", { color: true }],
    ["tex/roof_nor.jpg", "roofNor", {}],
    ["tex/roof_arm.jpg", "roofArm", {}],
    ["tex/wood_diff.jpg", "woodDiff", { color: true }],
    ["tex/wood_nor.jpg", "woodNor", {}],
    ["tex/wood_arm.jpg", "woodArm", {}],
    ["tex/lacquer_diff.jpg", "lacquerDiff", { color: true }],
    ["tex/lacquer_nor.jpg", "lacquerNor", {}],
    ["tex/lacquer_arm.jpg", "lacquerArm", {}],
    ["tex/bark_diff.jpg", "barkDiff", { color: true }],
    ["tex/bark_nor.jpg", "barkNor", {}],
    ["tex/bark_arm.jpg", "barkArm", {}],
    ["tex/metal_diff.jpg", "metalDiff", { color: true }],
    ["tex/metal_nor.jpg", "metalNor", {}],
    ["tex/metal_arm.jpg", "metalArm", {}],
    ["tex/leaf_diff.jpg", "leafDiff", { color: true }],
    ["tex/leaf_nor.jpg", "leafNor", {}],
    ["tex/leaf_arm.jpg", "leafArm", {}],
    ["tex/leaf_alpha.jpg", "leafAlpha", {}],
    ["tex/pine_diff.jpg", "pineDiff", { color: true }],
    ["tex/pine_nor.jpg", "pineNor", {}],
    ["tex/pine_arm.jpg", "pineArm", {}],
    ["tex/pine_alpha.jpg", "pineAlpha", {}],
  ];

  let done = 0;
  const tex = {};
  const total = jobs.length + 2;
  onProgress?.(0.06, "展开画卷…");
  await Promise.all(jobs.map(async ([path, key, opts]) => {
    tex[key] = await loadTex(path, { ...opts, anisotropy: q.fluent ? 2 : 8 });
    done++;
    onProgress?.(0.06 + (done / total) * 0.5, "铺陈石阶与屋瓦…");
  }));

  onProgress?.(0.6, "迎来暮色…");
  const hdr = await rgbe.loadAsync(BASE + "hdri/qwantani_dusk_1_1k.hdr");
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const envRot = 2.15;
  const env = rotateEnv(renderer, hdr, q.envSize, envRot);

  const skyMap = await loadTex("hdri/qwantani_dusk_1_1k.jpg", { color: true, wrap: false, anisotropy: 4 });
  skyMap.mapping = THREE.EquirectangularReflectionMapping;
  const skyMat = new THREE.MeshBasicMaterial({ map: skyMap, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 32, 16), skyMat);
  sky.scale.set(-1, 1, 1);
  sky.rotation.y = envRot;
  sky.renderOrder = -10;
  sky.frustumCulled = false;

  return {
    tex,
    hdr,
    env,
    sky,
    envRot,
    async loadBuddha() {
      const file = await gltf.loadAsync(BASE + q.buddha);
      return file.scene;
    },
  };
}

export function buildMaterials(tex, q) {
  const stone = (repeat, color = 0xc8c4bc) => makeStandard(
    { map: tex.stoneDiff, normal: tex.stoneNor, arm: tex.stoneArm },
    { color, repeat, roughness: 1, metalness: 0, normalScale: 1.1, envMapIntensity: 0.7 }
  );
  const wood = (repeat, color = 0xffffff) => makeStandard(
    { map: tex.woodDiff, normal: tex.woodNor, arm: tex.woodArm },
    { color, repeat, roughness: 0.85, metalness: 0, envMapIntensity: 0.55 }
  );
  const lacquer = (repeat, color = 0xd92a22) => makeStandard(
    { map: tex.lacquerDiff, normal: tex.lacquerNor, arm: tex.lacquerArm },
    {
      color, repeat, roughness: 0.28, metalness: 0.04,
      physical: true, clearcoat: 0.65, clearcoatRoughness: 0.18,
      envMapIntensity: 1.05, normalScale: 0.4,
    }
  );
  const roof = (repeat, color = 0xffe2c0) => makeStandard(
    { map: tex.roofDiff, normal: tex.roofNor, arm: tex.roofArm },
    { color, repeat, roughness: 0.7, metalness: 0.02, normalScale: 1.15, envMapIntensity: 0.8 }
  );
  const bark = (repeat, color = 0xffffff) => makeStandard(
    { map: tex.barkDiff, normal: tex.barkNor, arm: tex.barkArm },
    { color, repeat, roughness: 1, metalness: 0, normalScale: 1.2, envMapIntensity: 0.45 }
  );
  const metal = (repeat, color = 0xb08a4a) => makeStandard(
    { map: tex.metalDiff, normal: tex.metalNor, arm: tex.metalArm },
    { color, repeat, roughness: 0.45, metalness: 1, metalMap: true, normalScale: 0.8, envMapIntensity: 1.2 }
  );
  const leaf = (color) => makeStandard(
    { map: tex.leafDiff, normal: tex.leafNor, arm: tex.leafArm, alpha: tex.leafAlpha },
    { color, roughness: 0.7, metalness: 0, alphaTest: 0.35, side: THREE.DoubleSide, envMapIntensity: 0.5, normalScale: 0.6 }
  );
  const pine = makeStandard(
    { map: tex.pineDiff, normal: tex.pineNor, arm: tex.pineArm, alpha: tex.pineAlpha },
    { color: 0x8a9a60, roughness: 0.75, metalness: 0, alphaTest: 0.32, side: THREE.DoubleSide, envMapIntensity: 0.45, normalScale: 0.7 }
  );

  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xe7c56a,
    metalness: 1,
    roughness: 0.22,
    envMapIntensity: 1.35,
    clearcoat: 0.25,
    clearcoatRoughness: 0.3,
    emissive: 0x3a2808,
    emissiveIntensity: 0.18,
  });

  const water = new THREE.MeshPhysicalMaterial({
    color: 0x245a52,
    metalness: 0.04,
    roughness: 0.16,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.15,
    side: THREE.DoubleSide,
    normalMap: tex.stoneNor,
    normalScale: new THREE.Vector2(0.28, 0.28),
  });
  if (water.normalMap) {
    water.normalMap = tex.stoneNor.clone();
    water.normalMap.wrapS = water.normalMap.wrapT = THREE.RepeatWrapping;
    water.normalMap.repeat.set(3.5, 3.5);
  }

  const lantern = new THREE.MeshStandardMaterial({
    color: 0xffe2b0,
    emissive: 0xff9a45,
    emissiveIntensity: 1.35,
    roughness: 0.55,
    metalness: 0,
  });

  const pillarMat = lacquer([1, 2.4], 0xff6a4c);
  pillarMat.roughness = 0.5;
  pillarMat.clearcoat = 0.22;
  pillarMat.clearcoatRoughness = 0.4;
  pillarMat.envMapIntensity = 0.55;
  if (pillarMat.emissive) pillarMat.emissive.setHex(0x3a0808);
  pillarMat.emissiveIntensity = 0.12;

  return {
    stone: stone([1, 1], 0xcfc8be),
    stoneFine: stone([2.2, 2.2], 0xc8c2b8),
    stonePath: stone([1.4, 1.4], 0xd2ccc2),
    earth: stone([6, 6], 0x6a5a48),
    wood: wood([1, 1]),
    woodDark: wood([1.4, 1.4], 0x8a6a50),
    plank: wood([2, 2], 0xffffff),
    pillar: pillarMat,
    lacquer: lacquer([1.2, 1.2], 0xff4a38),
    roof: roof([2.4, 2.4], 0xffd2aa),
    roofFine: roof([1.4, 1.4], 0xffc898),
    bark: bark([1, 2]),
    bronze: metal([1, 1], 0x9a7a3a),
    iron: metal([1, 1], 0x888888),
    gold,
    water,
    leafR: leaf(0xc84a28),
    leafO: leaf(0xe07a30),
    leafY: leaf(0xe8b84a),
    leafG: leaf(0x6a8a40),
    pine,
    cream: new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.85, metalness: 0, envMapIntensity: 0.4 }),
    lattice: new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.7, metalness: 0 }),
    plaque: new THREE.MeshStandardMaterial({ color: 0x1a3a28, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.5 }),
    lantern,
    cushion: new THREE.MeshStandardMaterial({ color: 0x8c2f28, roughness: 0.85, metalness: 0 }),
    cushionDark: new THREE.MeshStandardMaterial({ color: 0x5a1c18, roughness: 0.85, metalness: 0 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xe0b089, roughness: 0.55, metalness: 0.02, envMapIntensity: 0.35 }),
    scalp: new THREE.MeshStandardMaterial({ color: 0xc99a74, roughness: 0.7, metalness: 0, envMapIntensity: 0.25 }),
    bamboo: new THREE.MeshStandardMaterial({ color: 0x6d8a48, roughness: 0.45, metalness: 0.02, envMapIntensity: 0.5 }),
    bambooDark: new THREE.MeshStandardMaterial({ color: 0x3d5428, roughness: 0.55, metalness: 0 }),
    halo: new THREE.MeshStandardMaterial({
      color: 0xffe2a0, emissive: 0xcc8840, emissiveIntensity: 0.7,
      transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
    }),
  };
}

export function localPeriod(date = new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5 && h < 7.5) return "dawn";
  if (h >= 7.5 && h < 16) return "day";
  if (h >= 16 && h < 19) return "dusk";
  return "night";
}

export function periodLooks(period) {
  const table = {
    dawn:  { exposure: 0.88, sun: 1.4,  sunColor: 0xffc58a, amb: 0.55, fog: 0xc9a890, fogNear: 48, fogFar: 160, bloom: 0.26, lantern: 0.8,  sky: 0xffe6d0, bg: 0xc9a890 },
    day:   { exposure: 1.12, sun: 2.2,  sunColor: 0xfff1d6, amb: 0.8,  fog: 0xc5d0d6, fogNear: 70, fogFar: 200, bloom: 0.1,  lantern: 0.3,  sky: 0xffffff, bg: 0xc5d0d6 },
    dusk:  { exposure: 0.98, sun: 1.7,  sunColor: 0xffb070, amb: 0.62, fog: 0xb88968, fogNear: 50, fogFar: 170, bloom: 0.28, lantern: 1.05, sky: 0xffffff, bg: 0xb88968 },
    night: { exposure: 0.7,  sun: 0.35, sunColor: 0x8aa0c8, amb: 0.32, fog: 0x1c2838, fogNear: 45, fogFar: 150, bloom: 0.4,  lantern: 1.85, sky: 0xa8b8d8, bg: 0x1c2838 },
  };
  return table[period] || table.dusk;
}
