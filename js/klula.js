/* Fondazzjoni ta' Klula: shared site script.
   Reads events.json, activities.json and past-events.json from the site root.
   There is deliberately no hard-coded fallback list: if a file fails to load,
   the page shows the "nothing scheduled" message instead of stale events.

   Event fields used (events.json):
     id, title, title_mt, date (YYYY-MM-DD), time, location, audience, tag, free,
     description, description_mt, poster, partners {img, alt},
     register (Google Form URL), registration_closed (true/false)          */
(function () {
  "use strict";
  var MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var MON3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var WD = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var CLOSED = "Reġistrazzjonijiet Magħluqa";
  var S = { events: [], acts: [], past: [] };

  function pd(s) { var p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function place(s) { return String(s || "").replace(/, Għawdex$/, ""); }
  function longDate(d) { return WD[d.getDay()] + ", " + d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  function shortDate(s) { var d = pd(s); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  function today() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function upcoming() {
    var t = today();
    return S.events.filter(function (e) { return pd(e.date) >= t; }).sort(function (a, b) { return pd(a.date) - pd(b.date); });
  }
  function $(id) { return document.getElementById(id); }
  function getJSON(url) { return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(url); return r.json(); }).catch(function () { return []; }); }
  function regState(e) { return e.registration_closed ? "closed" : (e.register ? "open" : "none"); }

  // ---------- Poster slot ----------
  function genPoster(e) {
    var x = pd(e.date);
    return '<div class="gp" role="img" aria-label="' + esc((e.title_mt || e.title) + ", " + x.getDate() + " " + MON[x.getMonth()]) + '">' +
      '<span class="gp-org">Fondazzjoni ta\' Klula</span><span class="gp-d">' + x.getDate() + '</span>' +
      '<span class="gp-m">' + MON[x.getMonth()] + " " + x.getFullYear() + '</span>' +
      '<span class="gp-t">' + esc(e.title_mt || e.title) + '</span><span class="gp-p">' + esc(e.time) + " · " + esc(place(e.location)) + '</span></div>';
  }
  function posterOrGen(e) { return e.poster ? '<img class="poster" src="' + esc(e.poster) + '" alt="Poster for ' + esc(e.title_mt || e.title) + '" loading="lazy">' : genPoster(e); }
  function factsOf(e) { return [e.time, place(e.location), e.audience, e.free ? "Free" : null].filter(Boolean); }
  function partners(e) {
    return e.partners && e.partners.img ? '<div class="partners"><span class="lab">In partnership with</span><img src="' + esc(e.partners.img) + '" alt="' + esc(e.partners.alt || "") + '" loading="lazy"></div>' : "";
  }
  function actions(e) {
    var st = regState(e), more = '" data-ev="' + esc(e.id) + '">More details</button>';
    if (st === "open") return '<a class="btn" href="' + esc(e.register) + '" target="_blank" rel="noopener">Register</a><button type="button" class="btn-line' + more;
    if (st === "closed") return '<button type="button" class="btn' + more + '<span class="closed">' + CLOSED + '</span>';
    return '<button type="button" class="btn' + more;
  }

  // ---------- Strip (all pages) ----------
  function renderStrip(up) {
    var el = $("strip"); if (!el) return;
    if (!up.length) { el.innerHTML = ""; return; }
    var f = up[0], d = pd(f.date), st = regState(f);
    var lead = '<span>' + d.getDate() + " " + MON[d.getMonth()] + " · " + esc(f.title_mt || f.title) + " · " + esc(place(f.location)) + '</span><span class="sep">/</span>';
    if (st === "open") el.innerHTML = lead + '<span>Limited places</span><a href="' + esc(f.register) + '" target="_blank" rel="noopener">Register</a>';
    else if (st === "closed") el.innerHTML = lead + '<span class="closed">' + CLOSED + '</span><a data-ev="' + esc(f.id) + '" href="#' + esc(f.id) + '">Details</a>';
    else el.innerHTML = lead + '<a data-ev="' + esc(f.id) + '" href="#' + esc(f.id) + '">Details</a>';
  }

  // ---------- Home: featured + rows ----------
  function emptyState() {
    return '<div class="empty"><h3>Qed nippjanaw aktar attivitajiet</h3><p>There are no events scheduled right now. Follow us on Facebook for the next date, or look back at what we have done so far.</p>' +
      '<div><a class="btn" href="events.html#past">See past events</a></div></div>';
  }
  function renderHome(up) {
    var box = $("ev"); if (!box) return;
    if (!up.length) { box.innerHTML = emptyState(); return; }
    var f = up[0], d = pd(f.date);
    var html = '<div class="feat' + (f.poster ? "" : " gen") + '">' +
      '<div class="cal" aria-label="' + esc(longDate(d)) + '"><div class="mo">' + MON[d.getMonth()] + " " + d.getFullYear() + '</div><div class="dy">' + d.getDate() + '</div><div class="wd">' + WD[d.getDay()] + '</div></div>' +
      '<div class="tx"><span class="lab tag">' + esc(f.tag) + '</span><h3>' + esc(f.title_mt || f.title) + '</h3>' + (f.title_mt ? '<p class="en">' + esc(f.title) + '</p>' : '') +
      '<div class="facts">' + factsOf(f).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>' +
      '<p class="ds">' + esc(f.description) + '</p><div class="btn-row">' + actions(f) + '</div>' + partners(f) + '</div>' +
      '<div class="pslot">' + posterOrGen(f) + '</div></div>';
    if (up.length > 1) {
      html += '<ul class="rows">' + up.slice(1).map(function (e) {
        var x = pd(e.date);
        return '<li data-ev="' + esc(e.id) + '"><div class="thw">' + (e.poster ? '<img class="th" src="' + esc(e.poster) + '" alt="" loading="lazy">' : '<div class="th-ph"><img src="images/logo-mark-colour.png" alt=""></div>') + '</div>' +
          '<div class="d"><b>' + x.getDate() + '</b><span>' + MON3[x.getMonth()] + " " + x.getFullYear() + '<br>' + WD[x.getDay()] + '</span></div>' +
          '<div><h4>' + esc(e.title_mt || e.title) + '</h4><p class="m">' + [e.time, place(e.location), e.free ? "Free" : null].filter(Boolean).map(esc).join(" · ") + '</p></div>' +
          '<button type="button" class="btn-line btn-sm" data-ev="' + esc(e.id) + '">Details</button></li>';
      }).join("") + '</ul>';
    }
    box.innerHTML = html;
  }

  // ---------- Events page: all upcoming as cards ----------
  function renderEventsPage(up) {
    var box = $("ev-list"); if (!box) return;
    if (!up.length) { box.innerHTML = emptyState(); return; }
    box.innerHTML = '<div class="ecards">' + up.map(function (e) {
      var d = pd(e.date);
      return '<article class="ecard" id="card-' + esc(e.id) + '"><div class="pv" data-ev="' + esc(e.id) + '">' + posterOrGen(e) + '</div>' +
        '<div class="tx"><span class="when">' + esc(longDate(d)) + '</span><h3>' + esc(e.title_mt || e.title) + '</h3>' + (e.title_mt ? '<p class="en">' + esc(e.title) + '</p>' : '') +
        '<div class="facts">' + factsOf(e).map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>' +
        '<p class="ds">' + esc(e.description) + '</p><div class="btn-row">' + actions(e) + '</div></div></article>';
    }).join("") + '</div>';
  }

  // ---------- Activities (home): rows balanced so no card sits alone ----------
  function rowSizes(n) {
    if (!n) return [];
    var rows = Math.ceil(n / 4), base = Math.floor(n / rows), extra = n % rows, out = [];
    for (var i = 0; i < rows; i++) out.push(base + (i < extra ? 1 : 0));
    return out;
  }
  function renderActs() {
    var box = $("acts"); if (!box) return;
    var list = S.acts.slice().sort(function (a, b) { return (a.month || 12.5) - (b.month || 12.5); });
    var html = "", k = 0;
    rowSizes(list.length).forEach(function (size) {
      for (var i = 0; i < size; i++, k++) {
        var a = list[k];
        html += '<article class="' + (size <= 2 ? "w" : "") + '" style="grid-column: span ' + (12 / size) + '">' +
          '<img src="' + esc(a.img) + '" alt="" loading="lazy">' +
          '<span class="lab when">' + esc(a.when) + (a.status === "planned" ? '<span class="new">New</span>' : '') + '</span>' +
          '<h3>' + esc(a.name) + '</h3><p>' + esc(a.text) + '</p></article>';
      }
    });
    box.innerHTML = html;
  }

  // ---------- Past events ----------
  function pastLine(p) { return [p.guests, p.with ? "With " + p.with : null].filter(Boolean).join(" · "); }
  function pcard(p) {
    return '<button type="button" class="pcard" data-past="' + esc(p.id) + '"><img src="' + esc(p.folder + "/" + p.photos[0]) + '" alt="" loading="lazy">' +
      '<span><b>' + esc(p.title) + '</b>' + (pastLine(p) ? '<span>' + esc(pastLine(p)) + '</span>' : '') +
      '<span>' + esc(shortDate(p.date)) + (p.photos.length > 1 ? " · " + p.photos.length + " photos" : "") + '</span></span></button>';
  }
  function sortedPast() { return S.past.slice().sort(function (a, b) { return pd(b.date) - pd(a.date); }); }
  function renderPast() {
    var strip = $("past-strip");
    if (strip) strip.innerHTML = sortedPast().slice(0, 6).map(pcard).join("");
    var grid = $("past-grid");
    if (grid) {
      var byYear = {};
      sortedPast().forEach(function (p) { var y = p.date.slice(0, 4); (byYear[y] = byYear[y] || []).push(p); });
      grid.innerHTML = Object.keys(byYear).sort().reverse().map(function (y) {
        return '<h3 class="pyear">' + y + '</h3><div class="pgrid">' + byYear[y].map(pcard).join("") + '</div>';
      }).join("");
    }
  }

  // ---------- Event detail panel ----------
  var drawer, lastFocus = null;
  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = document.createElement("div");
    drawer.className = "drawer"; drawer.hidden = true;
    drawer.innerHTML = '<div class="bk" data-close></div><aside class="pn" role="dialog" aria-modal="true" aria-labelledby="dr-title">' +
      '<button type="button" class="x" id="dr-x" data-close aria-label="Close">×</button><div class="pn-body" id="dr-body"></div></aside>';
    document.body.appendChild(drawer);
    return drawer;
  }
  function openEvent(id) {
    var e = S.events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
    ensureDrawer();
    var d = pd(e.date), st = regState(e);
    var rows = [["Date", longDate(d)], ["Time", e.time], ["Place", e.location], ["Ages", e.audience], ["Entry", e.free ? "Free" : null]].filter(function (r) { return r[1]; });
    $("dr-body").innerHTML =
      '<div class="po"><span class="lab">Poster</span>' + (e.poster ? '<img src="' + esc(e.poster) + '" alt="Poster for ' + esc(e.title_mt || e.title) + '">' : genPoster(e)) + '</div>' +
      '<div class="bd"><div class="dh"><b>' + d.getDate() + '</b><span>' + MON[d.getMonth()] + " " + d.getFullYear() + '<br>' + WD[d.getDay()] + '</span></div>' +
      '<span class="lab tag">' + esc(e.tag) + '</span><h3 id="dr-title">' + esc(e.title_mt || e.title) + '</h3>' + (e.title_mt ? '<p class="en">' + esc(e.title) + '</p>' : '') +
      '<dl>' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join("") + '</dl>' +
      '<p class="ds">' + esc(e.description) + '</p>' + (e.description_mt ? '<p class="mt" lang="mt">' + esc(e.description_mt) + '</p>' : '') +
      partners(e) +
      '<div class="btn-row">' + (st === "open" ? '<a class="btn" href="' + esc(e.register) + '" target="_blank" rel="noopener">Register</a>' : '') +
      (st === "closed" ? '<span class="closed">' + CLOSED + '</span>' : '') +
      '<button type="button" class="btn-line" data-close>Close</button></div></div>';
    lastFocus = document.activeElement;
    drawer.hidden = false; document.body.style.overflow = "hidden";
    drawer.querySelector(".pn").scrollTop = 0;
    requestAnimationFrame(function () { drawer.classList.add("open"); $("dr-x").focus(); });
  }
  function closeEvent() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("open"); document.body.style.overflow = "";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(function () { drawer.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }, reduce ? 0 : 320);
    if (/^#evt-/.test(location.hash)) { try { history.replaceState(null, "", location.pathname + location.search); } catch (err) {} }
  }

  // ---------- Photo viewer ----------
  var lb = null, lbSet = null, lbI = 0;
  function openPast(id) {
    var p = S.past.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    lbSet = p; lbI = 0; lastFocus = document.activeElement;
    if (!lb) {
      lb = document.createElement("div"); lb.className = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.hidden = true;
      lb.innerHTML = '<div class="top"><div><b id="lb-t"></b><span id="lb-s"></span></div><button type="button" id="lb-x" aria-label="Close">×</button></div>' +
        '<div class="stage"><img id="lb-img" alt=""></div><div class="ctl"><button type="button" id="lb-p" aria-label="Previous photo">‹</button><span id="lb-n"></span><button type="button" id="lb-nx" aria-label="Next photo">›</button></div>';
      document.body.appendChild(lb);
      $("lb-x").addEventListener("click", closePast);
      $("lb-p").addEventListener("click", function () { stepPast(-1); });
      $("lb-nx").addEventListener("click", function () { stepPast(1); });
      lb.addEventListener("click", function (ev) { if (ev.target === lb || ev.target.classList.contains("stage")) closePast(); });
    }
    $("lb-t").textContent = p.title;
    $("lb-s").textContent = [pastLine(p), shortDate(p.date)].filter(Boolean).join(" · ");
    showPast(); lb.hidden = false; document.body.style.overflow = "hidden"; $("lb-x").focus();
  }
  function showPast() {
    var n = lbSet.photos.length;
    $("lb-img").src = lbSet.folder + "/" + lbSet.photos[lbI];
    $("lb-img").alt = lbSet.title + ", photo " + (lbI + 1) + " of " + n;
    $("lb-n").textContent = (lbI + 1) + " / " + n;
    $("lb-p").hidden = $("lb-nx").hidden = n < 2;
  }
  function stepPast(k) { var n = lbSet.photos.length; lbI = (lbI + k + n) % n; showPast(); }
  function closePast() { if (!lb || lb.hidden) return; lb.hidden = true; document.body.style.overflow = ""; if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  // ---------- Clicks and keys ----------
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    if (t.closest("[data-close]")) { closeEvent(); return; }
    var p = t.closest("[data-past]"); if (p) { openPast(p.getAttribute("data-past")); return; }
    if (t.closest("a[href^='http']")) return;
    var b = t.closest("[data-ev]"); if (b) { ev.preventDefault(); openEvent(b.getAttribute("data-ev")); }
  });
  document.addEventListener("keydown", function (ev) {
    if (lb && !lb.hidden) {
      if (ev.key === "Escape") closePast();
      else if (ev.key === "ArrowRight") stepPast(1);
      else if (ev.key === "ArrowLeft") stepPast(-1);
      return;
    }
    if (ev.key === "Escape") closeEvent();
  });
  function openFromHash() { var h = location.hash.slice(1); if (/^evt-[\w-]+$/.test(h)) openEvent(h); }
  window.addEventListener("hashchange", openFromHash);

  // ---------- Contact form (Web3Forms) ----------
  var form = $("contact-form");
  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var err = $("form-err"); err.hidden = true;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var fd = new FormData(form);
    function done() { form.hidden = true; $("sent").hidden = false; $("sent").focus(); }
    if (fd.get("botcheck")) { done(); return; }
    if (form.dataset.preview) { done(); return; }
    var btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Sending…";
    var topic = String(fd.get("topic") || "").trim();
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: form.dataset.key,
        subject: "Website message" + (topic ? ": " + topic : ""),
        from_name: "Fondazzjoni ta' Klula website",
        name: fd.get("name"), email: fd.get("email"), topic: topic, message: fd.get("message")
      })
    }).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.success) done(); else throw new Error("send");
    }).catch(function () {
      err.hidden = false; btn.disabled = false; btn.textContent = "Send message";
    });
  });

  // ---------- Load ----------
  Promise.all([getJSON("events.json"), getJSON("activities.json"), getJSON("past-events.json")]).then(function (r) {
    S.events = r[0] || []; S.acts = r[1] || []; S.past = r[2] || [];
    var up = upcoming();
    renderStrip(up); renderHome(up); renderEventsPage(up); renderActs(); renderPast(); openFromHash();
  });
})();
