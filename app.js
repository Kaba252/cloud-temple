/* 云端禅院 — prototype app */
(() => {
  "use strict";

  const STORAGE_KEY = "cloud-temple-v1";
  const CIRC = 2 * Math.PI * 54; // bow ring
  const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
  const ZODIAC_EMOJI = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];

  // Packed Spring Festival as MMDD, index 0 = 1936
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
  // 1936-2036 inclusive = 101 entries. Verify length later if needed.

  const BUDDHA_BY_ZODIAC = [0,1,1,2,3,3,4,5,5,6,7,7];
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

  const NAMES_2 = [
    "清远","明空","静心","慈渡","悟尘","了然","安禅","守一",
    "怀远","正觉","圆明","澄观","普济","净莲","禅心","云水",
    "松风","月白","溪声","淡泊","知足","善缘","福田","慧灯",
    "明心","觉岸","慈航","甘露","闲云","清凉","妙音","法喜",
    "吉祥","莲开","檀香","晨钟","暮山","石泉","无住","如如",
    "般若","定光","慧海","寂照","清音","抱朴","归真","养素"
  ];

  const CUSHIONS = [
    { id: "hemp", name: "素麻", sub: "质朴安静", fill: "#d7c4a3", rim: "#a89070", pattern: "none" },
    { id: "cinnabar", name: "朱砂", sub: "庄严暖意", fill: "#9c3b2d", rim: "#6e241c", pattern: "dots" },
    { id: "inklotus", name: "墨莲", sub: "沉静深意", fill: "#2c3338", rim: "#1a1e22", pattern: "lotus" },
    { id: "gold", name: "金缕", sub: "殿前华彩", fill: "#c9a962", rim: "#8a7340", pattern: "lines" },
    { id: "moss", name: "青苔", sub: "山居清凉", fill: "#4a5d4e", rim: "#2f3d34", pattern: "dots" }
  ];

  const LAMPS = [
    { id: "changming", name: "长明灯", hours: 24 * 7, desc: "一灯长燃七日，愿行久远。", hint: "原型中免费 · 点燃后厅内亮七天" },
    { id: "pingan", name: "平安灯", hours: 24, desc: "愿家人和自己，日日平安。", hint: "原型中免费 · 点燃后厅内亮一天" },
    { id: "wenchang", name: "文昌灯", hours: 24, desc: "愿心思清楚，学业事业有光。", hint: "原型中免费 · 点燃后厅内亮一天" }
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

  const PEER_NAMES = ["释玄机","释明空","释抱朴","过客甲","莲居","松风","月下人","小沙弥乙","云游","檀越张","释法喜","静安"];

  /* ---------- utils ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function todayKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function hashInt(n) {
    let x = n | 0;
    x = Math.imul(x ^ (x >>> 16), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return (x ^ (x >>> 16)) >>> 0;
  }
  function comma(n) { return Number(n).toLocaleString("zh-CN"); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  function lunarYearOf(date) {
    const y = date.getFullYear();
    const md = (date.getMonth() + 1) * 100 + date.getDate();
    const idx = y - CNY_START;
    if (idx < 0 || idx >= CNY_MD.length) {
      // fallback: treat year as-is if before Feb 4, maybe previous
      return md < 204 ? y - 1 : y;
    }
    return md < CNY_MD[idx] ? y - 1 : y;
  }
  function zodiacIndex(lunarYear) {
    return ((lunarYear - 4) % 12 + 12) % 12;
  }

  /* ---------- state ---------- */
  function defaultState() {
    return {
      monk: null,
      birth: null,
      cushion: "hemp",
      merit: 0,
      dailyMerit: { date: "", value: 0 },
      streak: { count: 0, last: "" },
      incenseToday: { date: "", count: 0 },
      offerToday: "",
      lotToday: null,
      lamps: [],
      wishes: [],
      liked: {},
      muted: false,
      ambient: false,
      bowsTotal: 0,
      woodfishTotal: 0
    };
  }
  let state = defaultState();
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) state = Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) { /* ignore */ }
    rollDaily();
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function rollDaily() {
    const t = todayKey();
    if (state.dailyMerit.date !== t) state.dailyMerit = { date: t, value: 0 };
    if (state.incenseToday.date !== t) state.incenseToday = { date: t, count: 0 };
    // expire lamps
    const now = Date.now();
    state.lamps = (state.lamps || []).filter(l => l.until > now);
  }

  function addMerit(n, label = "功德+") {
    rollDaily();
    state.merit += n;
    state.dailyMerit.value += n;
    save();
    renderMerit();
    if (n) floatText(`${label}${n}`);
  }

  /* ---------- audio ---------- */
  const audio = {
    ctx: null,
    master: null,
    sfx: null,
    amb: null,
    ambNodes: [],
    raining: false
  };
  function ensureAudio() {
    if (audio.ctx) return audio.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    const sfx = ctx.createGain();
    sfx.gain.value = state.muted ? 0 : 0.85;
    sfx.connect(master);
    const amb = ctx.createGain();
    amb.gain.value = 0;
    amb.connect(master);
    audio.ctx = ctx; audio.master = master; audio.sfx = sfx; audio.amb = amb;
    return ctx;
  }
  function resumeAudio() {
    const ctx = ensureAudio();
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function envGain(ctx, dest, t, peak, dur, startVal) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(startVal || 0.0001, t);
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
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 880; bp.Q.value = 2.8;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 420;
    const g = envGain(ctx, audio.sfx, t, 0.7, 0.09);
    src.connect(bp); bp.connect(hp); hp.connect(g);
    src.start(t); src.stop(t + 0.09);
    const osc = ctx.createOscillator();
    osc.type = "triangle"; osc.frequency.value = 1180;
    const og = envGain(ctx, audio.sfx, t, 0.18, 0.05);
    osc.connect(og); osc.start(t); osc.stop(t + 0.05);
    try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
  }
  function playBell() {
    const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
    const t = ctx.currentTime;
    [528, 792, 1056, 1584].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 - i * 0.35);
      osc.connect(g); g.connect(audio.sfx);
      osc.start(t); osc.stop(t + 3);
    });
  }
  function playBead() {
    const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square"; osc.frequency.value = 1800 + Math.random() * 400;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 2200; bp.Q.value = 6;
    const g = envGain(ctx, audio.sfx, t, 0.12, 0.03);
    osc.connect(bp); bp.connect(g);
    osc.start(t); osc.stop(t + 0.03);
  }
  function playBowThud() {
    const ctx = resumeAudio(); if (!ctx || !audio.sfx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine"; osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);
    const g = envGain(ctx, audio.sfx, t, 0.28, 0.14);
    osc.connect(g); osc.start(t); osc.stop(t + 0.15);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 0.06);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 400;
    const ng = envGain(ctx, audio.sfx, t, 0.2, 0.06);
    src.connect(lp); lp.connect(ng); src.start(t); src.stop(t + 0.06);
  }
  function setMuted(on) {
    state.muted = on; save();
    if (audio.sfx) audio.sfx.gain.setTargetAtTime(on ? 0 : 0.85, audio.ctx.currentTime, 0.05);
    $("#iconSoundOn").classList.toggle("is-hidden", on);
    $("#iconSoundOff").classList.toggle("is-hidden", !on);
  }
  function stopAmbient() {
    audio.ambNodes.forEach(n => { try { n.stop ? n.stop() : (n.disconnect && n.disconnect()); } catch (e) {} });
    audio.ambNodes = [];
    audio.raining = false;
    if (audio.amb && audio.ctx) audio.amb.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2);
  }
  function startAmbient() {
    const ctx = resumeAudio(); if (!ctx || !audio.amb) return;
    stopAmbient();
    audio.amb.gain.setTargetAtTime(0.22, ctx.currentTime, 0.4);
    // rain
    const rain = ctx.createBufferSource();
    rain.buffer = noiseBuffer(ctx, 2.2);
    rain.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = 0.7;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 600;
    const rg = ctx.createGain(); rg.gain.value = 0.35;
    rain.connect(bp); bp.connect(hp); hp.connect(rg); rg.connect(audio.amb);
    rain.start();
    audio.ambNodes.push(rain);
    // soft drone (诵经-like pad, not chanting copyrighted sutra)
    [110, 165, 220, 247].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f * (i % 2 ? 1.002 : 0.998);
      const g = ctx.createGain();
      g.gain.value = 0.08 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lg = ctx.createGain(); lg.gain.value = 0.04 / (i + 1);
      lfo.connect(lg); lg.connect(g.gain);
      osc.connect(g); g.connect(audio.amb);
      osc.start(); lfo.start();
      audio.ambNodes.push(osc, lfo);
    });
    audio.raining = true;
  }
  function setAmbient(on) {
    state.ambient = on; save();
    $("#btnAmbient").classList.toggle("is-on", on);
    if (on) startAmbient(); else stopAmbient();
  }

  /* ---------- SVG: cushions, monks, deities ---------- */
  function cushionSVG(id, w = 132, h = 36) {
    const c = CUSHIONS.find(x => x.id === id) || CUSHIONS[0];
    let pat = "";
    if (c.pattern === "dots") {
      pat = `<circle cx="52" cy="16" r="1.2" fill="${c.rim}" opacity=".35"/>
             <circle cx="66" cy="18" r="1.2" fill="${c.rim}" opacity=".35"/>
             <circle cx="80" cy="16" r="1.2" fill="${c.rim}" opacity=".35"/>`;
    } else if (c.pattern === "lines") {
      pat = `<path d="M36 18h60" stroke="${c.rim}" stroke-width=".8" opacity=".35"/>
             <path d="M40 22h52" stroke="${c.rim}" stroke-width=".8" opacity=".35"/>`;
    } else if (c.pattern === "lotus") {
      pat = `<path d="M66 22c-4-6-10-6-12-2 6-2 8 0 12 2 4-2 6-4 12-2-2-4-8-4-12 2z" fill="${c.rim}" opacity=".4"/>`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
      <ellipse cx="66" cy="22" rx="58" ry="11" fill="rgba(0,0,0,.25)"/>
      <ellipse cx="66" cy="18" rx="58" ry="13" fill="${c.fill}"/>
      <ellipse cx="66" cy="16" rx="50" ry="9" fill="none" stroke="${c.rim}" stroke-width="2" opacity=".7"/>
      ${pat}
    </svg>`;
  }

  function makeMonk(seed) {
    const rng = mulberry32(seed >>> 0);
    const skins = ["#f3d7b5","#e8c4a0","#f6e0c8","#d4a574","#e2c09a"];
    const robes = [
      { main: "#c45c2a", dark: "#8c3a18", inner: "#e8d5a3" },
      { main: "#7a2e28", dark: "#4e1a16", inner: "#d4b56a" },
      { main: "#c49a4a", dark: "#8a6a28", inner: "#f3ead8" },
      { main: "#2c3d5a", dark: "#1a2538", inner: "#c9a962" },
      { main: "#3d5a45", dark: "#24362a", inner: "#e8dcc4" },
      { main: "#5a2c4a", dark: "#3a1a30", inner: "#e8d5a3" },
      { main: "#8c4a28", dark: "#5a2e16", inner: "#f0e0a8" }
    ];
    const eyes = ["peaceful","half","open","smile"];
    const robe = pick(rng, robes);
    return {
      seed,
      name: "释" + pick(rng, NAMES_2),
      skin: pick(rng, skins),
      robe,
      eye: pick(rng, eyes),
      brow: rng() > 0.5 ? "arch" : "straight",
      scars: rng() > 0.65,
      blush: rng() > 0.4
    };
  }

  function eyePaths(eye, x) {
    if (eye === "peaceful") return `<path d="M${x-6} 0 Q${x} 3 ${x+6} 0" fill="none" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>`;
    if (eye === "half") return `<path d="M${x-6} 1 Q${x} 4 ${x+6} 1" fill="none" stroke="#3a2a1c" stroke-width="1.2" stroke-linecap="round"/><circle cx="${x}" cy="2.2" r="1.1" fill="#3a2a1c"/>`;
    if (eye === "smile") return `<path d="M${x-6} 2 Q${x} -2 ${x+6} 2" fill="none" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>`;
    return `<ellipse cx="${x}" cy="1" rx="3.2" ry="3.6" fill="#faf6ef" stroke="#3a2a1c" stroke-width=".7"/><circle cx="${x}" cy="1.2" r="1.5" fill="#3a2a1c"/>`;
  }

  function monkSVG(m, opts = {}) {
    const w = opts.size || 150;
    const h = Math.round(w * 170 / 150);
    const { skin, robe, eye, brow, scars, blush } = m;
    const browP = brow === "arch"
      ? `<path d="M52 62 Q60 58 67 62" fill="none" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M83 62 Q90 58 98 62" fill="none" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>`
      : `<path d="M52 61h15" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M83 61h15" stroke="#3a2a1c" stroke-width="1.3" stroke-linecap="round"/>`;
    const scar = scars
      ? `<circle cx="69" cy="44" r="1.1" fill="#c9a08a"/><circle cx="75" cy="42.5" r="1.1" fill="#c9a08a"/><circle cx="81" cy="44" r="1.1" fill="#c9a08a"/>`
      : "";
    const blushP = blush
      ? `<ellipse cx="56" cy="76" rx="5" ry="2.4" fill="#e8a090" opacity=".35"/><ellipse cx="94" cy="76" rx="5" ry="2.4" fill="#e8a090" opacity=".35"/>`
      : "";
    return `<svg class="monk-svg" viewBox="0 0 150 170" width="${w}" height="${h}" aria-hidden="true">
      <ellipse cx="75" cy="158" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>
      <!-- robe body -->
      <path d="M36 96 C28 150 50 158 75 158 C100 158 122 150 114 96 C100 108 50 108 36 96Z" fill="${robe.main}"/>
      <path d="M40 100 C44 146 62 152 75 152 C88 152 106 146 110 100 C96 112 54 112 40 100Z" fill="${robe.dark}" opacity=".35"/>
      <path d="M60 96 L75 154 L90 96" fill="none" stroke="${robe.inner}" stroke-width="2.2" opacity=".8"/>
      <path d="M48 92 C60 86 90 86 102 92 L108 108 C96 102 54 102 42 108Z" fill="${robe.inner}"/>
      <path d="M48 92 C40 100 34 120 38 138" fill="none" stroke="${robe.dark}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
      <!-- ears -->
      <ellipse cx="46" cy="70" rx="6" ry="8" fill="${skin}"/>
      <ellipse cx="104" cy="70" rx="6" ry="8" fill="${skin}"/>
      <!-- neck -->
      <rect x="67" y="86" width="16" height="12" fill="${skin}"/>
      <!-- head -->
      <ellipse cx="75" cy="66" rx="28" ry="30" fill="${skin}"/>
      <path d="M50 58 Q75 36 100 58 Q98 48 75 44 Q52 48 50 58Z" fill="#f0d8b8" opacity=".25"/>
      ${scar}
      ${browP}
      <g transform="translate(0,68)">${eyePaths(eye, 60)}${eyePaths(eye, 90)}</g>
      ${blushP}
      <path d="M69 82 Q75 86 81 82" fill="none" stroke="#b07868" stroke-width="1.3" stroke-linecap="round"/>
      <!-- hands idle (meditation) -->
      <g class="hands-idle">
        <ellipse cx="75" cy="132" rx="16" ry="8" fill="${skin}"/>
        <path d="M62 132 Q75 126 88 132" fill="none" stroke="${skin}" stroke-width="5" stroke-linecap="round"/>
      </g>
      <!-- hands heshi -->
      <g class="hands-heshi" style="display:none">
        <path d="M70 118 L75 108 L80 118 L80 136 L70 136Z" fill="${skin}"/>
        <path d="M75 108 L75 136" stroke="${robe.dark}" stroke-width=".6" opacity=".3"/>
      </g>
    </svg>`;
  }

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

  function defaultAltarSVG() {
    return `<svg viewBox="0 0 120 150" width="120" height="150" aria-hidden="true">
      <circle cx="60" cy="58" r="44" fill="rgba(240,224,168,.12)" stroke="#c9a962" stroke-width=".8"/>
      <path d="M32 105 C34 128 48 138 60 138 C72 138 86 128 88 105 C78 112 42 112 32 105Z" fill="#8c3a28"/>
      <path d="M44 100 C50 96 70 96 76 100 L80 112 C72 108 48 108 40 112Z" fill="#e8d5a3"/>
      <ellipse cx="60" cy="72" rx="16" ry="18" fill="#f0d8b8"/>
      <path d="M52 80 Q60 84 68 80" fill="none" stroke="#b07868" stroke-width="1" stroke-linecap="round"/>
      <path d="M50 70 Q54 72 58 70M62 70 Q66 72 70 70" fill="none" stroke="#3a2a1c" stroke-width="1" stroke-linecap="round"/>
    </svg>`;
  }

  function woodfishSVG() {
    return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
      <ellipse cx="30" cy="36" rx="20" ry="16" fill="#c47a3a" stroke="#6b4423" stroke-width="1.5"/>
      <ellipse cx="30" cy="36" rx="12" ry="9" fill="none" stroke="#6b4423" stroke-width="1" opacity=".5"/>
      <circle cx="22" cy="30" r="2" fill="#3a2a1c"/>
      <path d="M42 28 Q50 24 54 18" stroke="#8c5a2a" stroke-width="3" stroke-linecap="round" class="mallet-handle"/>
      <circle cx="54" cy="16" r="5" fill="#6b4423" class="mallet-head"/>
    </svg>`;
  }
  function beadsSVG() {
    const beads = [];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 - Math.PI / 2;
      const x = 36 + Math.cos(a) * 24;
      const y = 36 + Math.sin(a) * 24;
      beads.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${i===0?"#c9a962":"#6b4423"}" stroke="#3a2a1c" stroke-width=".6"/>`);
    }
    return `<svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true" class="beads-svg">${beads.join("")}</svg>`;
  }

  /* ---------- render core ---------- */
  function renderMerit() { $("#meritNum").textContent = comma(state.merit); }

  function renderMonk() {
    if (!state.monk) return;
    $("#monk").innerHTML = monkSVG(state.monk);
    $("#monk").classList.add("is-breathing");
    $("#monkName").textContent = state.monk.name;
    $("#cushion").innerHTML = cushionSVG(state.cushion);
  }

  function renderAltar() {
    const fig = $("#altarFigure");
    const cap = $("#altarCaption");
    if (state.birth) {
      const b = BUDDHAS[state.birth.buddhaId];
      fig.innerHTML = deitySVG(b.id);
      cap.textContent = `本命佛 · ${b.name}`;
    } else {
      fig.innerHTML = defaultAltarSVG();
      cap.textContent = "禅院佛龛 · 可供奉本命佛";
    }
    renderLamps();
    renderIncense();
  }

  function renderLamps() {
    rollDaily();
    const row = $("#lampRow");
    row.innerHTML = state.lamps.map(l =>
      `<div class="lamp ${l.id}" title="${escapeHtml(LAMPS.find(x=>x.id===l.id)?.name || "")}"><i class="flame"></i><i class="base"></i></div>`
    ).join("");
    // fix: I used <i> but CSS expects .flame/.base as children classes on divs
    row.innerHTML = state.lamps.map(l =>
      `<div class="lamp ${l.id}" title="${escapeHtml(LAMPS.find(x=>x.id===l.id)?.name || "")}"><span class="flame"></span><span class="base"></span></div>`
    ).join("");
  }

  function renderIncense() {
    const box = $("#incenseBurner");
    const n = Math.min(state.incenseToday.date === todayKey() ? state.incenseToday.count : 0, 3);
    let sticks = "";
    for (let i = 0; i < n; i++) {
      const left = 28 + i * 10;
      sticks += `<span class="stick" style="left:${left}px"><span class="tip"></span><span class="smoke" style="animation-delay:${i*0.4}s"></span></span>`;
    }
    box.innerHTML = sticks + `<span class="burner-bowl"></span>`;
  }

  function floatText(text, x, y) {
    const layer = $("#floats");
    const el = document.createElement("div");
    el.className = "float-txt";
    const stage = $("#selfStage").getBoundingClientRect();
    const hall = $("#hall").getBoundingClientRect();
    el.style.left = (x != null ? x : (stage.left + stage.width / 2 - hall.left)) + "px";
    el.style.top = (y != null ? y : (stage.top + 24 - hall.top)) + "px";
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  let toastTimer = 0;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.toggle("is-sheet", currentSheet && !$("#sheet").hidden);
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
  }

  /* ---------- almanac ---------- */
  const WEEK = ["日","一","二","三","四","五","六"];
  function almanacFor(d = new Date()) {
    const key = d.getFullYear() * 10000 + (d.getMonth()+1)*100 + d.getDate();
    const h = hashInt(key);
    const yi = [];
    const ji = [];
    let x = h;
    while (yi.length < 3) {
      const item = YI_POOL[x % YI_POOL.length];
      if (!yi.includes(item)) yi.push(item);
      x = hashInt(x + 17);
    }
    while (ji.length < 2) {
      const item = JI_POOL[x % JI_POOL.length];
      if (!yi.includes(item) && !ji.includes(item)) ji.push(item);
      x = hashInt(x + 29);
    }
    return {
      dateStr: `${d.getMonth()+1}月${d.getDate()}日 周${WEEK[d.getDay()]}`,
      yi, ji
    };
  }
  function renderAlmanacBar() {
    const a = almanacFor();
    $("#almanacDate").textContent = a.dateStr;
    $("#almanacYi").textContent = "宜 " + a.yi.join("、");
  }

  /* ---------- sheets ---------- */
  let currentSheet = null;
  function openSheet(name) {
    currentSheet = name;
    const map = {
      buddha: ["本命佛", renderBuddhaSheet],
      lot: ["求签", renderLotSheet],
      wish: ["许愿", renderWishSheet],
      lamp: ["点灯", renderLampSheet],
      cushion: ["蒲团", renderCushionSheet],
      board: ["功德与修行", renderBoardSheet],
      settings: ["禅院设置", renderSettingsSheet],
      almanac: ["今日宜忌", renderAlmanacSheet],
      online: ["同屏禅修", renderOnlineSheet]
    };
    const item = map[name];
    if (!item) return;
    $("#sheetTitle").textContent = item[0];
    $("#sheetBody").innerHTML = "";
    item[1]($("#sheetBody"));
    $("#backdrop").hidden = false;
    $("#backdrop").classList.remove("is-hidden");
    $("#sheet").hidden = false;
  }
  function closeSheet() {
    currentSheet = null;
    $("#sheet").hidden = true;
    $("#backdrop").hidden = true;
    $("#backdrop").classList.add("is-hidden");
  }

  function renderBuddhaSheet(root) {
    if (!state.birth) {
      root.innerHTML = `
        <p class="lead">输入出生日期，按农历春节划分生肖，为你请一尊本命守护佛。专属卡片可保存下来，每日还可为本命佛上香，养成自己的小小功课。</p>
        <div class="field">
          <label for="birthYear">出生年份</label>
          <input id="birthYear" type="number" inputmode="numeric" min="1936" max="2036" placeholder="例如 1990">
        </div>
        <div class="field">
          <label for="birthInput">完整生日（可选，春节前出生请填写）</label>
          <input id="birthInput" type="date" max="2036-12-31" min="1936-01-01">
        </div>
        <div class="btn-row"><button type="button" class="btn-primary" id="btnGenBuddha">生成本命佛</button></div>
        <p class="lead" style="margin-top:14px">只填年份时，按该年春节之后计算生肖。若生日在春节前，请补上完整日期，以免生肖错一年。</p>`;
      $("#btnGenBuddha").onclick = () => {
        const full = $("#birthInput").value;
        const yearRaw = $("#birthYear").value.trim();
        let date, label;
        if (full) {
          const [y, mo, da] = full.split("-").map(Number);
          date = new Date(y, mo - 1, da);
          label = full;
        } else if (yearRaw) {
          const y = Number(yearRaw);
          if (!y || y < 1936 || y > 2036) return toast("请填写 1936 到 2036 之间的年份");
          // mid-year is safely after Spring Festival
          date = new Date(y, 5, 15);
          label = String(y);
        } else {
          return toast("请先填写出生年份或完整生日");
        }
        const ly = lunarYearOf(date);
        const zi = zodiacIndex(ly);
        state.birth = { date: label, lunarYear: ly, zodiac: ZODIAC[zi], zodiacIndex: zi, buddhaId: BUDDHA_BY_ZODIAC[zi] };
        save();
        renderAltar();
        renderBuddhaSheet(root);
        toast("本命佛已请至龛中");
        playBell();
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
      save();
      addMerit(5, "供奉+");
      renderIncense();
      playBell();
      toast("已为本命佛上香");
      renderBuddhaSheet(root);
    };
    $("#btnSaveCard").onclick = () => downloadBuddhaCard();
    $("#btnResetBirth").onclick = () => {
      state.birth = null; save(); renderAltar(); renderBuddhaSheet(root);
    };
  }

  async function downloadBuddhaCard() {
    if (!state.birth) return;
    const b = BUDDHAS[state.birth.buddhaId];
    try { await document.fonts.ready; } catch (e) {}
    const W = 1080, H = 1620;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#2a1c12"); g.addColorStop(1, "#120e0c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(201,169,98,0.55)";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, W - 96, H - 96);
    ctx.strokeStyle = "rgba(201,169,98,0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(64, 64, W - 128, H - 128);

    ctx.fillStyle = "#c9a962";
    ctx.font = "28px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("云端禅院  ·  本命守护", W / 2, 160);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>` + deitySVG(b.id).replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" `);
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    URL.revokeObjectURL(url);
    ctx.drawImage(img, (W - 520) / 2, 220, 520, 650);

    ctx.fillStyle = "#f0e0a8";
    ctx.font = "bold 76px 'Noto Serif SC', serif";
    ctx.fillText(b.name, W / 2, 940);
    ctx.fillStyle = "rgba(247,241,229,0.75)";
    ctx.font = "32px 'Noto Serif SC', serif";
    ctx.fillText(`生肖${state.birth.zodiac}  ·  ${b.title}`, W / 2, 1000);

    ctx.fillStyle = "rgba(247,241,229,0.9)";
    ctx.font = "34px 'Noto Serif SC', serif";
    wrapText(ctx, b.bless, W / 2, 1100, W - 220, 54);

    ctx.fillStyle = "rgba(247,241,229,0.45)";
    ctx.font = "26px 'Noto Sans SC', sans-serif";
    const meta = `${state.monk ? state.monk.name + "  ·  " : ""}${state.birth.date}`;
    ctx.fillText(meta, W / 2, 1480);
    ctx.font = "22px 'Noto Sans SC', sans-serif";
    ctx.fillText("仅供文化娱乐与冥想放松", W / 2, 1528);

    canvas.toBlob(blob => {
      if (!blob) return toast("无法生成图片");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `本命佛-${b.name}-${state.birth.zodiac}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast("卡片已保存");
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
      tube.classList.remove("is-shake");
      void tube.offsetWidth;
      tube.classList.add("is-shake");
      playBead();
      setTimeout(() => {
        const id = Math.floor(Math.random() * LOTS.length);
        const first = !(state.lotToday && state.lotToday.date === todayKey());
        state.lotToday = { date: todayKey(), id };
        save();
        if (first) addMerit(2, "求签+");
        paintLot($("#lotOut"), id, !first);
        playBell();
      }, 700);
    };
  }
  function paintLot(el, id, extra) {
    const L = LOTS[id];
    el.innerHTML = `
      <div class="lot-result">
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
      <p class="lead">把心愿写在墙上。随喜只表示祝福，不代表愿望会被「实现」。以下混有本地演示心愿。</p>
      <div class="field"><label for="wishText">心愿（四十子以内）</label>
        <textarea id="wishText" maxlength="40" placeholder="愿……"></textarea></div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnWish">挂上许愿墙</button></div>
      <div class="wish-list" id="wishList"></div>`;
    const list = $("#wishList");
    list.innerHTML = all.map(w => `
      <div class="wish-card">
        <p>${escapeHtml(w.text)}</p>
        <div class="wish-meta">
          <span>${escapeHtml(w.name)}${w.seed ? `<span class="demo-tag">演示</span>` : ""}</span>
          <button type="button" class="wish-like" data-id="${w.id}">随喜 ${comma((w.likes || 0) + (state.liked[w.id] || 0))}</button>
        </div>
      </div>`).join("");
    $("#btnWish").onclick = () => {
      const text = $("#wishText").value.trim();
      if (!text) return toast("先写下一句心愿");
      state.wishes.unshift({ id: "m" + Date.now(), name: state.monk ? state.monk.name : "过客", text, likes: 0, at: Date.now() });
      save();
      addMerit(3, "许愿+");
      toast("心愿已挂上");
      renderWishSheet(root);
    };
    list.onclick = (e) => {
      const btn = e.target.closest(".wish-like");
      if (!btn) return;
      const id = btn.dataset.id;
      if (state.liked[id]) return toast("已经随喜过了");
      state.liked[id] = 1; save();
      addMerit(1, "随喜+");
      renderWishSheet(root);
    };
  }

  function renderLampSheet(root) {
    root.innerHTML = `
      <p class="lead">点一盏灯，放在龛前。原型中全部免费，只为体验气氛，不涉及任何供奉或收费。</p>
      <div class="lamp-grid">
        ${LAMPS.map(l => `
          <button type="button" class="lamp-opt" data-id="${l.id}">
            <span class="swatch ${l.id}"></span>
            <span><h3>${l.name}</h3><p>${l.desc}</p><p>${l.hint}</p></span>
          </button>`).join("")}
      </div>`;
    root.querySelector(".lamp-grid").onclick = (e) => {
      const btn = e.target.closest(".lamp-opt");
      if (!btn) return;
      const meta = LAMPS.find(x => x.id === btn.dataset.id);
      const now = Date.now();
      state.lamps.push({ id: meta.id, until: now + meta.hours * 3600 * 1000 });
      if (state.lamps.length > 9) state.lamps = state.lamps.slice(-9);
      save();
      renderLamps();
      addMerit(3, "点灯+");
      playBell();
      toast(`已点燃${meta.name}`);
      closeSheet();
    };
  }

  function renderCushionSheet(root) {
    root.innerHTML = `
      <p class="lead">选一个蒲团坐下。样式只影响观感，与「功德」无关。</p>
      <div class="cushion-grid">
        ${CUSHIONS.map(c => `
          <button type="button" class="cushion-opt ${state.cushion===c.id?"is-sel":""}" data-id="${c.id}">
            <div class="preview">${cushionSVG(c.id, 110, 40)}</div>
            <div class="lab">${c.name}</div>
            <div class="sub">${c.sub}</div>
          </button>`).join("")}
      </div>`;
    root.querySelector(".cushion-grid").onclick = (e) => {
      const btn = e.target.closest(".cushion-opt");
      if (!btn) return;
      state.cushion = btn.dataset.id; save();
      renderMonk();
      renderCushionSheet(root);
    };
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
      <div class="streak-dots">${[0,1,2,3,4,5,6].map(i => `<i class="${i < (state.streak.count % 7) || (checked && i===((state.streak.count-1)%7)) ? "on":""}"></i>`).join("")}</div>
      <div class="btn-row"><button type="button" class="btn-primary" id="btnCheckin" ${checked?"disabled":""}>${checked ? "今日已签到" : "今日洒扫签到  +8"}</button></div>
      <p class="lead" style="margin-top:18px">今日榜 <span class="demo-tag">含演示数据</span></p>
      <div class="board-list">
        ${board.map((r,i) => `
          <div class="board-row ${r.me?"is-me":""}">
            <span class="rank">${i+1}</span>
            <span>${escapeHtml(r.name)}${r.me?"":`<span class="demo-tag">演示</span>`}</span>
            <span class="score">${comma(r.score)}</span>
          </div>`).join("")}
      </div>`;
    const btn = $("#btnCheckin");
    if (btn) btn.onclick = () => { doCheckin(); renderBoardSheet(root); };
  }
  function doCheckin() {
    rollDaily();
    if (state.streak.last === todayKey()) return toast("今日已经签过到了");
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yk = todayKey(y);
    state.streak.count = state.streak.last === yk ? state.streak.count + 1 : 1;
    state.streak.last = todayKey();
    save();
    const bonus = 8 + Math.min(7, state.streak.count - 1);
    addMerit(bonus, "签到+");
    playBell();
    toast(`已连续修行 ${state.streak.count} 日`);
    updateCheckinHint();
  }
  function buildBoard() {
    const t = todayKey();
    const h = hashInt(t.replace(/-/g, "") | 0);
    const names = ["释玄机","莲花居士","云水僧","过客南","释法喜","松月","檀越王","小沙弥丙","清凉寺游客","释抱朴"];
    const rows = names.map((name, i) => ({
      name,
      score: 20 + ((h >>> (i * 3)) % 80) + Math.floor(state.dailyMerit.value * (0.3 + (i % 5) * 0.1))
    }));
    rows.push({ name: (state.monk && state.monk.name) || "我", score: state.dailyMerit.value, me: true });
    rows.sort((a, b) => b.score - a.score);
    return rows.slice(0, 10);
  }

  function renderSettingsSheet(root) {
    root.innerHTML = `
      <p class="lead">小沙弥与修行记录保存在这台设备的浏览器里，换设备不会同步。同屏人数与他人动作均为本地演示。</p>
      <div class="settings-list">
        <button type="button" class="row" id="btnRenounce"><span>重新受戒（更换小沙弥）</span><span class="hint">法号与形貌会变</span></button>
        <button type="button" class="row" id="btnToggleMute"><span>音效</span><span class="hint">${state.muted?"已关闭":"已开启"}</span></button>
        <button type="button" class="row" id="btnToggleAmb"><span>禅境音（雨声与低音）</span><span class="hint">${state.ambient?"已开启":"已关闭"}</span></button>
        <button type="button" class="row" id="btnWipe"><span>清除本地记录</span><span class="hint">功德、本命佛、心愿将清空</span></button>
      </div>
      <p class="lead" style="margin-top:18px">仅供文化娱乐与冥想放松，不涉及真实宗教活动，亦不以宗教名义收取任何费用。</p>`;
    $("#btnRenounce").onclick = () => {
      state.monk = makeMonk((Math.random() * 0xffffffff) >>> 0);
      save(); renderMonk(); closeSheet();
      ceremony(state.monk, "重新受戒");
    };
    $("#btnToggleMute").onclick = () => { setMuted(!state.muted); renderSettingsSheet(root); };
    $("#btnToggleAmb").onclick = () => { setAmbient(!state.ambient); renderSettingsSheet(root); };
    $("#btnWipe").onclick = () => {
      if (!confirm("确定清除这台设备上的禅院记录？")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState();
      location.reload();
    };
  }
  function renderAlmanacSheet(root) {
    const a = almanacFor();
    root.innerHTML = `
      <div class="almanac-box">
        <h3>${a.dateStr}</h3>
        <p class="yi-line"><b>宜</b>${a.yi.join("　")}</p>
        <p class="ji-line"><b>忌</b>${a.ji.join("　")}</p>
      </div>
      <p class="lead" style="margin-top:14px">此为宜忌的趣味推算，并非专业黄历，只供随手一看。</p>`;
  }
  function renderOnlineSheet(root) {
    root.innerHTML = `
      <p class="lead">厅里其他小沙弥、在线人数、以及他们敲木鱼、礼佛、合十回礼，都是在你这台设备上模拟出来的演示，用来想象「同屏禅修」的气氛。</p>
      <p class="lead">正式版会把人分到不同禅房，每间只同步附近几十位同修，不会让百万人真的挤在同一个画面里。</p>
      <p class="lead">点一点别人的小沙弥，可以合十致意，对方会回礼。</p>`;
  }

  /* ---------- actions ---------- */
  let knockLock = false;
  function doWoodfish() {
    if (knockLock) return;
    knockLock = true;
    setTimeout(() => knockLock = false, 120);
    playWoodfish();
    state.woodfishTotal = (state.woodfishTotal || 0) + 1;
    const prop = $("#woodfishProp");
    prop.classList.add("is-on");
    prop.style.transform = "rotate(-18deg)";
    setTimeout(() => { prop.style.transform = ""; }, 90);
    addMerit(1);
    setTimeout(() => { if (!prop.dataset.keep) prop.classList.remove("is-on"); }, 800);
  }

  let beadTimer = 0;
  function doBeads() {
    const prop = $("#beadsProp");
    prop.innerHTML = beadsSVG();
    prop.classList.add("is-on");
    const svg = prop.querySelector("svg");
    if (svg) {
      svg.classList.remove("beads-spin");
      void svg.offsetWidth;
      svg.classList.add("beads-spin");
    }
    let n = 0;
    clearInterval(beadTimer);
    beadTimer = setInterval(() => {
      playBead();
      n++;
      if (n >= 9) { clearInterval(beadTimer); addMerit(1); }
    }, 90);
    setTimeout(() => prop.classList.remove("is-on"), 1400);
  }

  function doIncense() {
    rollDaily();
    if (state.incenseToday.count >= 3) return toast("今日上香已满三次，明日再来");
    state.incenseToday.count += 1;
    save();
    renderIncense();
    addMerit(3, "上香+");
    playBell();
  }

  function setHeshi(on) {
    const root = $("#monk");
    const idle = root.querySelector(".hands-idle");
    const he = root.querySelector(".hands-heshi");
    if (idle) idle.style.display = on ? "none" : "";
    if (he) he.style.display = on ? "" : "none";
  }

  function singleBow() {
    const el = $("#monk");
    el.classList.remove("is-bowing");
    void el.offsetWidth;
    el.classList.add("is-bowing");
    setHeshi(true);
    playBowThud();
    state.bowsTotal += 1;
    addMerit(1);
    setTimeout(() => { el.classList.remove("is-bowing"); setHeshi(false); }, 700);
  }

  const bowState = { running: false, count: 0, timer: 0, press: 0, long: false };
  function start108() {
    if (bowState.running) return;
    bowState.running = true;
    bowState.count = 0;
    bowState.long = true;
    const ov = $("#bowOverlay");
    ov.hidden = false; ov.classList.remove("is-hidden");
    $("#bowTip").textContent = "一心礼敬";
    updateBowRing(0);
    setHeshi(true);
    tickBow();
    bowState.timer = setInterval(tickBow, 700);
  }
  function tickBow() {
    if (!bowState.running) return;
    bowState.count += 1;
    state.bowsTotal += 1;
    updateBowRing(bowState.count);
    const el = $("#monk");
    el.classList.remove("is-bowing");
    void el.offsetWidth;
    el.classList.add("is-bowing");
    playBowThud();
    addMerit(1);
    if (bowState.count === 36 || bowState.count === 72) playBell();
    if (bowState.count >= 108) finish108(true);
  }
  function updateBowRing(n) {
    $("#bowNum").textContent = n;
    const c = $("#bowProgress");
    c.style.strokeDasharray = String(CIRC);
    c.style.strokeDashoffset = String(CIRC * (1 - n / 108));
  }
  function finish108(done) {
    clearInterval(bowState.timer);
    bowState.running = false;
    setHeshi(false);
    $("#monk").classList.remove("is-bowing");
    const ov = $("#bowOverlay");
    ov.hidden = true; ov.classList.add("is-hidden");
    if (done) {
      addMerit(20, "圆满+");
      playBell();
      toast("一百零八拜已圆满");
    } else {
      toast(`已礼敬 ${bowState.count} 拜`);
    }
    save();
  }
  function bindBowButton() {
    const btn = $("#btnBow");
    const startPress = (e) => {
      if (e.type === "mousedown" && e.button !== 0) return;
      if (bowState.running) return;
      bowState.long = false;
      clearTimeout(bowState.press);
      bowState.press = setTimeout(() => start108(), 450);
    };
    const endPress = (e) => {
      clearTimeout(bowState.press);
      if (bowState.running) return;
      if (!bowState.long) singleBow();
    };
    btn.addEventListener("pointerdown", startPress);
    btn.addEventListener("pointerup", endPress);
    btn.addEventListener("pointerleave", () => { if (!bowState.running) clearTimeout(bowState.press); });
    btn.addEventListener("pointercancel", () => clearTimeout(bowState.press));
    btn.addEventListener("contextmenu", e => e.preventDefault());
    $("#btnBowCancel").onclick = () => finish108(false);
  }

  /* ---------- peers (simulated same-screen) ---------- */
  const peers = [];
  let online = 1000 + Math.floor(Math.random() * 800);
  function setupPeers() {
    const slots = [
      { x: 16, y: 40, s: 0.52 }, { x: 84, y: 38, s: 0.52 },
      { x: 34, y: 34, s: 0.46 }, { x: 66, y: 33, s: 0.46 },
      { x: 10, y: 54, s: 0.68 }, { x: 90, y: 56, s: 0.68 },
      { x: 20, y: 66, s: 0.78 }, { x: 80, y: 68, s: 0.78 }
    ];
    const root = $("#peers");
    root.innerHTML = "";
    slots.forEach((sl, i) => {
      const m = makeMonk(hashInt(10007 + i * 997));
      m.name = PEER_NAMES[i % PEER_NAMES.length];
      const el = document.createElement("button");
      el.type = "button";
      el.className = "peer" + (sl.s < 0.6 ? " is-far" : "");
      el.style.left = sl.x + "%";
      el.style.top = sl.y + "%";
      el.style.transform = `translate(-50%,0) scale(${sl.s})`;
      el.style.transformOrigin = "50% 100%";
      el.innerHTML = `${monkSVG(m, { size: 90 })}${cushionSVG(CUSHIONS[i % CUSHIONS.length].id, 80, 22)}<span class="peer-name">${m.name}</span>`;
      el.addEventListener("click", () => greetPeer(el, m, sl));
      root.appendChild(el);
      peers.push({ el, m, sl });
    });
  }
  function greetPeer(el, m, sl) {
    setHeshi(true);
    playBell();
    toast(`向 ${m.name} 合十`);
    setTimeout(() => setHeshi(false), 800);
    setTimeout(() => {
      peerAct(el, sl, "heshi");
      toast(`${m.name} 合十回礼`);
    }, 500);
  }
  function peerAct(el, sl, kind) {
    const hall = $("#hall").getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - hall.left;
    const y = r.top - hall.top;
    if (kind === "knock") {
      floatText("功德+1", x, y);
      const monk = el.querySelector(".monk-svg");
      if (monk) { monk.style.transformOrigin = "50% 85%"; monk.style.transform = "rotate(-6deg)"; setTimeout(() => monk.style.transform = "", 200); }
    } else if (kind === "bow" || kind === "heshi") {
      const monk = el.querySelector(".monk-svg");
      if (monk) {
        monk.style.transformOrigin = "50% 85%";
        monk.style.transition = "transform .35s ease";
        monk.style.transform = "rotate(18deg) translateY(6px)";
        setTimeout(() => { monk.style.transform = ""; }, 400);
      }
      if (kind === "heshi") {
        const b = document.createElement("div");
        b.className = "heshi-bubble";
        b.style.left = x + "px"; b.style.top = y + "px";
        b.textContent = "合十";
        $("#floats").appendChild(b);
        setTimeout(() => b.remove(), 1600);
      } else {
        floatText("功德+1", x, y);
      }
    }
  }
  function tickWorld() {
    online += Math.floor(Math.random() * 7) - 3;
    online = Math.max(860, Math.min(2680, online));
    $("#onlineCount").textContent = comma(online);
    if (peers.length) {
      const p = peers[Math.floor(Math.random() * peers.length)];
      const kinds = ["knock","knock","bow","heshi"];
      peerAct(p.el, p.sl, kinds[Math.floor(Math.random() * kinds.length)]);
    }
  }

  function updateCheckinHint() {
    const hint = $("#checkinHint");
    const need = state.streak.last !== todayKey();
    hint.classList.toggle("is-hidden", !need);
    hint.hidden = !need;
  }

  /* ---------- ceremony / boot ---------- */
  function ceremony(monk, title) {
    const wrap = document.createElement("div");
    wrap.className = "ceremony";
    wrap.innerHTML = `<div class="mini">${monkSVG(monk, { size: 120 })}</div>
      <p>${title || "今日受戒"}</p>
      <p class="fn">${monk.name}</p>`;
    $("#shell").appendChild(wrap);
    setTimeout(() => { wrap.style.opacity = "0"; wrap.style.transition = "opacity .5s"; }, 1600);
    setTimeout(() => wrap.remove(), 2200);
  }

  function enterHall(first) {
    $("#gate").classList.add("is-hidden");
    $("#gate").hidden = true;
    const app = $("#app");
    app.hidden = false;
    app.classList.remove("is-hidden");
    renderMonk();
    renderAltar();
    renderMerit();
    renderAlmanacBar();
    setupPeers();
    $("#woodfishProp").innerHTML = woodfishSVG();
    $("#beadsProp").innerHTML = beadsSVG();
    updateCheckinHint();
    setMuted(state.muted);
    $("#btnAmbient").classList.toggle("is-on", state.ambient);
    if (state.ambient) startAmbient();
    if (first) ceremony(state.monk, "今日受戒，赐汝法号");
    else toast(`欢迎回来，${state.monk.name}`);
    setInterval(tickWorld, 2800);
    tickWorld();
  }

  function bindUI() {
    $("#btnEnter").addEventListener("click", () => {
      resumeAudio();
      playBell();
      const first = !state.monk;
      if (first) {
        state.monk = makeMonk((Math.random() * 0xffffffff) >>> 0);
        save();
      }
      enterHall(first);
    });
    $("#btnWoodfish").addEventListener("click", doWoodfish);
    $("#btnBeads").addEventListener("click", doBeads);
    $("#btnIncense").addEventListener("click", doIncense);
    bindBowButton();
    $$(".pill").forEach(b => b.addEventListener("click", () => openSheet(b.dataset.sheet)));
    $("#btnSheetClose").addEventListener("click", closeSheet);
    $("#backdrop").addEventListener("click", closeSheet);
    $("#btnMenu").addEventListener("click", () => openSheet("settings"));
    $("#btnMerit").addEventListener("click", () => openSheet("board"));
    $("#btnOnline").addEventListener("click", () => openSheet("online"));
    $("#almanacBar").addEventListener("click", () => openSheet("almanac"));
    $("#btnMute").addEventListener("click", () => { resumeAudio(); setMuted(!state.muted); });
    $("#btnAmbient").addEventListener("click", () => { resumeAudio(); setAmbient(!state.ambient); });
    $("#btnCheckinQuick").addEventListener("click", doCheckin);
    $("#altar").addEventListener("click", () => openSheet("buddha"));
  }

  function boot() {
    load();
    bindUI();
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "1") {
      if (!state.monk) { state.monk = makeMonk(20261111); save(); }
      $("#gate").hidden = true; $("#gate").classList.add("is-hidden");
      enterHall(false);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
