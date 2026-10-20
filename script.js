// =========================================================
// BS arcade center : affiche le site à partir de site.json
// Le contenu se modifie dans admin.html, pas ici.
// =========================================================

const $ = (id) => document.getElementById(id);
const apercu = new URLSearchParams(location.search).has("apercu");
const mouvementReduit = matchMedia("(prefers-reduced-motion: reduce)").matches;
let donnees = null;
let fichiersApercu = {}; // fichiers pas encore publiés, montrés dans l'aperçu de l'admin

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

const ICONES = {
  jouer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="rempli" d="M7 4v16l13-8z"/></svg>',
  coeur: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9.3-9A5 5 0 0 1 12 6a5 5 0 0 1 9.3 5c-2.3 4.6-9.3 9-9.3 9z"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  chevron: '<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  section: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
};

// Date d'ajout d'un jeu : son identifiant la contient (créé par l'admin)
const dateJeu = (j) => parseInt(String(j.id).slice(1), 36) || 0;
const estNouveau = (j) => { const t = dateJeu(j); return t > 1.6e12 && Date.now() - t < 30 * 864e5; };
const formatDate = (t) => (t > 1.6e12 ? new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "");
const jeuxTries = (d) => [...(d.jeux || [])].sort((a, b) => dateJeu(b) - dateJeu(a));
const dernierJeu = (d) => jeuxTries(d)[0] || null;
const imageJeu = (j) => j.image
  ? `<img src="${echapper(lien(j.image))}" alt="" loading="lazy" draggable="false">`
  : `<span class="genere"><span>${echapper(initiales(j.titre))}</span></span>`;

// ---------- Réseaux (blocs « Liens ») ----------
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
const reseauxDe = (d) => (d.blocs || []).filter((b) => b.type === "liens").flatMap((b) => liensDe(b.liens));
const htmlLienReseau = (l) => `<a class="lien-reseau" href="${echapper(l.url)}" target="_blank" rel="noopener"><span class="initiale">${echapper(l.nom.charAt(0).toUpperCase())}</span>${echapper(l.nom)}${ICONES.fleche}</a>`;

// ---------- Apparence ----------
const POLICES = {
  "Bricolage Grotesque": "Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700",
  "Instrument Serif": "Instrument+Serif:ital@0;1", "DM Serif Display": "DM+Serif+Display", "Syne": "Syne:wght@500;600;700",
  "Familjen Grotesk": "Familjen+Grotesk:wght@500;600;700", "Unbounded": "Unbounded:wght@500;600",
  "Geist": "Geist:wght@400;500;600", "Manrope": "Manrope:wght@400;500;600", "DM Sans": "DM+Sans:wght@400;500;600", "Figtree": "Figtree:wght@400;500;600",
};
const POLICE_TITRES = "Bricolage Grotesque", POLICE_TEXTE = "Geist";
function appliquerApparence(a = {}) {
  const r = document.documentElement.style;
  const couleurs = { fond: "#0A0A0B", carte: "#141416", texte: "#F4F4F5", accent: "#E3121B", ...a };
  ["fond", "carte", "texte", "accent"].forEach((k) => r.setProperty("--" + k, couleurs[k]));
  r.setProperty("--relief", a.relief ?? 5);
  // Les anciennes polices « gamer » sont remplacées par les nouvelles
  const titres = POLICES[a.titres] ? a.titres : POLICE_TITRES;
  const corps = POLICES[a.corps] ? a.corps : POLICE_TEXTE;
  r.setProperty("--f-titres", `"${titres}", "Avenir Next", system-ui, sans-serif`);
  r.setProperty("--f-corps", `"${corps}", system-ui, sans-serif`);
  $("polices").href = "https://fonts.googleapis.com/css2?" + [...new Set([titres, corps])].map((p) => "family=" + POLICES[p]).join("&") + "&family=Geist+Mono:wght@400;500&display=swap";
  document.querySelector('meta[name="theme-color"]').content = couleurs.fond;
  // Fond clair ou sombre : les champs et barres de défilement suivent
  const [rr, gg, bb] = (couleurs.fond.match(/[0-9a-f]{2}/gi) || ["0", "0", "0"]).map((x) => parseInt(x, 16));
  r.colorScheme = (0.2126 * rr + 0.7152 * gg + 0.0722 * bb) / 255 > 0.5 ? "light" : "dark";
}

// ---------- Affichage complet ----------
function afficher(d) {
  donnees = d;
  d.jeux = d.jeux || [];
  d.site = d.site || {};
  appliquerApparence(d.apparence);
  afficherEntete(d);
  afficherAccueil(d);
  afficherBandeau(d);
  afficherCarrousel(d);
  afficherJeux();
  afficherHistoire(d);
  afficherBlocs(d);
  afficherMenu(d);
  afficherAppel(d);
  afficherPied(d);
  activerRevele();
}

function afficherEntete(d) {
  const s = d.site;
  document.title = s.nom || "BS arcade center";
  $("nomEntete").textContent = s.nom || "";
  montrerImage($("logoEntete"), s.logo);
  if (s.accroche) document.querySelector('meta[name="description"]').content = s.accroche;
}
function montrerImage(img, chemin) {
  img.hidden = !chemin;
  if (chemin) img.src = lien(chemin); else img.removeAttribute("src");
}

