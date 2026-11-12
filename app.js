const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- saved progress ---------- */
const KEY = "wanderer-club-v1";
let state = { dust: 10, owned: {}, free: 1, theme: null };
try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
const setDust = (n) => { state.dust = n; $("#dust").textContent = n; save(); };
setDust(state.dust);

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- theme ---------- */
const root = document.documentElement;
root.dataset.theme = state.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
$("#themeBtn").onclick = () => {
  state.theme = root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; save();
};

/* ---------- hand-drawn stars ---------- */
function wobblyStar(cx, cy, r) {
  // a 5-point star drawn with slightly jittered points, like a pen doodle
  let d = "";
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = (i % 2 ? r * .45 : r) * (0.9 + Math.random() * .2);
    const x = cx + Math.cos(a) * rr + (Math.random() - .5) * 1.5, y = cy + Math.sin(a) * rr + (Math.random() - .5) * 1.5;
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
}
function drawStars() {
  const svg = $("#stars"), w = svg.clientWidth, h = svg.clientHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const n = Math.round(w * h / 26000);
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 5 + Math.random() * 11;
    const kind = Math.random();
    const style = `style="--d:${3 + Math.random() * 4}s;animation-delay:-${Math.random() * 5}s"`;
    if (kind < .65) out += `<path class="s" ${style} d="${wobblyStar(x, y, r)}"/>`;
    else if (kind < .85) out += `<path class="s" ${style} d="M${x} ${y - r}q1 ${r - 2} ${r} ${r}q${-r + 2} 1 ${-r} ${r}q-1 ${-r + 2} ${-r} ${-r}q${r - 2} -1 ${r} ${-r}"/>`;
    else out += `<circle class="s" ${style} cx="${x}" cy="${y}" r="${r / 4}" />`;
  }
  svg.innerHTML = out;
}
drawStars();
let rs; addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(drawStars, 200); });

/* ---------- exploring the 2x2 world ---------- */
const POS = { home: [0, 0], box: [1, 0], shelf: [0, 1], series: [1, 1] };
let here = "home";
function go(name) {
  if (!POS[name]) return;
  here = name;
  const [x, y] = POS[name], world = $("#world");
  world.style.setProperty("--cx", x); world.style.setProperty("--cy", y);
  $$(".screen").forEach(s => s.classList.toggle("here", s.dataset.screen === name));
  $$(".nav [data-go], .minimap [data-go]").forEach(b => b.classList.toggle(b.closest(".minimap") ? "on" : "active", b.dataset.go === name));
  $(".edge.up").hidden = y === 0; $(".edge.down").hidden = y === 1;
  $(".edge.left").hidden = x === 0; $(".edge.right").hidden = x === 1;
  if (name === "shelf") renderShelf();
  if (name === "series") renderSeries();
  history.replaceState(null, "", "#" + name);
}
function move(dir) {
  let [x, y] = POS[here];
  if (dir === "up") y--; if (dir === "down") y++; if (dir === "left") x--; if (dir === "right") x++;
  const name = Object.keys(POS).find(k => POS[k][0] === x && POS[k][1] === y);
  if (name) go(name);
}
document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]"); if (g) go(g.dataset.go);
  const d = e.target.closest("[data-dir]"); if (d) move(d.dataset.dir);
});
document.addEventListener("keydown", e => {
  if (!$("#modal").hidden) { if (e.key === "Escape") closeModal(); return; }
  const k = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[e.key];
  if (k && e.shiftKey) { move(k); e.preventDefault(); }
  else if (here === "home" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) spin(e.key === "ArrowLeft" ? -1 : 1);
  else if (k) move(k);
});

