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
    // Champion de la ligue : un dragon rouge enroulé autour de la photo, ailes déployées, éclairs rouges
    or: () => {
      const eclair = (x, y, r, d) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -14 7 -14 2 -3 9 -3 -5 16 -1 3 -7 3Z" fill="#ff2b2b" stroke="#ffd0d0" stroke-width="1" stroke-linejoin="round">${anime ? `<animate attributeName="opacity" values="1;.15;1;1;.4;1" dur="1.3s" begin="${d}s" repeatCount="indefinite"/>` : ""}</path></g>`;
      const pics = Array.from({ length: 9 }, (_, i) => { const a = 25 + i * 19, [x1, y1] = pt(a - 5, 66), [x2, y2] = pt(a, 74), [x3, y3] = pt(a + 5, 66); return `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}L${f(x3)} ${f(y3)}Z" fill="#7a0d12"/>`; }).join("");
      const [cx1, cy1] = pt(20, 60), [cx2, cy2] = pt(200, 60), [qx, qy] = pt(250, 60), [tx, ty] = pt(262, 61);
      return svg(`<defs><linearGradient id="cd-dr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a3c"/><stop offset=".5" stop-color="#c3121b"/><stop offset="1" stop-color="#5c0509"/></linearGradient></defs>
        <g>${anime ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 0" dur="2s" repeatCount="indefinite"/>` : ""}
          <path d="M44 -6C30 -30 8 -34 -22 -26c8 4 12 8 12 14-8-3-16-2-22 4 9 1 14 4 16 10-8 0-14 4-16 10 14-6 30-4 44 4Z" fill="#8f0a12" stroke="#ff5a3c" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M56 -6C70 -30 92 -34 122 -26c-8 4-12 8-12 14 8-3 16-2 22 4-9 1-14 4-16 10 8 0 14 4 16 10-14-6-30-4-44 4Z" fill="#8f0a12" stroke="#ff5a3c" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M-2 -22-6 -14M-12 -14-14 -4M102 -22 106 -14M112 -14 114 -4" stroke="#ff8a6b" stroke-width="1.2"/></g>
        <circle cx="50" cy="50" r="52.5" fill="none" stroke="#2a0306" stroke-width="5"/>
        ${pics}
        <path d="M${f(cx1)} ${f(cy1)}A60 60 0 0 1 ${f(cx2)} ${f(cy2)}A60 60 0 0 1 ${f(qx)} ${f(qy)}" fill="none" stroke="url(#cd-dr)" stroke-width="13" stroke-linecap="round"/>
        <path d="M${f(cx1)} ${f(cy1)}A60 60 0 0 1 ${f(cx2)} ${f(cy2)}" fill="none" stroke="#ffb199" stroke-width="2" stroke-dasharray="3 5" opacity=".7"/>
        <path d="M${f(qx)} ${f(qy)}L${f(tx - 10)} ${f(ty - 9)}L${f(tx + 2)} ${f(ty - 3)}L${f(tx - 6)} ${f(ty + 8)}Z" fill="#c3121b" stroke="#5c0509" stroke-width="1.5"/>
        <g transform="translate(${f(cx1)} ${f(cy1)}) rotate(20)">
          <path d="M-9 4C-12 -8 -6 -18 6 -20 16 -21 24 -16 28 -9L20 -6 26 -2 18 1C12 6 0 10 -9 4Z" fill="url(#cd-dr)" stroke="#5c0509" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M0 -18-6 -30 4 -20M8 -20 6 -33 13 -21" fill="#ffd23f" stroke="#8a6400" stroke-width="1"/>
          <circle cx="12" cy="-12" r="2.6" fill="#ffd23f"/><circle cx="12.6" cy="-12" r="1" fill="#000"/>
          <path d="M26 -4c6 1 9 -2 12 -6M27 0c6 3 11 2 14 0" fill="none" stroke="#ff8a3c" stroke-width="2" stroke-linecap="round">${scintille(0, .7)}</path></g>
        ${eclair(-18, 30, -15, 0)}${eclair(118, 22, 20, .45)}${eclair(-12, 100, 25, .8)}${eclair(116, 96, -20, .25)}${eclair(50, 124, 90, .6)}`);
    },
    // 2e de la ligue : une grande couronne d'argent sertie de pierres
    argent: () => svg(`${anneau("cd-ar", ["#ffffff", "#c9d2de", "#7d8794", "#eef2f8"], 6)}
      <g>${tourne(16)}${etoile(-12, 50, 4, "#fff", 0)}${etoile(112, 50, 4, "#fff", .7)}${etoile(50, 116, 4, "#e6ebf2", .3)}</g>
      <defs><linearGradient id="cd-arc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#c9d2de"/><stop offset="1" stop-color="#7d8794"/></linearGradient></defs>
      <path d="M20 4 14 -26 31 -10 40 -34 50 -16 60 -34 69 -10 86 -26 80 4Z" fill="url(#cd-arc)" stroke="#4b525c" stroke-width="2" stroke-linejoin="round"/>
      <path d="M19 0h62v8H19z" fill="#aab4c2" stroke="#4b525c" stroke-width="1.5"/>
      <circle cx="14" cy="-27" r="3.5" fill="#fff" stroke="#4b525c"/><circle cx="40" cy="-35" r="3.5" fill="#fff" stroke="#4b525c"/><circle cx="60" cy="-35" r="3.5" fill="#fff" stroke="#4b525c"/><circle cx="86" cy="-27" r="3.5" fill="#fff" stroke="#4b525c"/>
      <circle cx="50" cy="-6" r="4.5" fill="#3b82f6" stroke="#4b525c"/><circle cx="32" cy="-2" r="3" fill="#22d3ee"/><circle cx="68" cy="-2" r="3" fill="#22d3ee"/>
      <circle cx="30" cy="4" r="1.6" fill="#fff"/><circle cx="50" cy="4" r="1.6" fill="#fff"/><circle cx="70" cy="4" r="1.6" fill="#fff"/>${etoile(50, -44, 4, "#fff", .4)}`),
    // 3e de la ligue : une couronne de bronze
    bronze: () => svg(`${anneau("cd-br", ["#ffd0a6", "#e39a5b", "#7a4a22", "#f0b07a"], 6)}
      <g>${tourne(18)}${etoile(-12, 50, 4, "#ffd0a6", .3)}${etoile(112, 50, 4, "#ffd0a6", 1)}</g>
      <defs><linearGradient id="cd-brc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd0a6"/><stop offset=".55" stop-color="#d4864a"/><stop offset="1" stop-color="#7a4a22"/></linearGradient></defs>
      <path d="M24 4 20 -22 36 -8 50 -30 64 -8 80 -22 76 4Z" fill="url(#cd-brc)" stroke="#4a2a10" stroke-width="2" stroke-linejoin="round"/>
      <path d="M23 0h54v8H23z" fill="#b8692c" stroke="#4a2a10" stroke-width="1.5"/>
      <circle cx="20" cy="-23" r="3.2" fill="#ffd0a6" stroke="#4a2a10"/><circle cx="50" cy="-31" r="3.6" fill="#ffd0a6" stroke="#4a2a10"/><circle cx="80" cy="-23" r="3.2" fill="#ffd0a6" stroke="#4a2a10"/>
      <circle cx="50" cy="-6" r="4" fill="#16a34a" stroke="#4a2a10"/><circle cx="36" cy="4" r="1.6" fill="#ffe2c8"/><circle cx="64" cy="4" r="1.6" fill="#ffe2c8"/>`),
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
    // ---------- Cadres des autres jeux du site ----------
    // Golf with TEC3H : gazon, drapeau qui flotte et balle qui fait le tour
    golf: () => svg(`${anneau("cd-gf", ["#86efac", "#22c55e", "#15803d", "#4ade80"], 7)}
      ${Array.from({ length: 36 }, (_, i) => { const [x1, y1] = pt(i * 10, 56), [x2, y2] = pt(i * 10 + 3, 62 + (i % 3) * 2); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${i % 2 ? "#16a34a" : "#4ade80"}" stroke-width="2" stroke-linecap="round"/>`; }).join("")}
      <ellipse cx="88" cy="104" rx="11" ry="4" fill="#0b3d1c"/><line x1="88" y1="104" x2="88" y2="56" stroke="#f5f5f5" stroke-width="2.5"/>
      <path d="M88 56 112 63 88 71Z" fill="#ef4444" stroke="#991b1b" stroke-width="1">${anime ? `<animate attributeName="d" values="M88 56 112 63 88 71Z;M88 56 110 66 88 71Z;M88 56 112 63 88 71Z" dur="1.4s" repeatCount="indefinite"/>` : ""}</path>
      <g>${tourne(7)}<circle cx="50" cy="-16" r="6" fill="#fff" stroke="#9ca3af"/><circle cx="48" cy="-18" r=".9" fill="#cbd5e1"/><circle cx="52" cy="-16" r=".9" fill="#cbd5e1"/><circle cx="49" cy="-13" r=".9" fill="#cbd5e1"/></g>`),
    // BRELAN : des cartes à jouer qui volent autour, et des jetons
    brelan: () => {
      const carte = (a, c, coul) => { const [x, y] = pt(a, 66); return `<g transform="translate(${f(x)} ${f(y)}) rotate(${a + 15})"><rect x="-10" y="-14" width="20" height="28" rx="3" fill="#fff" stroke="#111" stroke-width="1"/><text y="6" text-anchor="middle" font-size="16" fill="${coul}" font-family="Arial, sans-serif">${c}</text></g>`; };
      return svg(`${anneau("cd-bl", ["#fde68a", "#16a34a", "#065f46", "#22c55e"], 6)}
        <g>${tourne(12)}${carte(0, "♠", "#111")}${carte(90, "♥", "#dc2626")}${carte(180, "♣", "#111")}${carte(270, "♦", "#dc2626")}</g>
        <g transform="translate(-14 96)">${[0, 5, 10].map((d, i) => `<ellipse cx="0" cy="${-d}" rx="11" ry="4.5" fill="${["#dc2626", "#2563eb", "#111"][i]}" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>`).join("")}</g>
        <g transform="translate(114 96)">${[0, 5].map((d, i) => `<ellipse cx="0" cy="${-d}" rx="11" ry="4.5" fill="${["#16a34a", "#f59e0b"][i]}" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>`).join("")}</g>
        <g transform="translate(50 -20)"><rect x="-22" y="-8" width="44" height="14" rx="4" fill="#065f46" stroke="#fde68a" stroke-width="1.5"/><text y="3" text-anchor="middle" font-size="9" font-weight="900" fill="#fde68a" font-family="Arial Black, Arial, sans-serif">BRELAN</text></g>`);
    },
    // Loup-Garou de Brumeval : pleine lune, loup qui hurle, étoiles et griffures
    loup: () => svg(`<circle cx="6" cy="2" r="24" fill="#fef3c7" opacity=".95"/><circle cx="0" cy="-4" r="4" fill="#fde68a"/><circle cx="12" cy="10" r="3" fill="#fde68a"/>
      ${anneau("cd-lg", ["#6366f1", "#1e1b4b", "#312e81", "#818cf8"], 7)}
      <g transform="translate(96 -4) rotate(-20)"><path d="M-22 26C-24 14-20 4-12 -2L-14 -16-6 -6C-2 -8 2 -8 6 -6L10 -18 12 -4C16 -2 20 0 24 -4 30 -8 34 -12 38 -12 36 -6 30 2 22 6 18 8 14 12 12 18L6 30Z" fill="#1f2937" stroke="#a5b4fc" stroke-width="1.4" stroke-linejoin="round"/><circle cx="8" cy="0" r="1.8" fill="#fde047">${scintille(.2, 2.2)}</circle><path d="M30 -10 36 -16M33 -6 40 -9" stroke="#c7d2fe" stroke-width="1.4" stroke-linecap="round">${scintille(0, 1)}</path></g>
      ${etoile(30, -18, 3, "#fff", 0)}${etoile(118, -12, 3, "#fff", .5)}${etoile(-20, 40, 3, "#c7d2fe", 1)}
      <path d="M86 92 100 112M93 89 107 109M100 86 114 106" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
      <g opacity=".55">${anime ? `<animateTransform attributeName="transform" type="translate" values="-4 0;4 0;-4 0" dur="6s" repeatCount="indefinite"/>` : ""}<ellipse cx="20" cy="112" rx="34" ry="6" fill="#c7d2fe"/><ellipse cx="72" cy="118" rx="28" ry="5" fill="#a5b4fc"/></g>`),
    // Bal Masqué : un masque vénitien à plumes et des confettis
    bal: () => svg(`${anneau("cd-bm", ["#f0abfc", "#a21caf", "#ffd23f", "#7e22ce"], 6)}
      <g>${tourne(14)}${["#ff4fa3", "#ffd23f", "#22d3ee", "#a3e635", "#f97316", "#a78bfa"].map((c, i) => { const [x, y] = pt(i * 60 + 20, 64); return `<rect x="${f(x - 2.5)}" y="${f(y - 4)}" width="5" height="8" rx="1" fill="${c}" transform="rotate(${i * 37} ${f(x)} ${f(y)})"/>`; }).join("")}</g>
      <path d="M62 -4C70 -28 78 -38 92 -44 86 -32 84 -20 80 -8Z" fill="#a855f7" stroke="#581c87" stroke-width="1"/><path d="M70 -6C82 -24 94 -30 108 -30 98 -22 92 -12 84 -4Z" fill="#ffd23f" stroke="#a16207" stroke-width="1"/>
      <path d="M18 4C18 -10 30 -16 50 -10 70 -16 82 -10 82 4 82 14 72 18 62 14 56 12 52 8 50 8 48 8 44 12 38 14 28 18 18 14 18 4Z" fill="#7e22ce" stroke="#ffd23f" stroke-width="2"/>
      <ellipse cx="36" cy="3" rx="8" ry="4.5" fill="#1e0a2e"/><ellipse cx="64" cy="3" rx="8" ry="4.5" fill="#1e0a2e"/>
      <path d="M22 -2C28 -8 34 -8 38 -6M78 -2C72 -8 66 -8 62 -6" stroke="#ffd23f" stroke-width="1.5" fill="none"/>
      <circle cx="50" cy="-8" r="3" fill="#ff4fa3" stroke="#ffd23f"/><line x1="18" y1="4" x2="2" y2="30" stroke="#ffd23f" stroke-width="2"/>`),
    // La Bousculade : une ligne d'arrivée en damier et des drapeaux à damier croisés
    bousc: () => {
      const drapeau = (sens) => `<g transform="translate(50 -6) scale(${sens} 1) rotate(-30)"><line x1="0" y1="10" x2="0" y2="-40" stroke="#d4d4d8" stroke-width="3"/><g transform="translate(0 -40)">${anime ? `<animateTransform attributeName="transform" type="translate" values="0 -40;0 -38;0 -40" dur="1s" repeatCount="indefinite" additive="replace"/>` : ""}${[0, 1, 2, 3, 4].map((x) => [0, 1, 2, 3].map((y) => `<rect x="${x * 6}" y="${y * 6}" width="6" height="6" fill="${(x + y) % 2 ? "#111" : "#fff"}"/>`).join("")).join("")}<rect width="30" height="24" fill="none" stroke="#111" stroke-width="1"/></g></g>`;
      return svg(`<circle cx="50" cy="50" r="57" fill="none" stroke="#fff" stroke-width="10"/>        <circle cx="50" cy="50" r="54.5" fill="none" stroke="#111" stroke-width="5" stroke-dasharray="6 6"/><circle cx="50" cy="50" r="59.5" fill="none" stroke="#111" stroke-width="5" stroke-dasharray="6 6" stroke-dashoffset="6"/>
        ${drapeau(1)}${drapeau(-1)}
        <g>${anime ? `<animateTransform attributeName="transform" type="translate" values="0 0;-6 0;0 0" dur=".8s" repeatCount="indefinite"/>` : ""}<path d="M-26 70h18M-30 80h22M-24 90h14" stroke="#facc15" stroke-width="3" stroke-linecap="round"/></g>
        <g>${anime ? `<animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0" dur=".8s" repeatCount="indefinite"/>` : ""}<path d="M108 70h18M108 80h22M110 90h14" stroke="#facc15" stroke-width="3" stroke-linecap="round"/></g>`);
    },
    // Zone 777 : des pièces d'or qui tournent et un bandeau 777
    z777: () => {
      const piece = (a, r) => { const [x, y] = pt(a, r); return `<g transform="translate(${f(x)} ${f(y)})"><circle r="8" fill="#facc15" stroke="#a16207" stroke-width="1.5"/><circle r="5.5" fill="none" stroke="#fde68a" stroke-width="1"/><text y="3.5" text-anchor="middle" font-size="9" font-weight="900" fill="#a16207" font-family="Arial Black, Arial, sans-serif">$</text></g>`; };
      return svg(`${anneau("cd-z7", ["#fde68a", "#facc15", "#a16207", "#fef08a"], 7)}
        <g>${tourne(9)}${[0, 60, 120, 180, 240, 300].map((a) => piece(a, 66)).join("")}</g>
        <g>${tourne(14, -1)}${etoile(-20, 50, 4, "#fff", 0)}${etoile(120, 50, 4, "#fde68a", .6)}</g>
        <g transform="translate(50 112)"><rect x="-30" y="-10" width="60" height="20" rx="5" fill="#7f1d1d" stroke="#facc15" stroke-width="2"/>${[-18, 0, 18].map((x, i) => `<rect x="${x - 7.5}" y="-7" width="15" height="14" rx="2" fill="#fff"/><text x="${x}" y="5" text-anchor="middle" font-size="12" font-weight="900" fill="#dc2626" font-family="Arial Black, Arial, sans-serif">7${scintille(i * .3, 1.2)}</text>`).join("")}</g>`);
    },
    // Cul Sec ! : deux chopes qui trinquent, de la mousse et des bulles qui montent
    culsec: () => {
      const chope = (x, r) => `<g transform="translate(${x} -6) rotate(${r})"><rect x="-10" y="-12" width="20" height="26" rx="3" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/><path d="M10 -6h5a5 5 0 0 1 0 12h-5" fill="none" stroke="#78350f" stroke-width="3"/><path d="M-12 -12c0-6 6-8 9-5 2-4 8-4 10 0 3-3 9-1 7 5Z" fill="#fff" stroke="#e5e7eb"/><path d="M-5 -6v16M0 -6v16M5 -6v16" stroke="#fbbf24" stroke-width="1.5" opacity=".6"/></g>`;
      const bulle = (x, d) => `<circle cx="${x}" cy="110" r="2.5" fill="none" stroke="#fde68a" stroke-width="1.2">${anime ? `<animate attributeName="cy" values="118;-10" dur="3s" begin="${d}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;0" dur="3s" begin="${d}s" repeatCount="indefinite"/>` : ""}</circle>`;
      return svg(`${anneau("cd-cs", ["#fde68a", "#f59e0b", "#b45309", "#fbbf24"], 7)}
        ${bulle(-14, 0)}${bulle(-8, 1.1)}${bulle(110, .5)}${bulle(116, 1.8)}${bulle(-18, 2.2)}${bulle(112, 2.6)}
        <g>${anime ? `<animateTransform attributeName="transform" type="rotate" values="0 50 0;-4 50 0;0 50 0" dur="1.2s" repeatCount="indefinite"/>` : ""}${chope(36, 14)}${chope(64, -14).replace("translate(64", "translate(64").replace('rotate(-14)', 'rotate(-14) scale(-1 1)')}</g>
        ${etoile(50, -30, 5, "#fff", .2)}`);
    },
  };
  // ---------- Cadres du podium de la ligue : de nouveaux dessins chaque semaine ----------
  // Identifiant : « l » + année ISO + semaine ISO + place (a = 1er, b = 2e, c = 3e), ex. l202647a
  // 12 créatures × 12 couleurs : la combinaison change chaque semaine et ne revient pas avant 144 semaines (presque 3 ans)
  const CREATURES = [
    { nom: "Phénix", emb: "flamme", cote: "ailes", part: "braises" },
    { nom: "Loup", emb: "flocon", cote: "pics", part: "flocons" },
    { nom: "Kraken", emb: "oeil", cote: "tentacules", part: "bulles" },
    { nom: "Aigle", emb: "plume", cote: "ailes", part: "eclairs" },
    { nom: "Serpent", emb: "croc", cote: "feuilles", part: "orbite" },
    { nom: "Lion", emb: "soleil", cote: "rayons", part: "braises" },
    { nom: "Comète", emb: "planete", cote: "cristaux", part: "orbite" },
    { nom: "Tigre", emb: "griffe", cote: "flammes", part: "eclairs" },
    { nom: "Cerf", emb: "bois", cote: "feuilles", part: "flocons" },
    { nom: "Scorpion", emb: "dard", cote: "pics", part: "braises" },
    { nom: "Lune", emb: "lune", cote: "cristaux", part: "flocons" },
    { nom: "Démon", emb: "cornes", cote: "flammes", part: "braises" },
  ];
  const COULEURS = [
    { nom: "de feu", pal: ["#fff1a8", "#ff8a00", "#c81e1e"] },
    { nom: "de givre", pal: ["#e6f8ff", "#7dd3fc", "#1d4ed8"] },
    { nom: "des abysses", pal: ["#b6f5e0", "#14b8a6", "#0f4c47"] },
    { nom: "tonnerre", pal: ["#fff7c2", "#facc15", "#7c4a03"] },
    { nom: "de jade", pal: ["#c9f7d6", "#22c55e", "#14532d"] },
    { nom: "solaire", pal: ["#fff3c4", "#f59e0b", "#92400e"] },
    { nom: "cosmique", pal: ["#efe0ff", "#a855f7", "#3b0764"] },
    { nom: "néon", pal: ["#ffd9ec", "#ff4fa3", "#7a1145"] },
    { nom: "des forêts", pal: ["#eefccf", "#84cc16", "#3f6212"] },
    { nom: "des sables", pal: ["#fdeba8", "#d97706", "#6b3409"] },
    { nom: "de cristal", pal: ["#f5f8ff", "#9fb3d1", "#30415f"] },
    { nom: "d'ombre", pal: ["#f7d6ff", "#c026d3", "#2a0a4a"] },
  ];
  const PLACES = { a: { n: "1er", met: ["#fff6c2", "#ffd23f", "#b7791f"], txt: "#4a2c00" }, b: { n: "2e", met: ["#ffffff", "#c9d2de", "#6b7480"], txt: "#2b3038" }, c: { n: "3e", met: ["#ffe0c2", "#d4864a", "#6e3d15"], txt: "#3d1f08" } };
  const HEBDO = /^l(\d{4})(\d{2})([abc])$/;
  const themeDe = (an, sem) => {
    const n = (an - 2026) * 53 + sem - 47, mod = (x) => ((x % 12) + 12) % 12, c = mod(n), q = mod(Math.floor(n / 12));
    const cr = CREATURES[c], co = COULEURS[(c + q * 5) % 12];
    return Object.assign({}, cr, { nom: `${cr.nom} ${co.nom}`, pal: co.pal });
  };
  // ---------- Dessins des cadres de podium (une créature par semaine) ----------
  const r1 = (n) => Math.round(n * 10) / 10;
  // Tube effilé lissé (tentacules, queues, mèches, cornes…) : liste de points, largeur au départ et à la fin
  const tube = (pts, w0, w1) => {
    const P = [pts[0], ...pts, pts[pts.length - 1]], S = [];
    for (let i = 1; i < P.length - 2; i++) for (let k = 0; k < 8; k++) {
      const t = k / 8, [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const q = (a) => .5 * (2 * p1[a] + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t * t * t);
      S.push([q(0), q(1)]);
    }
    S.push(pts[pts.length - 1]);
    const G = [], D = [];
    S.forEach((p, i) => {
      const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const w = (w0 + (w1 - w0) * (i / (S.length - 1))) / 2, nx = -dy / l * w, ny = dx / l * w;
      G.push([p[0] + nx, p[1] + ny]); D.push([p[0] - nx, p[1] - ny]);
    });
    return "M" + [...G, ...D.reverse()].map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
  };
  const lin = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map((c, i) => `<stop offset="${r1(i / (stops.length - 1))}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  const rad = (id, stops, cx = .5, cy = .5, r = .5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map((c, i) => `<stop offset="${r1(i / (stops.length - 1))}" stop-color="${c}"${c === "transparent" ? ' stop-opacity="0"' : ""}/>`).join("")}</radialGradient>`;
  const flou = (id, s = 2.4) => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${s}"/></filter>`;
  const an = (attr, vals, dur, extra = "") => anime ? `<animate attributeName="${attr}" values="${vals}" dur="${dur}s" repeatCount="indefinite"${extra}/>` : "";
  // « additive=sum » : la rotation s'ajoute à la position du groupe au lieu de la remplacer
  const rot = (vals, dur, extra = "") => anime ? `<animateTransform attributeName="transform" type="rotate" values="${vals}" dur="${dur}s" repeatCount="indefinite" additive="sum"${extra}/>` : "";
  const ease = ' calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"';
  const cligne = (d) => anime ? `<animateTransform attributeName="transform" type="scale" values="1 1;1 1;1 .1;1 1" keyTimes="0;.9;.95;1" dur="${d}s" repeatCount="indefinite" additive="sum"/>` : "";
  // Particules qui montent (braises, bulles) ou qui tombent (neige, feuilles)
  const monte = (liste, forme, dur, sens = -1) => !anime ? "" : liste.map(([x, d, dx = 0]) => `<g>${anime ? `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${sens * 120}" dur="${dur}s" begin="${d}s" repeatCount="indefinite"/>` : ""}<g transform="translate(${x} ${sens < 0 ? 118 : -24})">${forme}${an("opacity", "0;1;1;0", dur, ` begin="${d}s"`)}</g></g>`).join("");

  // Plume : longue forme effilée avec sa nervure
  const plume = (l, w, fill, nerv) => `<path d="M0 0C${w} ${-l * .25} ${w * .9} ${-l * .75} 0 ${-l}C${-w * .9} ${-l * .75} ${-w} ${-l * .25} 0 0Z" fill="${fill}"/><path d="M0 -1V${-l * .9}" stroke="${nerv}" stroke-width=".7" opacity=".7"/>`;
  // Aile déployée (côté gauche, épaule en (ex, ey)) : 3 rangées de plumes qui s'ouvrent en éventail
  const aile = (P, g, ex, ey, n = 8, base = -168, pas = 11, long = 44) => {
    let s = "";
    for (let i = 0; i < n; i++) s += `<g transform="translate(${ex} ${ey}) rotate(${base + i * pas + 90})">${plume(long - i * 2.2, 7, `url(#${g}p)`, P[2])}</g>`;
    for (let i = 0; i < n - 1; i++) s += `<g transform="translate(${ex + 2} ${ey + 2}) rotate(${base + 6 + i * pas + 90})">${plume(28 - i * 1.4, 7.5, `url(#${g}s)`, P[2])}</g>`;
    for (let i = 0; i < n - 2; i++) s += `<g transform="translate(${ex + 4} ${ey + 3}) rotate(${base + 12 + i * pas + 90})">${plume(15, 7, `url(#${g}c)`, P[2])}</g>`;
    return s;
  };
  const defsAile = (g, P) => lin(g + "p", [P[2], P[1], P[0]], 0, 1, 0, 0) + lin(g + "s", [P[2], P[1]], 0, 1, 0, 0) + lin(g + "c", [P[1], P[0]], 0, 1, 0, 0);
  // Œil brillant qui cligne
  const oeil = (x, y, rx, ry, iris, fente = false, d = 4.5) => `<g transform="translate(${x} ${y})"><g>${cligne(d)}<ellipse rx="${rx}" ry="${ry}" fill="${iris}"/><ellipse rx="${rx}" ry="${ry}" fill="url(#oeilBrille)" opacity=".7"/>${fente ? `<ellipse rx="${rx * .22}" ry="${ry * .9}" fill="#000"/>` : `<circle r="${Math.min(rx, ry) * .55}" fill="#000"/>`}<circle cx="${-rx * .3}" cy="${-ry * .35}" r="${Math.min(rx, ry) * .3}" fill="#fff"/></g></g>`;
  const DEFS_COMMUNS = `<defs>${rad("oeilBrille", ["#fff", "transparent"], .35, .3, .7)}</defs>`;

  const miroir = (s) => `${s}<g transform="translate(100 0) scale(-1 1)">${s}</g>`;
  const CREA = {};
  // Phénix : grandes ailes de plumes qui battent, tête à crête de flammes, longues plumes de queue, braises
  CREA.flamme = (P, g) => `<defs>${defsAile(g, P)}${rad(g + "h", [P[0], P[1], P[2]], .4, .35, .7)}${rad(g + "aura", [P[1], "transparent"])}${lin(g + "q", [P[1], P[0]], 0, 0, 0, 1)}${flou(g + "f", 3)}</defs>
    <ellipse cx="50" cy="-6" rx="62" ry="26" fill="url(#${g}aura)" opacity=".6">${an("opacity", ".35;.7;.35", 2.4)}</ellipse>
    ${miroir(`<g>${rot("0 16 10;-9 16 10;0 16 10", 1.6, ease)}${aile(P, g, 18, 12, 9, -176, 12, 58)}</g>`)}
    ${[-16, 0, 16].map((dx, i) => `<path d="${tube([[50 + dx * .3, 100], [50 + dx, 112], [50 + dx * 1.9, 124], [50 + dx * 2.6, 128]], 6, 1.5)}" fill="url(#${g}q)">${rot(`0 50 100;${i % 2 ? 4 : -4} 50 100;0 50 100`, 2 + i * .3)}</path>`).join("")}
    <g transform="translate(50 -8)">
      ${[-10, -5, 0, 5, 10].map((a, i) => `<path d="M0 -8C${a * .6 - 3} -16 ${a * 1.4} -22 ${a * 1.2} ${-30 + Math.abs(a) * .8}C${a * .5 + 3} -20 ${a * .3 + 2} -14 0 -8Z" fill="${i % 2 ? P[0] : P[1]}" stroke="${P[2]}" stroke-width=".6">${rot(`0 0 -8;${i % 2 ? 6 : -6} 0 -8;0 0 -8`, .9 + i * .17)}</path>`).join("")}
      <path d="M-11 14C-14 2-9 -10 0 -11 9 -10 14 2 11 14Z" fill="url(#${g}h)" stroke="${P[2]}" stroke-width="1"/>
      <path d="M-4 3 0 13 4 3Z" fill="#ffd23f" stroke="#7a4a00" stroke-width=".8"/>
      ${oeil(-5, -1, 2.6, 2.2, "#fff2a8")}${oeil(5, -1, 2.6, 2.2, "#fff2a8")}
    </g>
    ${monte([[-16, 0, 6], [-6, 1.1, -5], [108, .5, -6], [116, 1.7, 4], [-12, 2.2, 8], [112, 2.7, -3], [50, 1.4, 0]], `<circle r="1.8" fill="${P[0]}"/><circle r="3.5" fill="${P[1]}" opacity=".35"/>`, 3.4)}`;

  // Loup : tête de loup de face (oreilles, fourrure, yeux qui brillent et clignent), givre et neige qui tombe
  CREA.flocon = (P, g) => {
    const touffes = (cote) => `<path d="M${50 + cote * 8} 6L${50 + cote * 19} 2L${50 + cote * 17} -3L${50 + cote * 23} -6L${50 + cote * 19} -10L${50 + cote * 22} -15L${50 + cote * 15} -14Z" fill="url(#${g}f)"/>`;
    return `<defs>${lin(g + "f", [P[0], P[1], P[2]])}${lin(g + "m", ["#fff", P[0]])}${lin(g + "i", [P[2], P[1]], 0, 0, 1, 1)}${lin(g + "gl", ["#ffffff", P[0], P[1]], 0, 0, 0, 1)}</defs>
      ${Array.from({ length: 13 }, (_, i) => { const a = 108 + i * 12, l = 66 + (i % 3) * 5, [x1, y1] = pt(a - 4, 55), [x2, y2] = pt(a, l), [x3, y3] = pt(a + 4, 55); return `<path d="M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}L${r1(x3)} ${r1(y3)}Z" fill="url(#${g}gl)" stroke="${P[2]}" stroke-width=".5"/><path d="M${r1(x1 + (x2 - x1) * .2)} ${r1(y1 + (y2 - y1) * .2)}L${r1(x2)} ${r1(y2)}" stroke="#fff" stroke-width=".8" opacity=".8"/>`; }).join("")}
      <g transform="translate(50 0) scale(1.28) translate(-50 0)"><g>${rot("0 50 6;-2 50 6;0 50 6;2 50 6;0 50 6", 6)}
        <path d="M33 -6 30 -32 45 -14Z" fill="url(#${g}f)" stroke="${P[2]}" stroke-width="1"/><path d="M34 -10 32 -26 42 -15Z" fill="url(#${g}i)"/>
        <path d="M67 -6 70 -32 55 -14Z" fill="url(#${g}f)" stroke="${P[2]}" stroke-width="1"/><path d="M66 -10 68 -26 58 -15Z" fill="url(#${g}i)"/>
        ${touffes(-1)}${touffes(1)}
        <path d="M50 -20C38 -20 31 -12 31 -2 31 6 38 10 42 14L50 22 58 14C62 10 69 6 69 -2 69 -12 62 -20 50 -20Z" fill="url(#${g}f)" stroke="${P[2]}" stroke-width="1"/>
        <path d="M50 -12C46 -6 43 2 43 8 45 14 48 17 50 18 52 17 55 14 57 8 57 2 54 -6 50 -12Z" fill="url(#${g}m)"/>
        <path d="M40 -10 45 -6M60 -10 55 -6M38 -2 42 -1M62 -2 58 -1" stroke="${P[2]}" stroke-width=".8" opacity=".6"/>
        ${oeil(43, -3, 3.2, 2, P[1], true, 5)}${oeil(57, -3, 3.2, 2, P[1], true, 5)}
        <path d="M46.5 12C48 10.5 52 10.5 53.5 12 52 14.5 48 14.5 46.5 12Z" fill="#111"/><path d="M50 14.5V17M47 18Q50 20 53 18" stroke="#111" stroke-width=".9" fill="none"/>
      </g></g>
      ${monte([[-20, 0, 8], [-8, 1.3, 4], [10, 2.6, 6], [88, .7, -6], [106, 1.9, -4], [120, 3.1, -8], [40, 3.8, 3], [66, .3, -3]], `<g>${rot("0;360", 4)}<path d="M0 -2.6V2.6M-2.3 -1.3 2.3 1.3M-2.3 1.3 2.3 -1.3" stroke="#fff" stroke-width=".9" stroke-linecap="round"/></g>`, 4.5, 1)}`;
  };

  // Kraken : manteau et grand œil au sommet, quatre tentacules à ventouses qui ondulent, bulles
  CREA.oeil = (P, g) => {
    const tent = (pts, w, d, k) => `<g>${rot(`0 ${pts[0][0]} ${pts[0][1]};${k * 5} ${pts[0][0]} ${pts[0][1]};0 ${pts[0][0]} ${pts[0][1]};${-k * 3} ${pts[0][0]} ${pts[0][1]};0 ${pts[0][0]} ${pts[0][1]}`, d)}<path d="${tube(pts, w, 1.2)}" fill="url(#${g}t)" stroke="${P[2]}" stroke-width=".8"/>${pts.slice(1, -1).map(([x, y], i) => `<circle cx="${r1(x + (50 - x) * .05)}" cy="${r1(y + (50 - y) * .05)}" r="${r1(w * .16 * (1 - i / pts.length))}" fill="${P[0]}" stroke="${P[2]}" stroke-width=".4"/>`).join("")}</g>`;
    return `<defs>${lin(g + "t", [P[1], P[2]], 0, 0, 1, 1)}${rad(g + "m", [P[0], P[1], P[2]], .45, .35, .75)}</defs>
      ${tent([[22, 96], [4, 104], [-14, 92], [-20, 70], [-12, 56], [-4, 60]], 11, 5.2, 1)}
      ${tent([[78, 96], [96, 104], [114, 92], [120, 70], [112, 56], [104, 60]], 11, 5.8, -1)}
      ${tent([[16, 30], [-2, 22], [-16, 28], [-22, 42], [-14, 48]], 8, 4.4, -1)}
      ${tent([[84, 30], [102, 22], [116, 28], [122, 42], [114, 48]], 8, 4.8, 1)}
      <g>${rot("0 50 0;-3 50 0;0 50 0;3 50 0;0 50 0", 7)}
        <path d="M24 6C22 -18 36 -32 50 -32 64 -32 78 -18 76 6 66 0 34 0 24 6Z" fill="url(#${g}m)" stroke="${P[2]}" stroke-width="1.2"/>
        ${[[36, -20, 2.2], [62, -22, 1.8], [44, -27, 1.4], [68, -12, 1.6], [30, -8, 1.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P[0]}" opacity=".55"/>`).join("")}
        <path d="M37 -9C42 -16 58 -16 63 -9 58 -2 42 -2 37 -9Z" fill="#fff8d0" stroke="${P[2]}" stroke-width="1"/>
        ${oeil(50, -9, 6, 5.2, "#ffcf3f", true, 3.8)}
      </g>
      ${monte([[-14, 0, 4], [-4, 1.4, -3], [104, .6, 3], [114, 2, -4], [-20, 2.6, 5], [118, 3.1, -2]], `<circle r="2.6" fill="none" stroke="${P[0]}" stroke-width="1"/><circle cx="-.8" cy="-.9" r=".8" fill="#fff"/>`, 3.6)}`;
  };

  // Aigle : ailes brunes à pointes claires qui battent, tête blanche de profil au bec crochu, éclairs
  CREA.plume = (P, g) => {
    const eclair = (x, y, r, d, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 -14 7 -14 2 -3 9 -3 -5 16 -1 3 -7 3Z" fill="#fffbe0" filter="url(#${g}fl)"/><path d="M0 -14 7 -14 2 -3 9 -3 -5 16 -1 3 -7 3Z" fill="${P[0]}" stroke="${P[1]}" stroke-width=".8" stroke-linejoin="round"/>${an("opacity", "0;0;1;.2;1;0", 2.2, ` begin="${d}s" keyTimes="0;.55;.6;.66;.72;1"`)}</g>`;
    return `<defs>${lin(g + "p", [P[2], "#3a2414", "#f4ead2"], 0, 1, 0, 0)}${lin(g + "s", [P[2], "#5a3a1e"], 0, 1, 0, 0)}${lin(g + "c", ["#6b4423", P[1]], 0, 1, 0, 0)}${lin(g + "t", ["#ffffff", "#e6e2d6"])}${flou(g + "fl", 2)}</defs>
      ${miroir(`<g>${rot("0 16 8;-11 16 8;0 16 8", 1.8, ease)}${aile(P, g, 16, 8, 9, -172, 10, 46)}</g>`)}
      ${eclair(-18, 34, -15, 0)}${eclair(118, 26, 20, .7)}${eclair(-12, 98, 25, 1.3, .8)}${eclair(114, 96, -20, .35, .8)}
      <g transform="translate(50 -6)">${rot("0 0 10;-4 0 10;0 0 10;3 0 10;0 0 10", 5)}
        <path d="M-12 16C-15 4-10 -12 2 -14 12 -15 18 -8 18 0 18 6 14 10 8 12 4 16-4 20-12 16Z" fill="url(#${g}t)" stroke="#8a8274" stroke-width="1"/>
        <path d="M-12 16-14 22-6 20-8 26 0 21 2 27 6 19Z" fill="#e6e2d6" stroke="#8a8274" stroke-width=".6"/>
        <path d="M14 -4C22 -6 28 -2 28 4 28 9 24 11 21 9 22 6 20 3 15 3Z" fill="#ffc21a" stroke="#7a4a00" stroke-width="1"/><path d="M15 3C18 4 20 6 21 9" stroke="#7a4a00" stroke-width=".8" fill="none"/>
        <path d="M3 -7C7 -9 12 -8 14 -5" stroke="#5a5040" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        ${oeil(8, -3, 2.6, 2.4, "#ffb000", false, 6)}
      </g>`;
  };

  // Serpent : long corps à écailles enroulé autour de la photo, tête au sommet, langue qui sort
  CREA.croc = (P, g) => {
    const corps = Array.from({ length: 15 }, (_, i) => { const a = 66 + i * 21.5, r = 61 + Math.sin(i * 1.3) * 3; return pt(a, r); });
    return `<defs>${lin(g + "c", [P[0], P[1], P[2]], 0, 0, 1, 1)}${lin(g + "v", ["#fff8d6", P[0]])}
        <pattern id="${g}e" width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0 5A3 3 0 0 1 6 5" fill="none" stroke="${P[2]}" stroke-width=".7" opacity=".7"/><path d="M-3 2.5A3 3 0 0 1 3 2.5M3 2.5A3 3 0 0 1 9 2.5" fill="none" stroke="${P[2]}" stroke-width=".7" opacity=".7"/></pattern></defs>
      <path d="${tube(corps, 4, 11)}" fill="url(#${g}c)" stroke="${P[2]}" stroke-width="1"/>
      <path d="${tube(corps, 4, 11)}" fill="url(#${g}e)"/>
      <path d="${tube(corps.map(([x, y]) => [x + (50 - x) * .04, y + (50 - y) * .04]), 1, 3)}" fill="#fff" opacity=".35"/>
      <g transform="translate(${r1(corps[14][0])} ${r1(corps[14][1] - 6)}) scale(1.45) rotate(-4)">${rot("0 0 4;-6 0 4;0 0 4;5 0 4;0 0 4", 4)}
        <g>${anime ? `<animateTransform attributeName="transform" type="scale" values="1 0;1 0;1 1;1 .2;1 1;1 0" keyTimes="0;.6;.66;.72;.78;1" dur="2.6s" repeatCount="indefinite"/>` : ""}<path d="M0 -8V-16M0 -16-3 -20M0 -16 3 -20" stroke="#ff2e56" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>
        <path d="M0 10C-10 10-13 2-12 -3-10 -9-5 -11 0 -11 5 -11 10 -9 12 -3 13 2 10 10 0 10Z" fill="url(#${g}c)" stroke="${P[2]}" stroke-width="1.1"/>
        <path d="M0 10C-10 10-13 2-12 -3-10 -9-5 -11 0 -11 5 -11 10 -9 12 -3 13 2 10 10 0 10Z" fill="url(#${g}e)"/>
        <path d="M-4 -9C-2 -6 2 -6 4 -9" stroke="${P[2]}" stroke-width=".8" fill="none"/>
        ${oeil(-6, -2, 2.8, 3.2, "#ffd23f", true, 4.2)}${oeil(6, -2, 2.8, 3.2, "#ffd23f", true, 4.2)}
        <circle cx="-2" cy="-9" r=".7" fill="#111"/><circle cx="2" cy="-9" r=".7" fill="#111"/>
      </g>
      `;
  };

  // Lion : crinière de mèches tout autour (qui ondule), tête de lion au sommet, halo solaire
  CREA.soleil = (P, g) => {
    const meches = Array.from({ length: 26 }, (_, i) => { const a = -150 + i * 12, l = 70 + (i % 3) * 5 + (Math.abs(a) < 60 ? 6 : 0); const [x0, y0] = pt(a, 54), [x1, y1] = pt(a + 4, (54 + l) / 2), [x2, y2] = pt(a + (i % 2 ? 9 : -2), l); return `<path d="${tube([[x0, y0], [x1, y1], [x2, y2]], 9, 1)}" fill="url(#${g}m)" stroke="${P[2]}" stroke-width=".6"/>`; }).join("");
    return `<defs>${lin(g + "m", [P[0], P[1], P[2]], 0, 0, 1, 1)}${rad(g + "a", [P[0], "transparent"])}${rad(g + "v", [P[0], P[1], P[2]], .5, .45, .75)}</defs>
      <circle cx="50" cy="50" r="84" fill="url(#${g}a)" opacity=".5">${an("r", "78;88;78", 3)}</circle>
      <g>${rot("0 50 50;2 50 50;0 50 50;-2 50 50;0 50 50", 6)}${meches}</g>
      <g transform="translate(50 -8)">
        <path d="M-15 -4C-15 -16-6 -21 0 -21 6 -21 15 -16 15 -4 15 8 9 17 0 19-9 17-15 8-15 -4Z" fill="url(#${g}v)" stroke="${P[2]}" stroke-width="1.1"/>
        <path d="M-15 -14-18 -20-11 -18Z M15 -14 18 -20 11 -18Z" fill="${P[1]}" stroke="${P[2]}" stroke-width=".8"/>
        <path d="M-8 5C-8 14 8 14 8 5 5 1-5 1-8 5Z" fill="#fff6e0"/><path d="M-3 -16C-1 -10 1 -10 3 -16" fill="none" stroke="${P[0]}" stroke-width="2" opacity=".6"/>
        <path d="M-3.5 3.5C-2 2 2 2 3.5 3.5 2.5 6 -2.5 6 -3.5 3.5Z" fill="#3a1a0a"/><path d="M0 6V9M-4 10Q0 12 4 10" stroke="#3a1a0a" stroke-width="1" fill="none"/>
        <path d="M-9 -7Q-5 -10-2 -7M9 -7Q5 -10 2 -7" stroke="${P[2]}" stroke-width="1.2" fill="none"/>
        ${oeil(-6, -3.5, 2.6, 2, "#ffb000", false, 5.5)}${oeil(6, -3.5, 2.6, 2, "#ffb000", false, 5.5)}
        <path d="M-1 -12V-6M1 -12V-6" stroke="${P[2]}" stroke-width=".6" opacity=".5"/>
      </g>`;
  };

  // Comète : nébuleuse, planète à anneaux au sommet, comète qui fait le tour de la photo, étoiles qui scintillent
  CREA.planete = (P, g) => `<defs>${rad(g + "n", [P[1], "transparent"])}${rad(g + "p", [P[0], P[1], P[2]], .35, .3, .8)}${lin(g + "q", ["transparent", P[0], "#fff"], 0, 0, 1, 0)}${flou(g + "fl", 1.5)}</defs>
    <ellipse cx="-8" cy="14" rx="26" ry="20" fill="url(#${g}n)" opacity=".55">${an("opacity", ".3;.6;.3", 4)}</ellipse><ellipse cx="110" cy="88" rx="24" ry="22" fill="url(#${g}n)" opacity=".5">${an("opacity", ".55;.25;.55", 5)}</ellipse>
    ${[[-20, 10, 0], [118, 30, .7], [-14, 108, 1.4], [114, 116, .3], [8, -22, 1.1], [96, -24, 1.8], [124, 70, 2.2], [-24, 60, .5]].map(([x, y, d]) => etoile(x, y, 3.2, "#fff", d)).join("")}
    <circle cx="50" cy="50" r="64" fill="none" stroke="${P[0]}" stroke-width=".7" stroke-dasharray="1 4" opacity=".7"/>
    <g>${anime ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite"/>` : ""}
      <path d="M50 -14A64 64 0 0 0 4 4" fill="none" stroke="url(#${g}q)" stroke-width="5" stroke-linecap="round" opacity=".85" transform="rotate(180 50 50) scale(1 1)"/>
      <circle cx="50" cy="114" r="5" fill="#fff" filter="url(#${g}fl)"/><circle cx="50" cy="114" r="3" fill="#fff"/></g>
    <g transform="translate(50 -12)">${rot("0;-10;0", 8)}
      <circle r="13" fill="url(#${g}p)" stroke="${P[2]}" stroke-width=".8"/>
      <path d="M-11 -3C-4 -6 6 -6 12 -2M-12 4C-4 1 6 2 12 5" stroke="${P[0]}" stroke-width="1.3" fill="none" opacity=".55"/>
      <ellipse rx="25" ry="6" fill="none" stroke="${P[0]}" stroke-width="2.6" transform="rotate(-16)" stroke-dasharray="40 0"/>
      <path d="M-13 3A13 13 0 0 0 13 -3" transform="rotate(-16)" fill="none" stroke="url(#${g}p)" stroke-width="0"/>
      <ellipse rx="25" ry="6" fill="none" stroke="#fff" stroke-width=".6" transform="rotate(-16)" opacity=".6"/>
    </g>`;

  // Tigre : tête de tigre rayée au sommet, griffures lumineuses sur les côtés, anneau rayé
  CREA.griffe = (P, g) => {
    const griffures = (x, y, r, d) => `<g transform="translate(${x} ${y}) rotate(${r})">${[-6, 0, 6].map((dx) => `<path d="M${dx - 4} -14Q${dx + 4} 0 ${dx - 2} 14" fill="none" stroke="${P[1]}" stroke-width="3.2" stroke-linecap="round" filter="url(#${g}fl)"/><path d="M${dx - 4} -14Q${dx + 4} 0 ${dx - 2} 14" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>`).join("")}${an("opacity", ".3;1;.3", 1.6, ` begin="${d}s"`)}</g>`;
    return `<defs>${lin(g + "f", ["#ffb347", "#ff7a1a", "#c2410c"])}${flou(g + "fl", 1.8)}</defs>
      <circle cx="50" cy="50" r="59" fill="none" stroke="#1a1a1a" stroke-width="5" stroke-dasharray="3 7"/>
      ${griffures(-14, 50, -10, 0)}${griffures(114, 50, 10, .8)}
      <g transform="translate(50 -8)">${rot("0 0 10;-3 0 10;0 0 10;3 0 10;0 0 10", 5)}
        <path d="M-16 -12-14 -22-6 -17Z M16 -12 14 -22 6 -17Z" fill="url(#${g}f)" stroke="#2a1205" stroke-width="1"/><path d="M-14 -14-13 -19-9 -16Z M14 -14 13 -19 9 -16Z" fill="#fff"/>
        <path d="M0 -19C-12 -19-18 -10-18 -1-18 6-13 12-8 15L0 20 8 15C13 12 18 6 18 -1 18 -10 12 -19 0 -19Z" fill="url(#${g}f)" stroke="#2a1205" stroke-width="1.1"/>
        <path d="M-10 4C-8 13 8 13 10 4 6 1-6 1-10 4Z" fill="#fff8ef"/><path d="M-17 2-11 1-16 6Z M17 2 11 1 16 6Z" fill="#fff8ef"/>
        <path d="M0 -19-2 -13 0 -9 2 -13Z M-7 -17-6 -12M7 -17 6 -12M-17 -6-11 -5M-17 -2-12 -1M17 -6 11 -5M17 -2 12 -1" stroke="#1a0d05" stroke-width="1.5" fill="#1a0d05" stroke-linecap="round"/>
        ${oeil(-6, -5, 3, 2.2, "#7dff6a", true, 4.8)}${oeil(6, -5, 3, 2.2, "#7dff6a", true, 4.8)}
        <path d="M-3 2C-1.5 .5 1.5 .5 3 2 2 4.5-2 4.5-3 2Z" fill="#e0607a"/><path d="M0 4.5V7M-4 8Q0 10 4 8" stroke="#1a0d05" stroke-width=".9" fill="none"/>
      </g>`;
  };

  // Cerf : tête de cerf aux grands bois, feuilles qui tombent, lucioles
  CREA.bois = (P, g) => {
    const bois = (k) => `<path d="${tube([[50 + k * 5, -12], [50 + k * 10, -20], [50 + k * 22, -26], [50 + k * 36, -28]], 4.5, 1.6)}" fill="url(#${g}b)"/>
      <path d="${tube([[50 + k * 14, -22], [50 + k * 14, -32], [50 + k * 10, -40]], 3, 1)}" fill="url(#${g}b)"/>
      <path d="${tube([[50 + k * 24, -26], [50 + k * 28, -36], [50 + k * 26, -44]], 2.8, 1)}" fill="url(#${g}b)"/>
      <path d="${tube([[50 + k * 32, -27], [50 + k * 40, -34], [50 + k * 42, -42]], 2.4, .8)}" fill="url(#${g}b)"/>`;
    return `<defs>${lin(g + "b", ["#f4ead2", "#c9a97a", "#7a5a32"], 0, 0, 1, 1)}${lin(g + "t", ["#c98a4a", "#8a5226"])}${rad(g + "l", ["#fff9b0", "transparent"])}</defs>
      ${laurier(P[1], P[2])}
      <g>${rot("0 50 0;-2 50 0;0 50 0;2 50 0;0 50 0", 6)}${bois(-1)}${bois(1)}
        <path d="M37 -12 28 -18 34 -8Z M63 -12 72 -18 66 -8Z" fill="url(#${g}t)" stroke="#4a2a10" stroke-width=".8"/>
        <path d="M50 -16C42 -16 38 -10 38 -4 38 4 44 12 46 18 47 21 53 21 54 18 56 12 62 4 62 -4 62 -10 58 -16 50 -16Z" fill="url(#${g}t)" stroke="#4a2a10" stroke-width="1"/>
        <path d="M50 -8C47 -2 46 8 47 16 48 19 52 19 53 16 54 8 53 -2 50 -8Z" fill="#e8c9a0" opacity=".7"/>
        <ellipse cx="50" cy="17" rx="3.4" ry="2.4" fill="#2a1508"/>
        ${oeil(43.5, -3, 2.4, 2.4, "#3a1d0a", false, 6.2)}${oeil(56.5, -3, 2.4, 2.4, "#3a1d0a", false, 6.2)}
      </g>
      ${monte([[-18, 0, 10], [8, 1.6, 6], [92, .8, -8], [118, 2.4, -6], [40, 3.2, 4]], `<g>${rot("0;40;-20;0", 3)}<path d="M0 -4C3 -2 3 2 0 4-3 2-3 -2 0 -4Z" fill="${P[1]}" stroke="${P[2]}" stroke-width=".4"/><path d="M0 -4V4" stroke="${P[2]}" stroke-width=".4"/></g>`, 5, 1)}
      ${[[-16, 30, 0], [116, 40, 1], [-8, 80, 2], [110, 86, .5], [20, -20, 1.5]].map(([x, y, d]) => `<circle cx="${x}" cy="${y}" r="4" fill="url(#${g}l)">${an("opacity", "0;1;0", 2.4, ` begin="${d}s"`)}</circle><circle cx="${x}" cy="${y}" r="1" fill="#fffde0">${an("opacity", "0;1;0", 2.4, ` begin="${d}s"`)}</circle>`).join("")}`;
  };

  // Scorpion : pinces qui agrippent la photo, queue segmentée qui passe au-dessus, dard qui goutte
  CREA.dard = (P, g) => {
    const seg = Array.from({ length: 17 }, (_, i) => { const a = 120 - i * 6.6, r = 63 + Math.sin(i / 16 * Math.PI) * 9; return [pt(a, r), a]; });
    const pince = (k) => `<g transform="translate(${50 + k * 60} 86) scale(${k} 1)">
      <path d="${tube([[-14, 22], [-4, 14], [2, 4], [6, -4]], 7, 6)}" fill="url(#${g}c)" stroke="${P[2]}" stroke-width=".8"/>
      <g transform="translate(6 -4)">${rot("0 0 0;-10 0 0;0 0 0", 1.6, ease)}
        <path d="M0 0C-2 -8 0 -16 8 -20 14 -22 18 -18 16 -12 14 -14 10 -14 8 -12 6 -8 6 -4 4 0Z" fill="url(#${g}s)" stroke="${P[2]}" stroke-width=".9"/>
        <path d="M2 -2C6 -6 12 -6 16 -4 13 -2 8 0 4 2Z" fill="url(#${g}s)" stroke="${P[2]}" stroke-width=".9"/>
        <path d="M4 -14 9 -16" stroke="#fff" stroke-width="1" opacity=".6" stroke-linecap="round"/></g></g>`;
    return `<defs>${lin(g + "c", [P[0], P[1], P[2]], 0, 0, 1, 1)}${rad(g + "s", [P[0], P[1], P[2]], .35, .3, .8)}${flou(g + "fl", 1.2)}</defs>
      ${pince(-1)}${pince(1)}
      <g>${rot("0 50 50;-4 50 50;0 50 50", 3.2, ease)}
        ${seg.map(([[x, y], a], i) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(6.8 - i * .2)}" ry="${r1(5 - i * .15)}" fill="url(#${g}s)" stroke="${P[2]}" stroke-width=".8" transform="rotate(${r1(a + 90)} ${r1(x)} ${r1(y)})"/><path d="M${r1(x - 2)} ${r1(y - 2)}l2 -1" stroke="#fff" stroke-width=".8" opacity=".6"/>`).join("")}
        <g transform="translate(${r1(seg[16][0][0])} ${r1(seg[16][0][1])}) rotate(${r1(seg[16][1] - 80)})">
          <path d="M-5 2C-6 -6 0 -11 6 -10 10 -9 12 -5 10 0 8 4 2 6-5 2Z" fill="url(#${g}s)" stroke="${P[2]}" stroke-width=".9"/>
          <path d="M9 0C12 4 12 9 8 13 9 8 8 5 6 3Z" fill="#1a1a1a" stroke="#000" stroke-width=".5"/>
          <circle cx="8.5" cy="13" r="1.5" fill="#9dff5a" filter="url(#${g}fl)">${anime ? `<animate attributeName="cy" values="13;13;22" keyTimes="0;.7;1" dur="2.4s" repeatCount="indefinite"/>` : ""}${an("opacity", "1;1;0", 2.4, ' keyTimes="0;.85;1"')}</circle></g>
      </g>
      ${monte([[-16, 0, 14], [10, 1, 10], [90, .6, 12], [116, 1.8, 8]], `<circle r="1" fill="${P[0]}"/><circle cx="3" cy="2" r=".7" fill="${P[1]}"/>`, 3, -1)}`;
  };

  // Lune : grand croissant de lune aux cratères qui luit, éclats de cristal en orbite, étoiles
  CREA.lune = (P, g) => {
    const cristal = (x, y, r, s) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 -14 6 -4 4 12-4 12-6 -4Z" fill="url(#${g}k)" stroke="${P[2]}" stroke-width=".8"/><path d="M0 -14 0 12M-6 -4 0 0 6 -4" stroke="#fff" stroke-width=".7" opacity=".7" fill="none"/><path d="M-1 -10-3 -3" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></g>`;
    return `<defs>${rad(g + "m", ["#ffffff", P[0], P[1]], .3, .4, .8)}${rad(g + "h", [P[0], "transparent"])}${lin(g + "k", ["#ffffff", P[0], P[1], P[2]], 0, 0, 1, 1)}</defs>
      <circle cx="50" cy="-10" r="34" fill="url(#${g}h)" opacity=".7">${an("opacity", ".45;.85;.45", 3.5)}</circle>
      <g>${anime ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="24s" repeatCount="indefinite"/>` : ""}
        ${cristal(-14, 36, -30, .9)}${cristal(-16, 76, -120, .75)}${cristal(114, 30, 30, .8)}${cristal(116, 72, 120, .95)}${cristal(50, 122, 180, .7)}</g>
      ${[[-22, 8, 0], [120, 10, .8], [-20, 104, 1.6], [122, 104, 2.2], [28, -28, 1.2], [76, -28, .4]].map(([x, y, d]) => etoile(x, y, 3.6, "#fff", d)).join("")}
      <g transform="translate(50 -12)">${rot("0;-6;0", 9)}
        <path d="M6 -20A21 21 0 1 0 6 20 16 16 0 1 1 6 -20Z" fill="url(#${g}m)" stroke="${P[2]}" stroke-width=".8"/>
        <circle cx="-8" cy="6" r="3" fill="${P[1]}" opacity=".45"/><circle cx="-4" cy="-9" r="2" fill="${P[1]}" opacity=".45"/><circle cx="-12" cy="-2" r="1.5" fill="${P[1]}" opacity=".4"/>
        <path d="M-6 3Q-3 6 0 3" stroke="${P[2]}" stroke-width=".9" fill="none" opacity=".7"/><path d="M-8 -3h2" stroke="${P[2]}" stroke-width="1" stroke-linecap="round"/>
      </g>`;
  };

  // Démon : grandes cornes recourbées, visage dans l'ombre aux yeux rougeoyants, flammes et fumée
  CREA.cornes = (P, g) => {
    const corne = (k) => `<path d="${tube([[50 + k * 12, -6], [50 + k * 24, -14], [50 + k * 34, -28], [50 + k * 30, -40], [50 + k * 22, -40]], 10, 1.2)}" fill="url(#${g}c)" stroke="${P[2]}" stroke-width="1"/>
      ${[0, 1, 2, 3].map((i) => { const t = [[50 + k * 18, -10], [50 + k * 26, -17], [50 + k * 32, -25], [50 + k * 33, -33]][i]; return `<path d="M${t[0] - 4} ${t[1] + 2}Q${t[0]} ${t[1] - 1} ${t[0] + 4 * k} ${t[1] - 3}" stroke="${P[2]}" stroke-width=".8" fill="none" opacity=".7"/>`; }).join("")}`;
    const flammes = Array.from({ length: 11 }, (_, i) => { const a = 118 + i * 12.4, [x, y] = pt(a, 60); return `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})"><path d="M0 2C-5 -2-5 -8-1 -16 1 -10 4 -8 5 -4 6 -1 4 2 0 2Z" fill="url(#${g}f)">${anime ? `<animateTransform attributeName="transform" type="scale" values="1 1;1.1 1.3;.95 .9;1 1" dur="${r1(.6 + (i % 4) * .15)}s" repeatCount="indefinite"/>` : ""}</path></g>`; }).join("");
    return `<defs>${lin(g + "c", [P[0], P[1], P[2]], 0, 0, 1, 1)}${lin(g + "f", ["#fff3a0", "#ff7a1a", P[1]], 0, 1, 0, 0)}${flou(g + "fl", 1.6)}</defs>
      ${flammes}
      ${monte([[-12, 0, -6], [6, 1.5, -10], [94, .7, 8], [112, 2.2, 6]], `<circle r="5" fill="#2a2030" opacity=".45"/><circle cx="3" cy="-3" r="3.5" fill="#2a2030" opacity=".35"/>`, 4.2)}
      ${corne(-1)}${corne(1)}
      <g transform="translate(50 -2)">
        <path d="M-15 -8C-15 -18-6 -22 0 -22 6 -22 15 -18 15 -8 15 2 9 12 0 16-9 12-15 2-15 -8Z" fill="url(#${g}c)" stroke="${P[2]}" stroke-width="1"/>
        <path d="M-15 -8C-15 -18-6 -22 0 -22 6 -22 15 -18 15 -8 15 2 9 12 0 16-9 12-15 2-15 -8Z" fill="#000" opacity=".45"/>
        <path d="M-12 -9-3 -5-11 -3Z M12 -9 3 -5 11 -3Z" fill="#ff2a2a" filter="url(#${g}fl)">${an("opacity", ".4;1;.4", 1.4)}</path><path d="M-12 -9-3 -5-11 -3Z M12 -9 3 -5 11 -3Z" fill="#ffd0b0"/>
        <path d="M-7 5-4 8-1 5 2 8 5 5 7 7" stroke="#ff6a4a" stroke-width="1" fill="none" stroke-linejoin="round"/>
      </g>`;
  };

  // Anneau métallique ciselé (pierres, gravure, reflet qui tourne) et bannière de la semaine
  const STATUES = { b: ["#ffffff", "#b9c4d2", "#4b5563"], c: ["#ffe0c2", "#c87a3e", "#5a3010"] };
  const anneauPodium = (g, P, pl) => {
    const M = PLACES[pl].met, cols = pl === "a" ? [P[0], P[1], "#ffffff", P[1], P[2], P[1], P[0]] : [M[0], M[1], "#ffffff", M[1], M[2], M[1], M[0]];
    const pierre = pl === "a" ? P[1] : pl === "b" ? "#60a5fa" : "#22c55e";
    const gemmes = Array.from({ length: 8 }, (_, i) => { const [x, y] = pt(22.5 + i * 45, 54); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.6" fill="url(#${g}gm)" stroke="${M[2]}" stroke-width=".6"/><circle cx="${r1(x - .8)}" cy="${r1(y - .9)}" r=".8" fill="#fff"/>`; }).join("");
    const [sx, sy] = pt(-28, 54), [ex, ey] = pt(8, 54);
    return `<defs>${lin(g + "r", cols, 0, 0, 1, 1)}${rad(g + "gm", ["#ffffff", pierre, M[2]], .35, .3, .8)}${lin(g + "sh", ["transparent", "#ffffff", "transparent"], 0, 0, 1, 0)}</defs>
      <circle cx="50" cy="50" r="54" fill="none" stroke="${M[2]}" stroke-width="9.5"/>
      <circle cx="50" cy="50" r="54" fill="none" stroke="url(#${g}r)" stroke-width="7.5"/>
      <circle cx="50" cy="50" r="54" fill="none" stroke="#fff" stroke-width=".5" stroke-dasharray="1.5 2.5" opacity=".45"/>
      ${gemmes}
      <g>${anime ? `<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite"/>` : ""}<path d="M${r1(sx)} ${r1(sy)}A54 54 0 0 1 ${r1(ex)} ${r1(ey)}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/></g>`;
  };
  const banniere = (g, txt, M, texte) => `<defs>${lin(g + "rb", [M[0], M[1], M[2]])}</defs>
    <path d="M8 104 20 100V114L8 117 13 110Z" fill="${M[2]}"/><path d="M92 104 80 100V114L92 117 87 110Z" fill="${M[2]}"/>
    <path d="M18 97Q50 105 82 97V112Q50 120 18 112Z" fill="url(#${g}rb)" stroke="${M[2]}" stroke-width="1.2"/>
    <path d="M20 99.5Q50 107 80 99.5" fill="none" stroke="#fff" stroke-width=".7" opacity=".55"/>
    <text x="50" y="112" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9.5" fill="${texte}" letter-spacing=".3">${txt}</text>`;
  const hebdo = (code) => {
    const m = code.match(HEBDO); if (!m) return "";
    const an_ = +m[1], sem = +m[2], pl = m[3], t = themeDe(an_, sem), Pl = PLACES[pl], g = "w" + code;
    // 1er : la créature en couleurs ; 2e : statue d'argent ; 3e : statue de bronze
    const P = pl === "a" ? t.pal : STATUES[pl];
    return svg(`${DEFS_COMMUNS}${anneauPodium(g, t.pal, pl)}${CREA[t.emb](P, g)}${banniere(g, `S${sem} · ${Pl.n}`, pl === "a" ? [t.pal[0], t.pal[1], t.pal[2]] : Pl.met, pl === "a" ? "#fff" : Pl.txt)}`);
  };

  // Semaine de ligue en cours (heure de Paris, semaine ISO commençant le lundi)
  const semaineEnCours = () => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const d = new Date(parts + "T12:00:00Z"), j = (d.getUTCDay() + 6) % 7;
    const jeudi = new Date(d); jeudi.setUTCDate(d.getUTCDate() - j + 3);
    const an = jeudi.getUTCFullYear(), debutAn = new Date(Date.UTC(an, 0, 4));
    const sem = 1 + Math.round(((jeudi - debutAn) / 864e5 - 3 + ((debutAn.getUTCDay() + 6) % 7)) / 7);
    const lundi = new Date(d); lundi.setUTCDate(d.getUTCDate() - j);
    const dim = new Date(lundi); dim.setUTCDate(lundi.getUTCDate() + 6);
    const jm = (x) => String(x.getUTCDate()).padStart(2, "0") + "/" + String(x.getUTCMonth() + 1).padStart(2, "0");
    return { an, sem, du: jm(lundi), au: jm(dim) };
  };
  const infoHebdo = (code) => {
    const m = code.match(HEBDO); if (!m) return null;
    const an = +m[1], sem = +m[2], t = themeDe(an, sem), P = PLACES[m[3]];
    return { id: code, nom: `${t.nom} · ${P.n}`, comment: `Finir ${P.n} de la ligue CARDS CENTER la semaine ${sem}${an !== semaineEnCours().an ? " de " + an : ""}.` };
  };
  const CACHE = {};
  const existe = (c) => !!(DESSINS[c] || HEBDO.test(c));
  const dessin = (c) => (CACHE[c] ||= DESSINS[c] ? DESSINS[c]() : hebdo(c));

  const css = document.createElement("style");
  css.textContent = `
.cadre-deco { position: relative; display: inline-block; vertical-align: middle; flex: none; line-height: 0; border-radius: 50%; }
.cadre-deco > img { width: 100% !important; height: 100% !important; max-width: none !important; border-radius: 50% !important; object-fit: cover; display: block; margin: 0 !important; box-shadow: none !important; }
.cadre-deco > .cadre-svg { position: absolute; left: -30%; top: -30%; width: 160%; height: 160%; pointer-events: none; overflow: visible; z-index: 2; fill: none; stroke: none; stroke-width: 1; stroke-linecap: butt; stroke-linejoin: miter; }
.cadre-deco.c-or > .cadre-svg { filter: drop-shadow(0 0 4px rgba(255, 43, 43, .75)); }
.cadre-deco.c-z777 > .cadre-svg { filter: drop-shadow(0 0 3px rgba(250, 204, 21, .7)); }
.cadre-deco.c-loup > .cadre-svg { filter: drop-shadow(0 0 3px rgba(165, 180, 252, .6)); }
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
      if (!c || !existe(c)) { boite.replaceWith(img); return; }
      boite.className = "cadre-deco c-" + c; boite.dataset.cadre = c;
      boite.querySelector(".cadre-svg").outerHTML = dessin(c);
      return;
    }
    if (!c || !existe(c)) return;
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
  const ligue = (id, nom, comment) => ({ id, nom, comment });
  const JEUX = [
    { jeu: "CARDS CENTER", id: "jmwdr0y57", cadres: [
      ligue("top10", "Top 10 de la ligue", "Finir entre la 4e et la 10e place de la ligue."),
      ligue("assidu", "Assidu", "Réussir 25 objectifs du jour de CARDS CENTER dans la même semaine."),
      ligue("supreme", "Suprême", "Tirer une carte Suprême dans un booster."),
      ligue("god", "Béni des dieux", "Ouvrir un god pack."),
    ] },
    { jeu: "BRELAN", id: "jmvgplix8", cadres: [ligue("brelan", "Cartes volantes", "Réussir tous les objectifs du jour de BRELAN 3 jours différents.")] },
    { jeu: "Zone 777", id: "jmw0lc154", cadres: [ligue("z777", "Pluie de pièces", "Réussir tous les objectifs du jour de Zone 777 3 jours différents.")] },
    { jeu: "La Bousculade", id: "jmvz9p0v8", cadres: [ligue("bousc", "Ligne d'arrivée", "Réussir tous les objectifs du jour de La Bousculade 3 jours différents.")] },
    { jeu: "Golf with TEC3H", id: "jmvgdsi5v", cadres: [ligue("golf", "Trou en un", "Réussir tous les objectifs du jour de Golf with TEC3H 3 jours différents.")] },
    { jeu: "Loup-Garou de Brumeval", id: "jmvhuwavm", cadres: [ligue("loup", "Nuit de pleine lune", "Réussir tous les objectifs du jour du Loup-Garou 3 jours différents.")] },
    { jeu: "Bal Masqué", id: "jmvp0a0wh", cadres: [ligue("bal", "Masque vénitien", "Réussir tous les objectifs du jour du Bal Masqué 3 jours différents.")] },
    { jeu: "Cul Sec !", id: "jmw0rvbcc", cadres: [ligue("culsec", "Santé !", "Réussir tous les objectifs du jour de Cul Sec ! 3 jours différents.")] },
  ];
  // Catalogue des cadres à gagner sur le site, jeu par jeu
  // Anciens cadres de podium (avant les cadres de la semaine) : on les garde pour ceux qui les ont
  const ANCIENS = [ligue("or", "Dragon rouge", "Ancien cadre du 1er de la ligue."), ligue("argent", "Couronne d'argent", "Ancien cadre du 2e de la ligue."), ligue("bronze", "Couronne de bronze", "Ancien cadre du 3e de la ligue.")];
  const podiumDeLaSemaine = () => { const s = semaineEnCours(), code = `l${s.an}${String(s.sem).padStart(2, "0")}`; return ["a", "b", "c"].map((pl) => Object.assign(infoHebdo(code + pl), { comment: `Finir ${PLACES[pl].n} de la ligue CARDS CENTER cette semaine (du ${s.du} au ${s.au}). Nouveaux cadres chaque lundi !` })); };
  // Catalogue : les 3 cadres à gagner cette semaine, puis les podiums déjà gagnés (et les anciens), puis les autres cadres
  const catalogue = (mes = []) => JEUX.map((g, i) => {
    if (i) return g;
    const cette = podiumDeLaSemaine(), ids = new Set(cette.map((c) => c.id));
    const gagnes = mes.filter((id) => HEBDO.test(id) && !ids.has(id)).sort().reverse().map(infoHebdo);
    const anciens = ANCIENS.filter((c) => mes.includes(c.id));
    return Object.assign({}, g, { cadres: [...cette, ...gagnes, ...anciens, ...g.cadres] });
  });
  window.BS_CADRES = {
    dessin,
    jeux: catalogue(),
    catalogue,
    semaine: semaineEnCours,
    trouver: (id) => { if (HEBDO.test(id)) return Object.assign({ jeu: "CARDS CENTER" }, infoHebdo(id)); for (const g of [...JEUX, { jeu: "CARDS CENTER", cadres: ANCIENS }]) for (const c of g.cadres) if (c.id === id) return Object.assign({ jeu: g.jeu }, c); return null; },
  };
})();