// ---------- Accueil ----------
function boutonsAccueil(s) {
  if (Array.isArray(s.boutons)) return s.boutons;
  return [
    { texte: s.boutonJeux || "Voir les jeux", cible: "#jeux", style: "plein" },
    { texte: s.boutonHistoire || "Mon histoire", cible: "#histoire", style: "contour" },
  ];
}
function afficherAccueil(d) {
  const s = d.site, jeux = jeuxTries(d);
  $("titreSite").textContent = s.nom || "";
  $("accroche").textContent = s.accroche || "";
  montrerImage($("heroFond"), s.banniere);
  $("pastilleTexte").textContent = jeux.length
    ? `${jeux.length} jeu${jeux.length > 1 ? "x" : ""} à découvrir · gratuit, sans compte`
    : "Bientôt les premiers jeux";
  $("heroBoutons").innerHTML = boutonsAccueil(s).map((b, i) => {
    const externe = b.cible === "url", href = externe ? lienSur(b.url) : b.cible;
    if (!b.texte || !href) return "";
    const plein = b.style ? b.style === "plein" : i === 0;
    return `<a class="btn ${plein ? "plein" : ""}" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(b.texte)}${externe ? ICONES.fleche : ""}</a>`;
  }).join("");
  const genres = new Set(jeux.map((j) => (j.genre || "").trim().toLowerCase()).filter(Boolean));
  $("chiffres").innerHTML = [
    [jeux.length, jeux.length > 1 ? "jeux en ligne" : "jeu en ligne"],
    [genres.size || "–", genres.size > 1 ? "genres" : "genre"],
    ["0 €", "et aucun compte"],
  ].map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join("");
  // Pile des 3 dernières jaquettes
  const pile = jeux.filter((j) => j.image).slice(0, 3).reverse();
  const der = jeux[0];
  $("heroVisuel").hidden = !pile.length;
  $("heroVisuel").innerHTML = pile.map((j) => `<div class="pile-carte"><img src="${echapper(lien(j.image))}" alt=""></div>`).join("")
    + (der ? `<div class="pile-etiquette"><span>Dernière sortie</span>${echapper(der.titre)}</div>` : "");
}

// ---------- Bandeau défilant ----------
function afficherBandeau(d) {
  const jeux = jeuxTries(d);
  $("bandeau").hidden = !jeux.length;
  if (!jeux.length) return;
  let items = jeux.map((j) => `<span class="bandeau-item">${echapper(j.titre)}${j.genre ? `<small>${echapper(j.genre)}</small>` : ""}</span><span class="bandeau-sep"></span>`);
  while (items.length < 8) items = items.concat(items); // assez long pour remplir l'écran
  const groupe = `<div class="bandeau-groupe">${items.join("")}</div>`;
  $("bandeauPiste").innerHTML = groupe + groupe;
}

// ---------- Carrousel « À la une » ----------
function slidesParDefaut(d) {
  const reseaux = (d.blocs || []).find((b) => b.type === "liens");
  const liste = [{ id: "s-jeu", type: "dernier-jeu", surtitre: "Dernière sortie", boutonTexte: "Jouer maintenant" }];
  if (reseaux) liste.push({ id: "s-reseaux", type: "perso", surtitre: "Rejoins-moi", titre: "Suis-moi sur les réseaux",
    texte: "Les coulisses de mes jeux, les prochaines sorties et des défis à relever.", boutonTexte: "Voir mes réseaux", cible: "#bloc-" + reseaux.id });
  return liste;
}
const slidesDe = (d) => (Array.isArray(d.slides) ? d.slides : slidesParDefaut(d)).filter((s) => s.type !== "accueil");

function boutonCarte(texte, cible, url) {
  const externe = cible === "url", href = externe ? lienSur(url) : cible;
  if (!texte || !href) return "";
  return `<a class="btn plein" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(texte)}${externe ? ICONES.fleche : ""}</a>`;
}
const mediaCarte = (src) => `<span class="carte-secours"></span>${src ? `<img src="${echapper(lien(src))}" alt="" draggable="false" onerror="this.remove()">` : ""}`;

function htmlCarte(s, d) {
  if (s.type === "dernier-jeu") {
    const j = dernierJeu(d);
    if (!j) return "";
    const date = formatDate(dateJeu(j));
    const resume = j.description || [majuscule(j.genre || ""), date ? "ajouté le " + date : ""].filter(Boolean).join(" · ") || "Le dernier jeu ajouté à la ludothèque.";
    return `<div class="carte-media">${mediaCarte(j.image)}</div>
      <div class="carte-corps">
        <p class="etiquette">${estNouveau(j) ? '<span class="badge">Nouveau</span>' : '<span class="point"></span>'}${echapper(s.surtitre || "Dernière sortie")}</p>
        <h3 class="carte-titre">${echapper(j.titre)}</h3>
        <p class="desc">${echapper(resume)}</p>
        <div class="boutons">
          <button class="btn plein" type="button" data-jouer="${echapper(j.id)}">${ICONES.jouer}${echapper(s.boutonTexte || "Jouer maintenant")}</button>
          <button class="btn" type="button" data-fiche="${echapper(j.id)}">Voir la fiche</button>
        </div>
      </div>`;
  }
  if (!s.titre && !s.texte && !s.image) return "";
  return `<div class="carte-media">${mediaCarte(s.image)}</div>
    <div class="carte-corps">
      ${s.surtitre ? `<p class="etiquette"><span class="point"></span>${echapper(s.surtitre)}</p>` : ""}
      ${s.titre ? `<h3 class="carte-titre">${echapper(s.titre)}</h3>` : ""}
      ${s.texte ? `<p class="desc">${echapper(s.texte)}</p>` : ""}
      ${s.boutonTexte ? `<div class="boutons">${boutonCarte(s.boutonTexte, s.cible, s.url)}</div>` : ""}
    </div>`;
}

