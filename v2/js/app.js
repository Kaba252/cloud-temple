/* 云端禅院 v2 */
import { createGame } from "./game.js";

const STORAGE_KEY = "cloud-temple-v2";
const APP_ID = "yunchan-cloud-temple-v2";
const CNY_START = 1936;
const CNY_MD = [
    124,211,131,219,208,127,215,205,125,213,202,122,
    210,129,217,206,127,214,203,124,212,131,218,208,
    128,215,205,125,213,202,121,209,130,217,206,127,
    215,203,123,211,131,218,207,128,216,205,125,213,
    202,220,209,129,217,206,127,215,204,123,210,131,
    219,207,128,216,205,124,212,201,122,209,129,218,
    207,126,214,203,123,210,131,219,208,128,216,205,
    125,212,201,122,210,129,217,206,126,213,203,123,
    211,131,219,208,128
  ];

const BUDDHAS = [
    { id: 0, name: "千手观音", title: "大慈大悲", mantra: "观自在故，千手护持，所愿皆圆。", bless: "愿你所求光明，所行有伴，危难之中自有援手。" },
    { id: 1, name: "虚空藏菩萨", title: "福智无尽", mantra: "虚空为藏，福慧等施，心量广大。", bless: "愿你心量如空，福德智慧渐渐增长，不困于一时得失。" },
    { id: 2, name: "文殊菩萨", title: "大智开悟", mantra: "智剑断惑，经卷在握，明心见性。", bless: "愿你心思澄明，抉择不迷，学问与洞察日益精进。" },
    { id: 3, name: "普贤菩萨", title: "大行愿海", mantra: "行愿相资，步步落实，功德不虚。", bless: "愿你说到做到，长行不怠，善愿终能落地生根。" },
    { id: 4, name: "大势至菩萨", title: "光明威德", mantra: "势至威光，摄念专一，心不散乱。", bless: "愿你意志安定，气场平和，所向之处自有力量。" },
    { id: 5, name: "大日如来", title: "遍照法界", mantra: "日照大千，无幽不烛，本觉圆明。", bless: "愿你心地光明，不被阴霾久困，时时记得自己的本来圆满。" },
    { id: 6, name: "不动尊菩萨", title: "镇乱护心", mantra: "心如磐石，不动于境，降服烦恼。", bless: "愿你面对波折仍能立定，不被怒火与恐惧轻易动摇。" },
    { id: 7, name: "阿弥陀佛", title: "无量光寿", mantra: "南无阿弥陀佛，光明无量，寿命无量。", bless: "愿你身心安稳，夜里睡得踏实，心中常有一片清净光。" }
  ];

const LOTS = [
    { rank: "上上签", title: "云开见月", poem: "云开月自明，心地本来清。\n所求皆如意，万事可早成。", read: "近期运势明朗，心念澄净则事情容易推进。适合主动迈出那一步，不必一再观望。" },
    { rank: "上上签", title: "枯木逢春", poem: "枯木已逢春，花开自有时。\n旧事终得解，新枝发嫩姿。", read: "先前停滞的事情开始松动。耐心照料已有的基础，比另起炉灶更有收获。" },
    { rank: "上上签", title: "舟到顺风", poem: "一叶已中流，风来不用愁。\n把稳眼前舵，千里可至头。", read: "方向大致不错，外在助力也会出现。把细节做扎实，行程会比预想顺利。" },
    { rank: "上吉签", title: "贵人提携", poem: "路遇识君人，一言抵千金。\n莫恃一己力，和气自生春。", read: "宜多请教、多合作。有人愿意帮忙，但需要你先开口，也要记得回报善意。" },
    { rank: "上吉签", title: "勤耕有获", poem: "春种一粒粟，秋来谷满仓。\n日日不空过，功到自然香。", read: "没有侥幸，却有积累。按计划把该做的事做完，收获会在稍后显现。" },
    { rank: "上吉签", title: "室有余光", poem: "灯光映小窗，夜读味自长。\n内里若充实，外面自风光。", read: "适合学习、整理、把基本功打好。外表的热闹先放下，内在的光会慢慢透出来。" },
    { rank: "上吉签", title: "水到渠成", poem: "开渠已多时，流水自相知。\n但行平常事，不必问日期。", read: "不必强求立刻有结果。把渠道修通，该来的会来。焦虑反而会添变数。" },
    { rank: "中吉签", title: "行稳致远", poem: "缓步胜疾奔，山高自有门。\n心平路不险，处处可安身。", read: "宜稳不宜急。大的决定可以再看一看，先把眼前安全的一步走好。" },
    { rank: "中吉签", title: "和气致祥", poem: "一句暖人心，能化十分霜。\n争端宜早解，家和万事康。", read: "人际关系是这段时间的关键。少争对错，多留余地，事情会更好谈。" },
    { rank: "中吉签", title: "半晴半雨", poem: "天色有阴晴，人心自可宁。\n持伞以待雨，见日亦前行。", read: "有顺有逆，属于正常起伏。预先留一点余地，遇到变化才不会乱。" },
    { rank: "中吉签", title: "勤修善缘", poem: "举手即是春，滴水可成川。\n莫因善小废，福在日中间。", read: "适合做小事、帮小忙、把关系维护好。不必追求轰轰烈烈，细水长流更稳。" },
    { rank: "中平签", title: "守中为宜", poem: "过刚则易折，过柔亦难成。\n守中行正好，无事亦无惊。", read: "眼下宜保持平常心，不大起大落。重要选择若把握不准，不妨再等一个清楚的信号。" },
    { rank: "中平签", title: "暂且静候", poem: "花未到开时，人工莫强为。\n静里有消息，动中反成迟。", read: "现在动手未必有利，观察、准备比行动更重要。把计划写清楚，时机一到再发力。" },
    { rank: "中平签", title: "小损后安", poem: "路有些微不平，行过即是程。\n所失既不大，所得在心宁。", read: "可能有一点小麻烦或小开销，不至于伤筋动骨。处理完就放下，不要反复计较。" },
    { rank: "中平签", title: "反求诸己", poem: "事不在远方，照见在心房。\n一念若能转，前路自生光。", read: "外在条件暂时难改，但态度可以改。先把自己这一侧做好，局面会松动一些。" },
    { rank: "下签", title: "慎言少争", poem: "祸从口中出，福自忍中来。\n今日宜缄默，来日自无灾。", read: "这段时间说话、签约、争论都要更谨慎。能推迟的决定就推迟，先听清楚再开口。" },
    { rank: "下签", title: "先事后息", poem: "波起莫慌行，岸在转头处。\n歇得一分力，免得十分误。", read: "若已感到疲惫或混乱，先停一停。把问题拆小，寻求帮助，比硬撑更明智。" },
    { rank: "下签", title: "谨防冒进", poem: "山近反成遥，欲速则生焦。\n退一步海阔，再计未为凋。", read: "计划可能过于乐观。把目标和开支都收一收，先求稳妥，再求扩展。" },
    { rank: "下下签", title: "晦极有明", poem: "夜尽必有晨，雨过山更青。\n且把心放下，明朝自可晴。", read: "眼下或许不顺，但不是结局。先照顾身体和情绪，避免在情绪里做重大决定。低谷会过。" },
    { rank: "下下签", title: "改道而行", poem: "此路既难通，何妨问别峰。\n转身非是退，是为见新空。", read: "原计划可能要调整。承认现实并另寻路径，不是失败，而是聪明。找人商量会更清楚。" }
  ];

const YI_POOL = ["祭祀","祈福","出行","订盟","纳采","开市","交易","入宅","安床","修造","栽种","习艺","宴会","纳财","沐浴","扫舍","缮月","会友","立券","教养"];

const JI_POOL = ["动土","安葬","词讼","移徙","作灶","开仓","出货财","掘井","探病","远行","争讼","造桥","置产","新开张","砍伐"];

const SEED_WISHES = [
    { name: "过客", text: "愿家人身体健康，少生病。" },
    { name: "释云水", text: "愿心里的那件事，慢慢有着落。" },
    { name: "莲花居士", text: "愿考试顺利，发挥出平时的水平。" },
    { name: "匿名", text: "愿世界少一点争吵。" },
    { name: "山南", text: "愿找到一份不磨人的工作。" },
    { name: "阿茶", text: "愿远方的朋友平安，常联系。" },
    { name: "释清凉", text: "愿自己少一点焦虑，睡得踏实。" },
    { name: "旅人", text: "愿下一趟路途顺利，遇见好人。" }
  ];

