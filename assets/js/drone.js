/* =====================================================================
   Cinematic "drone flyover" of a simulated waterpark (canvas).
   If SITE.droneVideo is set in content.js, a real video is used instead.
   ===================================================================== */
(function () {
  "use strict";
  const stage = document.getElementById("aerial-stage");
  if (!stage) return;
  const S = window.SITE || {};

  /* ---------- Real footage option ---------- */
  if (S.droneVideo) {
    const v = document.createElement("video");
    Object.assign(v, { src: S.droneVideo, autoplay: true, muted: true, loop: true, playsInline: true });
    v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
    if (S.droneVideoPoster) v.poster = S.droneVideoPoster;
    v.className = "aerial-media";
    stage.appendChild(v);
    startHud();
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "aerial-media";
  canvas.setAttribute("aria-hidden", "true");
  stage.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const W = 2400, H = 1500;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* ---------- Geometry helpers ---------- */
  function catmull(pts, closed, segs = 24) {
    const out = [], n = pts.length;
    const get = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let s = 0; s < segs; s++) {
        const t = s / segs, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(closed ? out[0] : pts[n - 1]);
    let len = 0; out[0][2] = 0;
    for (let i = 1; i < out.length; i++) { len += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); out[i][2] = len; }
    out.total = len;
    return out;
  }
  function pointAt(path, d) {
    d = ((d % path.total) + path.total) % path.total;
    let lo = 0, hi = path.length - 1;
    while (lo < hi - 1) { const m = (lo + hi) >> 1; path[m][2] < d ? (lo = m) : (hi = m); }
    const a = path[lo], b = path[hi], k = (d - a[2]) / (b[2] - a[2] || 1);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  const toPath2D = (pts, close) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); if (close) p.closePath(); return p; };
  function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect ? p.roundRect(x, y, w, h, r) : p.rect(x, y, w, h); return p; }

  /* ---------- Park layout ---------- */
  const wavePool = (() => {
    const p = new Path2D();
    p.moveTo(300, 210); p.lineTo(700, 210);
    p.bezierCurveTo(760, 420, 900, 700, 990, 960);
    p.quadraticCurveTo(560, 1100, 120, 960);
    p.bezierCurveTo(200, 700, 260, 420, 300, 210);
    p.closePath(); return p;
  })();
  const river = catmull([[1060, 360], [1340, 255], [1650, 320], [1790, 560], [1700, 860], [1780, 1110], [1480, 1270], [1160, 1210], [1010, 960], [1110, 680]], true);
  const riverP = toPath2D(river, true);
  const activity = rrect(1190, 540, 400, 330, 90);
  const splash = rrect(1960, 1000, 300, 200, 40);
  const kids = rrect(2000, 1290, 220, 140, 60);
  const tower = { x: 2070, y: 330 };
  const slides = [
    { c: "#f4c430", pts: [[2070, 330], [2240, 360], [2300, 520], [2180, 600], [2250, 760], [2180, 900], [2060, 1020]] },
    { c: "#e2463f", pts: [[2070, 330], [1930, 390], [1880, 560], [1990, 640], [1900, 800], [2010, 1020]] },
    { c: "#46BCBB", pts: [[2070, 330], [2120, 480], [2060, 600], [2120, 720], [2070, 860], [2140, 1030]] },
    { c: "#7b4fc9", pts: [[2070, 330], [2280, 280], [2360, 460], [2330, 700], [2370, 900], [2220, 1040]] }
  ].map((s) => ({ ...s, path: catmull(s.pts, false, 30) }));

  /* ---------- Static world (drawn once) ---------- */
  const world = document.createElement("canvas");
  world.width = W; world.height = H;
  const w = world.getContext("2d");

  function shadowed(fn, dx = 14, dy = 12, a = .28) {
    w.save(); w.translate(dx, dy); w.globalAlpha = a; w.filter = "blur(6px)"; fn(true); w.restore(); fn(false);
  }
  function palm(x, y, r) {
    shadowed((sh) => {
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd() * .3;
        w.save(); w.translate(x, y); w.rotate(a);
        w.fillStyle = sh ? "#000" : (i % 2 ? "#2f7d3e" : "#3f9a4b");
        w.beginPath(); w.ellipse(r * .55, 0, r * .6, r * .2, 0, 0, Math.PI * 2); w.fill();
        w.restore();
      }
      if (!sh) { w.fillStyle = "#6b4a2b"; w.beginPath(); w.arc(x, y, r * .14, 0, 7); w.fill(); }
    }, r * .6, r * .45, .3);
  }
  function umbrella(x, y, r, c1, c2) {
    shadowed((sh) => {
      for (let i = 0; i < 8; i++) {
        w.fillStyle = sh ? "#000" : (i % 2 ? c1 : c2);
        w.beginPath(); w.moveTo(x, y); w.arc(x, y, r, (i / 8) * Math.PI * 2, ((i + 1) / 8) * Math.PI * 2); w.closePath(); w.fill();
      }
    }, 8, 7, .3);
  }
  function lounger(x, y, a) {
    w.save(); w.translate(x, y); w.rotate(a);
    w.fillStyle = "rgba(0,0,0,.18)"; w.fillRect(-3, -8, 9, 20);
    w.fillStyle = "#ffffff"; w.fillRect(-5, -10, 9, 20);
    if (rnd() > .45) { w.fillStyle = ["#f0b48a", "#c98c63", "#8a5a3c", "#e8c39e"][(rnd() * 4) | 0]; w.beginPath(); w.arc(-.5, -6, 3, 0, 7); w.fill(); w.fillStyle = ["#e2463f", "#2A9590", "#f4c430", "#163C4F"][(rnd() * 4) | 0]; w.fillRect(-3, -2, 5, 9); }
    w.restore();
  }
  function roof(x, y, ww, hh, c) {
    shadowed((sh) => { w.fillStyle = sh ? "#000" : c; w.fillRect(x, y, ww, hh); }, 18, 16, .35);
    w.fillStyle = "rgba(255,255,255,.18)"; w.fillRect(x, y, ww, hh / 2);
    w.strokeStyle = "rgba(0,0,0,.15)"; w.lineWidth = 3; w.beginPath(); w.moveTo(x, y + hh / 2); w.lineTo(x + ww, y + hh / 2); w.stroke();
  }
  function water(path, x0, y0, x1, y1, deep = "#167fa3", shallow = "#5fd3d3") {
    const g = w.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, deep); g.addColorStop(1, shallow);
    w.fillStyle = g; w.fill(path);
    w.save(); w.clip(path); w.strokeStyle = "rgba(255,255,255,.55)"; w.lineWidth = 6; w.stroke(path); w.restore();
  }

  function buildWorld() {
    // grass with texture
    w.fillStyle = "#5f9e57"; w.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { w.fillStyle = `rgba(${rnd() > .5 ? "30,70,30" : "150,200,120"},${rnd() * .12})`; w.beginPath(); w.arc(rnd() * W, rnd() * H, 6 + rnd() * 30, 0, 7); w.fill(); }

    // walkways
    w.strokeStyle = "#e7dcc6"; w.lineCap = "round"; w.lineJoin = "round";
    w.lineWidth = 60; w.beginPath(); w.moveTo(600, 1500); w.lineTo(620, 1120); w.lineTo(1000, 1330); w.lineTo(1900, 1330); w.lineTo(2100, 1220); w.stroke();
    w.lineWidth = 46; w.beginPath(); w.moveTo(940, 640); w.lineTo(1880, 260); w.lineTo(2070, 330); w.stroke();
    w.beginPath(); w.moveTo(1900, 1330); w.lineTo(1880, 640); w.stroke();

    // wave pool deck + sand
    w.save(); w.lineWidth = 150; w.strokeStyle = "#ece2cf"; w.stroke(wavePool); w.fillStyle = "#ece2cf"; w.fill(wavePool); w.restore();
    w.save(); w.clip(wavePool);
    water(wavePool, 0, 210, 0, 1000, "#0f6f97", "#6fdad6");
    const sand = w.createLinearGradient(0, 900, 0, 1060); sand.addColorStop(0, "rgba(241,223,180,0)"); sand.addColorStop(.45, "rgba(241,223,180,.85)"); sand.addColorStop(1, "#f1dfb4");
    w.fillStyle = sand; w.fillRect(0, 880, W, 200);
    w.restore();
    // wave machine house
    roof(330, 120, 340, 70, "#163C4F");

    // lazy river (deck, water)
    w.lineWidth = 150; w.strokeStyle = "#ece2cf"; w.stroke(riverP);
    w.lineWidth = 96; w.strokeStyle = "#1a88a8"; w.stroke(riverP);
    w.lineWidth = 70; w.strokeStyle = "#2fa9bf"; w.stroke(riverP);
    w.lineWidth = 30; w.strokeStyle = "rgba(120,220,220,.45)"; w.stroke(riverP);
    // bridge
    w.save(); w.translate(1340, 255); w.rotate(-.2); w.fillStyle = "rgba(0,0,0,.25)"; w.fillRect(-18, -70, 40, 140); w.fillStyle = "#b07a4a"; w.fillRect(-24, -76, 40, 140); w.fillStyle = "rgba(255,255,255,.15)"; for (let k = -70; k < 60; k += 14) w.fillRect(-24, k, 40, 3); w.restore();

    // activity pool + play structure
    w.save(); w.lineWidth = 70; w.strokeStyle = "#ece2cf"; w.stroke(activity); w.restore();
    water(activity, 1190, 540, 1590, 870, "#1c8fb2", "#7fe0dc");
    shadowed((sh) => { w.fillStyle = sh ? "#000" : "#f4c430"; w.fillRect(1335, 650, 110, 110); w.fillStyle = sh ? "#000" : "#e2463f"; w.beginPath(); w.arc(1390, 705, 34, 0, 7); w.fill(); }, 16, 14, .3);
    w.fillStyle = "#46BCBB"; w.beginPath(); w.arc(1390, 705, 16, 0, 7); w.fill();
    w.strokeStyle = "#2A9590"; w.lineWidth = 16; w.beginPath(); w.moveTo(1445, 700); w.quadraticCurveTo(1520, 690, 1520, 780); w.stroke();

    // splash pool + kids pool
    w.save(); w.lineWidth = 60; w.strokeStyle = "#ece2cf"; w.stroke(splash); w.stroke(kids); w.restore();
    water(splash, 1960, 1000, 2260, 1200, "#127ba0", "#4fc6cf");
    water(kids, 2000, 1290, 2220, 1430, "#3bb3c4", "#9be9e3");

    // slides (shadow, outline, tube)
    slides.forEach((s) => {
      const p = toPath2D(s.path);
      w.save(); w.translate(26, 24); w.filter = "blur(5px)"; w.strokeStyle = "rgba(0,0,0,.3)"; w.lineWidth = 26; w.stroke(p); w.restore();
      w.strokeStyle = "rgba(0,0,0,.25)"; w.lineWidth = 28; w.stroke(p);
      w.strokeStyle = s.c; w.lineWidth = 22; w.stroke(p);
      w.strokeStyle = "rgba(255,255,255,.35)"; w.lineWidth = 6; w.stroke(p);
    });
    shadowed((sh) => { w.fillStyle = sh ? "#000" : "#163C4F"; w.fillRect(tower.x - 55, tower.y - 55, 110, 110); }, 40, 34, .35);
    w.fillStyle = "#1A5F6E"; w.fillRect(tower.x - 40, tower.y - 40, 80, 80);
    w.fillStyle = "#46BCBB"; w.fillRect(tower.x - 12, tower.y - 12, 24, 24);

    // buildings: entry, food court, cabanas
    roof(380, 1180, 260, 130, "#1A5F6E"); roof(700, 1240, 200, 110, "#2A9590");
    roof(120, 1240, 200, 160, "#e7e1d4"); roof(1060, 1390, 300, 90, "#163C4F");
    for (let i = 0; i < 6; i++) roof(1000 + i * 70, 40, 52, 52, i % 2 ? "#f4f0e6" : "#46BCBB");

    // deck umbrellas and loungers around the wave pool
    const ucol = [["#e2463f", "#fff"], ["#2A9590", "#fff"], ["#f4c430", "#fff"], ["#163C4F", "#46BCBB"]];
    for (let x = 140; x < 960; x += 62) { lounger(x, 1080 + rnd() * 8, 0); lounger(x + 18, 1082 + rnd() * 8, 0); if ((x / 62 | 0) % 2) umbrella(x + 10, 1110, 20, ...ucol[(rnd() * 4) | 0]); }
    for (let y = 300; y < 900; y += 54) { lounger(160 - y * .13, y, .25); lounger(820 + (y - 210) * .17 + 40, y, -.35); }
    for (let y = 300; y < 900; y += 108) { umbrella(130 - y * .13, y + 20, 18, ...ucol[(rnd() * 4) | 0]); umbrella(880 + (y - 210) * .17 + 40, y + 20, 18, ...ucol[(rnd() * 4) | 0]); }
    for (let x = 1220; x < 1580; x += 48) { lounger(x, 900, 0); }
    for (let y = 1020; y < 1200; y += 50) { lounger(1910, y, 0); umbrella(1915, y + 25, 15, ...ucol[(rnd() * 4) | 0]); }

    // palms
    const palms = [[1080, 520, 40], [1150, 460, 30], [1620, 470, 38], [1660, 980, 42], [1230, 1030, 36], [1500, 1060, 30], [1110, 860, 34],
      [80, 160, 44], [920, 160, 40], [60, 640, 36], [1010, 1080, 38], [1860, 180, 40], [2330, 1150, 42], [2370, 260, 36], [1830, 900, 34],
      [470, 1440, 34], [800, 1430, 38], [1700, 1420, 40], [2300, 1440, 36], [1960, 880, 28], [960, 400, 30]];
    palms.forEach(([x, y, r]) => palm(x, y, r));
    for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * H; if (w.isPointInPath(wavePool, x, y)) continue; w.fillStyle = "rgba(40,100,45,.8)"; w.beginPath(); w.arc(x, y, 8 + rnd() * 10, 0, 7); w.fill(); }
  }

  /* ---------- Caustics tile ---------- */
  const tile = document.createElement("canvas"); tile.width = tile.height = 256;
  (() => {
    const t = tile.getContext("2d"); t.strokeStyle = "rgba(255,255,255,.9)"; t.lineWidth = 1.6;
    for (let i = 0; i < 46; i++) {
      const x = rnd() * 256, y = rnd() * 256, r = 10 + rnd() * 24;
      for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
        t.beginPath(); for (let a = 0; a <= 6.3; a += .5) { const rr = r * (0.7 + 0.3 * Math.sin(a * 3 + i)); t.lineTo(x + ox + Math.cos(a) * rr, y + oy + Math.sin(a) * rr); } t.stroke();
      }
    }
  })();

  /* ---------- Dynamic actors ---------- */
  const tubes = Array.from({ length: 34 }, (_, i) => ({ d: (i / 34) * river.total + rnd() * 30, off: (rnd() - .5) * 40, c: ["#f4c430", "#e2463f", "#ffffff", "#46BCBB", "#7b4fc9"][i % 5], s: 26 + rnd() * 8 }));
  const swimmers = [];
  while (swimmers.length < 70) { const x = 150 + rnd() * 820, y = 360 + rnd() * 640; if (w.isPointInPath(wavePool, x, y)) swimmers.push({ x, y, p: rnd() * 6.28, c: ["#e2463f", "#f4c430", "#ffffff", "#163C4F", "#7b4fc9"][(rnd() * 5) | 0] }); }
  const actSwim = Array.from({ length: 22 }, () => ({ x: 1220 + rnd() * 340, y: 570 + rnd() * 270, p: rnd() * 6.28 }));
  const riders = slides.map((s, i) => ({ s, d: i * 120, v: 160 + i * 25 }));

  /* ---------- Camera ---------- */
  const keys = [
    { x: 1200, y: 760, z: 1.12, r: 0 },
    { x: 620, y: 620, z: 1.65, r: -0.06 },
    { x: 1330, y: 640, z: 1.9, r: 0.02 },
    { x: 2060, y: 640, z: 1.7, r: 0.07 },
    { x: 1700, y: 1150, z: 1.45, r: 0.02 },
    { x: 1200, y: 760, z: 1.12, r: 0 }
  ];
  const SEG = 9;
  const ease = (t) => t * t * (3 - 2 * t);
  function camAt(t) {
    const total = SEG * (keys.length - 1), tt = (t % total) / SEG, i = Math.floor(tt), k = ease(tt - i), a = keys[i], b = keys[i + 1];
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, r: a.r + (b.r - a.r) * k };
  }

  /* ---------- Render ---------- */
  let vw = 0, vh = 0, dpr = 1;
  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    vw = r.width; vh = r.height;
    canvas.width = Math.round(vw * dpr); canvas.height = Math.round(vh * dpr);
  }

  function frame(t) {
    const c = camAt(t);
    const base = Math.max(vw / W, vh / H);
    let s = base * c.z;
    const hw = vw / s / 2, hh = vh / s / 2;
    const cx = Math.max(hw * 1.08, Math.min(W - hw * 1.08, c.x));
    const cy = Math.max(hh * 1.08, Math.min(H - hh * 1.08, c.y));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#5f9e57"; ctx.fillRect(0, 0, vw, vh);
    ctx.translate(vw / 2, vh / 2); ctx.rotate(c.r); ctx.scale(s, s); ctx.translate(-cx, -cy);
    ctx.drawImage(world, 0, 0);

    // caustics on pools
    ctx.save();
    const pools = new Path2D(); pools.addPath(wavePool); pools.addPath(activity); pools.addPath(splash); pools.addPath(kids);
    ctx.clip(pools);
    ctx.globalAlpha = .09; ctx.globalCompositeOperation = "lighter";
    const ox = (t * 14) % 256, oy = (t * 9) % 256;
    for (let x = 0 - ox; x < W; x += 256) for (let y = 0 - oy; y < H; y += 256) ctx.drawImage(tile, x, y);
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctx.restore();

    // wave pool swells rolling toward the beach
    ctx.save(); ctx.clip(wavePool);
    for (let k = 0; k < 6; k++) {
      const y = 230 + ((t * 70 + k * 130) % 780), f = (y - 230) / 780;
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + f * 0.55})`;
      ctx.lineWidth = 6 + f * 18;
      ctx.beginPath();
      for (let x = 80; x <= 1020; x += 20) ctx.lineTo(x, y + Math.sin(x * .012 + t * 1.5 + k) * 8 + f * 30 * Math.sin(x * .004));
      ctx.stroke();
    }
    ctx.restore();

    // swimmers
    swimmers.forEach((p) => {
      const bob = Math.sin(t * 2 + p.p) * 3;
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(p.x, p.y + bob, 7, 0, 7); ctx.fill();
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y + bob, 3.6, 0, 7); ctx.fill();
    });
    actSwim.forEach((p) => {
      const x = p.x + Math.sin(t * .6 + p.p) * 10, y = p.y + Math.cos(t * .5 + p.p) * 8;
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
      ctx.fillStyle = "#c98c63"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
    });

    // lazy river current + tubes
    ctx.save(); ctx.setLineDash([18, 46]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 3; ctx.stroke(riverP); ctx.restore();
    tubes.forEach((tb) => {
      const d = tb.d + t * tb.s, [x, y] = pointAt(river, d), [x2, y2] = pointAt(river, d + 4);
      const nx = -(y2 - y), ny = x2 - x, nl = Math.hypot(nx, ny) || 1, px = x + (nx / nl) * tb.off, py = y + (ny / nl) * tb.off;
      ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.beginPath(); ctx.arc(px + 4, py + 4, 11, 0, 7); ctx.fill();
      ctx.strokeStyle = tb.c; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.stroke();
      ctx.fillStyle = "#e8c39e"; ctx.beginPath(); ctx.arc(px, py, 4, 0, 7); ctx.fill();
    });

    // slide riders + splash rings
    riders.forEach((r) => {
      const L = r.s.path.total, d = (r.d + t * r.v) % (L + 260);
      if (d < L) {
        const [x, y] = pointAt(r.s.path, d);
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
        ctx.fillStyle = "#163C4F"; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
      } else {
        const end = r.s.pts[r.s.pts.length - 1], k = (d - L) / 260;
        ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(end[0], end[1], 10 + k * 46, 0, 7); ctx.stroke();
      }
    });

    // drifting cloud shadows
    for (let i = 0; i < 3; i++) {
      const x = ((t * 22 + i * 1100) % (W + 1400)) - 700, y = 300 + i * 420 + Math.sin(t * .1 + i) * 80;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 520);
      g.addColorStop(0, "rgba(6,22,38,.22)"); g.addColorStop(1, "rgba(6,22,38,0)");
      ctx.fillStyle = g; ctx.fillRect(x - 520, y - 520, 1040, 1040);
    }
    // sun glint
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sg = ctx.createRadialGradient(vw * .82, vh * .12, 0, vw * .82, vh * .12, vw * .5);
    sg.addColorStop(0, "rgba(255,245,220,.22)"); sg.addColorStop(1, "rgba(255,245,220,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, 0, vw, vh);
  }

  /* ---------- Loop (only when visible) ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let running = false, raf = 0, t0 = 0, acc = 4;
  function loop(now) {
    if (!running) return;
    if (t0) acc += Math.min(0.05, (now - t0) / 1000);
    t0 = now; frame(acc); raf = requestAnimationFrame(loop);
  }
  function start() { if (running || reduce) return; running = true; t0 = 0; raf = requestAnimationFrame(loop); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  buildWorld();
  resize(); frame(acc);
  window.addEventListener("resize", () => { resize(); frame(acc); });
  if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.05 }).observe(stage);
  else start();
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  startHud();

  /* ---------- HUD timecode ---------- */
  function startHud() {
    const tc = document.getElementById("hud-time"), alt = document.getElementById("hud-alt");
    if (!tc) return;
    const begin = performance.now();
    setInterval(() => {
      const s = (performance.now() - begin) / 1000, f = Math.floor((s % 1) * 24);
      const p = (n) => String(Math.floor(n)).padStart(2, "0");
      tc.textContent = `${p(s / 3600)}:${p((s / 60) % 60)}:${p(s % 60)}:${p(f)}`;
      if (alt) alt.textContent = `ALT ${Math.round(118 + Math.sin(s / 6) * 14)}M`;
    }, 1000 / 12);
  }
})();