// Carrousel infini : les 2 premières cartes sont recopiées à la fin.
// Arrivé sur une copie, on revient sans animation sur la vraie carte.
let slideActuelle = 0, pos = 0, nbCartes = 0, glisse = null, aGlisse = false;
const cartes = () => [...$("piste").children];

function afficherCarrousel(d) {
  const html = slidesDe(d).map((s) => htmlCarte(s, d)).filter(Boolean);
  nbCartes = html.length;
  $("une").hidden = !nbCartes;
  const plusieurs = nbCartes > 1;
  const copies = plusieurs ? [0, 1 % nbCartes] : [];
  $("piste").innerHTML =
    html.map((h, i) => `<article class="carte" aria-roledescription="carte" data-i="${i}">${h}</article>`).join("") +
    copies.map((i) => `<article class="carte copie" aria-hidden="true" data-i="${i}">${html[i]}</article>`).join("");
  $("une").style.setProperty("--duree", (Number(d.slidesDuree) || 6) + "s");
  $("progs").hidden = $("carrouselNav").hidden = !plusieurs;
  $("progs").innerHTML = html.map((_, i) => `<button class="prog" type="button" data-slide="${i}" aria-label="Aller à la carte ${i + 1}"><span></span></button>`).join("");
  placer(Math.min(slideActuelle, Math.max(nbCartes - 1, 0)), false);
}
const decalage = (p = pos) => { const c = cartes()[p]; return c ? c.offsetLeft : 0; };
function sansAnimation(f) {
  $("piste").classList.add("sans-transition");
  f();
  void $("piste").offsetWidth;
  $("piste").classList.remove("sans-transition");
}
function placer(p, animer = true) {
  const L = cartes();
  if (!L.length) return;
  const faire = () => {
    pos = p;
    slideActuelle = ((p % nbCartes) + nbCartes) % nbCartes;
    $("piste").style.transform = `translateX(${-decalage()}px)`;
    L.forEach((c, k) => {
      const active = k === pos;
      c.classList.toggle("actif", active);
      if (!c.classList.contains("copie")) { c.setAttribute("aria-label", `${k + 1} sur ${nbCartes}`); c.setAttribute("aria-hidden", String(!active)); }
      c.querySelectorAll("a, button").forEach((el) => (el.tabIndex = active ? 0 : -1));
    });
  };
  animer ? faire() : sansAnimation(faire);
  [...$("progs").children].forEach((b, k) => {
    b.classList.remove("actif");
    b.classList.toggle("vue", k < slideActuelle);
    if (k === slideActuelle && nbCartes > 1 && !mouvementReduit) { void b.offsetWidth; b.classList.add("actif"); }
  });
  $("numeroSlide").textContent = String(slideActuelle + 1).padStart(2, "0") + " / " + String(nbCartes).padStart(2, "0");
}
function suivante() { if (nbCartes < 2) return; if (pos >= nbCartes) placer(0, false); placer(pos + 1); }
function precedente() { if (nbCartes < 2) return; if (pos <= 0) placer(nbCartes, false); placer(pos - 1); }
function allerA(i) { if (i !== slideActuelle || pos >= nbCartes) placer(i); }

$("piste").addEventListener("transitionend", (e) => {
  if (e.target === $("piste") && e.propertyName === "transform" && pos >= nbCartes && !glisse) placer(0, false);
});
window.addEventListener("resize", () => placer(pos, false));
$("progs").addEventListener("animationend", (e) => { if (e.target.closest(".prog.actif")) suivante(); });
$("progs").addEventListener("click", (e) => { const b = e.target.closest("[data-slide]"); if (b) allerA(Number(b.dataset.slide)); });
$("slidePrec").addEventListener("click", precedente);
$("slideSuiv").addEventListener("click", suivante);

const zoneUne = $("une");
const pause = (oui) => zoneUne.classList.toggle("pause", oui);
zoneUne.addEventListener("mouseenter", () => pause(true));
zoneUne.addEventListener("mouseleave", () => pause(false));
zoneUne.addEventListener("focusin", () => pause(true));
zoneUne.addEventListener("focusout", (e) => { if (!zoneUne.contains(e.relatedTarget)) pause(zoneUne.matches(":hover")); });
zoneUne.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") precedente(); if (e.key === "ArrowRight") suivante(); });