const BUDDHA_BY_ZODIAC = [0,1,1,2,3,3,4,5,5,6,7,7];

const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];

function deitySVG(id) {
    const gold = "#e8d5a3";
    const line = "#c9a962";
    const glow = "rgba(240,224,168,.15)";
    const commonHalo = (extra = "") => `
      <circle cx="60" cy="58" r="46" fill="${glow}" stroke="${line}" stroke-width="0.8" opacity=".8"/>
      <circle cx="60" cy="58" r="40" fill="none" stroke="${line}" stroke-width="0.4" opacity=".4"/>
      ${extra}`;
    const body = `
      <path d="M32 105 C34 128 48 138 60 138 C72 138 86 128 88 105 C78 112 42 112 32 105Z" fill="#8c3a28"/>
      <path d="M44 100 C50 96 70 96 76 100 L80 112 C72 108 48 108 40 112Z" fill="${gold}"/>
      <ellipse cx="60" cy="72" rx="16" ry="18" fill="#f0d8b8"/>
      <path d="M52 80 Q60 84 68 80" fill="none" stroke="#b07868" stroke-width="1" stroke-linecap="round"/>
      <path d="M50 70 Q54 72 58 70" fill="none" stroke="#3a2a1c" stroke-width="1" stroke-linecap="round"/>
      <path d="M62 70 Q66 72 70 70" fill="none" stroke="#3a2a1c" stroke-width="1" stroke-linecap="round"/>
      <ellipse cx="50" cy="74" rx="3.2" ry="4" fill="#f0d8b8"/>
      <ellipse cx="70" cy="74" rx="3.2" ry="4" fill="#f0d8b8"/>`;
    const extras = {
      0: `${commonHalo(`<g stroke="${line}" fill="none" stroke-width="1.1">
            <path d="M60 16c-8 10-22 12-28 6"/>
            <path d="M60 16c8 10 22 12 28 6"/>
            <path d="M22 50h-10M108 50h10M30 30l-8-8M90 30l8-8"/>
          </g>
          <circle cx="18" cy="48" r="3" fill="${gold}"/><circle cx="102" cy="48" r="3" fill="${gold}"/>`)}
          ${body}
          <path d="M48 112 q12 -16 24 0" fill="none" stroke="${gold}" stroke-width="2"/>`,
      1: `${commonHalo(`<circle cx="60" cy="18" r="5" fill="${gold}" stroke="${line}"/>
           <path d="M60 23v6" stroke="${line}"/>`)}
          ${body}
          <circle cx="60" cy="118" r="6" fill="${gold}" stroke="${line}"/>`,
      2: `${commonHalo(`<path d="M60 12 l3 14 h-6z" fill="${gold}" stroke="${line}"/>
           <path d="M60 26 v16" stroke="${line}" stroke-width="1.4"/>`)}
          ${body}
          <rect x="70" y="110" width="10" height="14" rx="1" fill="none" stroke="${gold}"/>`,
      3: `${commonHalo(`<path d="M48 22 C48 14 60 12 60 20 C60 12 72 14 72 22 C66 26 54 26 48 22Z" fill="${gold}"/>`)}
          ${body}
          <path d="M44 124 C50 114 60 114 60 124 C60 114 70 114 76 124" fill="none" stroke="${gold}" stroke-width="1.2"/>`,
      4: `${commonHalo(`<path d="M60 14 L64 28 L60 24 L56 28Z" fill="${gold}"/>
           <path d="M48 20 L60 14 L72 20" fill="none" stroke="${line}"/>`)}
          ${body}`,
      5: `${commonHalo(`<g stroke="${line}" fill="none">
            ${[0,30,60,90,120,150,180,210,240,270,300,330].map(a => {
              const r1=42,r2=50, rad=a*Math.PI/180;
              const x1=60+Math.cos(rad)*r1,y1=58+Math.sin(rad)*r1;
              const x2=60+Math.cos(rad)*r2,y2=58+Math.sin(rad)*r2;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
            }).join("")}
          </g>`)}
          ${body}`,
      6: `${commonHalo(`<path d="M36 28 Q60 8 84 28 Q78 48 60 52 Q42 48 36 28Z" fill="none" stroke="#e8a060" stroke-width="1.2"/>`)}
          ${body}
          <path d="M76 100 L86 70 L90 72 L80 104Z" fill="${gold}" stroke="${line}"/>`,
      7: `${commonHalo(`<circle cx="60" cy="58" r="50" fill="none" stroke="${gold}" stroke-width="1.2" opacity=".5"/>`)}
          ${body}
          <path d="M48 118 h24" stroke="${gold}" stroke-width="1.5" stroke-linecap="round"/>`
    };
    return `<svg viewBox="0 0 120 150" width="120" height="150" aria-hidden="true">${extras[id] || extras[7]}</svg>`;
  }


const CIRC = 2 * Math.PI * 54;
const ROOMS = ["禅堂一","禅堂二","禅堂三","禅堂四","禅堂五","禅堂六","禅堂七","禅堂八","禅堂九","禅堂十","禅堂十一","禅堂十二"];
const ADJ = ["悠闲的","清凉的","慢行的","初雪的","薄暮的","闲来的","微光的","静好的","浅溪的","松间的","云边的","雨后的","向晚的","无事的"];
const NOUN = ["波纹","铃音","台阶","茶烟","竹影","晚钟","松针","云朵","石阶","灯花","溪声","月色","庭石","蒲团"];
const ROBES = [
  { id: "slate", name: "青灰", robe: 0xa8b0b4, sash: 0xd4a84e, sub: "默认僧衣" },
  { id: "saffron", name: "赭黄", robe: 0xc47a3a, sash: 0xe8d5a3, sub: "山居暖色" },
  { id: "cinnabar", name: "朱砂", robe: 0x8c3a2a, sash: 0xd4b56a, sub: "殿前庄严" },
  { id: "ink", name: "墨蓝", robe: 0x3a4a62, sash: 0xc9a962, sub: "暮色沉静" },
  { id: "moss", name: "苔绿", robe: 0x4a5d4e, sash: 0xe8d5a3, sub: "竹林一色" }
];
const LAMPS = [
  { id: "changming", name: "长明灯", hours: 24 * 7, desc: "一灯长燃七日，愿行久远。", hint: "原型免费 · 仅作体验，不会产生任何费用" },
  { id: "pingan", name: "平安灯", hours: 24, desc: "愿家人和自己，日日平安。", hint: "原型免费 · 仅作体验，不会产生任何费用" },
  { id: "wenchang", name: "文昌灯", hours: 24, desc: "愿心思清楚，学业事业有光。", hint: "原型免费 · 仅作体验，不会产生任何费用" }
];
const WEEK = ["日","一","二","三","四","五","六"];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function comma(n) { return Number(n).toLocaleString("zh-CN"); }
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function hashInt(n) {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 2246822507);
  x = Math.imul(x ^ (x >>> 13), 3266489909);
  return (x ^ (x >>> 16)) >>> 0;
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function lunarYearOf(date) {
  const y = date.getFullYear();
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  const idx = y - CNY_START;
  if (idx < 0 || idx >= CNY_MD.length) return md < 204 ? y - 1 : y;
  return md < CNY_MD[idx] ? y - 1 : y;
}
function zodiacIndex(lunarYear) { return ((lunarYear - 4) % 12 + 12) % 12; }
function poeticName(seed) {
  const rng = mulberry32(seed >>> 0);
  return ADJ[Math.floor(rng() * ADJ.length)] + NOUN[Math.floor(rng() * NOUN.length)];
}

function defaultState() {
  return {
    monk: null,
    robe: "slate",
    room: "禅堂一",
    birth: null,
    merit: 0,
    dailyMerit: { date: "", value: 0 },
    streak: { count: 0, last: "" },
    incenseToday: { date: "", count: 0 },
    offerToday: "",
    lotToday: null,
    lamps: [],
    wishes: [],
    liked: {},
    muted: true,
    ambOn: false,
    chantOn: false,
    ambVol: 0.35,
    chantVol: 0.25,
    sfxVol: 0.8,
    beadsTotal: 0,
    beadsRound: 0,
    woodfishTotal: 0,
    bowsTotal: 0,
    lesson: { morning: "", evening: "" }
  };
}
let state = defaultState();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {}
  rollDaily();
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}
function rollDaily() {
  const t = todayKey();
  if (state.dailyMerit.date !== t) state.dailyMerit = { date: t, value: 0 };
  if (state.incenseToday.date !== t) state.incenseToday = { date: t, count: 0 };
  const now = Date.now();
  state.lamps = (state.lamps || []).filter(l => l.until > now);
}

