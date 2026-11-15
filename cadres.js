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
  const CACHE = {};
  const dessin = (c) => (CACHE[c] ||= DESSINS[c] ? DESSINS[c]() : "");

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
  const ligue = (id, nom, comment) => ({ id, nom, comment });
  const JEUX = [
    { jeu: "CARDS CENTER", id: "jmwdr0y57", cadres: [
      ligue("or", "Dragon rouge", "Finir 1er de la ligue CARDS CENTER de la semaine."),
      ligue("argent", "Couronne d'argent", "Finir 2e de la ligue CARDS CENTER de la semaine."),
      ligue("bronze", "Couronne de bronze", "Finir 3e de la ligue CARDS CENTER de la semaine."),
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
  window.BS_CADRES = {
    dessin,
    jeux: JEUX,
    trouver: (id) => { for (const g of JEUX) for (const c of g.cadres) if (c.id === id) return Object.assign({ jeu: g.jeu }, c); return null; },
  };
})();