// Glisser à la souris ou au doigt
$("fenetre").addEventListener("pointerdown", (e) => {
  if (e.button !== 0 || nbCartes < 2) return;
  if (pos >= nbCartes) placer(0, false);
  if (pos === 0) placer(nbCartes, false); // permet de glisser vers la gauche depuis la 1re carte
  glisse = { x: e.clientX, y: e.clientY, base: -decalage(), id: e.pointerId, actif: false };
  aGlisse = false;
});
window.addEventListener("pointermove", (e) => {
  if (!glisse || e.pointerId !== glisse.id) return;
  const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
  if (!glisse.actif) {
    if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
    glisse.actif = aGlisse = true;
    $("piste").classList.add("sans-transition"); $("fenetre").classList.add("tire"); pause(true);
  }
  $("piste").style.transform = `translateX(${glisse.base + dx}px)`;
});
window.addEventListener("pointerup", (e) => {
  if (!glisse || e.pointerId !== glisse.id) return;
  const dx = e.clientX - glisse.x, etait = glisse.actif;
  glisse = null;
  $("piste").classList.remove("sans-transition"); $("fenetre").classList.remove("tire");
  if (!etait) return;
  const seuil = Math.min(120, $("fenetre").clientWidth * .15);
  if (dx < -seuil) suivante(); else if (dx > seuil) precedente(); else placer(pos);
  pause(zoneUne.matches(":hover"));
});
$("fenetre").addEventListener("dragstart", (e) => e.preventDefault());
$("fenetre").addEventListener("click", (e) => {
  if (aGlisse) { e.preventDefault(); e.stopPropagation(); aGlisse = false; return; }
  const c = e.target.closest(".carte:not(.actif)");
  if (c) { e.preventDefault(); e.stopPropagation(); cartes().indexOf(c) > pos ? suivante() : precedente(); }
}, true);

// ---------- Jeux : filtres, tri, favoris, reprise ----------
const filtres = { texte: "", genre: "", tri: "recent", favoris: false };
const favoris = new Set(lire("bs-favoris", []));
let recents = lire("bs-recents", []);

function afficherJeux() {
  const d = donnees, sj = d.sectionJeux || {}, jeux = d.jeux;
  $("titreJeux").textContent = sj.titre || "Jeux";
  $("introJeux").textContent = sj.intro || "";
  $("compteJeux").textContent = jeux.length ? "· " + jeux.length : "";
  $("outils").hidden = jeux.length < 2;

  // Puces de genre (+ favoris s'il y en a)
  const genres = [...new Map(jeux.filter((j) => j.genre && j.genre.trim()).map((j) => [j.genre.trim().toLowerCase(), majuscule(j.genre.trim())])).entries()];
  if (filtres.genre && !genres.some(([k]) => k === filtres.genre)) filtres.genre = "";
  const aDesFavoris = jeux.some((j) => favoris.has(j.id));
  if (!aDesFavoris) filtres.favoris = false;
  $("puces").innerHTML = (genres.length > 1 || aDesFavoris)
    ? [`<button class="puce" type="button" data-genre="" aria-pressed="${!filtres.genre && !filtres.favoris}">Tous</button>`]
      .concat(aDesFavoris ? [`<button class="puce" type="button" data-favoris aria-pressed="${filtres.favoris}">${ICONES.coeur}Favoris</button>`] : [])
      .concat(genres.length > 1 ? genres.map(([k, nom]) => `<button class="puce" type="button" data-genre="${echapper(k)}" aria-pressed="${filtres.genre === k}">${echapper(nom)}</button>`) : [])
      .join("")
    : "";

  // Liste filtrée et triée
  const q = filtres.texte.trim().toLowerCase();
  let liste = jeux.filter((j) =>
    (!filtres.genre || (j.genre || "").trim().toLowerCase() === filtres.genre) &&
    (!filtres.favoris || favoris.has(j.id)) &&
    (!q || `${j.titre} ${j.genre || ""} ${j.description || ""}`.toLowerCase().includes(q)));
  liste = filtres.tri === "az" ? liste.sort((a, b) => a.titre.localeCompare(b.titre, "fr")) : liste.sort((a, b) => dateJeu(b) - dateJeu(a));

  $("grilleJeux").innerHTML = liste.map((j) => {
    const date = formatDate(dateJeu(j)), fav = favoris.has(j.id);
    return `<article class="jeu">
      <button class="jeu-image" type="button" data-fiche="${echapper(j.id)}" aria-label="Voir ${echapper(j.titre)}">
        ${imageJeu(j)}
        ${estNouveau(j) ? '<span class="badge jeu-tag-nouveau">Nouveau</span>' : ""}
        <span class="jouer">${ICONES.jouer}Voir le jeu</span>
      </button>
      <button class="jeu-fav" type="button" data-favori="${echapper(j.id)}" aria-pressed="${fav}" aria-label="${fav ? "Retirer des" : "Ajouter aux"} favoris">${ICONES.coeur}</button>
      <div class="jeu-infos"><div>
        <h3 class="jeu-titre"><button type="button" data-fiche="${echapper(j.id)}"><span class="relief">${echapper(j.titre)}</span></button></h3>
        <div class="jeu-meta">${j.genre ? `<span class="tag">${echapper(majuscule(j.genre))}</span>` : ""}${date ? `<span>${date}</span>` : ""}</div>
      </div></div>
      ${j.description ? `<p class="jeu-desc">${echapper(j.description)}</p>` : ""}
    </article>`;
  }).join("");

  const vide = $("videJeux");
  vide.hidden = liste.length > 0;
  vide.innerHTML = !jeux.length
    ? `<strong>Bientôt des jeux ici</strong><span>${echapper(sj.vide || "Les premiers jeux arrivent bientôt.")}</span>`
    : `<strong>Aucun jeu trouvé</strong><span>Essaie un autre mot ou un autre genre.</span><button class="btn petit" type="button" data-reinitialiser>Tout afficher</button>`;

  afficherReprise();
}