function addMerit(n, label = "功德+") {
  rollDaily();
  state.merit += n;
  state.dailyMerit.value += n;
  save();
  const el = $("#meritNum");
  if (el) el.textContent = comma(state.merit);
  if (n) toast(`${label}${n}`);
}

/* ---------- audio (off by default) ---------- */
const audio = { ctx: null, master: null, sfx: null, amb: null, chant: null, nodes: [] };
function ensureAudio() {
  if (audio.ctx) return audio.ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = state.muted ? 0 : 0.9;
  master.connect(ctx.destination);
  const sfx = ctx.createGain(); sfx.gain.value = state.sfxVol; sfx.connect(master);
  const amb = ctx.createGain(); amb.gain.value = 0; amb.connect(master);
  const chant = ctx.createGain(); chant.gain.value = 0; chant.connect(master);
  audio.ctx = ctx; audio.master = master; audio.sfx = sfx; audio.amb = amb; audio.chant = chant;
  return ctx;
}
function resumeAudio() {
  const ctx = ensureAudio();
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}
function envGain(ctx, dest, t, peak, dur) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(dest);
  return g;
}
function noiseBuffer(ctx, dur) {
  const n = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}
function playWoodfish() {
  const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 0.09);
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 880; bp.Q.value = 2.8;
  const g = envGain(ctx, audio.sfx, t, 0.7, 0.09);
  src.connect(bp); bp.connect(g); src.start(t); src.stop(t + 0.09);
  const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = 1180;
  const og = envGain(ctx, audio.sfx, t, 0.18, 0.05);
  osc.connect(og); osc.start(t); osc.stop(t + 0.05);
  try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
}
function playBell() {
  const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
  const t = ctx.currentTime;
  [528, 792, 1056, 1584].forEach((f, i) => {
    const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 - i * 0.35);
    osc.connect(g); g.connect(audio.sfx); osc.start(t); osc.stop(t + 3);
  });
}
function playBead() {
  const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(); osc.type = "square"; osc.frequency.value = 1800 + Math.random() * 400;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2200; bp.Q.value = 6;
  const g = envGain(ctx, audio.sfx, t, 0.12, 0.03);
  osc.connect(bp); bp.connect(g); osc.start(t); osc.stop(t + 0.03);
}
function playBowThud() {
  const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(140, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
  const g = envGain(ctx, audio.sfx, t, 0.28, 0.14);
  osc.connect(g); osc.start(t); osc.stop(t + 0.15);
}
function stopPads() {
  audio.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
  audio.nodes = [];
  if (audio.amb && audio.ctx) audio.amb.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2);
  if (audio.chant && audio.ctx) audio.chant.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2);
}
function startAmbient() {
  const ctx = resumeAudio(); if (!ctx || !audio.amb) return;
  // wind + rain-ish
  const rain = ctx.createBufferSource();
  rain.buffer = noiseBuffer(ctx, 2.4); rain.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 800; bp.Q.value = 0.5;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 300;
  const g = ctx.createGain(); g.gain.value = 0.4;
  rain.connect(bp); bp.connect(hp); hp.connect(g); g.connect(audio.amb);
  rain.start(); audio.nodes.push(rain);
  audio.amb.gain.setTargetAtTime(state.ambVol * 0.4, ctx.currentTime, 0.3);
}
function startChant() {
  const ctx = resumeAudio(); if (!ctx || !audio.chant) return;
  [110, 165, 220, 247].forEach((f, i) => {
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.value = f * (i % 2 ? 1.002 : 0.998);
    const g = ctx.createGain(); g.gain.value = 0.08 / (i + 1);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08 + i * 0.03;
    const lg = ctx.createGain(); lg.gain.value = 0.04 / (i + 1);
    lfo.connect(lg); lg.connect(g.gain);
    osc.connect(g); g.connect(audio.chant);
    osc.start(); lfo.start(); audio.nodes.push(osc, lfo);
  });
  audio.chant.gain.setTargetAtTime(state.chantVol * 0.5, ctx.currentTime, 0.4);
}
function applySound() {
  if (!audio.master) return;
  audio.master.gain.setTargetAtTime(state.muted ? 0 : 0.9, audio.ctx.currentTime, 0.05);
  if (audio.sfx) audio.sfx.gain.setTargetAtTime(state.sfxVol, audio.ctx.currentTime, 0.05);
  if (audio.amb) audio.amb.gain.setTargetAtTime(state.muted || !state.ambOn ? 0 : state.ambVol * 0.4, audio.ctx.currentTime, 0.08);
  if (audio.chant) audio.chant.gain.setTargetAtTime(state.muted || !state.chantOn ? 0 : state.chantVol * 0.5, audio.ctx.currentTime, 0.08);
  $("#icSoundOn").classList.toggle("is-hidden", state.muted);
  $("#icSoundOff").classList.toggle("is-hidden", !state.muted);
}
function enableSoundscape() {
  resumeAudio();
  if (state.ambOn && audio.nodes.length === 0) startAmbient();
  if (state.chantOn) startChant();
  applySound();
}

/* ---------- UI ---------- */
let currentSheet = null;
let toastTimer = 0;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("is-sheet", currentSheet && !$("#sheet").hidden);
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
}
function openSheet(name) {
  currentSheet = name;
  const map = {
    buddha: ["本命佛", renderBuddhaSheet],
    lot: ["求签", renderLotSheet],
    wish: ["许愿", renderWishSheet],
    lamp: ["点灯 · 随喜", renderLampSheet],
    board: ["功德与修行", renderBoardSheet],
    settings: ["设置", renderSettingsSheet],
    almanac: ["今日宜忌", renderAlmanacSheet],
    server: ["选择禅堂", renderServerSheet],
    visitors: ["同修名录", renderVisitorSheet],
    map: ["禅院地图", renderMapSheet],
    woodfish: ["木鱼", renderWoodfishSheet],
    beads: ["念珠", renderBeadsSheet],
  };
  const item = map[name];
  if (!item) return;
  $("#sheetTitle").textContent = item[0];
  $("#sheetBody").innerHTML = "";
  item[1]($("#sheetBody"));
  $("#backdrop").hidden = false; $("#backdrop").classList.remove("is-hidden");
  $("#sheet").hidden = false;
}
function closeSheet() {
  currentSheet = null;
  stopWoodfishAuto();
  $("#sheet").hidden = true;
  $("#backdrop").hidden = true;
  $("#backdrop").classList.add("is-hidden");
}

function robeOf() { return ROBES.find(r => r.id === state.robe) || ROBES[0]; }

function renderBuddhaSheet(root) {
  if (!state.birth) {
    root.innerHTML = `
      <p class="lead">输入出生年份或完整生日，按农历春节划分生肖，请一尊本命守护佛。卡片可保存，每日可上香。</p>
      <div class="field"><label for="birthYear">出生年份</label>
        <input id="birthYear" type="number" inputmode="numeric" min="1936" max="2036" placeholder="例如 1990"></div>
      <div class="field"><label for="birthInput">完整生日（可选，春节前出生请填写）</label>
        <input id="birthInput" type="date" max="2036-12-31" min="1936-01-01"></div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnGenBuddha">生成本命佛</button></div>`;
    $("#btnGenBuddha").onclick = () => {
      const full = $("#birthInput").value;
      const yearRaw = $("#birthYear").value.trim();
      let date, label;
      if (full) {
        const [y, mo, da] = full.split("-").map(Number);
        date = new Date(y, mo - 1, da); label = full;
      } else if (yearRaw) {
        const y = Number(yearRaw);
        if (!y || y < 1936 || y > 2036) return toast("请填写 1936 到 2036 之间的年份");
        date = new Date(y, 5, 15); label = String(y);
      } else return toast("请先填写出生年份或完整生日");
      const ly = lunarYearOf(date);
      const zi = zodiacIndex(ly);
      state.birth = { date: label, lunarYear: ly, zodiac: ZODIAC[zi], zodiacIndex: zi, buddhaId: BUDDHA_BY_ZODIAC[zi] };
      save(); renderBuddhaSheet(root); toast("本命佛已请来"); playBell();
    };
    return;
  }
  const b = BUDDHAS[state.birth.buddhaId];
  const offered = state.offerToday === todayKey();
  root.innerHTML = `
    <div class="buddha-card" id="buddhaCard">
      <div class="buddha-kicker">云端禅院 · 本命守护</div>
      <div class="deity">${deitySVG(b.id)}</div>
      <div class="buddha-name">${b.name}</div>
      <div class="buddha-zodiac">生肖${state.birth.zodiac} · ${b.title}</div>
      <p class="buddha-bless">${b.bless}</p>
      <div class="buddha-meta">${state.monk ? state.monk.name : ""} · ${state.birth.date}</div>
    </div>
    <div class="btn-row" style="margin-top:14px">
      <button type="button" class="btn-primary" id="btnOffer">${offered ? "今日已上香" : "为本命佛上香"}</button>
      <button type="button" class="btn-ghost" id="btnSaveCard">保存卡片</button>
    </div>
    <div class="btn-row"><button type="button" class="btn-ghost" id="btnResetBirth">重新填写生辰</button></div>
    <p class="lead" style="margin-top:8px">${b.mantra}</p>`;
  $("#btnOffer").disabled = offered;
  $("#btnOffer").onclick = () => {
    if (state.offerToday === todayKey()) return;
    state.offerToday = todayKey();
    if (state.incenseToday.date !== todayKey()) state.incenseToday = { date: todayKey(), count: 0 };
    state.incenseToday.count = Math.min(3, state.incenseToday.count + 1);
    save(); addMerit(5, "供奉+"); playBell(); game?.strikeIncense(); toast("已为本命佛上香"); renderBuddhaSheet(root);
  };
  $("#btnSaveCard").onclick = () => downloadBuddhaCard();
  $("#btnResetBirth").onclick = () => { state.birth = null; save(); renderBuddhaSheet(root); };
}