/* ---------- hero carousel (swipe / drag / arrows) ---------- */
const featured = FIGURES.filter((f, i) => i % 3 === 0 || f.rarity === "secret").slice(0, 9);
let ci = 0;
$("#track").innerHTML = featured.map(f => `<div class="slot">${drawFigure(f)}</div>`).join("");
function layoutCarousel(offset = 0) {
  const n = featured.length, wide = innerWidth > 640 ? 1 : .62;
  $$("#track .slot").forEach((el, i) => {
    let p = ((i - ci + n + Math.floor(n / 2)) % n) - Math.floor(n / 2) + offset;
    const a = Math.abs(p);
    el.style.transform = `translate(-50%,-50%) translateX(${p * 150 * wide}px) translateY(${a * a * 6}px) scale(${1 - a * .2}) rotate(${p * 6}deg)`;
    el.style.opacity = a > 2.6 ? 0 : 1 - a * .25;
    el.style.zIndex = 10 - Math.round(a);
    el.style.filter = a > .5 ? "saturate(.7)" : "none";
  });
  $("#carName").textContent = featured[ci].name;
}
function spin(d) { ci = (ci + d + featured.length) % featured.length; layoutCarousel(); }
$("#prevFig").onclick = () => spin(-1);
$("#nextFig").onclick = () => spin(1);
(() => {
  const car = $("#carousel"); let sx = null, dx = 0;
  car.addEventListener("pointerdown", e => { sx = e.clientX; dx = 0; car.classList.add("drag"); car.setPointerCapture(e.pointerId); });
  car.addEventListener("pointermove", e => { if (sx === null) return; dx = e.clientX - sx; layoutCarousel(dx / 150); });
  const end = () => {
    if (sx === null) return; car.classList.remove("drag"); sx = null;
    const steps = Math.round(-dx / 120);
    if (steps) spin(steps); else if (Math.abs(dx) < 5) openModal(featured[ci]); else layoutCarousel();
  };
  car.addEventListener("pointerup", end); car.addEventListener("pointercancel", end);
  car.addEventListener("wheel", e => { if (Math.abs(e.deltaX) > 20) { spin(Math.sign(e.deltaX)); e.preventDefault(); } }, { passive: false });
})();
layoutCarousel();
let auto = setInterval(() => here === "home" && $("#modal").hidden && spin(1), 4200);
addEventListener("resize", () => layoutCarousel());

/* ---------- blind box ---------- */
let pickSeries = "all", opening = false;
function renderPick() {
  $("#seriesPick").innerHTML = [{ id: "all", name: "Any series" }, ...SERIES]
    .map(s => `<button class="chip ${s.id === pickSeries ? "on" : ""}" data-pick="${s.id}">${s.name}</button>`).join("");
}
$("#seriesPick").onclick = e => { const b = e.target.closest("[data-pick]"); if (b) { pickSeries = b.dataset.pick; renderPick(); } };
renderPick();
function updateHint() {
  $("#boxHint").textContent = state.free > 0 ? `You have ${state.free} free box${state.free > 1 ? "es" : ""} ✦ tap to open`
    : `Costs 10 ✦ · catch drifting stars to earn more`;
}
updateHint();
function roll() {
  const pool = FIGURES.filter(f => pickSeries === "all" || f.series === pickSeries);
  const total = pool.reduce((t, f) => t + RARITY_W[f.rarity], 0);
  let r = Math.random() * total;
  for (const f of pool) { r -= RARITY_W[f.rarity]; if (r <= 0) return f; }
  return pool[0];
}
$("#blindbox").onclick = () => {
  if (opening) return;
  if (state.free > 0) state.free--;
  else if (state.dust >= 10) setDust(state.dust - 10);
  else return toast("Not enough stardust — catch some floating stars ✦");
  opening = true;
  const box = $("#blindbox"), rev = $("#reveal"), f = roll();
  rev.innerHTML = ""; box.classList.add("shake");
  setTimeout(() => box.classList.add("open"), 700);
  setTimeout(() => {
    const dup = state.owned[f.id];
    state.owned[f.id] = (dup || 0) + 1; save();
    rev.innerHTML = `${f.rarity !== "common" ? '<div class="rays"></div>' : ""}<div class="fig">${drawFigure(f)}</div>
      <div class="label">${f.rarity === "secret" ? "★ SECRET ★ " : f.rarity === "rare" ? "✦ rare · " : ""}${f.name}${dup ? " (dupe +3✦)" : " — NEW!"}</div>`;
    if (dup) setDust(state.dust + 3);
    updateHint();
  }, 1300);
  setTimeout(() => {
    box.classList.remove("shake", "open"); opening = false;
  }, 3800);
};