function afficherReprise() {
  const jeux = recents.map((id) => donnees.jeux.find((j) => j.id === id)).filter(Boolean).slice(0, 4);
  $("reprendre").hidden = !jeux.length || apercu;
  $("reprendreListe").innerHTML = jeux.map((j) => `
    <button class="reprise" type="button" data-jouer="${echapper(j.id)}">
      ${j.image ? `<img src="${echapper(lien(j.image))}" alt="">` : '<span class="mini"></span>'}
      <span><b>${echapper(j.titre)}</b><small>Continuer à jouer</small></span>
    </button>`).join("");
}

$("filtreTexte").addEventListener("input", (e) => { filtres.texte = e.target.value; afficherJeux(); });
$("tri").addEventListener("change", (e) => { filtres.tri = e.target.value; afficherJeux(); });
$("puces").addEventListener("click", (e) => {
  const p = e.target.closest(".puce");
  if (!p) return;
  if (p.hasAttribute("data-favoris")) { filtres.favoris = !filtres.favoris; filtres.genre = ""; }
  else { filtres.genre = p.dataset.genre; filtres.favoris = false; }
  afficherJeux();
});

function basculerFavori(id) {
  favoris.has(id) ? favoris.delete(id) : favoris.add(id);
  ecrire("bs-favoris", [...favoris]);
  afficherJeux();
  notifier(favoris.has(id) ? "Ajouté à tes favoris" : "Retiré de tes favoris");
  if ($("fiche").open && ficheJeu && ficheJeu.id === id) majFavoriFiche();
}

// ---------- À propos ----------
function afficherHistoire(d) {
  const h = d.histoire || {};
  $("titreHistoire").textContent = h.titre || "Histoire";
  $("texteHistoire").innerHTML = paragraphes(h.texte);
  $("histoireImage").hidden = !h.image;
  if (h.image) $("imageHistoire").src = lien(h.image);
  const jeux = jeuxTries(d), der = jeux[0];
  const premier = jeux.length ? dateJeu(jeux[jeux.length - 1]) : 0;
  const stats = [[jeux.length, jeux.length > 1 ? "jeux créés" : "jeu créé"]];
  if (der && dateJeu(der) > 1.6e12) stats.push([new Date(dateJeu(der)).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }), "dernier ajout"]);
  if (premier > 1.6e12) stats.push([new Date(premier).getFullYear(), "premier jeu en ligne"]);
  $("chiffresHistoire").innerHTML = jeux.length ? stats.map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`).join("") : "";
}

// ---------- Blocs (ordre des sections + blocs ajoutés) ----------
function idYouTube(u) {
  const m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : "";
}
const titreBloc = (b) => (b.titre ? `<h2 class="bloc-titre">${echapper(b.titre)}</h2>` : "");
function htmlBloc(b) {
  switch (b.type) {
    case "texte":
      return `<div class="b-texte ${b.alignement === "centre" ? "centre" : ""}">${titreBloc(b)}<div class="b-paras">${paragraphes(b.texte)}</div></div>`;
    case "image":
      if (!b.image) return "";
      return `<figure class="b-image ${b.largeur === "moyenne" ? "moyenne" : ""}">${titreBloc(b)}<img src="${echapper(lien(b.image))}" alt="${echapper(b.legende || "")}" loading="lazy">${b.legende ? `<figcaption>${echapper(b.legende)}</figcaption>` : ""}</figure>`;
    case "encadre": {
      const url = lienSur(b.lienBouton);
      return `<div class="b-encadre" style="--fond-encadre:${echapper(b.couleur || "var(--accent)")}">${b.titre ? `<h2>${echapper(b.titre)}</h2>` : ""}${paragraphes(b.texte)}${b.texteBouton && url ? `<a class="btn plein" href="${echapper(url)}" target="_blank" rel="noopener">${echapper(b.texteBouton)}${ICONES.fleche}</a>` : ""}</div>`;
    }
    case "liens": {
      const items = liensDe(b.liens);
      if (!items.length) return "";
      return `<div class="b-liens">${titreBloc(b)}<ul>${items.map((i) => `<li>${htmlLienReseau(i)}</li>`).join("")}</ul></div>`;
    }
    case "video": {
      const id = idYouTube(b.url);
      if (!id) return "";
      return `<div class="b-video">${titreBloc(b)}<div class="cadre-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${echapper(b.titre || "Vidéo")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${b.texte ? `<p class="intro">${echapper(b.texte)}</p>` : ""}</div>`;
    }
    case "galerie": {
      const imgs = (b.images || []).filter(Boolean);
      if (!imgs.length) return "";
      return `<div class="b-galerie">${titreBloc(b)}<div class="galerie">${imgs.map((i) => `<img src="${echapper(lien(i))}" alt="" loading="lazy">`).join("")}</div></div>`;
    }
    case "separateur":
      return `<div class="b-sep ${b.style || "ligne"}" role="presentation"></div>`;
  }
  return "";
}
const blocsDe = (d) => (d.blocs && d.blocs.length ? d.blocs : [{ id: "jeux", type: "jeux" }, { id: "histoire", type: "histoire" }]);
function afficherBlocs(d) {
  const noeuds = [];
  for (const b of blocsDe(d)) {
    if (b.type === "jeux") { noeuds.push($("jeux")); continue; }
    if (b.type === "histoire") { noeuds.push($("histoire")); continue; }
    const html = htmlBloc(b);
    if (!html) continue;
    const s = document.createElement("section");
    s.className = "section bloc bloc-" + b.type;
    s.id = "bloc-" + b.id;
    s.innerHTML = `<div class="conteneur">${html}</div>`;
    noeuds.push(s);
  }
  ["jeux", "histoire"].forEach((id) => { $(id).hidden = !noeuds.includes($(id)); if ($(id).hidden) noeuds.push($(id)); });
  $("sections").replaceChildren(...noeuds);
}