async function downloadBuddhaCard() {
  if (!state.birth) return;
  const b = BUDDHAS[state.birth.buddhaId];
  try { await document.fonts.ready; } catch (e) {}
  const W = 1080, H = 1620;
  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1c12"); g.addColorStop(1, "#120e0c");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(201,169,98,0.55)"; ctx.lineWidth = 4; ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.fillStyle = "#c9a962"; ctx.font = "28px 'Noto Sans SC', sans-serif"; ctx.textAlign = "center";
  ctx.fillText("云端禅院  ·  本命守护", W / 2, 160);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>` + deitySVG(b.id).replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" `);
  const img = new Image();
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  URL.revokeObjectURL(url);
  ctx.drawImage(img, (W - 520) / 2, 220, 520, 650);
  ctx.fillStyle = "#f0e0a8"; ctx.font = "bold 76px 'Noto Serif SC', serif"; ctx.fillText(b.name, W / 2, 940);
  ctx.fillStyle = "rgba(247,241,229,0.75)"; ctx.font = "32px 'Noto Serif SC', serif";
  ctx.fillText(`生肖${state.birth.zodiac}  ·  ${b.title}`, W / 2, 1000);
  ctx.fillStyle = "rgba(247,241,229,0.9)"; ctx.font = "34px 'Noto Serif SC', serif";
  wrapText(ctx, b.bless, W / 2, 1100, W - 220, 54);
  ctx.fillStyle = "rgba(247,241,229,0.45)"; ctx.font = "26px 'Noto Sans SC', sans-serif";
  ctx.fillText(`${state.monk ? state.monk.name + "  ·  " : ""}${state.birth.date}`, W / 2, 1480);
  ctx.font = "22px 'Noto Sans SC', sans-serif"; ctx.fillText("仅供文化娱乐与冥想放松", W / 2, 1528);
  canvas.toBlob(blob => {
    if (!blob) return toast("无法生成图片");
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `本命佛-${b.name}-${state.birth.zodiac}.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("卡片已保存");
  }, "image/png");
}
function wrapText(ctx, text, x, y, maxW, lh) {
  let line = "", yy = y;
  for (const ch of text) {
    const t = line + ch;
    if (ctx.measureText(t).width > maxW) { ctx.fillText(line, x, yy); line = ch; yy += lh; }
    else line = t;
  }
  if (line) ctx.fillText(line, x, yy);
}

function renderLotSheet(root) {
  const already = state.lotToday && state.lotToday.date === todayKey();
  root.innerHTML = `
    <p class="lead">摇一摇签筒，求一则今日参考。签文为原创，只作文化娱乐，不作为决策依据。</p>
    <div class="lot-tube" id="lotTube"></div>
    <div class="btn-row"><button type="button" class="btn-primary" id="btnDraw">${already ? "再求一签（仅供参考）" : "摇签"}</button></div>
    <div id="lotOut"></div>`;
  if (already) paintLot($("#lotOut"), state.lotToday.id, true);
  $("#btnDraw").onclick = () => {
    const tube = $("#lotTube");
    tube.classList.remove("is-shake"); void tube.offsetWidth; tube.classList.add("is-shake");
    playBead();
    setTimeout(() => {
      const id = Math.floor(Math.random() * LOTS.length);
      const first = !(state.lotToday && state.lotToday.date === todayKey());
      state.lotToday = { date: todayKey(), id }; save();
      if (first) addMerit(2, "求签+");
      paintLot($("#lotOut"), id, !first); playBell();
    }, 700);
  };
}
function paintLot(el, id, extra) {
  const L = LOTS[id];
  el.innerHTML = `<div class="lot-result" style="text-align:center;padding-top:8px">
    ${extra ? `<p class="lead">今日已求过，此为加求，仅供把玩。</p>` : ""}
    <div class="lot-rank">${L.rank}</div>
    <div class="lot-title">${L.title}</div>
    <div class="lot-poem">${L.poem.replace(/\n/g, "<br>")}</div>
    <div class="lot-read"><strong>解签　</strong>${L.read}</div>
  </div>`;
}

function renderWishSheet(root) {
  const mine = state.wishes || [];
  const seeds = SEED_WISHES.map((w, i) => ({ id: "s" + i, ...w, likes: 3 + (hashInt(i + 9) % 20), seed: true }));
  const all = [...mine.map((w, i) => ({ ...w, id: w.id || "m" + i })), ...seeds];
  root.innerHTML = `
    <p class="lead">把心愿写下来，红绳会挂到许愿树上。随喜只表示祝福。墙里混有演示心愿。</p>
    <div class="field"><label for="wishText">心愿（四十子以内）</label>
      <textarea id="wishText" maxlength="40" placeholder="愿……"></textarea></div>
    <div class="btn-row"><button type="button" class="btn-primary" id="btnWish">挂上许愿树</button></div>
    <div class="wish-list" id="wishList"></div>`;
  const list = $("#wishList");
  list.innerHTML = all.map(w => `
    <div class="wish-card"><p>${escapeHtml(w.text)}</p>
      <div class="wish-meta"><span>${escapeHtml(w.name)}${w.seed ? `<span class="demo-tag">演示</span>` : ""}</span>
        <button type="button" class="wish-like" data-id="${w.id}" style="color:#e8a090">随喜 ${comma((w.likes || 0) + (state.liked[w.id] || 0))}</button>
      </div></div>`).join("");
  $("#btnWish").onclick = () => {
    const text = $("#wishText").value.trim();
    if (!text) return toast("先写下一句心愿");
    state.wishes.unshift({ id: "m" + Date.now(), name: state.monk ? state.monk.name : "过客", text, likes: 0, at: Date.now() });
    save(); addMerit(3, "许愿+"); game?.addRibbon(); toast("红绳已挂上"); renderWishSheet(root);
  };
  list.onclick = (e) => {
    const btn = e.target.closest(".wish-like");
    if (!btn) return;
    const id = btn.dataset.id;
    if (state.liked[id]) return toast("已经随喜过了");
    state.liked[id] = 1; save(); addMerit(1, "随喜+"); renderWishSheet(root);
  };
}

function renderLampSheet(root) {
  root.innerHTML = `
    <p class="lead">点一盏灯，放在殿前。这是随喜体验，<strong>不会产生任何费用，也没有真实支付</strong>。</p>
    <div class="grid2" style="grid-template-columns:1fr">
      ${LAMPS.map(l => `
        <button type="button" class="opt" data-id="${l.id}" style="display:flex;gap:12px;text-align:left;align-items:center">
          <span class="swatch" style="background:${l.id==="wenchang"?"#dfe9ff":l.id==="pingan"?"#ffb07a":"#ffe08a"}"></span>
          <span><div class="lab">${l.name}</div><div class="sub">${l.desc}<br>${l.hint}</div></span>
        </button>`).join("")}
    </div>`;
  root.querySelectorAll(".opt").forEach(btn => btn.onclick = () => {
    const meta = LAMPS.find(x => x.id === btn.dataset.id);
    state.lamps.push({ id: meta.id, until: Date.now() + meta.hours * 3600 * 1000 });
    if (state.lamps.length > 12) state.lamps = state.lamps.slice(-12);
    save(); game?.addLamp(meta.id); addMerit(3, "点灯+"); playBell(); toast(`已点燃${meta.name}（体验）`); closeSheet();
  });
}

function almanacFor(d = new Date()) {
  const key = d.getFullYear() * 10000 + (d.getMonth()+1)*100 + d.getDate();
  let x = hashInt(key); const yi = [], ji = [];
  while (yi.length < 3) { const item = YI_POOL[x % YI_POOL.length]; if (!yi.includes(item)) yi.push(item); x = hashInt(x + 17); }
  while (ji.length < 2) { const item = JI_POOL[x % JI_POOL.length]; if (!yi.includes(item) && !ji.includes(item)) ji.push(item); x = hashInt(x + 29); }
  return { dateStr: `${d.getMonth()+1}月${d.getDate()}日 周${WEEK[d.getDay()]}`, yi, ji };
}
function renderAlmanacSheet(root) {
  const a = almanacFor();
  root.innerHTML = `<div class="almanac-box"><h3>${a.dateStr}</h3>
    <p class="yi-line"><b>宜</b>${a.yi.join("　")}</p>
    <p class="ji-line"><b>忌</b>${a.ji.join("　")}</p></div>
    <p class="lead" style="margin-top:14px">此为宜忌的趣味推算，并非专业黄历。</p>`;
}

function renderBoardSheet(root) {
  rollDaily();
  const checked = state.streak.last === todayKey();
  const board = buildBoard();
  root.innerHTML = `
    <div class="stat-grid">
      <div class="stat"><b>${comma(state.merit)}</b><span>累计功德</span></div>
      <div class="stat"><b>${state.streak.count}</b><span>连续签到天数</span></div>
      <div class="stat"><b>${comma(state.dailyMerit.value)}</b><span>今日功德</span></div>
      <div class="stat"><b>${comma(state.bowsTotal)}</b><span>累计礼敬</span></div>
    </div>
    <div class="btn-row"><button type="button" class="btn-primary" id="btnCheckin" ${checked?"disabled":""}>${checked ? "今日已签到" : "今日洒扫签到  +8"}</button></div>
    <p class="lead" style="margin-top:18px">今日榜 <span class="demo-tag">含演示数据</span></p>
    ${board.map((r,i) => `<div class="board-row ${r.me?"is-me":""}">
      <span>${i+1}</span><span>${escapeHtml(r.name)}${r.me?"":`<span class="demo-tag">演示</span>`}</span>
      <span>${comma(r.score)}</span></div>`).join("")}`;
  const btn = $("#btnCheckin");
  if (btn) btn.onclick = () => { doCheckin(); renderBoardSheet(root); };
}
function doCheckin() {
  rollDaily();
  if (state.streak.last === todayKey()) return toast("今日已经签过到了");
  const y = new Date(); y.setDate(y.getDate() - 1);
  state.streak.count = state.streak.last === todayKey(y) ? state.streak.count + 1 : 1;
  state.streak.last = todayKey(); save();
  const bonus = 8 + Math.min(7, state.streak.count - 1);
  addMerit(bonus, "签到+"); playBell(); toast(`已连续修行 ${state.streak.count} 日`); updateCheckinHint();
}
function buildBoard() {
  const t = todayKey();
  const h = hashInt(Number(t.replace(/-/g, "")));
  const names = ["松间的晚钟","浅溪的茶烟","云边闲人","过客南","竹影里的人","清凉居士","月下的石阶"];
  const rows = names.map((name, i) => ({ name, score: 20 + ((h >>> (i * 3)) % 80) }));
  rows.push({ name: (state.monk && state.monk.name) || "我", score: state.dailyMerit.value, me: true });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, 10);
}

function renderSettingsSheet(root) {
  const r = robeOf();
  root.innerHTML = `
    <p class="lead">修行记录保存在这台设备的浏览器里。同屏若未连上其他真人，会以标注「演示」的小沙弥填满庭院。</p>
    <p class="lead">法号：<strong>${state.monk ? state.monk.name : ""}</strong></p>
    <p class="lead" style="margin-bottom:8px">僧衣颜色</p>
    <div class="grid2" id="robeGrid">
      ${ROBES.map(rb => `<button type="button" class="opt ${state.robe===rb.id?"is-sel":""}" data-id="${rb.id}">
        <span class="swatch" style="background:#${rb.robe.toString(16).padStart(6,"0")}"></span>
        <div class="lab">${rb.name}</div><div class="sub">${rb.sub}</div></button>`).join("")}
    </div>
    <div class="settings-list" style="margin-top:16px">
      <button type="button" class="row" id="btnToggleMute"><span>总音量（默认关闭）</span><span class="hint">${state.muted?"已关闭":"已开启"}</span></button>
    </div>
    <div class="slider-row"><label>环境音（风与林） <span>${Math.round(state.ambVol*100)}%</span></label>
      <input type="range" id="slAmb" min="0" max="100" value="${Math.round(state.ambVol*100)}"></div>
    <div class="slider-row"><label>念诵低音（合成，非真实经文） <span>${Math.round(state.chantVol*100)}%</span></label>
      <input type="range" id="slChant" min="0" max="100" value="${Math.round(state.chantVol*100)}"></div>
    <div class="slider-row"><label>效果音 <span>${Math.round(state.sfxVol*100)}%</span></label>
      <input type="range" id="slSfx" min="0" max="100" value="${Math.round(state.sfxVol*100)}"></div>
    <div class="settings-list">
      <button type="button" class="row" id="btnAmb"><span>开启环境音</span><span class="hint">${state.ambOn?"已开":"已关"}</span></button>
      <button type="button" class="row" id="btnChant"><span>开启念诵低音</span><span class="hint">${state.chantOn?"已开":"已关"}</span></button>
      <button type="button" class="row" id="btnRename"><span>重新受戒（换法号）</span><span class="hint">形貌会随之改变</span></button>
    </div>
    <p class="lead" style="margin-top:12px">快捷键：1 / E / 空格 礼拜 · 2 念珠 · 3 合掌 · 5 木鱼<br>每日 6:00 早课、18:00 晚课会鸣钟（需先打开声音，并以本机时间为准）。</p>
    <p class="lead">仅供文化娱乐与冥想放松，不涉及真实宗教活动，亦不以宗教名义收取任何费用。<br><a href="v1/" style="color:#d4b878">查看第一版二维原型</a></p>`;
  $("#robeGrid").onclick = (e) => {
    const btn = e.target.closest(".opt"); if (!btn) return;
    state.robe = btn.dataset.id; save();
    const rb = robeOf(); game?.setRobe(rb.robe, rb.sash); net.sendHello();
    renderSettingsSheet(root);
  };
  $("#btnToggleMute").onclick = () => { state.muted = !state.muted; if (!state.muted) enableSoundscape(); applySound(); save(); renderSettingsSheet(root); };
  $("#btnAmb").onclick = () => { state.ambOn = !state.ambOn; if (state.ambOn) { enableSoundscape(); startAmbient(); } applySound(); save(); renderSettingsSheet(root); };
  $("#btnChant").onclick = () => { state.chantOn = !state.chantOn; if (state.chantOn) { enableSoundscape(); startChant(); } applySound(); save(); renderSettingsSheet(root); };
  const bindSl = (id, key, start) => {
    $(id).oninput = (e) => {
      state[key] = Number(e.target.value) / 100; save(); applySound();
      e.target.previousElementSibling?.querySelector?.("span") || (e.target.parentElement.querySelector("span").textContent = e.target.value + "%");
    };
  };
  bindSl("#slAmb", "ambVol"); bindSl("#slChant", "chantVol"); bindSl("#slSfx", "sfxVol");
  $("#btnRename").onclick = () => {
    const seed = (Math.random() * 0xffffffff) >>> 0;
    state.monk = { seed, name: poeticName(seed) }; save();
    game?.setName(state.monk.name); net.sendHello(); toast("今日法号 · " + state.monk.name); closeSheet();
  };
}

function renderServerSheet(root) {
  const counts = net.counts();
  root.innerHTML = `
    <p class="lead">每个禅堂是同一座院子。真人同修走 WebRTC 点对点（无需本站服务器）。人满约五十位后请换堂。显示为「—」的是尚未探听到人数的堂口。</p>
    <div class="server-grid">
      ${ROOMS.map(r => {
        const n = counts[r];
        const cur = r === state.room;
        const label = n == null ? "—" : `${n}/50`;
        return `<button type="button" class="server-cell ${cur?"is-on":""}" data-room="${r}" ${n>=50&&!cur?"disabled":""}>
          <b>${r}${cur?" · 当前":""}</b><span>${label}</span></button>`;
      }).join("")}
    </div>
    <p class="lead" style="margin-top:12px">连线状态：${net.statusText()}</p>`;
  root.querySelectorAll(".server-cell").forEach(btn => btn.onclick = async () => {
    const r = btn.dataset.room;
    if (r === state.room) return closeSheet();
    await net.join(r);
    closeSheet();
  });
}

function renderVisitorSheet(root) {
  const list = net.visitors();
  root.innerHTML = `
    <p class="lead">此堂没有聊天。遇见同修，点对方的小沙弥即可合十致意。标了「演示」的是本地模拟，让院子不至于空着。</p>
    ${list.map(v => `<div class="visitor-row ${v.me?"is-me":""} board-row">
      <span></span><span>${escapeHtml(v.name)}${v.me?"（我）":""}${v.demo?`<span class="demo-tag">演示</span>`:""}${v.real?`<span class="demo-tag">同修</span>`:""}</span>
      <span></span></div>`).join("")}`;
}

function renderMapSheet(root) {
  root.innerHTML = `<p class="lead">俯视禅院。白点是你，金点是同修，灰点是演示沙弥。</p><canvas id="mapCanvas" width="360" height="360"></canvas>
    <p class="lead" style="margin-top:10px">入口、山门、大雄宝殿、宝塔、莲池、许愿树、竹林、钟楼、茶亭、河边步道、林间小路。</p>`;
  drawMinimap($("#mapCanvas"));
}
function drawMinimap(c) {
  if (!c || !game) return;
  const ctx = c.getContext("2d");
  const W = c.width, H = c.height;
  ctx.fillStyle = "#1c1914"; ctx.fillRect(0, 0, W, H);
  const data = game.getMinimap();
  const scale = W / 110;
  const sx = (x) => W / 2 + x * scale;
  const sy = (z) => H / 2 + z * scale;
  ctx.font = "11px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  data.areas.forEach(a => {
    ctx.fillStyle = "rgba(212,184,120,0.12)";
    ctx.beginPath(); ctx.arc(sx(a.x), sy(a.z), a.r * scale * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d4b878"; ctx.fillText(a.name, sx(a.x), sy(a.z));
  });
  // path
  ctx.strokeStyle = "rgba(160,160,160,0.35)"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(sx(0), sy(28)); ctx.lineTo(sx(0), sy(-30)); ctx.stroke();
  data.pts.forEach(p => {
    ctx.beginPath();
    ctx.fillStyle = p.self ? "#fff" : (p.demo ? "#8a8680" : "#e0c060");
    ctx.arc(sx(p.x), sy(p.z), p.self ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
  });
}

/* woodfish + beads tools */
let wfAuto = 0, wfCanvas, wfCtx, wfAngle = 0;
function stopWoodfishAuto() { clearInterval(wfAuto); wfAuto = 0; }
function renderWoodfishSheet(root) {
  root.innerHTML = `<p class="lead">点按木鱼敲击，或开自动连敲。关闭面板即停止。</p>
    <div class="tool-woodfish"><canvas id="wfCanvas" width="280" height="220"></canvas>
      <div class="counter-line">今日 <span id="wfCount">${state.woodfishTotal}</span></div>
      <div class="btn-row">
        <button type="button" class="btn-primary" id="btnWfAuto">自动敲击</button>
        <button type="button" class="btn-ghost" id="btnWfOnce">敲一下</button>
      </div></div>`;
  wfCanvas = $("#wfCanvas"); wfCtx = wfCanvas.getContext("2d");
  drawWoodfish(0);
  const hit = () => { doWoodfish(); wfAngle = 1; drawWoodfish(1); setTimeout(() => drawWoodfish(0), 80); $("#wfCount").textContent = state.woodfishTotal; };
  wfCanvas.onclick = hit;
  $("#btnWfOnce").onclick = hit;
  $("#btnWfAuto").onclick = () => {
    if (wfAuto) { stopWoodfishAuto(); $("#btnWfAuto").textContent = "自动敲击"; return; }
    $("#btnWfAuto").textContent = "停止";
    wfAuto = setInterval(hit, 520);
  };
}
function drawWoodfish(hit) {
  if (!wfCtx) return;
  const c = wfCtx, w = wfCanvas.width, h = wfCanvas.height;
  c.clearRect(0, 0, w, h);
  c.save(); c.translate(w/2, h/2 + 10);
  c.fillStyle = "#8a4e28"; c.strokeStyle = "#4a2a14"; c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 10, 70, 52, 0, 0, Math.PI*2); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(0, 10, 30, 20, 0, 0, Math.PI*2); c.stroke();
  c.fillStyle = "#3a2a1c"; c.beginPath(); c.arc(-22, 0, 5, 0, Math.PI*2); c.fill();
  c.save(); c.translate(40, -20); c.rotate(hit ? -0.7 : -0.35);
  c.fillStyle = "#6b4423"; c.fillRect(-4, 0, 8, 70);
  c.beginPath(); c.arc(0, 0, 12, 0, Math.PI*2); c.fill();
  c.restore(); c.restore();
}
function doWoodfish() {
  playWoodfish();
  state.woodfishTotal++; save();
  addMerit(1);
  game?.playAction("woodfish");
  net.sendAction("woodfish");
}

function renderBeadsSheet(root) {
  root.innerHTML = `<p class="lead">上下滑动或拖动念珠。满一百零八为一圈。</p>
    <div class="tool-beads"><canvas id="beadCanvas" width="280" height="420"></canvas>
      <div class="counter-line">${state.beadsRound} / 108 <small>　累计 ${comma(state.beadsTotal)} 颗 · ${Math.floor(state.beadsTotal/108)} 圈</small></div>
    </div>`;
  const canvas = $("#beadCanvas");
  const ctx = canvas.getContext("2d");
  let angle = 0, lastY = null, acc = 0;
  const N = 22;
  function draw() {
    ctx.clearRect(0, 0, 280, 420);
    const cx = 140, cy = 200, rx = 70, ry = 150;
    for (let i = 0; i < N; i++) {
      const a = angle + (i / N) * Math.PI * 2;
      const x = cx + Math.sin(a) * rx;
      const y = cy - Math.cos(a) * ry;
      const z = (Math.cos(a) + 1) / 2;
      const r = 10 + z * 14;
      const grd = ctx.createRadialGradient(x - r*0.3, y - r*0.3, 2, x, y, r);
      grd.addColorStop(0, "#e8c07a"); grd.addColorStop(1, "#8a4e22");
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    }
    ctx.fillStyle = "#d4b878"; ctx.font = "28px 'Noto Serif SC', serif"; ctx.textAlign = "center";
    ctx.fillText(state.beadsRound + " / 108", 140, 400);
  }
  function turn(dy) {
    angle += dy * 0.02;
    acc += Math.abs(dy);
    if (acc > 28) {
      acc = 0; playBead();
      state.beadsRound = (state.beadsRound + 1) % 108;
      state.beadsTotal++;
      if (state.beadsRound === 0) { addMerit(5, "满圈+"); playBell(); }
      else addMerit(0); // just save
      save();
      root.querySelector(".counter-line").innerHTML = `${state.beadsRound} / 108 <small>　累计 ${comma(state.beadsTotal)} 颗 · ${Math.floor(state.beadsTotal/108)} 圈</small>`;
    }
    draw();
  }
  draw();
  canvas.addEventListener("pointerdown", e => { lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointermove", e => { if (lastY == null) return; turn(e.clientY - lastY); lastY = e.clientY; });
  canvas.addEventListener("pointerup", () => lastY = null);
  canvas.addEventListener("wheel", e => { e.preventDefault(); turn(e.deltaY * 0.2); }, { passive: false });
}

/* ---------- actions ---------- */
const bow = { running: false, count: 0, timer: 0, press: 0, long: false };
function singleBow() {
  game?.playAction("bow");
  playBowThud();
  state.bowsTotal++; save(); addMerit(1);
  net.sendAction("bow");
}
function start108() {
  if (bow.running) return;
  bow.running = true; bow.count = 0; bow.long = true;
  game?.setBowingAuto(true);
  const ov = $("#bowOverlay"); ov.hidden = false; ov.classList.remove("is-hidden");
  $("#bowNum").textContent = "0";
  tickBow();
  bow.timer = setInterval(tickBow, 700);
}
function tickBow() {
  if (!bow.running) return;
  bow.count++; state.bowsTotal++; $("#bowNum").textContent = bow.count;
  game?.playAction("bow"); playBowThud(); addMerit(1); net.sendAction("bow");
  if (bow.count === 36 || bow.count === 72) playBell();
  if (bow.count >= 108) finish108(true);
}
function finish108(done) {
  clearInterval(bow.timer); bow.running = false;
  game?.setBowingAuto(false);
  const ov = $("#bowOverlay"); ov.hidden = true; ov.classList.add("is-hidden");
  if (done) { addMerit(20, "圆满+"); playBell(); toast("一百零八拜已圆满"); }
  else toast(`已礼敬 ${bow.count} 拜`);
  save();
}
function bindBow() {
  const btn = $("#btnBow");
  btn.addEventListener("pointerdown", (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (bow.running) return;
    bow.long = false;
    clearTimeout(bow.press);
    bow.press = setTimeout(() => start108(), 450);
  });
  btn.addEventListener("pointerup", () => {
    clearTimeout(bow.press);
    if (bow.running) return;
    if (!bow.long) singleBow();
  });
  btn.addEventListener("pointerleave", () => { if (!bow.running) clearTimeout(bow.press); });
  btn.addEventListener("contextmenu", e => e.preventDefault());
  $("#btnBowStop").onclick = () => finish108(false);
}
function doHeshi() {
  game?.playAction("heshi"); playBell(); net.sendAction("heshi");
}

/* ---------- joystick ---------- */
function bindJoystick() {
  const wrap = $("#joystick");
  const knob = $("#joyKnob");
  const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 800;
  if (isTouch) wrap.classList.remove("is-hidden");
  const base = wrap.querySelector(".joy-base");
  let pid = null;
  function set(x, y) {
    const r = 32;
    const l = Math.hypot(x, y) || 1;
    const nx = x / l, ny = y / l, m = Math.min(l, r);
    knob.style.transform = `translate(calc(-50% + ${nx*m}px), calc(-50% + ${ny*m}px))`;
    game?.setJoystick(l < 8 ? 0 : nx * (m / r), l < 8 ? 0 : -ny * (m / r));
  }
  function onDown(e) { pid = e.pointerId; base.setPointerCapture(e.pointerId); onMove(e); }
  function onMove(e) {
    if (pid == null || e.pointerId !== pid) return;
    const rec = base.getBoundingClientRect();
    set(e.clientX - rec.left - rec.width/2, e.clientY - rec.top - rec.height/2);
  }
  function onUp(e) { if (e.pointerId !== pid) return; pid = null; set(0, 0); knob.style.transform = "translate(-50%, -50%)"; game?.setJoystick(0, 0); }
  base.addEventListener("pointerdown", onDown);
  base.addEventListener("pointermove", onMove);
  base.addEventListener("pointerup", onUp);
  base.addEventListener("pointercancel", onUp);
}

function updateCheckinHint() {
  const hint = $("#checkinHint");
  const need = state.streak.last !== todayKey();
  hint.classList.toggle("is-hidden", !need);
  hint.hidden = !need;
}

function checkLesson() {
  const now = new Date();
  const hm = now.getHours() * 60 + now.getMinutes();
  const t = todayKey();
  if (hm === 6 * 60 && state.lesson.morning !== t) {
    state.lesson.morning = t; save();
    toast("早课钟声"); playBell(); setTimeout(playBell, 800);
  }
  if (hm === 18 * 60 && state.lesson.evening !== t) {
    state.lesson.evening = t; save();
    toast("晚课钟声"); playBell(); setTimeout(playBell, 800);
  }
}

/* ---------- net ---------- */

async function loadTrystero() {
  const urls = [
    "https://esm.run/trystero",
    "https://cdn.jsdelivr.net/npm/@trystero-p2p/nostr@0.26.0/+esm",
    "https://unpkg.com/@trystero-p2p/nostr@0.26.0/dist/index.mjs",
    "https://unpkg.com/trystero@0.26.0/dist/index.mjs"
  ];
  let last;
  for (const u of urls) {
    try {
      const mod = await import(u);
      const joinRoom = mod.joinRoom || (mod.default && mod.default.joinRoom) || mod.default;
      if (typeof joinRoom === "function") {
        console.info("trystero loaded from", u);
        return joinRoom;
      }
      last = new Error("no joinRoom in " + u + " keys=" + Object.keys(mod));
    } catch (e) { last = e; console.warn("trystero load fail", u, e); }
  }
  throw last || new Error("trystero unavailable");
}

const net = {
  room: null,
  leave: null,
  sendMv: null,
  sendHelloFn: null,
  sendAct: null,
  sendGreetFn: null,
  peers: new Map(),
  occupancy: {},
  connected: false,
  strategy: "none",
  lastSend: 0,
  statusText() {
    if (this.connected) return `已连接（${this.strategy}）· 本堂真人 ${this.peers.size} 位`;
    return "未连上实时同修，当前为本地演示";
  },
  counts() {
    const o = { ...this.occupancy };
    o[state.room] = this.peers.size + 1;
    return o;
  },
  visitors() {
    const list = [{ name: state.monk?.name || "我", me: true }];
    this.peers.forEach(p => list.push({ name: p.name || "同修", real: true }));
    (this._bots || []).forEach(b => list.push({ name: b.name, demo: true }));
    return list;
  },
  _bots: [],
  async join(roomName) {
    state.room = roomName; save();
    $("#serverName").textContent = roomName;
    this.peers.forEach((_, id) => game?.removePeer(id));
    this.peers.clear();
    if (this.leave) { try { this.leave(); } catch (e) {} this.leave = null; this.room = null; this.connected = false; }
    this.fillBots();
    this.updateChrome();
    try {
      const joinRoom = await loadTrystero();
      const room = joinRoom({ appId: APP_ID }, "yunchan-" + roomName);
      this.room = room; this.strategy = "Nostr / Trystero"; this.connected = true;
      const listen = (obj, key, fn) => {
        if (!obj) return;
        const cur = obj[key];
        if (typeof cur === "function" && cur.length >= 1) {
          try { cur.call(obj, fn); return; } catch (e) {}
        }
        obj[key] = fn;
      };
      const pair = (name) => {
        const r = room.makeAction(name);
        if (Array.isArray(r)) return r;
        if (r && typeof r.send === "function") {
          return [ (data, peer) => r.send(data, peer), (cb) => listen(r, "onMessage", cb) ];
        }
        throw new Error("makeAction did not return a pair for " + name);
      };
      const [sendMv, getMv] = pair("mv");
      const [sendHello, getHello] = pair("hello");
      const [sendAct, getAct] = pair("act");
      const [sendGreet, getGreet] = pair("greet");
      this.sendMv = sendMv; this.sendHelloFn = sendHello; this.sendAct = sendAct; this.sendGreetFn = sendGreet;
      this.leave = () => room.leave();
      listen(room, "onPeerJoin", (id) => {
        this.sendHello();
        this.updateChrome();
        this.adjustBots();
      });
      listen(room, "onPeerLeave", (id) => {
        this.peers.delete(id);
        game?.removePeer("p-" + id);
        this.updateChrome();
        this.adjustBots();
      });
      getHello((data, id) => {
        this.peers.set(id, data || {});
        game?.setPeer("p-" + id, { ...data, demo: false });
        this.updateChrome();
        this.adjustBots();
      });
      getMv((data, id) => {
        const prev = this.peers.get(id) || {};
        this.peers.set(id, { ...prev, ...data });
        game?.setPeer("p-" + id, { ...prev, ...data, demo: false });
      });
      getAct((data, id) => {
        game?.setPeer("p-" + id, { action: data?.type, demo: false });
      });
      getGreet((data, id) => {
        const p = this.peers.get(id);
        game?.playAction("heshi");
        toast(`${(p && p.name) || "同修"} 向你合十`);
        playBell();
      });
      this.sendHello();
      this.updateChrome();
    } catch (err) {
      console.warn("multiplayer unavailable", err);
      this.connected = false;
      this.strategy = "none";
    }
    this.startBroadcast(roomName);
    this.fillBots();
    this.updateChrome();
    this.sendHello();
  },
  startBroadcast(roomName) {
    try { this._bc && this._bc.close(); } catch (e) {}
    if (!this._nid) {
      this._nid = sessionStorage.getItem("yunchan-nid") || (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
      sessionStorage.setItem("yunchan-nid", this._nid);
    }
    const bc = new BroadcastChannel("yunchan-bc-" + roomName);
    this._bc = bc;
    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (!msg || msg.id === this._nid) return;
      const pid = "bc-" + msg.id;
      if (msg.type === "leave") {
        this.peers.delete(pid);
        game?.removePeer("p-" + pid);
        this.updateChrome(); this.adjustBots();
        return;
      }
      if (msg.type === "hello" || msg.type === "mv") {
        const prev = this.peers.get(pid) || {};
        const data = { ...prev, ...(msg.data || {}) };
        this.peers.set(pid, data);
        game?.setPeer("p-" + pid, { ...data, demo: false });
        this.updateChrome(); this.adjustBots();
        if (msg.type === "hello") this.bcSend("hello", this.helloPayload());
        return;
      }
      if (msg.type === "act") game?.setPeer("p-" + pid, { action: msg.data?.type, demo: false });
      if (msg.type === "greet") {
        const p = this.peers.get(pid);
        game?.playAction("heshi");
        toast(`${(p && p.name) || "同修"} 向你合十`);
        playBell();
      }
    };
    window.addEventListener("pagehide", () => { try { this.bcSend("leave", {}); bc.close(); } catch (e) {} });
    this.connected = true;
    this.strategy = this.strategy && this.strategy !== "none" ? "BroadcastChannel + " + this.strategy : "BroadcastChannel";
  },
  bcSend(type, data) {
    try { this._bc && this._bc.postMessage({ id: this._nid, type, data }); } catch (e) {}
  },
  helloPayload() {
    const rb = robeOf();
    const st = game?.getState() || { x: 0, z: 24, rot: 0 };
    return { name: state.monk?.name, robe: rb.robe, sash: rb.sash, ...st };
  },
  sendHello() {
    const payload = this.helloPayload();
    if (this.sendHelloFn && state.monk) this.sendHelloFn(payload);
    this.bcSend("hello", payload);
  },
  sendMove() {
    if (!game) return;
    const now = performance.now();
    if (now - this.lastSend < 100) return;
    this.lastSend = now;
    const st = game.getState();
    if (this.sendMv) this.sendMv(st);
    this.bcSend("mv", { ...this.helloPayload(), ...st });
  },
  sendAction(type) {
    if (this.sendAct) this.sendAct({ type });
    this.bcSend("act", { type });
  },
  greet(peerId) {
    const raw = String(peerId).replace(/^p-/, "");
    if (this.sendGreetFn && !raw.startsWith("bc-")) this.sendGreetFn({ to: raw }, raw);
    this.bcSend("greet", { to: raw });
  },
  fillBots() {
    this._bots.forEach(b => game?.removePeer(b.id));
    this._bots = [];
    const need = Math.max(0, 7 - this.peers.size);
    for (let i = 0; i < need; i++) {
      const seed = hashInt(10007 + i * 913 + (state.monk?.seed || 1));
      const name = poeticName(seed);
      const rb = ROBES[i % ROBES.length];
      const id = "bot-" + i;
      const spots = [[-10,8],[8,12],[-6,-8],[10,-6],[-14,-16],[16,6],[4,-12],[-16,4],[14,-18],[0,6],[18,8],[-8,14]];
      const sp = spots[i % spots.length];
      const x = sp[0] + (Math.random() - 0.5) * 2;
      const z = sp[1] + (Math.random() - 0.5) * 2;
      this._bots.push({ id, name });
      game?.setPeer(id, { name, robe: rb.robe, sash: rb.sash, x, z, rot: Math.random() * Math.PI * 2, demo: true, ai: true });
    }
  },
  adjustBots() {
    const need = Math.max(0, 7 - this.peers.size);
    if (need === this._bots.length) return;
    this.fillBots();
  },
  updateChrome() {
    const real = this.peers.size + 1;
    const demo = this._bots.length;
    $("#peerCount").textContent = String(real + demo);
    $("#serverOcc").textContent = `${real}/50`;
    $("#serverName").textContent = state.room;
  }
};

/* ---------- boot ---------- */
let game = null;

function bindUI() {
  $$(".pill").forEach(b => b.addEventListener("click", () => openSheet(b.dataset.sheet)));
  $("#btnSheetClose").onclick = closeSheet;
  $("#backdrop").onclick = closeSheet;
  $("#btnMenu").onclick = () => openSheet("settings");
  $("#btnMerit").onclick = () => openSheet("board");
  $("#btnServer").onclick = () => openSheet("server");
  $("#btnVisitors").onclick = () => openSheet("visitors");
  $("#btnSound").onclick = () => {
    state.muted = !state.muted;
    if (!state.muted) enableSoundscape();
    applySound(); save();
    toast(state.muted ? "声音已关闭" : "声音已打开");
  };
  $("#btnHeshi").onclick = doHeshi;
  $("#btnWoodfish").onclick = () => openSheet("woodfish");
  $("#btnBeads").onclick = () => openSheet("beads");
  bindBow();
  bindJoystick();
  $("#btnCheckinQuick").onclick = doCheckin;
  $("#prompt").onclick = () => {
    const it = game?.interactNearest();
    if (!it) return;
    if (it.type === "incense") {
      rollDaily();
      if (state.incenseToday.count >= 3) return toast("今日上香已满三次");
      state.incenseToday.count++; save(); game.strikeIncense(); addMerit(3, "上香+"); playBell();
    } else if (it.type === "bell") {
      game.strikeBell(); playBell(); addMerit(2, "撞钟+");
    } else if (it.type === "wish") openSheet("wish");
    else if (it.type === "sit") game.sitNearest();
    else if (it.type === "stand") game.playAction("stand");
    else if (it.type === "bow") singleBow();
    else if (it.type === "pagoda") toast(`绕塔中 · 已完成 ${game.getState().laps} 圈（沿塔走一圈即计）`);
  };
}

async function boot() {
  load();
  if (!state.monk) {
    const seed = (Math.random() * 0xffffffff) >>> 0;
    state.monk = { seed, name: poeticName(seed) };
    save();
  }
  const bar = $("#loadBar");
  const hint = $("#loadHint");
  const setProg = (p, t) => { bar.style.width = Math.round(p * 100) + "%"; if (t) hint.textContent = t; };

  setProg(0.08, "展开画卷…");
  const rb = robeOf();
  game = createGame($("#view"), {
    onProgress: setProg,
    onArea(name) { $("#areaTag").textContent = name; },
    onPrompt(it) {
      const el = $("#prompt");
      if (!it) { el.classList.add("is-hidden"); el.hidden = true; return; }
      el.textContent = it.label;
      el.classList.remove("is-hidden"); el.hidden = false;
    },
    onLap(n) { toast(`绕塔第 ${n} 圈`); addMerit(5, "绕塔+"); playBell(); },
    onTapMonk(id, meta) {
      game.playAction("heshi"); playBell();
      const isBot = String(id).startsWith("bot-");
      const rec = isBot ? net._bots.find(b => b.id === id) : net.peers.get(String(id).replace(/^p-/, ""));
      const name = (rec && rec.name) || "同修";
      toast(`向 ${name} 合十`);
      setTimeout(() => toast(`${name} 合十回礼`), 500);
      if (!isBot) net.greet(id);
      game.setPeer(id, { action: "heshi", demo: isBot });
    },
    onHotkey(k) {
      if (k === "bow") { if (bow.running) finish108(false); else singleBow(); }
      if (k === "beads") openSheet("beads");
      if (k === "heshi") doHeshi();
      if (k === "woodfish") openSheet("woodfish");
    },
    onFrame() { net.sendMove(); }
  });
  game.setName(state.monk.name);
  game.setRobe(rb.robe, rb.sash);
  (state.lamps || []).forEach(l => game.addLamp(l.id));
  (state.wishes || []).slice(0, 8).forEach(() => game.addRibbon());

  setProg(1, "山门已开");
  game.start();
  await new Promise(r => setTimeout(r, 400));
  $("#loading").classList.add("is-hidden");
  $("#loading").hidden = true;
  $("#hud").classList.remove("is-hidden");
  $("#nameFloat").textContent = ""; $("#nameFloat").style.display = "none";
  $("#meritNum").textContent = comma(state.merit);
  applySound();
  updateCheckinHint();
  bindUI();
  toast("欢迎，" + state.monk.name);
  const qRoom = new URLSearchParams(location.search).get("room");
  if (qRoom) state.room = qRoom;
  await net.join(state.room || "禅堂一");
  setInterval(checkLesson, 5000);
  window.__yunchan = { get game() { return game; }, net, get state() { return state; } };
}

let booted = false;
function bootOnce() { if (booted) return; booted = true; boot(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootOnce);
else bootOnce();
