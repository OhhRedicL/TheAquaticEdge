/* =====================================================================
   Laboy Aquatics Co — site scripts
   You normally won't need to edit this file. Update content.js instead.
   ===================================================================== */
(function () {
  "use strict";

  const S = window.SITE || {};
  const POSTS = (window.POSTS || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const EPISODES = window.EPISODES || [];
  const page = document.body.dataset.page || "home";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Icons ---------- */
  const I = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
    apple: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.5 6l.4-1.9A5 5 0 1 1 17 9a5 5 0 0 1-1.9 3.9l.4 1.9A7 7 0 0 0 12 2zm0 4a3 3 0 0 0-1.4 5.7l.3-1.4A1.5 1.5 0 1 1 13.5 9a1.5 1.5 0 0 1-.4 1.3l.3 1.4A3 3 0 0 0 12 6zm0 6a1.6 1.6 0 0 0-1.6 1.8l.8 6.6a.8.8 0 0 0 1.6 0l.8-6.6A1.6 1.6 0 0 0 12 12z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-5.9-2-9.8-1.1a.7.7 0 1 1-.3-1.4c4.2-1 7.9-.5 10.8 1.3.3.2.4.7.3 1zm1.3-2.9a.9.9 0 0 1-1.2.3c-3-1.8-7.5-2.4-11-1.3a.9.9 0 1 1-.5-1.7c4-1.2 9-.6 12.4 1.5.4.2.5.8.3 1.2zm.1-3c-3.6-2.1-9.5-2.3-12.9-1.3a1 1 0 1 1-.6-2c3.9-1.2 10.5-1 14.6 1.5a1 1 0 0 1-1.1 1.8z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6v5.4h-4v-4.8c0-1.2 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5v4.9h-4v-11z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/></svg>'
  };

  const waveSvg = (fill, opacity = 1) =>
    `<svg class="cover-wave" viewBox="0 0 400 120" preserveAspectRatio="none"><path fill="${fill}" fill-opacity="${opacity}" d="M0 60c40-20 80-30 130-10s90 30 140 10 90-30 130-10v70H0z"/><path fill="${fill}" fill-opacity="${opacity * .6}" d="M0 80c50-15 90-15 140 5s100 20 150 0 80-20 110-10v45H0z"/></svg>`;

  /* ---------- Helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const catLabel = (c) => (c === "leadership" ? "Leadership Track" : "Professional Development");

  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+|[^\s)]+\.html[^\s)]*|#[^\s)]*)\)/g, '<a href="$2">$1</a>');
  }

  // Minimal Markdown → HTML (headings, paragraphs, lists, quotes, bold/italic/links)
  function md(src) {
    const lines = src.trim().split(/\r?\n/);
    let html = "", list = null, para = [];
    const flushPara = () => { if (para.length) { html += `<p>${inline(para.join(" "))}</p>`; para = []; } };
    const flushList = () => { if (list) { html += `</${list}>`; list = null; } };
    for (const raw of lines) {
      const line = raw.trim();
      let m;
      if (!line) { flushPara(); flushList(); continue; }
      if ((m = line.match(/^(#{2,3})\s+(.*)/))) { flushPara(); flushList(); const h = m[1].length; html += `<h${h}>${inline(m[2])}</h${h}>`; continue; }
      if ((m = line.match(/^>\s?(.*)/))) { flushPara(); flushList(); html += `<blockquote><p>${inline(m[1])}</p></blockquote>`; continue; }
      if ((m = line.match(/^[-*]\s+(.*)/))) { flushPara(); if (list !== "ul") { flushList(); html += "<ul>"; list = "ul"; } html += `<li>${inline(m[1])}</li>`; continue; }
      if ((m = line.match(/^\d+\.\s+(.*)/))) { flushPara(); if (list !== "ol") { flushList(); html += "<ol>"; list = "ol"; } html += `<li>${inline(m[1])}</li>`; continue; }
      flushList(); para.push(line);
    }
    flushPara(); flushList();
    return html;
  }

  /* ---------- Shared nav & footer ---------- */
  const home = page === "home" ? "" : "index.html";
  function renderNav() {
    const el = $("#site-nav");
    if (!el) return;
    const links = [
      ["About", home + "#about"],
      ["Services", home + "#services"],
      ["Leadership Track", home + "#leadership"],
      ["Podcast", home + "#podcast"],
      ["Blog", "blog.html"]
    ];
    el.className = "nav" + (page === "home" ? "" : " solid");
    el.innerHTML = `
      <div class="container">
        <a class="brand" href="index.html" aria-label="${esc(S.brand)} home">
          <img src="assets/img/wave-mark.png" alt="" width="52" height="22">
          <span class="brand-text">${esc((S.brand || "").toUpperCase())}<small>${esc(S.tagline || "")}</small></span>
        </a>
        <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
        <ul class="nav-links">
          ${links.map(([t, h]) => `<li><a href="${h}"${page === "blog" && t === "Blog" ? ' class="active"' : ""}>${t}</a></li>`).join("")}
          <li><a class="btn btn--primary btn--ring" href="${home}#contact">Book Training</a></li>
        </ul>
      </div>`;
    const toggle = $(".nav-toggle", el);
    toggle.addEventListener("click", () => {
      const open = el.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    $$(".nav-links a", el).forEach((a) => a.addEventListener("click", () => { el.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }));
    const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const socialsHtml = () => ["instagram", "linkedin", "youtube", "tiktok"]
    .map((k) => `<a href="${esc(S.links?.[k] || "#")}" aria-label="${k}" target="_blank" rel="noopener">${I[k]}</a>`).join("");

  function renderFooter() {
    const el = $("#site-footer");
    if (!el) return;
    el.className = "footer";
    el.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="assets/img/logo-light.png" alt="${esc(S.brand)} logo" width="150" height="142">
            <p>Leadership development, lifeguard training, and risk management insight for waterparks and aquatic facilities. Building the next generation of aquatics leaders.</p>
            <div class="socials">${socialsHtml()}</div>
          </div>
          <div>
            <h5>Explore</h5>
            <ul>
              <li><a href="${home}#about">About</a></li>
              <li><a href="${home}#services">Services</a></li>
              <li><a href="${home}#resources">Free Resources</a></li>
              <li><a href="${home}#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5>Learn</h5>
            <ul>
              <li><a href="blog.html?cat=development">Professional Development</a></li>
              <li><a href="blog.html?cat=leadership">Leadership Track</a></li>
              <li><a href="${home}#podcast">${esc(S.podcastName)}</a></li>
            </ul>
          </div>
          <div>
            <h5>Listen</h5>
            <ul>
              <li><a href="${esc(S.links?.apple || "#")}" target="_blank" rel="noopener">Apple Podcasts</a></li>
              <li><a href="${esc(S.links?.spotify || "#")}" target="_blank" rel="noopener">Spotify</a></li>
              <li><a href="${esc(S.links?.youtube || "#")}" target="_blank" rel="noopener">YouTube</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${esc(S.brand)}. All rights reserved.</span>
          <span>${esc(S.tagline)}</span>
        </div>
        <p class="disclaimer">Content on this site is for educational and professional development purposes and does not replace certified lifeguard, first aid, CPR, or EMS training, or your facility's policies and local regulations.</p>
      </div>`;
  }

  /* ---------- Cards ---------- */
  function postCard(p, i) {
    const variant = ["v1", "v2", "v3"][i % 3];
    const initials = p.category === "leadership" ? "LEAD" : "GROW";
    return `
      <a class="post-card reveal d${(i % 3) + 1}" href="post.html?slug=${encodeURIComponent(p.slug)}">
        <div class="cover ${variant}">
          <span class="cat ${p.category}">${catLabel(p.category)}</span>
          ${waveSvg("#ffffff", .35)}
          <span class="cover-title">${initials}</span>
        </div>
        <div class="body">
          <div class="meta"><span>${fmtDate(p.date)}</span><span>${p.readTime || 4} min read</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.excerpt)}</p>
          <span class="more">Read article ${I.arrow}</span>
        </div>
      </a>`;
  }

  function episodeRow(e) {
    return `
      <a class="episode reveal" href="${esc(e.url || "#")}" ${e.url && e.url !== "#" ? 'target="_blank" rel="noopener"' : ""}>
        <div class="ep-num"><div><small>EP</small>${String(e.number).padStart(2, "0")}</div></div>
        <div>
          <div class="ep-meta">${fmtDate(e.date)} · ${esc(e.duration)}</div>
          <h4>${esc(e.title)}</h4>
          <p>${esc(e.description)}</p>
        </div>
        <span class="go">${I.play}</span>
      </a>`;
  }

  /* ---------- Home page ---------- */
  function renderHome() {
    const lead = $("#leadership-posts");
    if (lead) lead.innerHTML = POSTS.filter((p) => p.category === "leadership").slice(0, 3).map(postCard).join("") || '<p class="empty">New leadership content coming soon.</p>';
    const dev = $("#blog-posts");
    if (dev) dev.innerHTML = POSTS.filter((p) => p.category === "development").slice(0, 3).map(postCard).join("") || '<p class="empty">New posts coming soon.</p>';

    const eps = $("#episodes");
    if (eps) eps.innerHTML = EPISODES.slice(0, 4).map(episodeRow).join("");

    // Featured episode player
    const latest = EPISODES[0];
    const feat = $(".pod-feature");
    if (feat && latest) {
      $("#feat-title").textContent = `Ep. ${latest.number}: ${latest.title}`;
      $("#feat-meta").textContent = `${fmtDate(latest.date)} · ${latest.duration}`;
      const btn = $(".play-btn", feat);
      btn.addEventListener("click", () => {
        if (S.podcastEmbed) {
          const wrap = $(".pod-embed", feat);
          if (!wrap.innerHTML) wrap.innerHTML = `<iframe src="${esc(S.podcastEmbed)}" allow="autoplay; clipboard-write; encrypted-media" loading="lazy" title="Podcast player"></iframe>`;
          return;
        }
        if (latest.url && latest.url !== "#") { window.open(latest.url, "_blank", "noopener"); return; }
        const paused = feat.classList.toggle("paused");
        btn.innerHTML = paused ? I.play : I.pause;
        btn.setAttribute("aria-label", paused ? "Play" : "Pause");
      });
    }
    const eq = $(".eq");
    if (eq) eq.innerHTML = Array.from({ length: 40 }, (_, i) => `<i style="animation-delay:${(-Math.random() * 1.2).toFixed(2)}s;animation-duration:${(0.8 + Math.random() * 0.9).toFixed(2)}s"></i>`).join("");

    $$("[data-link]").forEach((a) => { const k = a.dataset.link; if (S.links?.[k]) a.href = S.links[k]; });
    $$("[data-socials]").forEach((el) => (el.innerHTML = socialsHtml()));
    $$("[data-email]").forEach((el) => { el.textContent = S.email; if (el.tagName === "A") el.href = "mailto:" + S.email; });
    $$("[data-owner]").forEach((el) => (el.textContent = S.ownerName));
    $$("[data-location]").forEach((el) => (el.textContent = S.location));
    $$("[data-podcast]").forEach((el) => (el.textContent = S.podcastName));
  }

  /* ---------- Blog page ---------- */
  function renderBlog() {
    const grid = $("#all-posts");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "all";
    let q = "";
    const draw = () => {
      const list = POSTS.filter((p) => (cat === "all" || p.category === cat) &&
        (!q || (p.title + " " + p.excerpt + " " + (p.tags || []).join(" ")).toLowerCase().includes(q)));
      grid.innerHTML = list.map(postCard).join("") || '<p class="empty">No posts match your search yet.</p>';
      $$(".filter").forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
      observe();
      const titles = { all: ["The Blog", "Insights, lessons, and leadership tools from the deck, the ambulance, and the director's office."],
        development: ["Professional Development", "Short reads on leadership, operations, risk management, and building a career in aquatics."],
        leadership: ["The Leadership Track", "For lifeguards ready to take the next step into head guard, supervisor, and beyond."] };
      $("#blog-title").textContent = titles[cat][0];
      $("#blog-sub").textContent = titles[cat][1];
    };
    $$(".filter").forEach((b) => b.addEventListener("click", () => {
      cat = b.dataset.cat;
      const u = new URL(location.href);
      cat === "all" ? u.searchParams.delete("cat") : u.searchParams.set("cat", cat);
      history.replaceState(null, "", u);
      draw();
    }));
    $("#post-search")?.addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
    draw();
  }

  /* ---------- Single post ---------- */
  function renderPost() {
    const slug = new URLSearchParams(location.search).get("slug");
    const idx = POSTS.findIndex((p) => p.slug === slug);
    const p = POSTS[idx];
    if (!p) {
      $("#post-title").textContent = "Post not found";
      $("#post-body").innerHTML = '<p>That article may have moved. <a href="blog.html">Browse all posts →</a></p>';
      return;
    }
    document.title = `${p.title} | ${S.brand}`;
    const desc = $('meta[name="description"]'); if (desc) desc.content = p.excerpt;
    $("#post-crumb").innerHTML = `<a href="index.html">Home</a> / <a href="blog.html?cat=${p.category}">${catLabel(p.category)}</a>`;
    $("#post-title").textContent = p.title;
    $("#post-meta").innerHTML = `<span class="cat">${catLabel(p.category)}</span><span>${fmtDate(p.date)}</span><span>${p.readTime || 4} min read</span>`;
    $("#post-body").innerHTML = md(p.body);
    $("#post-tags").innerHTML = (p.tags || []).map((t) => `<span>#${esc(t)}</span>`).join("");
    $("#author-name").textContent = `${S.ownerName} · ${S.brand}`;
    const prev = POSTS[idx + 1], next = POSTS[idx - 1];
    $("#post-nav").innerHTML =
      (prev ? `<a class="btn btn--outline" href="post.html?slug=${prev.slug}">← Older post</a>` : "<span></span>") +
      (next ? `<a class="btn btn--outline" href="post.html?slug=${next.slug}">Newer post →</a>` : `<a class="btn btn--outline" href="blog.html">All posts →</a>`);
    const related = POSTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
    const rel = $("#related");
    if (rel) rel.innerHTML = related.map(postCard).join("");
    if (!related.length) $("#related-section")?.remove();
  }

  /* ---------- Forms ---------- */
  function wireForms() {
    const contact = $("#contact-form");
    if (contact) contact.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(contact);
      const status = $("#form-status");
      if (S.formEndpoint) {
        status.textContent = "Sending…";
        try {
          const r = await fetch(S.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
          if (!r.ok) throw new Error();
          contact.reset();
          status.textContent = "Thanks! Your message is on its way. I'll be in touch soon.";
        } catch { status.textContent = "Something went wrong. Please email me directly at " + S.email; }
        return;
      }
      const subject = `[${data.get("topic")}] Inquiry from ${data.get("name")}`;
      const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nOrganization: ${data.get("org") || "-"}\nTopic: ${data.get("topic")}\n\n${data.get("message")}`;
      location.href = `mailto:${S.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.textContent = "Opening your email app…";
    });

    $$(".nl-form").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("input", f).value;
      const note = f.parentElement.querySelector(".nl-note");
      if (S.formEndpoint) {
        fetch(S.formEndpoint, { method: "POST", body: new URLSearchParams({ email, topic: "Newsletter signup" }), headers: { Accept: "application/json" } }).catch(() => {});
      } else {
        location.href = `mailto:${S.email}?subject=${encodeURIComponent("Add me to the newsletter")}&body=${encodeURIComponent("Please subscribe: " + email)}`;
      }
      f.reset();
      if (note) note.textContent = "You're on the list! Welcome aboard. 🌊";
    }));
  }

  /* ---------- Links that pre-select a contact topic ---------- */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-topic]");
    const sel = document.getElementById("f-topic");
    if (!a || !sel) return;
    const opt = Array.from(sel.options).find((o) => o.text === a.dataset.topic);
    if (opt) sel.value = opt.value;
  });

  /* ---------- Reveal on scroll ---------- */
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("in")); return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal:not(.in)").forEach((el) => io.observe(el));
  }

  /* ---------- Count-up stats ---------- */
  function countUp() {
    $$("[data-count]").forEach((el) => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const run = () => {
        const t0 = performance.now(), dur = 1600;
        const step = (t) => { const k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      };
      if (!("IntersectionObserver" in window)) return run();
      const o = new IntersectionObserver(([en]) => { if (en.isIntersecting) { run(); o.disconnect(); } }, { threshold: .5 });
      o.observe(el);
    });
  }

  /* ---------- Init ---------- */
  renderNav();
  renderFooter();
  if (page === "home") renderHome();
  if (page === "blog") renderBlog();
  if (page === "post") renderPost();
  wireForms();
  observe();
  countUp();
})();