// Sections visibles, pour le menu, la recherche et le pied de page
function sectionsDe(d) {
  const liste = [{ nom: "Accueil", href: "#accueil" }];
  if (!$("une").hidden) liste.push({ nom: "À la une", href: "#une" });
  for (const b of blocsDe(d)) {
    if (b.type === "jeux") liste.push({ nom: d.sectionJeux?.titre || "Jeux", href: "#jeux", jeux: true });
    else if (b.type === "histoire") liste.push({ nom: b.titreMenu || "Histoire", href: "#histoire" });
    else if (b.dansMenu && b.titre && $("bloc-" + b.id)) liste.push({ nom: b.titre.trim(), href: "#bloc-" + b.id });
  }
  return liste;
}

// ---------- Menu ----------
function afficherMenu(d) {
  const jeux = jeuxTries(d), sections = sectionsDe(d);
  $("menuLiens").innerHTML = sections.map((s) => s.jeux
    ? `<li><button class="menu-lien" id="menuJeuxBtn" type="button" aria-expanded="false" aria-controls="menuListeJeux"><span class="relief">${echapper(s.nom)}</span>${jeux.length ? `<small>${jeux.length}</small>` : ""}${ICONES.chevron}</button>
        <ul class="menu-sous" id="menuListeJeux" hidden>${jeux.map((j) => `<li><button type="button" data-fiche="${echapper(j.id)}">${j.image ? `<img src="${echapper(lien(j.image))}" alt="">` : '<span class="mini"></span>'}${echapper(j.titre)}</button></li>`).join("")}
        <li><a href="#jeux" data-ferme>Voir tous les jeux →</a></li></ul></li>`
    : `<li><a class="menu-lien" href="${s.href}" data-ferme><span class="relief">${echapper(s.nom)}</span></a></li>`).join("");
  $("menuReseaux").innerHTML = reseauxDe(d).map(htmlLienReseau).join("");
  // Liens rapides dans l'en-tête (grand écran)
  $("navRapide").innerHTML = sections.filter((s) => s.href !== "#accueil").slice(0, 4).map((s) => `<a href="${s.href}">${echapper(s.nom)}</a>`).join("");
}
function ouvrirMenu(ouvrir) {
  $("menu").classList.toggle("ouvert", ouvrir);
  $("menu").inert = !ouvrir;
  $("voile").hidden = !ouvrir;
  $("burger").setAttribute("aria-expanded", String(ouvrir));
  $("burger").setAttribute("aria-label", ouvrir ? "Fermer le menu" : "Ouvrir le menu");
  document.body.style.overflow = ouvrir ? "hidden" : "";
  document.body.classList.toggle("menu-ouvert", ouvrir);
}
$("burger").addEventListener("click", () => ouvrirMenu($("burger").getAttribute("aria-expanded") !== "true"));
$("voile").addEventListener("click", () => ouvrirMenu(false));

// ---------- Appel final + pied de page ----------
function afficherAppel(d) {
  const reseaux = reseauxDe(d);
  // Pas de doublon : l'encadré n'apparaît que si aucun bloc « Liens » n'est déjà sur la page
  const blocLiensVisible = (d.blocs || []).some((b) => b.type === "liens" && $("bloc-" + b.id));
  $("appel").hidden = !reseaux.length || blocLiensVisible;
  $("appelLiens").innerHTML = reseaux.map(htmlLienReseau).join("");
}
function afficherPied(d) {
  const s = d.site;
  $("piedNom").textContent = s.nom || "";
  $("piedAccroche").textContent = s.accroche || "";
  $("pied").textContent = s.piedDePage || `© ${new Date().getFullYear()} ${s.nom || ""}`;
  $("piedNav").innerHTML = sectionsDe(d).map((x) => `<li><a href="${x.href}">${echapper(x.nom)}</a></li>`).join("");
  $("piedJeux").innerHTML = jeuxTries(d).slice(0, 6).map((j) => `<li><button type="button" data-fiche="${echapper(j.id)}">${echapper(j.titre)}</button></li>`).join("") || "<li>Bientôt</li>";
  const reseaux = reseauxDe(d);
  $("piedReseauxCol").hidden = !reseaux.length;
  $("piedReseaux").innerHTML = reseaux.map((l) => `<li><a href="${echapper(l.url)}" target="_blank" rel="noopener">${echapper(l.nom)} ↗</a></li>`).join("");
}

