/* Figurine catalogue + a little SVG illustrator.
   Illustrations are original stand-ins — swap `img` on any figure for a real photo URL. */
const SERIES = [
  { id: "mischief", name: "Little Mischief", blurb: "Small pranks, big quiet feelings. The boy who started it all.", tint: "#e9b872" },
  { id: "reshape",  name: "Reshape",         blurb: "Patched up, put back together, still standing.",               tint: "#9cc5d6" },
  { id: "mime",     name: "The Mime",        blurb: "Painted smiles and silent stories on a tiny stage.",          tint: "#f2a7a0" },
  { id: "wild",     name: "Living Wild",     blurb: "Leaves in his hair and moss on his boots.",                   tint: "#8fc27a" },
];

// [name, series, rarity, outfit, accessory, mood]
const RAW = [
  ["Sleepy Sunday","mischief","common","#e9b872","none","sleepy"],
  ["Paper Plane","mischief","common","#d97b5a","plane","blank"],
  ["Gum Bubble","mischief","common","#f2a7a0","bubble","smirk"],
  ["Hide & Seek","mischief","rare","#6f8fc4","box","sleepy"],
  ["Rainy Walk","mischief","common","#5b8a72","umbrella","sad"],
  ["Golden Hour","mischief","secret","#ffd36e","crown","smirk"],
  ["Band-Aid","reshape","common","#9cc5d6","bandage","sad"],
  ["Stitched","reshape","common","#b6a4d6","stitch","blank"],
  ["Glued Heart","reshape","rare","#e7837b","heart","sleepy"],
  ["Cast Arm","reshape","common","#cfd8dc","cast","blank"],
  ["Night Light","reshape","common","#3d5a80","star","sleepy"],
  ["Kintsugi","reshape","secret","#2b2b2b","crown","blank"],
  ["White Face","mime","common","#f7f4e6","beret","blank"],
  ["Balloon","mime","common","#f2a7a0","balloon","smirk"],
  ["Invisible Wall","mime","rare","#222","beret","sad"],
  ["Juggler","mime","common","#e9b872","stars","smirk"],
  ["Tear Drop","mime","common","#9cc5d6","none","sad"],
  ["Curtain Call","mime","secret","#c0392b","crown","smirk"],
  ["Leaf Hat","wild","common","#8fc27a","leaf","sleepy"],
  ["Frog Friend","wild","common","#5fa35a","frog","smirk"],
  ["Mushroom","wild","rare","#c96f5a","mushroom","blank"],
  ["Firefly","wild","common","#2f5d46","star","sleepy"],
  ["Pine Cone","wild","common","#8b6b4a","scarf","sad"],
  ["Forest Spirit","wild","secret","#e8f5d0","crown","sleepy"],
];
const FIGURES = RAW.map((r, i) => ({ id: "f" + i, name: r[0], series: r[1], rarity: r[2], outfit: r[3], acc: r[4], mood: r[5] }));
const RARITY_W = { common: 70, rare: 24, secret: 6 };

function eyes(mood) {
  const L = 78, R = 122, y = 118;
  const lid = (x) => `<path d="M${x-10} ${y} q10 6 20 0" stroke="#2b1d16" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const dot = (x) => `<ellipse cx="${x}" cy="${y+2}" rx="5" ry="6" fill="#2b1d16"/><path d="M${x-11} ${y-3} h22" stroke="#2b1d16" stroke-width="4" stroke-linecap="round"/>`;
  let e = mood === "sleepy" ? lid(L) + lid(R) : dot(L) + dot(R);
  let m = { sleepy: "M93 146 q7 3 14 0", blank: "M94 147 h12", smirk: "M92 145 q10 6 16 -2", sad: "M93 149 q7 -5 14 0" }[mood];
  e += `<path d="${m}" stroke="#2b1d16" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if (mood === "sad") e += `<path d="M126 128 q4 8 0 11 q-4 -3 0 -11z" fill="#8ec9f0" stroke="#2b1d16" stroke-width="1.5"/>`;
  return e + `<ellipse cx="66" cy="136" rx="9" ry="5" fill="#f2a7a0" opacity=".7"/><ellipse cx="134" cy="136" rx="9" ry="5" fill="#f2a7a0" opacity=".7"/>`;
}