/* ---------- shelf ---------- */
let shelfFilter = "all";
function renderShelf() {
  const owned = FIGURES.filter(f => state.owned[f.id]).length;
  $("#shelfCount").textContent = `${owned}/${FIGURES.length}`;
  $("#filters").innerHTML = [{ id: "all", name: "All" }, { id: "owned", name: "Owned" }, ...SERIES]
    .map(s => `<button class="chip ${s.id === shelfFilter ? "on" : ""}" data-filter="${s.id}">${s.name}</button>`).join("");
  $("#shelf").innerHTML = FIGURES
    .filter(f => shelfFilter === "all" || (shelfFilter === "owned" ? state.owned[f.id] : f.series === shelfFilter))
    .map(f => {
      const has = state.owned[f.id];
      return `<button class="tile ${has ? "" : "locked"} ${has && f.rarity === "secret" ? "secret" : ""}" data-fig="${f.id}">
        ${drawFigure(f)}<div class="nm">${has ? f.name : (f.rarity === "secret" ? "???" : f.name)}</div>
        <div class="rar">${has ? (has > 1 ? `×${has} · ` : "") + f.rarity : "locked"}</div></button>`;
    }).join("");
}
$("#filters").onclick = e => { const b = e.target.closest("[data-filter]"); if (b) { shelfFilter = b.dataset.filter; renderShelf(); } };
$("#shelf").onclick = e => {
  const b = e.target.closest("[data-fig]"); if (!b) return;
  const f = FIGURES.find(x => x.id === b.dataset.fig);
  if (state.owned[f.id]) openModal(f); else toast("Still in a blind box somewhere… 📦");
};

/* ---------- series ---------- */
function renderSeries() {
  $("#seriesList").innerHTML = SERIES.map(s => {
    const figs = FIGURES.filter(f => f.series === s.id), got = figs.filter(f => state.owned[f.id]).length;
    return `<div class="scard"><h3>${s.name}</h3><p>${s.blurb}</p>
      <div class="mini">${figs.slice(0, 5).map(drawFigure).join("")}</div>
      <div class="bar"><i style="width:${got / figs.length * 100}%"></i></div>
      <p>${got}/${figs.length} collected</p>
      <button class="pill ghost" style="margin-top:8px" data-series-open="${s.id}">Open this series →</button></div>`;
  }).join("");
}
$("#seriesList").onclick = e => {
  const b = e.target.closest("[data-series-open]"); if (!b) return;
  pickSeries = b.dataset.seriesOpen; renderPick(); go("box");
};

/* ---------- modal ---------- */
function openModal(f) {
  const s = SERIES.find(x => x.id === f.series), has = state.owned[f.id];
  $("#modalCard").innerHTML = `${drawFigure(f)}<p class="kicker">${s.name} · ${f.rarity}</p><h3>${f.name}</h3>
    <p class="serif" style="margin:6px 0 14px">${has ? `On your shelf ×${has}` : "Not collected yet"}</p>
    <button class="pill" onclick="closeModal()">Close</button>`;
  $("#modal").hidden = false;
}
function closeModal() { $("#modal").hidden = true; }
$("#modal").onclick = e => { if (e.target.id === "modal") closeModal(); };

/* ---------- catchable drifting stars (earn stardust) ---------- */
function spawnCatch() {
  if (document.hidden) return;
  const s = document.createElement("button");
  s.className = "catch"; s.textContent = "✦"; s.setAttribute("aria-label", "Catch star for 2 stardust");
  s.style.left = (5 + Math.random() * 90) + "%"; s.style.top = "100%";
  s.onclick = ev => { ev.stopPropagation(); setDust(state.dust + 2); toast("+2 stardust ✦"); s.remove(); };
  s.addEventListener("animationend", () => s.remove());
  $(".frame").appendChild(s);
}
setInterval(spawnCatch, 3500);

go(POS[location.hash.slice(1)] ? location.hash.slice(1) : "home");
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
addEventListener("hashchange", () => { const h = location.hash.slice(1); if (POS[h] && h !== here) go(h); });