// ---------- Fiche d'un jeu ----------
let ficheJeu = null;
const trouverJeu = (id) => (donnees?.jeux || []).find((j) => j.id === id);
function ouvrirFiche(id) {
  const j = trouverJeu(id);
  if (!j) return;
  ficheJeu = j;
  ouvrirMenu(false);
  $("ficheMedia").innerHTML = imageJeu(j);
  $("ficheGenre").innerHTML = `${estNouveau(j) ? '<span class="badge">Nouveau</span>' : '<span class="point"></span>'}${echapper(majuscule(j.genre || "Jeu"))}`;
  $("ficheTitre").textContent = j.titre;
  $("ficheDate").textContent = formatDate(dateJeu(j)) ? "Ajouté le " + formatDate(dateJeu(j)) : "";
  $("ficheDesc").innerHTML = paragraphes(j.description) || "<p>Lance la partie, elle s'ouvre directement ici. Aucun téléchargement, aucun compte.</p>";
  majFavoriFiche();
  if (!$("fiche").open) $("fiche").showModal();
  if (!apercu) history.replaceState(null, "", "#jeu-" + id);
}
function majFavoriFiche() {
  const f = favoris.has(ficheJeu.id);
  $("ficheFavori").setAttribute("aria-pressed", String(f));
  $("ficheFavori").setAttribute("aria-label", f ? "Retirer des favoris" : "Ajouter aux favoris");
}
$("ficheJouer").addEventListener("click", () => ouvrirJeu(ficheJeu.id));
$("fichePartager").addEventListener("click", () => partager(ficheJeu));
$("ficheFavori").addEventListener("click", () => basculerFavori(ficheJeu.id));
$("fiche").addEventListener("close", () => { if (!apercu && location.hash.startsWith("#jeu-")) history.replaceState(null, "", location.pathname); });

// Fermer une fenêtre en cliquant à côté
document.querySelectorAll("dialog.fenetre-modale").forEach((dlg) => dlg.addEventListener("click", (e) => {
  if (e.target !== dlg) return;
  const r = dlg.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
}));

// ---------- Partage ----------
async function partager(j) {
  const url = location.origin + location.pathname + "#jouer-" + j.id;
  try {
    if (navigator.share && matchMedia("(pointer: coarse)").matches) { await navigator.share({ title: j.titre, url }); return; }
    await navigator.clipboard.writeText(url);
    notifier("Lien copié, envoie-le à tes amis !");
  } catch { notifier(url); }
}
let minuterieToast;
function notifier(texte) {
  $("toast").textContent = texte;
  $("toast").classList.add("visible");
  clearTimeout(minuterieToast);
  minuterieToast = setTimeout(() => $("toast").classList.remove("visible"), 2600);
}

// ---------- Recherche rapide ----------
let resultats = [], choix = 0;
function ouvrirRecherche() {
  if (!donnees) return;
  ouvrirMenu(false);
  $("paletteTexte").value = "";
  remplirPalette("");
  if (!$("palette").open) $("palette").showModal();
  $("paletteTexte").focus();
}
function remplirPalette(q) {
  q = q.trim().toLowerCase();
  const jeux = jeuxTries(donnees).filter((j) => !q || `${j.titre} ${j.genre || ""}`.toLowerCase().includes(q));
  const sections = sectionsDe(donnees).filter((s) => !q || s.nom.toLowerCase().includes(q));
  resultats = [...jeux.map((j) => ({ type: "jeu", j })), ...sections.map((s) => ({ type: "section", s }))];
  choix = 0;
  let html = "";
  if (jeux.length) html += `<li class="palette-groupe" role="presentation">Jeux</li>` + jeux.map((j, i) => `
    <li role="option" data-r="${i}" aria-selected="${i === 0}">${j.image ? `<img src="${echapper(lien(j.image))}" alt="">` : '<span class="mini"></span>'}
    <span class="palette-titre">${echapper(j.titre)}</span><small>${echapper(majuscule(j.genre || ""))}</small></li>`).join("");
  if (sections.length) html += `<li class="palette-groupe" role="presentation">Sections</li>` + sections.map((s, k) => {
    const i = jeux.length + k;
    return `<li role="option" data-r="${i}" aria-selected="${i === 0}"><span class="mini">${ICONES.section}</span><span class="palette-titre">${echapper(s.nom)}</span><small>Aller à</small></li>`;
  }).join("");
  $("paletteListe").innerHTML = html || `<li class="palette-vide">Aucun résultat pour « ${echapper(q)} »</li>`;
}
function surligner(i) {
  if (!resultats.length) return;
  choix = (i + resultats.length) % resultats.length;
  $("paletteListe").querySelectorAll("[data-r]").forEach((li) => li.setAttribute("aria-selected", String(Number(li.dataset.r) === choix)));
  $("paletteListe").querySelector(`[data-r="${choix}"]`)?.scrollIntoView({ block: "nearest" });
}
function valider(i) {
  const r = resultats[i];
  if (!r) return;
  $("palette").close();
  if (r.type === "jeu") ouvrirFiche(r.j.id);
  else document.querySelector(r.s.href)?.scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth" });
}
$("paletteTexte").addEventListener("input", (e) => remplirPalette(e.target.value));
$("paletteTexte").addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); surligner(choix + 1); }
  if (e.key === "ArrowUp") { e.preventDefault(); surligner(choix - 1); }
  if (e.key === "Enter") { e.preventDefault(); valider(choix); }
  if (e.key === "Escape") { e.preventDefault(); $("palette").close(); } // sinon Échap ne fait que vider le champ
});
$("paletteListe").addEventListener("click", (e) => { const li = e.target.closest("[data-r]"); if (li) valider(Number(li.dataset.r)); });
$("paletteListe").addEventListener("mousemove", (e) => { const li = e.target.closest("[data-r]"); if (li && Number(li.dataset.r) !== choix) surligner(Number(li.dataset.r)); });
$("btnRecherche").addEventListener("click", ouvrirRecherche);

