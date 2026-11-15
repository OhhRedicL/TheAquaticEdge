/* =====================================================================
   Impact stat: animated count-up + interactive grid of life rings.
   To change the number, edit data-total / data-suffix on #impact in index.html.
   ===================================================================== */
(function () {
  "use strict";
  const root = document.getElementById("impact");
  if (!root) return;
  const grid = root.querySelector(".impact-grid");
  const num = root.querySelector(".impact-num");
  const tip = root.querySelector(".impact-tip");
  const replay = root.querySelector(".impact-replay");
  const total = +root.dataset.total || 150;
  const suffix = root.dataset.suffix || "";
  const DURATION = 2200;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Build the grid of rings
  const frag = document.createDocumentFragment();
  for (let i = 0; i < total; i++) {
    const c = document.createElement("i");
    c.className = "ring";
    c.dataset.n = i + 1;
    frag.appendChild(c);
  }
  grid.appendChild(frag);
  const cells = Array.from(grid.children);
  let centers = [];
  const measure = () => {
    const g = grid.getBoundingClientRect();
    centers = cells.map((c) => { const r = c.getBoundingClientRect(); return [r.left - g.left + r.width / 2, r.top - g.top + r.height / 2]; });
  };

  // Count-up synced with the rings filling in
  let raf = 0;
  function play() {
    cancelAnimationFrame(raf);
    cells.forEach((c) => c.classList.remove("on"));
    num.textContent = "0";
    root.classList.remove("done");
    if (reduce) { cells.forEach((c) => c.classList.add("on")); num.textContent = total + suffix; root.classList.add("done"); return; }
    const t0 = performance.now();
    let lit = 0;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / DURATION);
      const e = 1 - Math.pow(1 - k, 3);
      const n = Math.round(total * e);
      while (lit < n) cells[lit++].classList.add("on");
      num.textContent = n + (k === 1 ? suffix : "");
      if (k < 1) raf = requestAnimationFrame(step);
      else { root.classList.add("done"); ripple(centers[total - 1] || [0, 0]); }
    };
    raf = requestAnimationFrame(step);
  }

  // Ripple outward from a point
  function ripple([x, y]) {
    if (reduce) return;
    cells.forEach((c, i) => {
      const [cx, cy] = centers[i];
      const d = Math.hypot(cx - x, cy - y);
      c.classList.remove("pulse");
      void c.offsetWidth;
      c.style.animationDelay = (d * 1.6).toFixed(0) + "ms";
      c.classList.add("pulse");
    });
  }

  // Hover: rings near the pointer lift and glow
  function onMove(e) {
    const g = grid.getBoundingClientRect();
    const x = e.clientX - g.left, y = e.clientY - g.top;
    cells.forEach((c, i) => {
      const d = Math.hypot(centers[i][0] - x, centers[i][1] - y);
      const k = Math.max(0, 1 - d / 90);
      c.style.setProperty("--lift", k.toFixed(3));
    });
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    if (hit && hit.classList.contains("ring")) {
      tip.textContent = `Guard #${hit.dataset.n} · Certified`;
      tip.style.transform = `translate(${hit.offsetLeft + hit.offsetWidth / 2}px, ${hit.offsetTop - 8}px) translate(-50%, -100%)`;
      tip.classList.add("show");
    } else tip.classList.remove("show");
  }
  function onLeave() {
    cells.forEach((c) => c.style.setProperty("--lift", 0));
    tip.classList.remove("show");
  }
  grid.addEventListener("pointermove", onMove);
  grid.addEventListener("pointerleave", onLeave);
  grid.addEventListener("click", (e) => {
    const g = grid.getBoundingClientRect();
    ripple([e.clientX - g.left, e.clientY - g.top]);
  });
  replay?.addEventListener("click", () => { measure(); play(); });

  // Start when scrolled into view
  measure();
  window.addEventListener("resize", measure);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { measure(); play(); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(root);
  } else play();
})();
