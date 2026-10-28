// =========================================================
// BS arcade center : le site, page par page
// Le contenu vient de site.json (modifié depuis admin.html).
// Pages : #/  ·  #/jeux  ·  #/jeu/<id>  ·  #/a-propos  ·  #/contact
// =========================================================

const $ = (id) => document.getElementById(id);
const apercu = new URLSearchParams(location.search).has("apercu");
const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
let donnees = null;
let fichiersApercu = {}; // fichiers pas encore publiés, montrés dans l'aperçu de l'admin
let pageActuelle = "";

// ---------- Outils ----------
const echapper = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lien = (chemin) => fichiersApercu[chemin] || chemin;
const initiales = (t) => String(t).trim().split(/\s+/).slice(0, 2).map((m) => m[0] || "").join("").toUpperCase() || "?";
const lienSur = (u) => { try { const x = new URL(String(u).trim()); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
const paragraphes = (t) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("");
const majuscule = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lire = (cle, defaut) => { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } };
const ecrire = (cle, v) => { try { localStorage.setItem(cle, JSON.stringify(v)); } catch {} };
const pluriel = (n, un, plusieurs) => `${n} ${n > 1 ? plusieurs : un}`;

const I = {
  jouer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="rempli" d="M7 4v16l13-8z"/></svg>',
  coeur: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5c-2.3 4.6-9.3 9-9.3 9z"/></svg>',
  externe: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  droite: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  gauche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  chevG: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg>',
  chevD: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  lien: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  page: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  cadenas: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  coche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>',
  copie: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="3"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  souris: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v4"/></svg>',
  ecran: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  utilisateur: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
  euro: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6.5A7 7 0 1 0 18 17.5M4 10h10M4 14h10"/></svg>',
  photo: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 8"/></svg>',
  cadeau: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>',
};

// Illustrations dessinées (illustrations.js), masquables dans Mise en page
const dessin = (nom, cls = "") => (option("illustrations") && window.ILLUS?.[nom] ? `<div class="dessin ${cls}">${window.ILLUS[nom]}</div>` : "");

// ---------- Jeux : dates, couleurs ----------
// Date d'ajout : l'identifiant créé par l'admin la contient
const dateJeu = (j) => parseInt(String(j.id).slice(1), 36) || 0;
const aUneDate = (j) => dateJeu(j) > 1.6e12;
const estNouveau = (j) => aUneDate(j) && Date.now() - dateJeu(j) < 30 * 864e5;
const formatDate = (j, opts = { day: "numeric", month: "long", year: "numeric" }) => (aUneDate(j) ? new Date(dateJeu(j)).toLocaleDateString("fr-FR", opts) : "");
const jeuxTries = () => [...(donnees?.jeux || [])].sort((a, b) => dateJeu(b) - dateJeu(a));
const trouverJeu = (id) => (donnees?.jeux || []).find((j) => j.id === id);

// Chaque jeu prend la couleur de sa jaquette (calculée dans le navigateur)
const couleurs = new Map();
function teinteDe(texte) { let h = 0; for (const c of String(texte)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
const couleurJeu = (j) => couleurs.get(j.id) || `hsl(${teinteDe(j.titre)} 70% 58%)`;
function calculerCouleur(j) {
  if (!j.image || couleurs.has(j.id)) return;
  const img = new Image();
  img.onload = () => {
    try {
      const c = document.createElement("canvas"); c.width = c.height = 24;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0, 24, 24);
      const d = x.getImageData(0, 0, 24, 24).data;
      // On garde la teinte vive la plus présente (pas une moyenne, qui donne du beige)
      const bacs = new Array(24).fill(0), sommes = new Array(24).fill(0);
      for (let i = 0; i < d.length; i += 4) {
        const [h, s, l] = rgbEnTsl(d[i], d[i + 1], d[i + 2]);
        if (s < .25 || l < .15 || l > .9) continue;
        const k = Math.floor(h / 15) % 24, poids = s * (1 - Math.abs(l - .5) * 1.6);
        bacs[k] += poids; sommes[k] += h * poids;
      }
      const meilleur = bacs.indexOf(Math.max(...bacs));
      const teinte = bacs[meilleur] > 0 ? sommes[meilleur] / bacs[meilleur] : teinteDe(j.titre);
      couleurs.set(j.id, `hsl(${Math.round(teinte)} 72% 58%)`);
      document.querySelectorAll(`[data-couleur="${CSS.escape(j.id)}"]`).forEach((el) => el.style.setProperty("--c", couleurs.get(j.id)));
    } catch {}
  };
  img.src = lien(j.image);
}
function rgbEnTsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
const attrCouleur = (j) => `data-couleur="${echapper(j.id)}" style="--c:${couleurJeu(j)}"`;
const imageJeu = (j) => j.image
  ? `<img src="${echapper(lien(j.image))}" alt="" loading="lazy" draggable="false">`
  : `<span class="sans-image">${echapper(initiales(j.titre))}</span>`;

// ---------- Réseaux (blocs « Liens » de l'admin) ----------
const NOMS_SITES = { instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube", youtu: "YouTube", tiktok: "TikTok", twitter: "X", x: "X", discord: "Discord", twitch: "Twitch", facebook: "Facebook", github: "GitHub", itch: "itch.io", snapchat: "Snapchat" };
function nomDuSite(u) {
  const morceaux = new URL(u).hostname.replace(/^www\./, "").split(".");
  const cle = morceaux.find((m) => NOMS_SITES[m]);
  return cle ? NOMS_SITES[cle] : majuscule(morceaux[0]);
}
function liensDe(texte) {
  return String(texte || "").split("\n").map((l) => {
    let [nom, url] = l.split("|").map((s) => (s || "").trim());
    if (!url && lienSur(nom)) { url = nom; nom = nomDuSite(nom); }
    return { nom, url: lienSur(url) };
  }).filter((x) => x.nom && x.url);
}
// Réseaux : ceux de l'onglet Contact, sinon ceux des blocs « Liens »
const reseaux = () => (donnees.contact?.reseaux?.trim() ? liensDe(donnees.contact.reseaux) : (donnees.blocs || []).filter((b) => b.type === "liens").flatMap((b) => liensDe(b.liens)));
const emailSur = (e) => (/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(String(e || "").trim()) ? String(e).trim() : "");
const telLien = (t) => { const n = String(t || "").replace(/[^\d+]/g, ""); return n.length >= 6 ? (n.startsWith("0") ? "+33" + n.slice(1) : n) : ""; };
const adresseCourte = (u) => { try { const x = new URL(u); return (x.hostname.replace(/^www\./, "") + x.pathname).replace(/\/$/, ""); } catch { return u; } };
const pastilleReseau = (l) => `<a class="pastille-reseau" href="${echapper(l.url)}" target="_blank" rel="noopener">${echapper(l.nom)}${I.externe}</a>`;

// ---------- Apparence ----------
const POLICES = {
  "Manrope": "Manrope:wght@400;500;600;700;800", "Inter Tight": "Inter+Tight:wght@500;600;700;800", "Plus Jakarta Sans": "Plus+Jakarta+Sans:wght@400;500;600;700;800",
  "Outfit": "Outfit:wght@400;500;600;700;800", "Sora": "Sora:wght@400;500;600;700;800", "Fraunces": "Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800",
  "Bricolage Grotesque": "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800",
  "Instrument Serif": "Instrument+Serif:ital@0;1", "DM Serif Display": "DM+Serif+Display", "Syne": "Syne:wght@500;600;700;800",
  "Familjen Grotesk": "Familjen+Grotesk:wght@500;600;700", "Unbounded": "Unbounded:wght@500;600;700",
  "Geist": "Geist:wght@400;500;600;700", "Inter": "Inter:wght@400;500;600;700", "DM Sans": "DM+Sans:wght@400;500;600;700", "Figtree": "Figtree:wght@400;500;600;700",
};
// Réglages par défaut du design « Pierre » (modifiables dans l'admin, onglet Apparence)
const DEFAUT = {
  v: 4, teinte: "#8C7963", mode: "clair", titres: "Manrope", corps: "Manrope", poidsTitres: 800, tailleTitres: 100,
  arrondi: 22, ombre: "douce", densite: "normale",
  effets: { apparition: "douce", survol: "zoom", transition: "fondu", halo: true, parallaxe: true, progression: true, compteurs: true, grain: false, logosCouleur: false },
};
let reglages = DEFAUT;
function hexVersHsl(hex) {
  const m = String(hex || "").match(/^#?([0-9a-f]{6})$/i);
  const [r, g, b] = (m ? m[1] : "8C7963").match(/../g).map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, s * 100];
}
// Tous les tons du site à partir d'une seule couleur
function tonsDe(teinte, sombre) {
  const [h, s] = hexVersHsl(teinte);
  const c = (k, max) => Math.min(s * k, max);
  const t = (sat, l) => `hsl(${h.toFixed(1)} ${sat.toFixed(1)}% ${l}%)`;
  return sombre ? {
    fond: t(c(1.2, 20), 8), carte: t(c(1.2, 18), 12), surface: t(c(1.2, 18), 16), clair: t(c(1.2, 18), 24), trait: t(c(1.2, 16), 19),
    moyen: t(c(1, 45), 60), principal: t(c(1.3, 50), 80), fonce: t(c(1.2, 20), 14), encre: t(c(.8, 20), 94), doux: t(c(.8, 16), 72), pale: t(c(.6, 12), 56),
    "sur-principal": t(c(1.2, 30), 10), "sur-fonce": t(c(.8, 20), 94),
  } : {
    fond: t(c(1.7, 30), 95.5), carte: t(c(1, 25), 99.5), surface: t(c(1.7, 32), 90), clair: t(c(1.4, 34), 81), trait: t(c(1.4, 30), 86.5),
    moyen: t(c(1, 60), 46), principal: t(c(1.5, 62), 28), fonce: t(c(1.4, 40), 13), encre: t(c(1.3, 40), 10), doux: t(c(.9, 25), 35), pale: t(c(.7, 18), 50),
    "sur-principal": t(c(1.7, 30), 96), "sur-fonce": t(c(1.5, 30), 94),
  };
}
function appliquerApparence(a = {}) {
  // Avant ce design (v4), on repart des réglages « Pierre »
  const v = a.v >= 4 ? { ...DEFAUT, ...a, effets: { ...DEFAUT.effets, ...(a.effets || {}) } } : { ...DEFAUT, css: a.css };
  reglages = v;
  const h = document.documentElement, r = h.style, sombre = v.mode === "sombre";
  const tons = tonsDe(v.teinte, sombre);
  Object.entries(tons).forEach(([k, val]) => r.setProperty("--" + k, val));
  r.setProperty("--r", Math.max(0, Math.min(40, Number(v.arrondi) || 0)) + "px");
  r.setProperty("--esp", { compacte: .72, normale: 1, aeree: 1.3 }[v.densite] || 1);
  r.setProperty("--echelle-titres", (Number(v.tailleTitres) || 100) / 100);
  r.setProperty("--poids-titres", v.poidsTitres || 800);
  const titres = POLICES[v.titres] ? v.titres : DEFAUT.titres, corps = POLICES[v.corps] ? v.corps : DEFAUT.corps;
  r.setProperty("--f-titres", `"${titres}", system-ui, sans-serif`);
  r.setProperty("--f-corps", `"${corps}", system-ui, -apple-system, sans-serif`);
  $("polices").href = "https://fonts.googleapis.com/css2?" + [...new Set([titres, corps])].map((p) => "family=" + POLICES[p]).join("&") + "&display=swap";
  document.querySelector('meta[name="theme-color"]').content = tons.fond;
  if (window.FAVICON_BS && $("favicon") && !(donnees?.site?.logoStyle === "image" && donnees.site.logo)) $("favicon").href = "data:image/svg+xml," + encodeURIComponent(window.FAVICON_BS(tons));
  h.classList.toggle("theme-sombre", sombre);
  // Classes d'effets (lues par le CSS)
  const e = v.effets, classes = h.className.split(/\s+/).filter((x) => x && !/^(anim|survol|trans|ombre)-|^effet-|^logos-couleur$/.test(x));
  classes.push("anim-" + e.apparition, "survol-" + e.survol, "trans-" + e.transition, "ombre-" + v.ombre);
  if (e.halo) classes.push("effet-halo");
  if (e.grain) classes.push("effet-grain");
  if (e.logosCouleur) classes.push("logos-couleur");
  h.className = classes.join(" ");
}
const effet = (cle) => !mouvementReduit && !!reglages.effets?.[cle];

// =========================================================
// Morceaux réutilisés
// =========================================================
function carteJeu(j, { grande = false } = {}) {
  const fav = favoris.has(j.id);
  return `<article class="carte-jeu ${grande ? "grande" : ""}" ${attrCouleur(j)}>
    <a class="carte-jeu-media" href="#/jeu/${echapper(j.id)}" aria-label="${echapper(j.titre)}">
      ${imageJeu(j)}
      ${estNouveau(j) ? `<span class="badge">${t("carte_nouveau")}</span>` : ""}
    </a>
    <button class="bouton-fav" type="button" data-favori="${echapper(j.id)}" aria-pressed="${fav}" aria-label="${fav ? "Retirer des" : "Ajouter aux"} favoris">${I.coeur}</button>
    <div class="carte-jeu-texte">
      <div class="carte-jeu-ligne">
        <h3><a href="#/jeu/${echapper(j.id)}">${echapper(j.titre)}</a></h3>
        <button class="jouer-rapide" type="button" data-jouer="${echapper(j.id)}" aria-label="Jouer à ${echapper(j.titre)}">${I.jouer}</button>
      </div>
      <p class="meta">${[j.genre ? echapper(majuscule(j.genre)) : "", formatDate(j, { day: "numeric", month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</p>
    </div>
  </article>`;
}
const enteteSection = (etiquette, titre, droite = "") => `<div class="section-tete">
  <div><p class="etiquette">${etiquette}</p><h2>${titre}</h2></div>${droite}</div>`;

function boutonsAccueil(s) {
  if (Array.isArray(s.boutons)) return s.boutons;
  return [{ texte: s.boutonJeux || "Voir les jeux", cible: "#jeux", style: "plein" }, { texte: s.boutonHistoire || "Mon histoire", cible: "#histoire", style: "contour" }];
}
function lienBouton(b, i) {
  const externe = b.cible === "url", href = externe ? lienSur(b.url) : b.cible;
  if (!b.texte || !href) return "";
  const plein = b.style ? b.style === "plein" : i === 0;
  return `<a class="btn ${plein ? "plein" : ""}" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(b.texte)}${externe ? I.externe : ""}</a>`;
}

// ---------- Blocs ajoutés dans l'admin ----------
function idYouTube(u) {
  const m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : "";
}
const titreBloc = (b) => (b.titre ? `<h2 class="bloc-titre">${echapper(b.titre)}</h2>` : "");
function htmlBloc(b) {
  switch (b.type) {
    case "texte":
      return `<div class="b-texte ${b.alignement === "centre" ? "centre" : ""}">${titreBloc(b)}<div class="prose">${paragraphes(b.texte)}</div></div>`;
    case "image":
      if (!b.image) return "";
      return `<figure class="b-image ${b.largeur === "moyenne" ? "moyenne" : ""}">${titreBloc(b)}<img src="${echapper(lien(b.image))}" alt="${echapper(b.legende || "")}" loading="lazy">${b.legende ? `<figcaption>${echapper(b.legende)}</figcaption>` : ""}</figure>`;
    case "encadre": {
      const url = lienSur(b.lienBouton);
      return `<div class="b-encadre" style="--fond-encadre:${echapper(b.couleur || "var(--accent)")}"><div>${b.titre ? `<h2>${echapper(b.titre)}</h2>` : ""}${paragraphes(b.texte)}</div>${b.texteBouton && url ? `<a class="btn blanc" href="${echapper(url)}" target="_blank" rel="noopener">${echapper(b.texteBouton)}${I.externe}</a>` : ""}</div>`;
    }
    case "liens": {
      const items = liensDe(b.liens);
      if (!items.length) return "";
      return `<div class="b-liens">${titreBloc(b)}<div class="grille-reseaux">${items.map(carteReseau).join("")}</div></div>`;
    }
    case "video": {
      const id = idYouTube(b.url);
      if (!id) return "";
      return `<div class="b-video">${titreBloc(b)}<div class="cadre-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${echapper(b.titre || "Vidéo")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${b.texte ? `<p class="legende">${echapper(b.texte)}</p>` : ""}</div>`;
    }
    case "galerie": {
      const imgs = (b.images || []).filter(Boolean);
      if (!imgs.length) return "";
      return `<div class="b-galerie">${titreBloc(b)}<div class="galerie">${imgs.map((i) => `<img src="${echapper(lien(i))}" alt="" loading="lazy">`).join("")}</div></div>`;
    }
    case "html":
      return b.code ? `<div class="b-html">${titreBloc(b)}${b.code}</div>` : "";
    case "separateur":
      return `<hr class="b-sep ${b.style || "ligne"}">`;
  }
  return "";
}
// Logo du réseau (icônes Font Awesome) d'après l'adresse ; sinon l'initiale
const ICONES_RESEAUX = { instagram: "instagram", linkedin: "linkedin-in", youtube: "youtube", youtu: "youtube", tiktok: "tiktok", twitter: "x-twitter", x: "x-twitter",
  discord: "discord", twitch: "twitch", facebook: "facebook-f", github: "github", itch: "itch-io", snapchat: "snapchat", threads: "threads", reddit: "reddit-alien", spotify: "spotify", steampowered: "steam", steamcommunity: "steam" };
function iconeReseau(url) {
  try {
    const morceaux = new URL(url).hostname.replace(/^www\./, "").split(".");
    const cle = morceaux.find((m) => ICONES_RESEAUX[m]);
    return cle ? ICONES_RESEAUX[cle] : "";
  } catch { return ""; }
}
const carteReseau = (l) => {
  const icone = iconeReseau(l.url);
  return `<a class="carte-reseau" href="${echapper(l.url)}" target="_blank" rel="noopener" style="--c:hsl(${teinteDe(l.nom)} 70% 58%)">
  ${icone
    ? `<span class="carte-reseau-initiale logo-reseau logo-${icone}"><i class="fa-brands fa-${icone}" aria-hidden="true"></i><b class="lettre" aria-hidden="true">${echapper(l.nom.charAt(0).toUpperCase())}</b></span>`
    : `<span class="carte-reseau-initiale">${echapper(l.nom.charAt(0).toUpperCase())}</span>`}
  <span class="carte-reseau-texte"><b>${echapper(l.nom)}</b><small>${echapper(adresseCourte(l.url))}</small></span>${I.externe}</a>`;
};
// =========================================================
// Textes, sections et options (modifiables dans l'admin)
// =========================================================
const TEXTES_DEFAUT = Object.fromEntries((window.TEXTES_SITE || []).flatMap((g) => g.textes.map(([k, , v]) => [k, v])));
// Texte brut (avec {jeux} / {prochains} remplacés) puis version échappée pour le HTML
function T(cle, vars = {}) {
  const perso = donnees?.textes?.[cle];
  let v = typeof perso === "string" && perso.trim() ? perso : (TEXTES_DEFAUT[cle] ?? cle);
  for (const [k, val] of Object.entries(vars)) v = v.split("{" + k + "}").join(val);
  return v;
}
const t = (cle, vars) => echapper(T(cle, vars));
const option = (cle) => { const o = donnees?.miseEnPage?.options?.[cle]; return o === undefined ? (window.OPTIONS_SITE || []).find((x) => x[0] === cle)?.[2] ?? true : !!o; };
// Ordre et visibilité des sections d'une page
function sectionsDePage(page) {
  const defaut = (window.SECTIONS_SITE?.[page]?.sections || []).map(([id]) => id);
  const enregistre = donnees?.miseEnPage?.[page];
  if (!Array.isArray(enregistre)) return defaut;
  const res = enregistre.filter((x) => defaut.includes(x.id));
  defaut.forEach((id, i) => {
    if (res.some((x) => x.id === id)) return;
    const avant = defaut.slice(0, i).reverse().find((p) => res.some((x) => x.id === p));
    res.splice(avant ? res.findIndex((x) => x.id === avant) + 1 : 0, 0, { id, visible: true });
  });
  return res.filter((x) => x.visible !== false).map((x) => x.id);
}
const assembler = (page, morceaux) => sectionsDePage(page).map((id) => (morceaux[id] ? morceaux[id]() : "")).join("\n");

// Blocs de l'admin : chacun s'affiche sur la page choisie (Accueil par défaut)
const blocsDe = () => (donnees.blocs && donnees.blocs.length ? donnees.blocs : [{ id: "jeux", type: "jeux" }, { id: "histoire", type: "histoire" }]);
const blocsPerso = () => blocsDe().filter((b) => b.type !== "jeux" && b.type !== "histoire");
const blocsPour = (page) => blocsPerso().filter((b) => (b.page || "accueil") === page).map((b) => {
  const html = htmlBloc(b);
  return html ? `<section class="section bloc bloc-${b.type}" id="bloc-${echapper(b.id)}"><div class="conteneur">${html}</div></section>` : "";
}).join("");

// =========================================================
// Pages
// =========================================================
const PAGES = {};

// ---------- Accueil ----------
const nbTexte = (n) => `<span data-compteur="${n}">${n}</span>`;
PAGES.accueil = () => {
  const s = donnees.site, jeux = jeuxTries();
  const genres = [...new Map(jeux.filter((j) => j.genre?.trim()).map((j) => [j.genre.trim().toLowerCase(), majuscule(j.genre.trim())])).entries()];
  const h = donnees.histoire || {}, liens = reseaux(), prochains = prochainsJeux(h);
  const [a, b] = jeux;
  const nomJeux = (n) => (n > 1 ? "jeux" : "jeu");
  return assembler("accueil", {
    hero: () => `
  <section class="hero">
    <div class="conteneur hero-grille ${option("collage") ? "" : "sans-collage"}">
      <div class="hero-texte">
        ${option("pastille") ? `<p class="pastille"><span class="point" aria-hidden="true"></span>${jeux.length ? t("accueil_pastille", { jeux: pluriel(jeux.length, "jeu", "jeux") }) : t("accueil_pastille_vide")}</p>` : ""}
        <h1>${t("hero_titre")} <span class="ton">${t("hero_titre_ton")}</span></h1>
        <p class="accroche">${t("hero_texte")}</p>
        <div class="boutons">${boutonsAccueil(s).map(lienBouton).join("")}</div>
        <ul class="hero-atouts">${["hero_point1", "hero_point2", "hero_point3"].filter((k) => T(k).trim()).map((k) => `<li>${I.coche}${t(k)}</li>`).join("")}</ul>
      </div>
      ${!option("collage") ? "" : jeux.length >= 2 ? `<div class="mosaique" data-parallaxe="-0.05">
        <a class="mosaique-case grande" href="#/jeu/${echapper(a.id)}" aria-label="${echapper(a.titre)}">${imageJeu(a)}<span class="mosaique-nom">${echapper(a.titre)}</span></a>
        <a class="mosaique-case" href="#/jeu/${echapper(b.id)}" aria-label="${echapper(b.titre)}">${imageJeu(b)}<span class="mosaique-nom">${echapper(b.titre)}</span></a>
        <a class="mosaique-case mosaique-compteur" href="#/jeux"><small>${t("hero_compteur")}</small><span><b>${nbTexte(jeux.length)} ${nomJeux(jeux.length)}</b>${I.externe}</span></a>
        <div class="mosaique-bulle" aria-hidden="true">${imageJeu(a)}<span><small><span class="point"></span>${t("accueil_bulle")}</small><b>${echapper(a.titre)}</b></span></div>
      </div>` : a || s.banniere ? `<div class="mosaique seule"><a class="mosaique-case" href="${a ? "#/jeu/" + echapper(a.id) : "#/jeux"}">${a ? imageJeu(a) : `<img src="${echapper(lien(s.banniere))}" alt="">`}</a></div>` : ""}
    </div>
  </section>`,
    defilant: () => {
      const mots = T("defilant_mots").split(/[·|,]/).map((x) => x.trim()).filter(Boolean);
      let items = mots.flatMap((m, i) => (jeux[i] ? [m, jeux[i].titre] : [m]));
      if (!items.length) return "";
      while (items.length < 12) items = items.concat(items);
      const html = items.map((x) => `<span>${echapper(x)}</span>`).join("");
      return `<div class="defilant" aria-hidden="true"><div class="defilant-piste">${html}${html}</div></div>`;
    },
    atouts: () => `
  <section class="section">
    <div class="conteneur"><div class="grille-atouts">
      ${[["ecran", 1], ["euro", 2], ["utilisateur", 3], ["lien", 4]].map(([ic, n]) => `<div class="atout"><span class="atout-icone">${I[ic]}</span><b>${t("atout" + n + "_titre")}</b><span>${t("atout" + n + "_texte")}</span></div>`).join("")}
    </div></div>
  </section>`,
    une: () => !slidesDe().length ? "" : `
  <section class="section une" id="une" aria-roledescription="carrousel" aria-label="${t("une_etiquette")}">
    <div class="conteneur">
      ${enteteSection(t("une_etiquette"), t("une_titre"), `<div class="carrousel-nav" id="carrouselNav">
        <button class="bouton-rond contour" type="button" id="slidePrec" aria-label="Carte précédente">${I.chevG}</button>
        <button class="bouton-rond contour" type="button" id="slideSuiv" aria-label="Carte suivante">${I.chevD}</button></div>`)}
      <div class="carrousel-fenetre" id="fenetre"><div class="piste" id="piste"></div></div>
      <div class="progs" id="progs"></div>
    </div>
  </section>`,
    derniers: () => `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("derniers_etiquette"), t("derniers_titre"), jeux.length > 6 ? `<a class="lien-fleche" href="#/jeux">${t("derniers_tous")} ${I.droite}</a>` : `<a class="lien-fleche" href="#/jeux">${t("derniers_voir")} ${I.droite}</a>`)}
      ${jeux.length ? `<div class="grille-jeux">${jeux.slice(0, 6).map((j) => carteJeu(j)).join("")}</div>` : `<div class="vide">${dessin("vide", "vide-dessin")}<strong>${t("jeux_vide_titre")}</strong><span>${echapper(donnees.sectionJeux?.vide || "")}</span></div>`}
    </div>
  </section>`,
    genres: () => genres.length < 2 ? "" : `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("genres_etiquette"), t("genres_titre"))}
      <div class="grille-genres">${genres.map(([k, nom]) => {
        const liste = jeux.filter((j) => (j.genre || "").trim().toLowerCase() === k);
        return `<a class="tuile-genre" href="#/jeux?genre=${encodeURIComponent(k)}">
          <span class="tuile-nom">${echapper(nom)}</span><span class="tuile-nb">${pluriel(liste.length, "jeu", "jeux")}</span>
          <span class="tuile-images">${liste.slice(0, 3).map((j) => j.image ? `<img src="${echapper(lien(j.image))}" alt="">` : "").join("")}</span></a>`;
      }).join("")}</div>
    </div>
  </section>`,
    galerie: () => {
      const imgs = [
        ...jeux.filter((j) => j.image).map((j) => ({ src: j.image, titre: j.titre, lienJeu: j.id })),
        ...(Array.isArray(donnees.slides) ? donnees.slides : []).filter((x) => x.image).map((x) => ({ src: x.image, titre: x.titre || "" })),
        ...blocsPerso().flatMap((b) => [b.image, ...(b.images || [])]).filter(Boolean).map((src) => ({ src, titre: "" })),
      ];
      if (imgs.length < 2) return "";
      // 8 cases (une grande, une large) : les cases en trop se remplissent de dessins
      const cases = imgs.slice(0, 8);
      ["ludotheque", "atelier", "lettre", "jouer", "partager", "choisir"].forEach((d) => { if (cases.length < 8) cases.push({ dessin: d }); });
      return `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("galerie_etiquette"), t("galerie_titre"), `<span class="meta">${t("galerie_aide")}</span>`)}
      <div class="galerie-mur">${cases.map((x, i) => {
        const forme = i === 0 ? "grande" : i === 5 ? "large" : "";
        if (x.dessin) return `<div class="galerie-case dessinee ${forme}" aria-hidden="true">${window.ILLUS?.[x.dessin] || ""}</div>`;
        return `<button class="galerie-case ${forme}" type="button" data-zoom="${echapper(lien(x.src))}" data-legende="${echapper(x.titre)}"><img src="${echapper(lien(x.src))}" alt="${echapper(x.titre)}" loading="lazy">${x.titre ? `<span>${echapper(x.titre)}</span>` : ""}</button>`;
      }).join("")}</div>
    </div>
  </section>`;
    },
    citation: () => {
      const images = (jeux.length > 4 ? jeux.slice(2, 5) : jeux.slice(0, 3));
      return `
  <section class="citation">
    <div class="conteneur citation-grille">
      <div>
        <p class="etiquette clair">${t("citation_etiquette")}</p>
        <blockquote>« ${t("citation_texte")} »</blockquote>
        <div class="citation-auteur"><span class="citation-avatar">${h.image ? `<img src="${echapper(lien(h.image))}" alt="">` : echapper(T("citation_nom").charAt(0).toUpperCase())}</span>
          <span><b>${t("citation_nom")}</b><small>${t("citation_role")}</small></span></div>
      </div>
      ${images.length ? `<div class="citation-images" data-parallaxe="0.06">${images.map((j) => `<a href="#/jeu/${echapper(j.id)}" aria-label="${echapper(j.titre)}">${imageJeu(j)}</a>`).join("")}</div>` : ""}
    </div>
  </section>`;
    },
    etapes: () => `
  <section class="section">
    <div class="conteneur">
      <div class="section-tete centre"><div><p class="etiquette">${t("etapes_etiquette")}</p><h2>${t("etapes_titre")}</h2></div></div>
      <div class="grille-etapes">${[1, 2, 3].map((n) => `<div class="etape" data-n="${n}">${dessin(["choisir", "jouer", "partager"][n - 1], "etape-dessin")}<span class="etape-num">${n}</span><b>${t("etape" + n + "_titre")}</b><span>${t("etape" + n + "_texte")}</span></div>`).join("")}</div>
    </div>
  </section>`,
    prochains: () => `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("prochains_etiquette"), t("prochains_titre"), `<a class="lien-fleche" href="#/contact">${t("prochains_lien")} ${I.droite}</a>`)}
      ${grilleProchains(prochains)}
    </div>
  </section>`,
    blocs: () => blocsPour("accueil"),
    apropos: () => `
  <section class="section">
    <div class="conteneur">
      <div class="teaser">
        <a class="teaser-image" href="#/a-propos" aria-label="${t("teaser_lien")}">${h.image ? `<img src="${echapper(lien(h.image))}" alt="">` : option("illustrations") && window.ILLUS ? window.ILLUS.portrait : I.photo}</a>
        <div class="teaser-texte">
          <p class="etiquette">${t("teaser_etiquette")}</p>
          <h2 class="teaser-titre">${echapper(h.titre?.trim() || T("teaser_titre"))}</h2>
          <p class="teaser-extrait">${echapper((String(h.texte || "").trim() ? String(h.texte).split(/\n{2,}/)[0] : T("teaser_texte")).slice(0, 260))}</p>
          <div class="chiffres">
            <div><b>${nbTexte(jeux.length)}</b><small>${t("teaser_chiffre1")}</small></div>
            <div><b>${nbTexte(prochains.length)}</b><small>${t("teaser_chiffre2")}</small></div>
          </div>
          <a class="lien-fleche" href="#/a-propos">${t("teaser_lien")} ${I.droite}</a>
        </div>
      </div>
    </div>
  </section>`,
    contact: () => {
      const c = donnees.contact || {}, mail = emailSur(c.email), tel = telLien(c.telephone);
      if (!(mail || tel || liens.length)) return "";
      return `
  <section class="section">
    <div class="conteneur">
      <div class="bande-contact">
        <div class="bande-tete"><p class="etiquette">${t("bande_etiquette")}</p><h2>${t("bande_titre")}</h2><p>${t("bande_texte")}</p>${dessin("lettre", "bande-dessin")}</div>
        <div class="bande-liens">
          ${mail ? `<a class="bande-lien clair" href="mailto:${echapper(mail)}"><span>${echapper(mail)}</span>${I.droite}</a>` : ""}
          ${tel ? `<a class="bande-lien clair" href="tel:${echapper(tel)}"><span>${echapper(c.telephone.trim())}</span>${I.droite}</a>` : ""}
          ${liens.length ? `<div class="bande-reseaux">${liens.map((l) => `<a class="bande-lien" href="${echapper(l.url)}" target="_blank" rel="noopener"><span>${echapper(l.nom)}</span>${I.externe}</a>`).join("")}</div>` : ""}
          <a class="bande-lien clair" href="#/contact"><span>${t("bande_bouton")}</span>${I.droite}</a>
        </div>
      </div>
    </div>
  </section>`;
    },
  });
};

// ---------- Jeux ----------
const filtres = { texte: "", genre: "", tri: "recent", favoris: false };
const favoris = new Set(lire("bs-favoris", []));
let recents = lire("bs-recents", []);

PAGES.jeux = () => {
  const sj = donnees.sectionJeux || {}, jeux = jeuxTries();
  const ordre = sectionsDePage("jeux");
  return assembler("jeux", {
    entete: () => `
  <section class="entete-page">
    <div class="conteneur entete-illu">
      <div><p class="etiquette">${t("jeux_etiquette", { jeux: pluriel(jeux.length, "jeu", "jeux") })}</p>
      <h1>${echapper(sj.titre || "Jeux")}</h1>
      ${sj.intro ? `<p class="accroche">${echapper(sj.intro)}</p>` : ""}</div>
      ${dessin("ludotheque", "entete-dessin")}
    </div>
  </section>`,
    reprendre: () => `<section class="section serree"><div class="conteneur"><div class="reprendre" id="reprendre" hidden><p class="sous-titre">${t("jeux_reprendre")}</p><div class="reprendre-liste" id="reprendreListe"></div></div></div></section>`,
    outils: () => jeux.length < 2 ? "" : `
  <section class="section serree"><div class="conteneur">
      <div class="outils">
        <label class="champ-recherche">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="filtreTexte" placeholder="${t("jeux_recherche")}" aria-label="${t("jeux_recherche")}" value="${echapper(filtres.texte)}">
        </label>
        <div class="puces" id="puces" role="group" aria-label="Filtrer"></div>
        <label class="tri"><span class="visuellement-cache">Trier</span>
          <select id="tri"><option value="recent">${t("jeux_tri_recent")}</option><option value="az">${t("jeux_tri_az")}</option></select></label>
      </div>
  </div></section>`,
    grille: () => `<section class="section serree"><div class="conteneur"><div class="grille-jeux" id="grilleJeux"></div><div class="vide" id="videJeux" hidden></div></div></section>`,
    blocs: () => blocsPour("jeux"),
  }) + (ordre.includes("grille") ? "" : `<div hidden><div id="grilleJeux"></div><div id="videJeux"></div></div>`)
     + (ordre.includes("reprendre") ? "" : `<div hidden><div id="reprendre"></div><div id="reprendreListe"></div></div>`);
};
function majListeJeux() {
  if (pageActuelle !== "jeux") return;
  const sj = donnees.sectionJeux || {}, jeux = donnees.jeux;
  const genres = [...new Map(jeux.filter((j) => j.genre?.trim()).map((j) => [j.genre.trim().toLowerCase(), majuscule(j.genre.trim())])).entries()];
  if (filtres.genre && !genres.some(([k]) => k === filtres.genre)) filtres.genre = "";
  const aFav = option("favoris") && jeux.some((j) => favoris.has(j.id));
  if (!aFav) filtres.favoris = false;
  if ($("puces")) $("puces").innerHTML = [`<button class="puce" type="button" data-genre="" aria-pressed="${!filtres.genre && !filtres.favoris}">${t("jeux_tous")}</button>`]
    .concat(aFav ? [`<button class="puce" type="button" data-favoris aria-pressed="${filtres.favoris}">${I.coeur}${t("jeux_favoris")}</button>`] : [])
    .concat(genres.map(([k, nom]) => `<button class="puce" type="button" data-genre="${echapper(k)}" aria-pressed="${filtres.genre === k}">${echapper(nom)}</button>`)).join("");
  if ($("tri")) $("tri").value = filtres.tri;
  const q = filtres.texte.trim().toLowerCase();
  let liste = jeux.filter((j) => (!filtres.genre || (j.genre || "").trim().toLowerCase() === filtres.genre) && (!filtres.favoris || favoris.has(j.id))
    && (!q || `${j.titre} ${j.genre || ""} ${j.description || ""}`.toLowerCase().includes(q)));
  liste = filtres.tri === "az" ? liste.sort((a, b) => a.titre.localeCompare(b.titre, "fr")) : liste.sort((a, b) => dateJeu(b) - dateJeu(a));
  $("grilleJeux").innerHTML = liste.map((j) => carteJeu(j)).join("");
  $("videJeux").hidden = liste.length > 0;
  $("videJeux").innerHTML = !jeux.length
    ? `<strong>${t("jeux_vide_titre")}</strong><span>${echapper(sj.vide || "")}</span>`
    : `<strong>${t("jeux_aucun_titre")}</strong><span>${t("jeux_aucun_texte")}</span><button class="btn petit" type="button" data-reinitialiser>${t("jeux_tout_afficher")}</button>`;
  const rep = recents.map(trouverJeu).filter(Boolean).slice(0, 4);
  $("reprendre").hidden = !rep.length || apercu;
  $("reprendreListe").innerHTML = rep.map((j) => `<button class="reprise" type="button" data-jouer="${echapper(j.id)}" ${attrCouleur(j)}>
    <span class="reprise-image">${imageJeu(j)}</span><span><b>${echapper(j.titre)}</b><small>${t("jeux_continuer")} ${I.jouer}</small></span></button>`).join("");
  jeux.forEach(calculerCouleur);
}

// ---------- Page d'un jeu ----------
PAGES.jeu = (id) => {
  const j = trouverJeu(id);
  if (!j) return PAGES.introuvable();
  const liste = jeuxTries(), i = liste.indexOf(j);
  const prec = liste[(i + 1) % liste.length], suiv = liste[(i - 1 + liste.length) % liste.length];
  const autres = liste.filter((x) => x !== j).sort((a, b) => ((b.genre || "") === (j.genre || "")) - ((a.genre || "") === (j.genre || ""))).slice(0, 3);
  const fav = favoris.has(j.id);
  return assembler("jeu", {
    fiche: () => `
  <section class="page-jeu" ${attrCouleur(j)}>
    <div class="conteneur">
      <nav class="fil" aria-label="Fil d'Ariane"><a href="#/jeux">${t("jeu_fil")}</a><span aria-hidden="true">/</span><span aria-current="page">${echapper(j.titre)}</span></nav>
      <div class="jeu-grille">
        <button class="jeu-visuel" type="button" data-jouer="${echapper(j.id)}" aria-label="Jouer à ${echapper(j.titre)}">
          ${imageJeu(j)}
          <span class="jeu-visuel-jouer">${I.jouer}</span>
        </button>
        <div class="jeu-infos">
          <p class="etiquette">${estNouveau(j) ? `<span class="badge">${t("carte_nouveau")}</span>` : ""}${echapper(majuscule(j.genre || T("jeu_genre_defaut")))}</p>
          <h1>${echapper(j.titre)}</h1>
          ${aUneDate(j) ? `<p class="meta">${t("jeu_ajoute")} ${formatDate(j)}</p>` : ""}
          <div class="prose">${paragraphes(j.description) || `<p>${t("jeu_desc_defaut")}</p>`}</div>
          <div class="boutons">
            <button class="btn plein grand" type="button" data-jouer="${echapper(j.id)}">${I.jouer}${t("jeu_jouer")}</button>
            ${option("favoris") ? `<button class="bouton-rond contour grand" type="button" data-favori="${echapper(j.id)}" aria-pressed="${fav}" aria-label="${fav ? "Retirer des" : "Ajouter aux"} favoris">${I.coeur}</button>` : ""}
            <button class="bouton-rond contour grand" type="button" data-partager="${echapper(j.id)}" aria-label="Copier le lien du jeu">${I.lien}</button>
          </div>
          ${option("infosJeu") ? `<ul class="infos-pratiques">
            <li>${I.ecran}<span><b>${t("jeu_info1_titre")}</b>${t("jeu_info1")}</span></li>
            <li>${I.cadeau}<span><b>${t("jeu_info2_titre")}</b>${t("jeu_info2")}</span></li>
            <li>${I.souris}<span><b>${t("jeu_info3_titre")}</b>${t("jeu_info3")}</span></li>
          </ul>` : ""}
        </div>
      </div>
    </div>
  </section>`,
    suite: () => liste.length < 3 ? "" : `
  <section class="section serree">
    <div class="conteneur">
      <div class="suite-jeux">
        <a class="suite" href="#/jeu/${echapper(prec.id)}">${I.gauche}<span><small>${t("jeu_precedent")}</small><b>${echapper(prec.titre)}</b></span></a>
        <a class="suite droite" href="#/jeu/${echapper(suiv.id)}"><span><small>${t("jeu_suivant")}</small><b>${echapper(suiv.titre)}</b></span>${I.droite}</a>
      </div>
    </div>
  </section>`,
    autres: () => liste.length < 2 ? "" : `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("jeu_autres_etiquette"), t("jeu_autres_titre"), `<a class="lien-fleche" href="#/jeux">${t("jeu_autres_lien")} ${I.droite}</a>`)}
      <div class="grille-jeux">${autres.map((x) => carteJeu(x)).join("")}</div>
    </div>
  </section>`,
    blocs: () => blocsPour("jeu"),
  });
};

// ---------- À propos ----------
// Prochains jeux : réglés dans l'admin (onglet Histoire), sinon exemples
const PROCHAINS_DEFAUT = [
  { nom: "Jeu mystère", genre: "Course", avancement: 70 },
  { nom: "Jeu mystère", genre: "Puzzle", avancement: 40 },
  { nom: "Jeu mystère", genre: "Aventure", avancement: 15 },
];
const grilleProchains = (prochains) => `<div class="grille-prochains">${prochains.map((p) => `<article class="prochain">
    <div class="prochain-visuel">${option("illustrations") && window.ILLUS ? window.ILLUS.mystere : `<span class="prochain-forme f1"></span><span class="prochain-forme f2"></span><span class="prochain-cadenas">${I.cadenas}</span>`}<span class="badge noir">${t("prochains_badge")}</span></div>
    <div class="prochain-corps"><h3>${echapper(p.nom)}</h3>${p.genre ? `<p class="meta">${echapper(p.genre)}</p>` : ""}
      <div class="avancement" role="img" aria-label="Avancement : ${p.avancement} %"><span class="avancement-barre"><span style="--v:${p.avancement}%"></span></span><span class="avancement-nb">${p.avancement} %</span></div></div>
  </article>`).join("")}
  <a class="prochain idee" href="#/contact"><span class="idee-plus">+</span><b>${t("idee_titre")}</b><span>${t("idee_texte")}</span></a></div>`;
function prochainsJeux(h) {
  const l = String(h.prochains || "").split("\n").map((x) => x.split("|").map((y) => y.trim())).filter((x) => x[0])
    .map(([nom, genre, av]) => ({ nom, genre: genre || "", avancement: Math.max(0, Math.min(100, parseInt(av, 10) || 0)) }));
  return l.length ? l : PROCHAINS_DEFAUT;
}
PAGES["a-propos"] = () => {
  const h = donnees.histoire || {}, jeux = jeuxTries(), chrono = [...jeux].reverse().filter(aUneDate);
  const prochains = prochainsJeux(h);
  return `
  <section class="entete-page">
    <div class="conteneur entete-illu">
      <div><p class="etiquette">${t("apropos_etiquette")}</p>
      <h1>${echapper(h.titre?.trim() || T("teaser_titre"))}</h1></div>
      ${dessin("atelier", "entete-dessin")}
    </div>
  </section>` + assembler("a-propos", {
    histoire: () => `
  <section class="section serree">
    <div class="conteneur apropos ${h.image || option("illustrations") ? "" : "sans-image"}">
      ${h.image ? `<figure class="apropos-image"><img src="${echapper(lien(h.image))}" alt=""></figure>` : option("illustrations") ? `<figure class="apropos-image dessinee">${window.ILLUS?.portrait || ""}</figure>` : ""}
      <div class="apropos-texte"><div class="prose grande">${paragraphes(String(h.texte || "").trim() ? h.texte : T("teaser_texte"))}</div></div>
    </div>
  </section>`,
    debut: () => `
  <section class="section">
    <div class="conteneur">
      <div class="debut">
        <div class="debut-texte">
          <p class="etiquette clair">${t("debut_etiquette")}</p>
          <h2>${echapper(h.suiteTitre || T("debut_titre"))}</h2>
          <p>${echapper(h.suiteTexte || T("debut_texte"))}</p>
        </div>
        <div class="debut-compteur">
          <span class="compteur-nb">${jeux.length}</span>
          <span class="compteur-plus">+${prochains.length}</span>
          <span class="compteur-legende">${t("debut_en_ligne", { jeux: pluriel(jeux.length, "jeu", "jeux") })}<br>${t("debut_preparation", { prochains: String(prochains.length) })}</span>
        </div>
        <div class="debut-pile" aria-hidden="true">
          ${jeux.slice(0, 3).map((j, i) => `<span class="pile-${i + 1}" ${attrCouleur(j)}>${imageJeu(j)}</span>`).join("")}
          <span class="pile-mystere">?</span>
        </div>
      </div>
    </div>
  </section>`,
    prochains: () => `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("prochains_etiquette"), t("prochains_titre"), `<a class="lien-fleche" href="#/contact">${t("prochains_lien")} ${I.droite}</a>`)}
      ${grilleProchains(prochains)}
    </div>
  </section>`,
    chrono: () => !chrono.length ? "" : `
  <section class="section">
    <div class="conteneur">
      ${enteteSection(t("chrono_etiquette"), t("chrono_titre"))}
      <ol class="chronologie">${chrono.map((j) => `
        <li ${attrCouleur(j)}>
          <span class="chrono-date">${formatDate(j, { day: "numeric", month: "short", year: "numeric" })}</span>
          <a class="chrono-carte" href="#/jeu/${echapper(j.id)}"><span class="chrono-image">${imageJeu(j)}</span>
            <span><b>${echapper(j.titre)}</b><small>${echapper(majuscule(j.genre || T("jeu_genre_defaut")))}</small></span>${I.droite}</a>
        </li>`).join("")}
        <li class="chrono-futur" style="--c:#C9C9D2">
          <span class="chrono-date">${t("chrono_bientot")}</span>
          <span class="chrono-carte vide-futur"><span class="chrono-image">?</span><span><b>${t("chrono_prochain")}</b><small>${t("chrono_preparation")}</small></span></span>
        </li>
      </ol>
    </div>
  </section>`,
    blocs: () => blocsPour("a-propos"),
  });
};

// ---------- Contact ----------
// Cartes « mail » et « téléphone » (page Contact et bandeau de l'accueil)
const coordonnee = (icone, titre, valeur, href, action) => `
    <div class="carte-coord">
      <span class="coord-icone">${icone}</span>
      <span class="coord-texte"><small>${titre}</small><b>${echapper(valeur)}</b></span>
      <span class="coord-actions">
        <button class="bouton-rond contour" type="button" data-copier="${echapper(valeur)}" aria-label="Copier">${I.copie}</button>
        <a class="btn plein petit" href="${echapper(href)}">${action}</a>
      </span>
    </div>`;
function cartesCoordonnees() {
  const c = donnees.contact || {}, mail = emailSur(c.email), tel = telLien(c.telephone);
  return (mail ? coordonnee(I.mail, t("contact_email"), mail, "mailto:" + mail, t("contact_ecrire")) : "")
    + (tel ? coordonnee(I.tel, t("contact_telephone"), c.telephone.trim(), "tel:" + tel, t("contact_appeler")) : "");
}

PAGES.contact = () => {
  const c = donnees.contact || {}, liens = reseaux(), mail = emailSur(c.email), tel = telLien(c.telephone);
  return assembler("contact", {
    entete: () => `
  <section class="entete-page">
    <div class="conteneur entete-illu">
      <div><p class="etiquette">${t("contact_etiquette")}</p>
      <h1>${echapper(c.titre || "Restons en contact")}</h1>
      <p class="accroche">${echapper(c.texte || "Une idée de jeu, un bug, un record à partager ? Écris-moi.")}</p></div>
      ${dessin("lettre", "entete-dessin")}
    </div>
  </section>`,
    coordonnees: () => !(mail || tel) ? "" : `<section class="section serree"><div class="conteneur"><div class="grille-coord">${cartesCoordonnees()}</div></div></section>`,
    reseaux: () => !liens.length ? "" : `<section class="section serree"><div class="conteneur"><p class="sous-titre">${t("contact_reseaux")}</p><div class="grille-reseaux grande">${liens.map(carteReseau).join("")}</div></div></section>`,
    partage: () => `
  <section class="section serree">
    <div class="conteneur">
      <div class="carte-partage">
        <div><h2>${t("partage_titre")}</h2><p>${t("partage_texte")}</p></div>
        <button class="btn plein" type="button" data-partager-site>${I.lien}${t("partage_bouton")}</button>
      </div>
    </div>
  </section>`,
    blocs: () => blocsPour("contact"),
  });
};

PAGES.introuvable = () => `
  <section class="entete-page centre">
    <div class="conteneur">
      ${dessin("perdu", "dessin-404")}
      <p class="etiquette">${t("erreur_etiquette")}</p>
      <h1>${t("erreur_titre")}</h1>
      <p class="accroche">${t("erreur_texte")}</p>
      <div class="boutons centre"><a class="btn plein" href="#/jeux">${t("erreur_bouton")}</a><a class="btn" href="#/">${t("nav_accueil")}</a></div>
    </div>
  </section>`;

// =========================================================
// Navigation entre les pages
// =========================================================
const NOMS_PAGES = {};
const majNomsPages = () => Object.assign(NOMS_PAGES, { accueil: T("nav_accueil"), jeux: T("nav_jeux"), "a-propos": T("nav_apropos"), contact: T("nav_contact") });

function lireAdresse() {
  const h = decodeURIComponent(location.hash || "");
  // Anciennes adresses du site (toujours valables)
  if (!h || h === "#" || h === "#accueil" || h === "#/") return { page: "accueil" };
  if (h === "#jeux") return { page: "jeux" };
  if (h === "#histoire") return { page: "a-propos" };
  if (h === "#une") return { page: "accueil", ancre: "une" };
  let m;
  if ((m = h.match(/^#bloc-(.+)$/))) {
    // Le bloc peut être sur une autre page que l'accueil
    const b = blocsPerso().find((x) => x.id === m[1]), p = b?.page && b.page !== "jeu" ? b.page : "accueil";
    return { page: p, ancre: "bloc-" + m[1] };
  }
  if ((m = h.match(/^#jeu-(.+)$/))) return { page: "jeu", id: m[1] };
  if ((m = h.match(/^#jouer-(.+)$/))) return { page: "jeu", id: m[1], jouer: true };
  if ((m = h.match(/^#\/jeu\/([^?]+)/))) return { page: "jeu", id: m[1] };
  if ((m = h.match(/^#\/jeux(?:\?genre=(.+))?$/))) return { page: "jeux", genre: m[1] || "" };
  if ((m = h.match(/^#\/(a-propos|contact)$/))) return { page: m[1] };
  if (h.startsWith("#/")) return { page: "introuvable" };
  return null; // ancre interne (ex. #contenu) : on ne change pas de page
}

function naviguer() {
  if (!donnees) return;
  const a = lireAdresse();
  if (!a) return;
  if ($("lecteur").open && !a.jouer) $("lecteur").close();
  ouvrirMenu(false);
  if (a.page === "jeux" && a.genre !== undefined) { filtres.genre = a.genre; filtres.favoris = false; }
  const memeFiche = a.page === pageActuelle && (a.page !== "jeu" || a.id === pageId);
  if (!memeFiche || a.ancre === undefined) afficherPage(a.page, a.id);
  if (a.ancre) requestAnimationFrame(() => document.getElementById(a.ancre)?.scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth" }));
  else scrollTo({ top: 0, behavior: memeFiche && !mouvementReduit ? "smooth" : "instant" });
  if (a.jouer) ouvrirJeu(a.id);
}
let pageId = null;
function afficherPage(page, id) {
  const vue = $("vue");
  pageActuelle = page; pageId = id || null;
  vue.innerHTML = PAGES[page](id);
  vue.classList.remove("entree"); void vue.offsetWidth; vue.classList.add("entree");
  const j = page === "jeu" ? trouverJeu(id) : null;
  document.title = (j ? j.titre + " · " : NOMS_PAGES[page] && page !== "accueil" ? NOMS_PAGES[page] + " · " : "") + (donnees.site.nom || "");
  majNav();
  if (page === "accueil") initCarrousel();
  if (page === "jeux") majListeJeux();
  (donnees.jeux || []).forEach(calculerCouleur);
  activerRevele();
  majDefilement();
  marquerImagesPretes();
}
addEventListener("hashchange", naviguer);

// Pastille qui glisse sous le lien actif
function majNav() {
  const actif = { jeu: "jeux", introuvable: "" }[pageActuelle] ?? pageActuelle;
  let cible = null;
  document.querySelectorAll(".nav a").forEach((a) => {
    const oui = a.dataset.page === actif;
    a.classList.toggle("actif", oui);
    oui ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    if (oui) cible = a;
  });
  const p = $("navPastille");
  if (!cible || !cible.offsetWidth) { p.style.opacity = 0; return; }
  p.style.opacity = 1;
  p.style.width = cible.offsetWidth + "px";
  p.style.transform = `translateX(${cible.offsetLeft}px)`;
  document.querySelectorAll(".menu-liens a").forEach((a) => a.classList.toggle("actif", a.dataset.page === actif));
}
addEventListener("resize", majNav);

// =========================================================
// Éléments communs (en-tête, menu, pied de page)
// =========================================================
function afficherCommun() {
  const s = donnees.site, jeux = jeuxTries(), liens = reseaux();
  majNomsPages();
  const txt = (sel, cle) => document.querySelectorAll(sel).forEach((el) => { el.textContent = T(cle); });
  document.querySelectorAll(".nav a[data-page]").forEach((a) => { a.textContent = NOMS_PAGES[a.dataset.page]; });
  txt(".entete-cta", "entete_jouer");
  txt(".menu > div:first-child > .etiquette", "menu_titre");
  txt(".menu-bas > .etiquette", "menu_derniers");
  $("paletteTexte").placeholder = T("recherche_placeholder");
  const titresPied = document.querySelectorAll(".pied-titre");
  ["pied_site", "pied_jeux", "pied_reseaux"].forEach((k, i) => { if (titresPied[i]) titresPied[i].textContent = T(k); });
  $("btnHaut").firstChild.textContent = T("pied_haut") + " ";
  $("btnFermer").lastChild.textContent = T("lecteur_retour");
  txt("#btnRejouer", "lecteur_recommencer"); txt("#btnPartager", "lecteur_partager"); txt("#btnSuivant", "lecteur_suivant");
  $("chargement").lastChild.textContent = T("lecteur_chargement");
  // Options d'affichage (onglet « Mise en page »)
  const h = document.documentElement;
  (window.OPTIONS_SITE || []).forEach(([cle]) => h.classList.toggle("sans-" + cle, !option(cle)));
  const intensite = Number(donnees.miseEnPage?.options?.intensiteDecor);
  h.style.setProperty("--intensite-decor", Number.isFinite(intensite) && donnees.miseEnPage?.options?.intensiteDecor !== undefined ? intensite / 100 : 1);
  let css = $("cssPerso");
  if (!css) { css = document.createElement("style"); css.id = "cssPerso"; document.head.appendChild(css); }
  css.textContent = donnees.apparence?.css || "";
  $("nomEntete").textContent = s.nom || "";
  // Logo : dessiné aux couleurs du site, sauf si « Mon image » est choisi dans l'admin
  const image = s.logoStyle === "image" && s.logo;
  $("logoEntete").hidden = !image;
  $("initialesEntete").hidden = !!image;
  $("initialesEntete").innerHTML = window.LOGO_BS ? window.LOGO_BS() : echapper(initiales(s.nom || "?"));
  if (image) $("logoEntete").src = lien(s.logo);
  if (s.accroche) document.querySelector('meta[name="description"]').content = s.accroche;
  const pages = [["accueil", "#/"], ["jeux", "#/jeux"], ["a-propos", "#/a-propos"], ["contact", "#/contact"]];
  const blocsMenu = blocsPerso().filter((b) => b.dansMenu && b.titre && htmlBloc(b));
  $("menuLiens").innerHTML = pages.map(([p, href], i) => `<li><a href="${href}" data-page="${p}"><span class="menu-num">0${i + 1}</span>${NOMS_PAGES[p]}${p === "jeux" && jeux.length ? `<small>${jeux.length}</small>` : ""}</a></li>`).join("")
    + blocsMenu.map((b, i) => `<li><a href="#bloc-${echapper(b.id)}"><span class="menu-num">0${pages.length + i + 1}</span>${echapper(b.titre.trim())}</a></li>`).join("");
  $("menuJeux").innerHTML = jeux.slice(0, 3).map((j) => `<a class="menu-jeu" href="#/jeu/${echapper(j.id)}" ${attrCouleur(j)}><span class="menu-jeu-image">${imageJeu(j)}</span><span><b>${echapper(j.titre)}</b><small>${echapper(majuscule(j.genre || T("jeu_genre_defaut")))}</small></span></a>`).join("");
  $("menuReseaux").innerHTML = liens.map(pastilleReseau).join("");
  $("piedNom").innerHTML = (image ? `<img class="pied-logo" src="${echapper(lien(s.logo))}" alt="">` : window.LOGO_BS ? window.LOGO_BS() : "") + `<span>${echapper(s.nom || "")}</span>`;
  $("piedAccroche").textContent = s.accroche || "";
  $("pied").textContent = s.piedDePage || `© ${new Date().getFullYear()} ${s.nom || ""}`;
  $("piedNav").innerHTML = pages.map(([p, href]) => `<li><a href="${href}">${NOMS_PAGES[p]}</a></li>`).join("");
  $("piedJeux").innerHTML = jeux.slice(0, 6).map((j) => `<li><a href="#/jeu/${echapper(j.id)}">${echapper(j.titre)}</a></li>`).join("") || `<li>${t("chrono_bientot")}</li>`;
  const mail = emailSur(donnees.contact?.email);
  $("piedReseauxCol").hidden = !liens.length && !mail;
  $("piedReseaux").innerHTML = liens.map((l) => `<li><a href="${echapper(l.url)}" target="_blank" rel="noopener">${echapper(l.nom)} ↗</a></li>`).join("")
    + (mail ? `<li><a href="mailto:${echapper(mail)}">${echapper(mail)}</a></li>` : "");
}

function ouvrirMenu(ouvrir) {
  $("menu").classList.toggle("ouvert", ouvrir);
  $("menu").inert = !ouvrir;
  $("voile").hidden = !ouvrir;
  $("burger").setAttribute("aria-expanded", String(ouvrir));
  $("burger").setAttribute("aria-label", ouvrir ? "Fermer le menu" : "Ouvrir le menu");
  document.body.classList.toggle("menu-ouvert", ouvrir);
}
$("burger").addEventListener("click", () => ouvrirMenu($("burger").getAttribute("aria-expanded") !== "true"));
$("voile").addEventListener("click", () => ouvrirMenu(false));
$("btnHaut").addEventListener("click", () => scrollTo({ top: 0, behavior: mouvementReduit ? "auto" : "smooth" }));
const majEntete = () => $("entete").classList.toggle("defile", scrollY > 12);
addEventListener("scroll", majEntete, { passive: true });

// =========================================================
// Carrousel « À la une » (infini, glissable)
// =========================================================
function slidesParDefaut() {
  const r = (donnees.blocs || []).find((b) => b.type === "liens");
  const l = [{ id: "s-jeu", type: "dernier-jeu", surtitre: "Dernière sortie", boutonTexte: "Jouer maintenant" }];
  if (r) l.push({ id: "s-reseaux", type: "perso", surtitre: "Rejoins-moi", titre: "Suis-moi sur les réseaux", texte: "Les coulisses de mes jeux et les prochaines sorties.", boutonTexte: "Voir mes réseaux", cible: "#/contact" });
  return l;
}
const slidesDe = () => (Array.isArray(donnees.slides) ? donnees.slides : slidesParDefaut()).filter((s) => s.type !== "accueil").map(htmlCarte).filter(Boolean);
function htmlCarte(s) {
  if (s.type === "dernier-jeu") {
    const j = jeuxTries()[0];
    if (!j) return "";
    const resume = j.description || [majuscule(j.genre || ""), aUneDate(j) ? "ajouté le " + formatDate(j) : ""].filter(Boolean).join(" · ");
    return `<div class="carte-media" ${attrCouleur(j)}>${j.image ? `<img src="${echapper(lien(j.image))}" alt="" draggable="false">` : ""}</div>
      <div class="carte-corps">
        <p class="etiquette">${estNouveau(j) ? `<span class="badge">${t("carte_nouveau")}</span>` : ""}${echapper(s.surtitre || "Dernière sortie")}</p>
        <h3>${echapper(j.titre)}</h3>
        ${resume ? `<p class="desc">${echapper(resume)}</p>` : ""}
        <div class="boutons"><button class="btn plein" type="button" data-jouer="${echapper(j.id)}">${I.jouer}${echapper(s.boutonTexte || "Jouer maintenant")}</button><a class="btn" href="#/jeu/${echapper(j.id)}">Voir le jeu</a></div>
      </div>`;
  }
  if (!s.titre && !s.texte && !s.image) return "";
  const externe = s.cible === "url", href = externe ? lienSur(s.url) : s.cible;
  const dessins = ["atelier", "lettre", "ludotheque"], dessinCarte = window.ILLUS?.[dessins[teinteDe(s.id || s.titre) % 3]] || "";
  return `<div class="carte-media ${s.image ? "" : "carte-dessin"}">${s.image ? `<img src="${echapper(lien(s.image))}" alt="" draggable="false" onerror="this.remove()">` : dessinCarte}</div>
    <div class="carte-corps">
      ${s.surtitre ? `<p class="etiquette">${echapper(s.surtitre)}</p>` : ""}
      ${s.titre ? `<h3>${echapper(s.titre)}</h3>` : ""}
      ${s.texte ? `<p class="desc">${echapper(s.texte)}</p>` : ""}
      ${s.boutonTexte && href ? `<div class="boutons"><a class="btn plein" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(s.boutonTexte)}${externe ? I.externe : I.droite}</a></div>` : ""}
    </div>`;
}

let slideActuelle = 0, pos = 0, nbCartes = 0, glisse = null, aGlisse = false;
const cartes = () => ($("piste") ? [...$("piste").children] : []);
function initCarrousel() {
  if (!$("piste")) return;
  const html = slidesDe();
  nbCartes = html.length;
  const plusieurs = nbCartes > 1, copies = plusieurs ? [0, 1 % nbCartes] : [];
  $("piste").innerHTML = html.map((h, i) => `<article class="carte" data-i="${i}">${h}</article>`).join("")
    + copies.map((i) => `<article class="carte copie" aria-hidden="true" data-i="${i}">${html[i]}</article>`).join("");
  $("une").style.setProperty("--duree", (Number(donnees.slidesDuree) || 6) + "s");
  $("progs").hidden = $("carrouselNav").hidden = !plusieurs;
  $("progs").innerHTML = html.map((_, i) => `<button class="prog" type="button" data-slide="${i}" aria-label="Carte ${i + 1}"><span></span></button>`).join("");
  slideActuelle = Math.min(slideActuelle, Math.max(nbCartes - 1, 0));
  placer(slideActuelle, false);

  $("piste").addEventListener("transitionend", (e) => { if (e.target === $("piste") && e.propertyName === "transform" && pos >= nbCartes && !glisse) placer(0, false); });
  $("progs").addEventListener("animationend", (e) => { if (e.target.closest(".prog.actif")) suivante(); });
  $("progs").addEventListener("click", (e) => { const b = e.target.closest("[data-slide]"); if (b) placer(Number(b.dataset.slide)); });
  $("slidePrec").addEventListener("click", precedente);
  $("slideSuiv").addEventListener("click", suivante);
  const zone = $("une");
  zone.addEventListener("mouseenter", () => zone.classList.add("pause"));
  zone.addEventListener("mouseleave", () => zone.classList.remove("pause"));
  zone.addEventListener("focusin", () => zone.classList.add("pause"));
  zone.addEventListener("focusout", (e) => { if (!zone.contains(e.relatedTarget)) zone.classList.toggle("pause", zone.matches(":hover")); });
  zone.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") precedente(); if (e.key === "ArrowRight") suivante(); });
  const f = $("fenetre");
  f.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || nbCartes < 2) return;
    if (pos >= nbCartes) placer(0, false);
    if (pos === 0) placer(nbCartes, false);
    glisse = { x: e.clientX, y: e.clientY, base: -decalage(), id: e.pointerId, actif: false }; aGlisse = false;
  });
  f.addEventListener("dragstart", (e) => e.preventDefault());
  f.addEventListener("click", (e) => {
    if (aGlisse) { e.preventDefault(); e.stopPropagation(); aGlisse = false; return; }
    const c = e.target.closest(".carte:not(.actif)");
    if (c) { e.preventDefault(); e.stopPropagation(); cartes().indexOf(c) > pos ? suivante() : precedente(); }
  }, true);
}
const decalage = (p = pos) => { const c = cartes()[p]; return c ? c.offsetLeft : 0; };
function placer(p, animer = true) {
  const L = cartes();
  if (!L.length) return;
  const faire = () => {
    pos = p; slideActuelle = ((p % nbCartes) + nbCartes) % nbCartes;
    $("piste").style.transform = `translateX(${-decalage()}px)`;
    L.forEach((c, k) => {
      const active = k === pos;
      c.classList.toggle("actif", active);
      if (!c.classList.contains("copie")) c.setAttribute("aria-hidden", String(!active));
      c.querySelectorAll("a, button").forEach((el) => (el.tabIndex = active ? 0 : -1));
    });
  };
  if (animer) faire(); else { $("piste").classList.add("sans-transition"); faire(); void $("piste").offsetWidth; $("piste").classList.remove("sans-transition"); }
  [...$("progs").children].forEach((b, k) => {
    b.classList.remove("actif"); b.classList.toggle("vue", k < slideActuelle);
    if (k === slideActuelle && nbCartes > 1 && !mouvementReduit) { void b.offsetWidth; b.classList.add("actif"); }
  });
}
function suivante() { if (nbCartes < 2) return; if (pos >= nbCartes) placer(0, false); placer(pos + 1); }
function precedente() { if (nbCartes < 2) return; if (pos <= 0) placer(nbCartes, false); placer(pos - 1); }
addEventListener("pointermove", (e) => {
  if (!glisse || e.pointerId !== glisse.id) return;
  const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
  if (!glisse.actif) {
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
    glisse.actif = aGlisse = true;
    $("piste").classList.add("sans-transition"); $("fenetre").classList.add("tire"); $("une").classList.add("pause");
  }
  $("piste").style.transform = `translateX(${glisse.base + dx}px)`;
});
addEventListener("pointerup", (e) => {
  if (!glisse || e.pointerId !== glisse.id) return;
  const dx = e.clientX - glisse.x, etait = glisse.actif;
  glisse = null;
  if (!$("piste")) return;
  $("piste").classList.remove("sans-transition"); $("fenetre").classList.remove("tire");
  if (!etait) return;
  const seuil = Math.min(120, $("fenetre").clientWidth * .15);
  if (dx < -seuil) suivante(); else if (dx > seuil) precedente(); else placer(pos);
  $("une").classList.toggle("pause", $("une").matches(":hover"));
});
addEventListener("resize", () => { if ($("piste")) placer(pos, false); });

// =========================================================
// Favoris, partage, notifications
// =========================================================
function basculerFavori(id) {
  favoris.has(id) ? favoris.delete(id) : favoris.add(id);
  ecrire("bs-favoris", [...favoris]);
  const oui = favoris.has(id);
  document.querySelectorAll(`[data-favori="${CSS.escape(id)}"]`).forEach((b) => { b.setAttribute("aria-pressed", String(oui)); b.setAttribute("aria-label", (oui ? "Retirer des" : "Ajouter aux") + " favoris"); });
  if (pageActuelle === "jeux") majListeJeux();
  notifier(oui ? "Ajouté à tes favoris" : "Retiré de tes favoris");
}
async function copier(url, message) {
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ url }); return; }
    await navigator.clipboard.writeText(url); notifier(message);
  } catch { notifier(url); }
}
const adresseSite = () => location.origin + location.pathname;
let minuterie;
function notifier(texte) {
  $("toast").textContent = texte; $("toast").classList.add("visible");
  clearTimeout(minuterie); minuterie = setTimeout(() => $("toast").classList.remove("visible"), 2600);
}

// =========================================================
// Recherche rapide
// =========================================================
let resultats = [], choix = 0;
function ouvrirRecherche() {
  if (!donnees) return;
  ouvrirMenu(false);
  $("paletteTexte").value = ""; remplirPalette("");
  if (!$("palette").open) $("palette").showModal();
  $("paletteTexte").focus();
}
function remplirPalette(q) {
  q = q.trim().toLowerCase();
  const jeux = jeuxTries().filter((j) => !q || `${j.titre} ${j.genre || ""}`.toLowerCase().includes(q));
  const pages = Object.entries(NOMS_PAGES).filter(([, n]) => !q || n.toLowerCase().includes(q));
  resultats = [...jeux.map((j) => "#/jeu/" + j.id), ...pages.map(([p]) => (p === "accueil" ? "#/" : "#/" + p))];
  choix = 0;
  let html = "";
  if (jeux.length) html += `<li class="palette-groupe" role="presentation">${t("nav_jeux")}</li>` + jeux.map((j, i) => `<li role="option" data-r="${i}" aria-selected="${i === 0}" ${attrCouleur(j)}><span class="palette-image">${imageJeu(j)}</span><span class="palette-titre">${echapper(j.titre)}</span><small>${echapper(majuscule(j.genre || ""))}</small></li>`).join("");
  if (pages.length) html += `<li class="palette-groupe" role="presentation">Pages</li>` + pages.map(([, n], k) => { const i = jeux.length + k; return `<li role="option" data-r="${i}" aria-selected="${i === 0}"><span class="palette-image icone">${I.page}</span><span class="palette-titre">${n}</span><small>Ouvrir</small></li>`; }).join("");
  $("paletteListe").innerHTML = html || `<li class="palette-vide">Aucun résultat pour « ${echapper(q)} »</li>`;
}
function surligner(i) {
  if (!resultats.length) return;
  choix = (i + resultats.length) % resultats.length;
  $("paletteListe").querySelectorAll("[data-r]").forEach((li) => li.setAttribute("aria-selected", String(Number(li.dataset.r) === choix)));
  $("paletteListe").querySelector(`[data-r="${choix}"]`)?.scrollIntoView({ block: "nearest" });
}
function valider(i) { if (!resultats[i]) return; $("palette").close(); location.hash = resultats[i]; }
$("paletteTexte").addEventListener("input", (e) => remplirPalette(e.target.value));
$("paletteTexte").addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); surligner(choix + 1); }
  if (e.key === "ArrowUp") { e.preventDefault(); surligner(choix - 1); }
  if (e.key === "Enter") { e.preventDefault(); valider(choix); }
  if (e.key === "Escape") { e.preventDefault(); $("palette").close(); }
});
$("paletteListe").addEventListener("click", (e) => { const li = e.target.closest("[data-r]"); if (li) valider(Number(li.dataset.r)); });
$("paletteListe").addEventListener("mousemove", (e) => { const li = e.target.closest("[data-r]"); if (li && Number(li.dataset.r) !== choix) surligner(Number(li.dataset.r)); });
$("palette").addEventListener("click", (e) => { if (e.target === $("palette")) $("palette").close(); });
$("btnRecherche").addEventListener("click", ouvrirRecherche);

// =========================================================
// Lecteur de jeu
// =========================================================
let jeuActuel = null;
function ouvrirJeu(id) {
  const j = trouverJeu(id);
  if (!j) return;
  jeuActuel = j;
  ouvrirMenu(false);
  $("lecteurTitre").textContent = j.titre;
  $("lecteurGenre").textContent = majuscule(j.genre || "Jeu");
  $("btnSuivant").hidden = donnees.jeux.length < 2;
  if (!$("lecteur").open) $("lecteur").showModal();
  $("scene").querySelector("iframe")?.remove();
  $("chargement").hidden = false;
  const f = document.createElement("iframe");
  f.title = j.titre; f.allow = "fullscreen; autoplay; gamepad";
  f.addEventListener("load", () => { $("chargement").hidden = true; f.focus(); });
  f.src = lien(j.fichier);
  $("scene").appendChild(f);
  if (!apercu) { recents = [id, ...recents.filter((x) => x !== id)].slice(0, 8); ecrire("bs-recents", recents); }
}
$("lecteur").addEventListener("close", () => {
  $("scene").querySelector("iframe")?.remove();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (location.hash.startsWith("#jouer-") && jeuActuel) history.replaceState(null, "", "#/jeu/" + jeuActuel.id);
  jeuActuel = null;
  if (pageActuelle === "jeux") majListeJeux();
});
$("btnFermer").addEventListener("click", () => $("lecteur").close());
$("btnRejouer").addEventListener("click", () => jeuActuel && ouvrirJeu(jeuActuel.id));
$("btnPartager").addEventListener("click", () => jeuActuel && copier(adresseSite() + "#/jeu/" + jeuActuel.id, "Lien du jeu copié !"));
$("btnSuivant").addEventListener("click", () => { const l = jeuxTries(), i = l.findIndex((j) => j.id === jeuActuel.id); ouvrirJeu(l[(i + 1) % l.length].id); });
$("btnPleinEcran").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else $("lecteur").requestFullscreen?.().catch(() => notifier("Le plein écran n'est pas disponible ici"));
});

// =========================================================
// Clics et touches
// =========================================================
document.addEventListener("click", (e) => {
  const t = e.target;
  const jouer = t.closest("[data-jouer]"); if (jouer) { e.preventDefault(); ouvrirJeu(jouer.dataset.jouer); return; }
  const zoom = t.closest("#vue [data-zoom], #vue .galerie img, #vue .b-image img"); if (zoom) { ouvrirVision(zoom); return; }
  const fav = t.closest("[data-favori]"); if (fav) { e.preventDefault(); basculerFavori(fav.dataset.favori); return; }
  const part = t.closest("[data-partager]"); if (part) { copier(adresseSite() + "#/jeu/" + part.dataset.partager, "Lien du jeu copié !"); return; }
  if (t.closest("[data-partager-site]")) { copier(adresseSite(), "Lien du site copié !"); return; }
  const cop = t.closest("[data-copier]");
  if (cop) { navigator.clipboard?.writeText(cop.dataset.copier).then(() => notifier("Copié : " + cop.dataset.copier), () => notifier(cop.dataset.copier)); return; }
  if (t.closest("[data-reinitialiser]")) { Object.assign(filtres, { texte: "", genre: "", favoris: false }); if ($("filtreTexte")) $("filtreTexte").value = ""; majListeJeux(); return; }
  const puce = t.closest(".puce");
  if (puce) {
    if (puce.hasAttribute("data-favoris")) { filtres.favoris = !filtres.favoris; filtres.genre = ""; }
    else { filtres.genre = puce.dataset.genre; filtres.favoris = false; }
    majListeJeux(); return;
  }
  // Un clic sur le lien de la page déjà ouverte ramène en haut
  const a = t.closest('a[href^="#"]');
  if (a && a.getAttribute("href") === location.hash) { ouvrirMenu(false); naviguer(); }
});
document.addEventListener("input", (e) => { if (e.target.id === "filtreTexte") { filtres.texte = e.target.value; majListeJeux(); } });
document.addEventListener("change", (e) => { if (e.target.id === "tri") { filtres.tri = e.target.value; majListeJeux(); } });
document.addEventListener("keydown", (e) => {
  const saisie = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === "/" && !saisie && !document.querySelector("dialog[open]")) { e.preventDefault(); ouvrirRecherche(); }
  if (e.key === "Escape" && $("menu").classList.contains("ouvert")) ouvrirMenu(false);
});

// Apparition au défilement (réglable : aucune, douce, dynamique) + compteurs animés
let observateur = null;
function compter(el) {
  const fin = Number(el.dataset.compteur) || 0, debut = performance.now(), duree = 1100;
  const pas = (t) => { const p = Math.min(1, (t - debut) / duree); el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(pas); };
  el.textContent = "0"; requestAnimationFrame(pas);
}
function activerRevele() {
  const anime = !apercu && !mouvementReduit && option("animations") && reglages.effets?.apparition !== "aucune" && "IntersectionObserver" in window;
  const compteurs = effet("compteurs") && !apercu && "IntersectionObserver" in window;
  if (!anime && !compteurs) return;
  if (anime) document.documentElement.classList.add("js-revele");
  observateur ??= new IntersectionObserver((l) => l.forEach((en) => {
    if (!en.isIntersecting) return;
    if (en.target.dataset.compteur !== undefined) compter(en.target); else en.target.classList.add("vu");
    observateur.unobserve(en.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  if (anime) {
    const seuls = "#vue .section-tete, #vue .hero-texte, #vue .mosaique, #vue .teaser, #vue .bande-contact, #vue .bloc .conteneur, #vue .chronologie, #vue .carrousel-fenetre, #vue .debut, #vue .citation-grille > div:first-child, #vue .apropos, #vue .entete-page .conteneur, #vue .carte-partage, #vue .page-jeu .conteneur";
    const enfants = "#vue .grille-jeux > *, #vue .grille-genres > *, #vue .grille-atouts > *, #vue .grille-etapes > *, #vue .grille-prochains > *, #vue .citation-images > *, #vue .grille-reseaux > *, #vue .grille-coord > *, #vue .suite-jeux > *";
    document.querySelectorAll(seuls).forEach((el) => el.style.setProperty("--i", 0));
    document.querySelectorAll(enfants).forEach((el) => el.style.setProperty("--i", [...el.parentNode.children].indexOf(el) % 6));
    document.querySelectorAll(seuls + ", " + enfants).forEach((el) => {
      el.classList.add("revele");
      // Ce qui est déjà à l'écran apparaît aussi en douceur
      if (el.getBoundingClientRect().top < innerHeight) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("vu")));
      else observateur.observe(el);
    });
  }
  if (compteurs) document.querySelectorAll("#vue [data-compteur]").forEach((el) => observateur.observe(el));
}

// Effets qui suivent la souris : inclinaison 3D et halo lumineux sur les cartes
let carteSurvolee = null;
document.addEventListener("pointermove", (ev) => {
  if (ev.pointerType !== "mouse") return;
  const h = document.documentElement, incline = h.classList.contains("survol-3d") && !mouvementReduit, halo = h.classList.contains("effet-halo");
  if (!incline && !halo) return;
  const el = ev.target.closest?.(".carte-jeu, .tuile-genre");
  if (carteSurvolee && carteSurvolee !== el) { carteSurvolee.style.removeProperty("--rx"); carteSurvolee.style.removeProperty("--ry"); }
  carteSurvolee = el;
  if (!el) return;
  const r = el.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
  if (halo) { el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%"); }
  if (incline && el.classList.contains("carte-jeu")) { el.style.setProperty("--ry", ((x - .5) * 10).toFixed(2) + "deg"); el.style.setProperty("--rx", ((.5 - y) * 8).toFixed(2) + "deg"); }
}, { passive: true });

// Images : apparition en fondu une fois chargées
const marquerImage = (img) => img.classList.add("charge");
document.addEventListener("load", (e) => { if (e.target.tagName === "IMG") marquerImage(e.target); }, true);
document.addEventListener("error", (e) => { if (e.target.tagName === "IMG") marquerImage(e.target); }, true);
const marquerImagesPretes = () => document.querySelectorAll("#vue img").forEach((i) => { if (i.complete) marquerImage(i); });

// Visionneuse d'images (galerie, blocs Image et Galerie)
let vision = { liste: [], i: 0 };
function imagesZoomables() {
  return [...document.querySelectorAll("#vue [data-zoom], #vue .galerie img, #vue .b-image img")].map((el) => ({
    el, src: el.dataset.zoom || el.currentSrc || el.src, legende: el.dataset.legende || el.alt || el.closest("figure")?.querySelector("figcaption")?.textContent || "",
  }));
}
function ouvrirVision(el) {
  vision.liste = imagesZoomables();
  vision.i = Math.max(0, vision.liste.findIndex((x) => x.el === el || x.el.contains(el)));
  montrerVision();
  if (!$("visionneuse").open) $("visionneuse").showModal();
}
function montrerVision() {
  const x = vision.liste[vision.i]; if (!x) return;
  const img = $("visionImage");
  img.classList.remove("charge"); img.src = x.src; img.alt = x.legende;
  $("visionLegende").textContent = x.legende;
  $("visionCompte").textContent = `${vision.i + 1} / ${vision.liste.length}`;
  $("visionPrec").hidden = $("visionSuiv").hidden = vision.liste.length < 2;
}
const tournerVision = (d) => { vision.i = (vision.i + d + vision.liste.length) % vision.liste.length; montrerVision(); };
$("visionPrec").addEventListener("click", () => tournerVision(-1));
$("visionSuiv").addEventListener("click", () => tournerVision(1));
$("visionFermer").addEventListener("click", () => $("visionneuse").close());
$("visionneuse").addEventListener("click", (e) => { if (e.target === $("visionneuse") || e.target.classList.contains("vision-scene")) $("visionneuse").close(); });
$("visionneuse").addEventListener("keydown", (e) => { if (e.key === "ArrowRight") tournerVision(1); if (e.key === "ArrowLeft") tournerVision(-1); });
let visionX = null;
$("visionneuse").addEventListener("pointerdown", (e) => { visionX = e.clientX; });
$("visionneuse").addEventListener("pointerup", (e) => { if (visionX !== null && Math.abs(e.clientX - visionX) > 50) tournerVision(e.clientX < visionX ? 1 : -1); visionX = null; });

// Barre de progression de lecture + parallaxe des images
let defilPrevu = false;
function majDefilement() {
  defilPrevu = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const barre = $("progression");
  barre.hidden = !effet("progression") || apercu;
  if (!barre.hidden) barre.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max) : 0);
  // Bouton flottant « remonter » avec anneau de progression
  const haut = $("hautFlottant");
  haut.classList.toggle("visible", option("boutonHaut") && scrollY > 700 && !apercu);
  haut.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max) : 0);
  const para = effet("parallaxe");
  document.querySelectorAll("#vue [data-parallaxe]").forEach((el) => {
    if (!para) { el.style.transform = ""; return; }
    const r = el.getBoundingClientRect(), centre = r.top + r.height / 2 - innerHeight / 2;
    const d = Math.max(-36, Math.min(36, centre * Number(el.dataset.parallaxe)));
    el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
  });
}
addEventListener("scroll", () => { if (!defilPrevu) { defilPrevu = true; requestAnimationFrame(majDefilement); } }, { passive: true });
addEventListener("resize", () => requestAnimationFrame(majDefilement));
$("hautFlottant").addEventListener("click", () => scrollTo({ top: 0, behavior: mouvementReduit ? "auto" : "smooth" }));

// Décor de fond : chaque forme glisse à sa propre vitesse quand on fait défiler (effet de profondeur)
const formesDecor = [...document.querySelectorAll(".decor [data-vitesse]")];
let decorPrevu = false;
function bougerDecor() {
  decorPrevu = false;
  const y = scrollY, H = innerHeight;
  formesDecor.forEach((f) => {
    // Position de départ (en pixels), puis on remonte ; une forme sortie par le haut revient par le bas
    const taille = f.offsetHeight, depart = f.offsetTop, tour = H + taille * 2;
    const p = ((((depart + taille - y * Number(f.dataset.vitesse)) % tour) + tour) % tour) - taille;
    f.style.transform = `translate3d(0, ${(p - depart).toFixed(1)}px, 0)`;
  });
}
if (!mouvementReduit) addEventListener("scroll", () => { if (!decorPrevu) { decorPrevu = true; requestAnimationFrame(bougerDecor); } }, { passive: true });

// Si les icônes des réseaux ne se chargent pas, on affiche l'initiale à la place
addEventListener("load", () => {
  if (!document.fonts?.load) return;
  document.fonts.load('16px "Font Awesome 6 Brands"').then((l) => { if (!l.length) document.documentElement.classList.add("sans-icones"); })
    .catch(() => document.documentElement.classList.add("sans-icones"));
});

// =========================================================
// Démarrage
// =========================================================
function demarrer(d) {
  donnees = d; d.jeux = d.jeux || []; d.site = d.site || {};
  appliquerApparence(d.apparence);
  afficherCommun();
  pageActuelle = "";
  naviguer();
  majEntete();
}
if (apercu) {
  // Aperçu en direct dans l'admin
  addEventListener("message", (e) => {
    if (e.source !== window.parent || !e.data || e.data.type !== "apercu") return;
    fichiersApercu = e.data.fichiers || {};
    const page = pageActuelle, y = scrollY;
    demarrer(e.data.donnees);
    if (page === pageActuelle) scrollTo(0, y);
  });
  window.parent.postMessage({ type: "apercu-pret" }, "*");
} else {
  fetch("site.json?v=" + Date.now())
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(demarrer)
    .catch((err) => {
      console.error(err);
      if (donnees) return;
      $("vue").innerHTML = `<section class="entete-page centre"><div class="conteneur"><h1>Le site n'a pas pu se charger</h1><p class="accroche">Recharge la page dans quelques instants (Ctrl + F5).</p></div></section>`;
    });
}