// ---------- Lecteur de jeu ----------
let jeuActuel = null;
function ouvrirJeu(id) {
  const j = trouverJeu(id);
  if (!j) return;
  jeuActuel = j;
  ouvrirMenu(false);
  if ($("fiche").open) $("fiche").close();
  $("lecteurTitre").textContent = j.titre;
  $("lecteurGenre").textContent = majuscule(j.genre || "Jeu");
  $("btnSuivant").hidden = donnees.jeux.length < 2;
  if (!$("lecteur").open) $("lecteur").showModal();
  monterJeu();
  if (!apercu) {
    history.replaceState(null, "", "#jouer-" + id);
    recents = [id, ...recents.filter((x) => x !== id)].slice(0, 8);
    ecrire("bs-recents", recents);
  }
}
function monterJeu() {
  $("scene").querySelector("iframe")?.remove();
  $("chargement").hidden = false;
  const f = document.createElement("iframe");
  f.title = jeuActuel.titre;
  f.allow = "fullscreen; autoplay; gamepad";
  f.addEventListener("load", () => { $("chargement").hidden = true; f.focus(); });
  f.src = lien(jeuActuel.fichier);
  $("scene").appendChild(f);
}
$("lecteur").addEventListener("close", () => {
  $("scene").querySelector("iframe")?.remove();
  jeuActuel = null;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (!apercu) history.replaceState(null, "", location.pathname);
  afficherReprise();
});
$("btnFermer").addEventListener("click", () => $("lecteur").close());
$("btnRejouer").addEventListener("click", () => jeuActuel && monterJeu());
$("btnPartager").addEventListener("click", () => jeuActuel && partager(jeuActuel));
$("btnSuivant").addEventListener("click", () => {
  const liste = jeuxTries(donnees), i = liste.findIndex((j) => j.id === jeuActuel.id);
  ouvrirJeu(liste[(i + 1) % liste.length].id);
});
$("btnPleinEcran").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else $("lecteur").requestFullscreen?.().catch(() => notifier("Le plein écran n'est pas disponible ici"));
});

// ---------- Clics communs ----------
document.addEventListener("click", (e) => {
  const t = e.target;
  const jouer = t.closest("[data-jouer]"); if (jouer) { ouvrirJeu(jouer.dataset.jouer); return; }
  const fav = t.closest("[data-favori]"); if (fav) { basculerFavori(fav.dataset.favori); return; }
  const fiche = t.closest("[data-fiche]"); if (fiche) { ouvrirFiche(fiche.dataset.fiche); return; }
  if (t.closest("[data-fermer]")) { t.closest("dialog")?.close(); return; }
  if (t.closest("[data-ouvrir-recherche]")) { ouvrirRecherche(); return; }
  if (t.closest("[data-reinitialiser]")) { Object.assign(filtres, { texte: "", genre: "", favoris: false }); $("filtreTexte").value = ""; afficherJeux(); return; }
  const mj = t.closest("#menuJeuxBtn");
  if (mj) { const o = mj.getAttribute("aria-expanded") === "true"; mj.setAttribute("aria-expanded", String(!o)); $("menuListeJeux").hidden = o; return; }
  if (t.closest("[data-ferme]")) ouvrirMenu(false);
});
document.addEventListener("keydown", (e) => {
  const saisie = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
  if (e.key === "/" && !saisie && !document.querySelector("dialog[open]")) { e.preventDefault(); ouvrirRecherche(); }
  if (e.key === "Escape" && $("menu").classList.contains("ouvert")) ouvrirMenu(false);
});

// En-tête : fond flouté dès qu'on fait défiler
const majEntete = () => $("entete").classList.toggle("defile", scrollY > 24);
addEventListener("scroll", majEntete, { passive: true });
majEntete();

// Apparition douce des sections au défilement
let observateur = null;
function activerRevele() {
  if (apercu || mouvementReduit || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("js-revele");
  observateur ??= new IntersectionObserver((entrees) => entrees.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("vu"); observateur.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".section-tete, .grille, .histoire, .bloc .conteneur, .appel-carte, .carrousel-fenetre").forEach((el) => {
    if (el.classList.contains("revele")) return;
    el.classList.add("revele");
    // Ce qui est déjà à l'écran s'affiche tout de suite
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add("vu"); else observateur.observe(el);
  });
}

// ---------- Démarrage ----------
if (apercu) {
  // Aperçu en direct : l'admin envoie les données
  window.addEventListener("message", (e) => {
    if (e.source !== window.parent || !e.data || e.data.type !== "apercu") return;
    fichiersApercu = e.data.fichiers || {};
    afficher(e.data.donnees);
  });
  window.parent.postMessage({ type: "apercu-pret" }, "*");
} else {
  fetch("site.json?v=" + Date.now())
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((d) => {
      afficher(d);
      const jouer = location.hash.match(/^#jouer-(.+)$/), fiche = location.hash.match(/^#jeu-(.+)$/);
      if (jouer) ouvrirJeu(jouer[1]);
      else if (fiche) ouvrirFiche(fiche[1]);
    })
    .catch((err) => {
      console.error(err);
      if (donnees) return;
      $("videJeux").hidden = false;
      $("videJeux").innerHTML = "<strong>Le site n'a pas pu se charger</strong><span>Recharge la page dans quelques instants (Ctrl + F5).</span>";
    });
}