function accessory(a, c) {
  const o = `stroke="#2b1d16" stroke-width="3.5" stroke-linejoin="round"`;
  switch (a) {
    case "crown": return `<path d="M72 52 l8 -22 l12 16 l8 -20 l8 20 l12 -16 l8 22z" fill="#ffd36e" ${o}/>`;
    case "beret": return `<ellipse cx="100" cy="60" rx="48" ry="14" fill="#2b2b2b" ${o}/><circle cx="100" cy="44" r="5" fill="#2b2b2b"/>`;
    case "leaf": return `<path d="M100 54 q-4 -30 26 -36 q-2 30 -26 36z" fill="#7bb36a" ${o}/><path d="M100 54 q10 -16 22 -30" ${o} fill="none"/>`;
    case "mushroom": return `<path d="M54 74 q46 -60 92 0z" fill="#d9534f" ${o}/><circle cx="84" cy="56" r="6" fill="#fff"/><circle cx="112" cy="50" r="5" fill="#fff"/>`;
    case "frog": return `<ellipse cx="100" cy="58" rx="26" ry="16" fill="#7bc16b" ${o}/><circle cx="88" cy="48" r="7" fill="#fff" ${o}/><circle cx="112" cy="48" r="7" fill="#fff" ${o}/><circle cx="88" cy="48" r="2.5" fill="#2b1d16"/><circle cx="112" cy="48" r="2.5" fill="#2b1d16"/>`;
    case "bandage": return `<rect x="104" y="96" width="30" height="11" rx="4" transform="rotate(-20 119 101)" fill="#f6d1a8" ${o}/>`;
    case "stitch": return `<path d="M60 100 l18 16 M64 112 l6 -8 M70 117 l6 -8" ${o} fill="none"/>`;
    case "umbrella": return `<path d="M150 236 v-120" ${o}/><path d="M104 120 q46 -60 92 0 q-11 -8 -23 0 q-11 -8 -23 0 q-12 -8 -23 0 q-12 -8 -23 0z" fill="#ffd36e" ${o}/>`;
    case "balloon": return `<path d="M160 230 q-8 -50 0 -110" ${o} fill="none"/><ellipse cx="160" cy="96" rx="22" ry="26" fill="#e7837b" ${o}/>`;
    case "heart": return `<path d="M100 206 l-14 -14 a8 8 0 1 1 14 -10 a8 8 0 1 1 14 10z" fill="#e7837b" ${o}/><path d="M100 184 l-3 8 l5 4 l-3 6" ${o} fill="none"/>`;
    case "star": return `<path d="M162 150 l5 12 l13 1 l-10 8 l3 13 l-11 -7 l-11 7 l3 -13 l-10 -8 l13 -1z" fill="#ffd36e" ${o}/>`;
    case "stars": return [[40,40],[160,30],[170,90]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#ffd36e" ${o}/>`).join("");
    case "plane": return `<path d="M140 70 l50 -20 l-22 40 l-8 -14z" fill="#fff" ${o}/>`;
    case "bubble": return `<circle cx="100" cy="158" r="14" fill="#f8b6c8" ${o} opacity=".95"/>`;
    case "box": return `<rect x="46" y="186" width="108" height="50" rx="6" fill="#d9b48a" ${o}/><path d="M46 200 h108" ${o}/>`;
    case "cast": return `<rect x="132" y="178" width="22" height="34" rx="8" fill="#fff" ${o}/>`;
    case "scarf": return `<path d="M64 170 q36 16 72 0 v14 q-36 14 -72 0z M118 182 v30 h14 v-28" fill="#e7837b" ${o}/>`;
    default: return "";
  }
}

function drawFigure(f) {
  if (f.img) return `<img src="${f.img}" alt="${f.name}">`;
  const o = `stroke="#2b1d16" stroke-width="3.5" stroke-linejoin="round"`;
  return `<svg viewBox="0 0 200 240" role="img" aria-label="${f.name}">
  <ellipse cx="100" cy="234" rx="52" ry="6" fill="#000" opacity=".12"/>
  <rect x="78" y="208" width="18" height="24" rx="7" fill="#2b1d16"/><rect x="104" y="208" width="18" height="24" rx="7" fill="#2b1d16"/>
  <path d="M62 222 q-2 -60 38 -62 q40 2 38 62z" fill="${f.outfit}" ${o}/>
  <path d="M64 196 q-14 -2 -12 -20 M136 196 q14 -2 12 -20" ${o} fill="none"/>
  <circle cx="100" cy="112" r="58" fill="#f8e1cb" ${o}/>
  <path d="M42 118 q-8 -40 14 -62 q20 -20 50 -16 q34 2 48 30 q10 22 2 48 l-8 -18 l-6 12 l-8 -18 l-8 10 l-6 -16 l-10 10 l-6 -14 l-10 12 l-6 -14 l-10 10 l-6 -12 l-8 14 l-4 -12 l-8 16z" fill="#3b2a22" ${o}/>
  ${eyes(f.mood)}
  ${accessory(f.acc, f.outfit)}
</svg>`;
}
