// Cadres de profil gagnés dans les jeux du site (« #c=… » à la fin de l'avatar).
// Partout où une photo de profil apparaît, on l'entoure d'un cadre dessiné (SVG animé) qui dépasse un peu de la photo.
(function () {
  const anime = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Repère : la photo est le disque de centre (50, 50) et de rayon 50 ; le dessin va de -30 à 130.
  const pt = (a, r) => [50 + r * Math.sin((a * Math.PI) / 180), 50 - r * Math.cos((a * Math.PI) / 180)];
  const f = (n) => Math.round(n * 10) / 10;
  const tourne = (s, sens = 1) => anime ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="${360 * sens} 50 50" dur="${s}s" repeatCount="indefinite"/>` : "";
  const scintille = (d, s = 1.6) => anime ? `<animate attributeName="opacity" values="1;.25;1" dur="${s}s" begin="${d}s" repeatCount="indefinite"/>` : "";
  const etoile = (x, y, s, c, d = 0) => `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="${c}">${scintille(d)}</path>`;
  // Branches de laurier de chaque côté de la photo : une tige et de grandes feuilles qui sortent du cadre
  const laurier = (c1, c2) => {
    let s = "";
    for (const cote of [1, -1]) {
      const [x0, y0] = pt(cote * 195, 60), [x1, y1] = pt(cote * 300, 60);
      s += `<path d="M${f(x0)} ${f(y0)}A60 60 0 0 ${cote > 0 ? 1 : 0} ${f(x1)} ${f(y1)}" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>`;
      for (let i = 0; i < 8; i++) {
        const a = cote * (192 - i * 14);
        for (const dehors of [1, -1]) {
          const r = 60 + dehors * 7, [x, y] = pt(a + cote * 4, r);
          const rot = a + (cote > 0 ? 90 : -90) + dehors * cote * -35 + (cote > 0 ? 180 : 0);
          s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="9.5" ry="4.2" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="${dehors > 0 ? c1 : c2}" stroke="rgba(0,0,0,.3)" stroke-width=".6"/>`;
        }
      }
      const [bx, by] = pt(cote * 302, 60);
      s += `<circle cx="${f(bx)}" cy="${f(by)}" r="3" fill="${c1}"/>`;
    }
    return s;
  };
  const anneau = (id, couleurs, w = 5) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${couleurs.map((c, i) => `<stop offset="${i / (couleurs.length - 1)}" stop-color="${c}"/>`).join("")}</linearGradient></defs><circle cx="50" cy="50" r="${50 + w / 2}" fill="none" stroke="url(#${id})" stroke-width="${w}"/>`;
  const ruban = (txt, fond, bord, texte) => `<path d="M14 99h72l-7 8 7 8H14l7-8z" fill="${bord}"/><path d="M22 96h56v18H22z" fill="${fond}" stroke="${bord}" stroke-width="1.5"/><text x="50" y="109" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="11" fill="${texte}" stroke="rgba(255,255,255,.35)" stroke-width=".3">${txt}</text>`;
  const orbite = (r, couleurs, s, sens = 1) => `<g>${tourne(s, sens)}${couleurs.map((c, i) => { const [x, y] = pt((360 / couleurs.length) * i, r); return `<circle cx="${f(x)}" cy="${f(y)}" r="2.6" fill="${c}"/>`; }).join("")}</g>`;
  const svg = (contenu) => `<svg class="cadre-svg" viewBox="-30 -30 160 160" aria-hidden="true" focusable="false">${contenu}</svg>`;

  const DESSINS = {
    // Champion de la ligue : couronne, laurier doré, étincelles qui tournent
    or: () => svg(`${laurier("#ffd23f", "#e0a800")}${anneau("cd-or", ["#fff3b0", "#ffd23f", "#b8860b", "#ffe680"], 6)}
      <g>${tourne(14)}${etoile(-14, 50, 5, "#fff3b0", 0)}${etoile(114, 50, 5, "#fff3b0", .8)}${etoile(50, 118, 4, "#ffd23f", .4)}</g>
      <g><path d="M28 -2 25 -24 38 -12 50 -30 62 -12 75 -24 72 -2Z" fill="#ffd23f" stroke="#8a6400" stroke-width="2" stroke-linejoin="round"/><path d="M28 -2h44v6H28z" fill="#e0a800" stroke="#8a6400" stroke-width="1.5"/>
      <circle cx="50" cy="-14" r="4" fill="#ff2b55" stroke="#8a6400"/><circle cx="36" cy="-8" r="2.6" fill="#22d3ee"/><circle cx="64" cy="-8" r="2.6" fill="#3ee07a"/>${etoile(50, -34, 4, "#fff", .2)}</g>
      ${ruban("N°1", "#ffd23f", "#8a6400", "#5a3c00")}`),
    // 2e : laurier argenté et étoile
    argent: () => svg(`${laurier("#eef2f8", "#aab4c2")}${anneau("cd-ar", ["#ffffff", "#c9d2de", "#7d8794", "#eef2f8"], 6)}
      <g>${tourne(16)}${etoile(-12, 50, 4, "#fff", 0)}${etoile(112, 50, 4, "#fff", .7)}</g>
      ${etoile(50, -12, 11, "#eef2f8")}<circle cx="50" cy="-12" r="3" fill="#7d8794"/>${ruban("2e", "#eef2f8", "#6b7480", "#39404a")}`),
    // 3e : laurier de bronze
    bronze: () => svg(`${laurier("#e39a5b", "#b8692c")}${anneau("cd-br", ["#ffd0a6", "#e39a5b", "#7a4a22", "#f0b07a"], 6)}
      <g>${tourne(18)}${etoile(-12, 50, 4, "#ffd0a6", .3)}${etoile(112, 50, 4, "#ffd0a6", 1)}</g>
      ${etoile(50, -12, 10, "#e39a5b")}${ruban("3e", "#e39a5b", "#7a4a22", "#3d2410")}`),
    // Top 10 : anneau néon violet, orbite en pointillés, éclairs et bannière
    top10: () => svg(`<circle cx="50" cy="50" r="64" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="6 6" opacity=".9">${anime ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite"/>` : ""}</circle>
      ${anneau("cd-t10", ["#c4b5fd", "#8b5cf6", "#ff4fa3", "#8b5cf6"], 6)}${orbite(64, ["#22d3ee", "#ffd23f", "#ff4fa3"], 6, -1)}
      <path d="M-8 30 2 30-4 44 8 44-10 66-4 50-14 50Z" fill="#ffd23f" stroke="#5b21b6" stroke-width="1.5"/><path d="M108 30 98 30 104 44 92 44 110 66 104 50 114 50Z" fill="#ffd23f" stroke="#5b21b6" stroke-width="1.5"/>
      ${ruban("TOP 10", "#8b5cf6", "#2a1a52", "#ffe680")}`),
    // Assidu : cadran d'horloge qui tourne, comète, calendrier coché
    assidu: () => svg(`<g>${tourne(30)}${Array.from({ length: 24 }, (_, i) => { const [x1, y1] = pt(i * 15, 58), [x2, y2] = pt(i * 15, i % 2 ? 62 : 66); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${i % 6 ? "#67e8f9" : "#ffd23f"}" stroke-width="${i % 6 ? 1.5 : 3}" stroke-linecap="round"/>`; }).join("")}</g>
      ${anneau("cd-as", ["#a5f3fc", "#22d3ee", "#0e7490", "#67e8f9"], 6)}
      <g>${tourne(5)}<circle cx="50" cy="-20" r="4" fill="#fff"/><path d="M50 -24a70 70 0 0 0-30 8" fill="none" stroke="#a5f3fc" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>
      <g transform="translate(78 76)"><rect x="0" y="4" width="30" height="28" rx="5" fill="#fff" stroke="#0e7490" stroke-width="2"/><path d="M0 9a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v5H0z" fill="#22d3ee"/><rect x="6" y="0" width="3" height="8" rx="1.5" fill="#0e7490"/><rect x="21" y="0" width="3" height="8" rx="1.5" fill="#0e7490"/><path d="M7 22l6 6 11-12" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`),
    // Suprême : un volant de course (jante noire, poignées roses, repère jaune) qui braque à gauche et à droite
    supreme: () => {
      const arc = (a1, a2, r) => { const [x1, y1] = pt(a1, r), [x2, y2] = pt(a2, r); return `M${f(x1)} ${f(y1)}A${r} ${r} 0 0 1 ${f(x2)} ${f(y2)}`; };
      const branche = (a) => { const [x1, y1] = pt(a - 9, 47), [x2, y2] = pt(a + 9, 47), [x3, y3] = pt(a + 6, 60), [x4, y4] = pt(a - 6, 60); return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}L${f(x4)} ${f(y4)}Z" fill="#c9ccd6" stroke="#4b4f5c" stroke-width="1.5"/>`; };
      return svg(`<circle cx="50" cy="50" r="70" fill="none" stroke="#ff4fa3" stroke-width="1.5" opacity=".55"/>
      <g>${anime ? `<animateTransform attributeName="transform" type="rotate" values="-26 50 50;26 50 50;-26 50 50" dur="2.8s" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" repeatCount="indefinite"/>` : ""}
        ${branche(90)}${branche(270)}${branche(180)}
        <circle cx="50" cy="50" r="59" fill="none" stroke="#1d1a24" stroke-width="15"/>
        <path d="${arc(40, 140, 59)}" fill="none" stroke="#ff4fa3" stroke-width="15" stroke-linecap="round"/><path d="${arc(220, 320, 59)}" fill="none" stroke="#ff4fa3" stroke-width="15" stroke-linecap="round"/>
        <path d="${arc(44, 136, 59)}" fill="none" stroke="#c21f72" stroke-width="15" stroke-dasharray="1.6 4"/><path d="${arc(224, 316, 59)}" fill="none" stroke="#c21f72" stroke-width="15" stroke-dasharray="1.6 4"/>
        <circle cx="50" cy="50" r="66.5" fill="none" stroke="#ffb3d6" stroke-width="1"/><circle cx="50" cy="50" r="51.5" fill="none" stroke="#3a3446" stroke-width="1"/>
        <rect x="44.5" y="-16" width="11" height="15" rx="2" fill="#ffd23f" stroke="#8a6400"/></g>
      <g transform="translate(90 90)"><circle r="13" fill="#ff4fa3" stroke="#fff" stroke-width="2.5"/><text y="5.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="15" fill="#fff">S</text></g>
      ${etoile(-18, 4, 5, "#ffb3d6", 0)}${etoile(118, 6, 4, "#fff", .6)}`);
    },
    // Béni des dieux : rayons, anneau arc-en-ciel, ailes et auréole
    god: () => {
      const rayons = Array.from({ length: 16 }, (_, i) => { const [x1, y1] = pt(i * 22.5, 56), [x2, y2] = pt(i * 22.5, 76); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${["#ffd23f", "#ff4fa3", "#22d3ee", "#3ee07a"][i % 4]}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`; }).join("");
      const arcs = ["#ff2b55", "#ff9f1c", "#ffd23f", "#3ee07a", "#22d3ee", "#8b5cf6"].map((c, i) => `<circle cx="50" cy="50" r="53.5" fill="none" stroke="${c}" stroke-width="7" stroke-dasharray="56.0 280.2" stroke-dashoffset="${f(-56.03 * i)}"/>`).join("");
      const plumes = `<path d="M2 38C-14 26-28 30-34 40c10-2 16 0 22 4-12 0-20 4-24 12 10-4 18-3 26 1-9 3-14 8-15 16 8-6 16-8 26-6Z" fill="#fff" stroke="#ffd23f" stroke-width="1.5" stroke-linejoin="round"/>`;
      return svg(`<g>${tourne(24)}${rayons}</g>
        <g transform="translate(-2 0)">${anime ? `<animateTransform attributeName="transform" type="rotate" values="0 2 40;-8 2 40;0 2 40" dur="1.8s" repeatCount="indefinite"/>` : ""}${plumes}</g>
        <g transform="translate(100 0) scale(-1 1)"><g transform="translate(-2 0)">${anime ? `<animateTransform attributeName="transform" type="rotate" values="0 2 40;-8 2 40;0 2 40" dur="1.8s" repeatCount="indefinite"/>` : ""}${plumes}</g></g>
        <g>${tourne(8)}${arcs}</g><circle cx="50" cy="50" r="50" fill="none" stroke="#fff" stroke-width="1.5" opacity=".8"/>
        <g>${anime ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2.4s" repeatCount="indefinite"/>` : ""}<ellipse cx="50" cy="-16" rx="26" ry="6.5" fill="none" stroke="#ffd23f" stroke-width="4"/><ellipse cx="50" cy="-16" rx="26" ry="6.5" fill="none" stroke="#fff6c2" stroke-width="1.2"/></g>
        ${orbite(70, ["#fff", "#ffd23f", "#fff", "#ff4fa3"], 9, -1)}${etoile(-20, 96, 5, "#fff", .3)}${etoile(120, 96, 5, "#ffd23f", 1)}`);
    },
  };
  const CACHE = {};
  const dessin = (c) => (CACHE[c] ||= DESSINS[c] ? DESSINS[c]() : "");

  const css = document.createElement("style");
  css.textContent = `
.cadre-deco { position: relative; display: inline-block; vertical-align: middle; flex: none; line-height: 0; border-radius: 50%; }
.cadre-deco > img { width: 100% !important; height: 100% !important; max-width: none !important; border-radius: 50% !important; object-fit: cover; display: block; margin: 0 !important; box-shadow: none !important; }
.cadre-deco > .cadre-svg { position: absolute; left: -30%; top: -30%; width: 160%; height: 160%; pointer-events: none; overflow: visible; z-index: 2; }
.cadre-deco.c-or > .cadre-svg { filter: drop-shadow(0 0 3px rgba(255, 210, 63, .7)); }
.cadre-deco.c-supreme > .cadre-svg { filter: drop-shadow(0 0 4px rgba(255, 79, 163, .8)); }
.cadre-deco.c-god > .cadre-svg { filter: drop-shadow(0 0 4px rgba(255, 255, 255, .6)); }
.cadre-deco.c-top10 > .cadre-svg { filter: drop-shadow(0 0 3px rgba(139, 92, 246, .8)); }
.cadre-deco.c-assidu > .cadre-svg { filter: drop-shadow(0 0 3px rgba(34, 211, 238, .7)); }
:has(> .cadre-deco) { overflow: visible !important; }`;
  document.head.appendChild(css);

  // Photo pas encore affichée (chargement, menu fermé…) : on attend qu'elle ait une taille
  const enAttente = new WeakSet();
  const taille = "ResizeObserver" in window ? new ResizeObserver((es) => es.forEach((e) => { if (e.contentRect.width) { taille.unobserve(e.target); enAttente.delete(e.target); decorer(e.target); } })) : null;
  const attendre = (img) => { if (enAttente.has(img)) return; enAttente.add(img); if (taille) taille.observe(img); else img.addEventListener("load", () => { enAttente.delete(img); decorer(img); }, { once: true }); };
  const cadreDe = (img) => ((img.getAttribute("src") || "").match(/#c=([a-z0-9]+)$/) || [])[1] || "";
  function decorer(img) {
    if (!img.isConnected) return;
    const c = cadreDe(img), boite = img.parentElement && img.parentElement.classList.contains("cadre-deco") ? img.parentElement : null;
    if (boite) {
      if (boite.dataset.cadre === c) return;
      if (!c || !DESSINS[c]) { boite.replaceWith(img); return; }
      boite.className = "cadre-deco c-" + c; boite.dataset.cadre = c;
      boite.querySelector(".cadre-svg").outerHTML = dessin(c);
      return;
    }
    if (!c || !DESSINS[c]) return;
    const w = img.offsetWidth, h = img.offsetHeight;
    if (!w || !h) { attendre(img); return; }
    const cs = getComputedStyle(img), s = document.createElement("span");
    s.className = "cadre-deco c-" + c; s.dataset.cadre = c;
    s.style.width = w + "px"; s.style.height = h + "px"; s.style.margin = cs.margin;
    if (cs.position === "absolute") { s.style.position = "absolute"; ["top", "left", "right", "bottom", "transform"].forEach((k) => (s.style[k] = cs[k])); }
    img.replaceWith(s); s.appendChild(img); s.insertAdjacentHTML("beforeend", dessin(c));
  }
  const tout = (racine) => racine.querySelectorAll && racine.querySelectorAll('img[src*="#c="]').forEach(decorer);
  let attente = null;
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "attributes" && m.target.tagName === "IMG") decorer(m.target);
      else m.addedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.tagName === "IMG") decorer(n); else if (!attente) attente = requestAnimationFrame(() => { attente = null; tout(document.body); }); } });
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
  addEventListener("DOMContentLoaded", () => tout(document.body));
  tout(document);

  // Catalogue des cadres à gagner sur le site, jeu par jeu
  window.BS_CADRES = {
    dessin,
    jeux: [{
      jeu: "CARDS CENTER", lien: "#/jeu/jmwdr0y57",
      cadres: [
        { id: "or", nom: "Champion de la ligue", comment: "Finir 1er de la ligue de la semaine." },
        { id: "argent", nom: "2e de la ligue", comment: "Finir 2e de la ligue de la semaine." },
        { id: "bronze", nom: "3e de la ligue", comment: "Finir 3e de la ligue de la semaine." },
        { id: "top10", nom: "Top 10 de la ligue", comment: "Finir entre la 4e et la 10e place de la ligue." },
        { id: "assidu", nom: "Assidu", comment: "Réussir 15 objectifs du jour dans la même semaine." },
        { id: "supreme", nom: "Suprême", comment: "Tirer une carte Suprême dans un booster." },
        { id: "god", nom: "Béni des dieux", comment: "Ouvrir un god pack." },
      ],
    }],
  };
})();
