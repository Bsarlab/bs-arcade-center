// BS arcade center : affiche le site à partir de site.json
// Tu modifies le contenu dans admin.html, pas ici.

const $ = (id) => document.getElementById(id);
const apercu = new URLSearchParams(location.search).has("apercu");
let donnees = null;
let fichiersApercu = {};   // fichiers pas encore publiés, montrés dans l'aperçu de l'admin
let jeuActuel = null;

const POLICES = {
  "Anton": "Anton", "Bebas Neue": "Bebas+Neue", "Russo One": "Russo+One", "Black Ops One": "Black+Ops+One", "Bungee": "Bungee",
  "Barlow": "Barlow:wght@400;500;700", "Rubik": "Rubik:wght@400;500;700", "Atkinson Hyperlegible": "Atkinson+Hyperlegible:wght@400;700", "IBM Plex Sans": "IBM+Plex+Sans:wght@400;600"
};

const echapper = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const lien = (chemin) => fichiersApercu[chemin] || chemin;
const initiales = (t) => String(t).trim().split(/\s+/).slice(0, 2).map((m) => m[0] || "").join("").toUpperCase() || "?";

// ---------- Apparence ----------
function appliquerApparence(a) {
  const r = document.documentElement.style;
  r.setProperty("--fond", a.fond);
  r.setProperty("--carte", a.carte);
  r.setProperty("--texte", a.texte);
  r.setProperty("--accent", a.accent);
  r.setProperty("--relief", a.relief ?? 5);
  r.setProperty("--f-titres", `"${a.titres}", Impact, sans-serif`);
  r.setProperty("--f-corps", `"${a.corps}", system-ui, sans-serif`);
  const familles = [a.titres, a.corps].map((p) => POLICES[p]).filter(Boolean).map((p) => "family=" + p);
  $("polices").href = "https://fonts.googleapis.com/css2?" + familles.join("&") + "&family=Silkscreen&display=swap";
  document.querySelector('meta[name="theme-color"]').content = a.fond;
}

// ---------- Contenu ----------
function afficher(d) {
  donnees = d;
  appliquerApparence(d.apparence);
  const s = d.site;

  document.title = s.nom;
  $("nomBarre").textContent = s.nom;
  $("titreSite").textContent = s.nom;
  $("accroche").textContent = s.accroche || "";
  $("heroBoutons").innerHTML = boutonsAccueil(s).map((b) => {
    const externe = b.cible === "url";
    const href = externe ? lienSur(b.url) : b.cible;
    if (!b.texte || !href) return "";
    return `<a class="bouton ${b.style === "contour" ? "" : "plein"}" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(b.texte)}${externe ? " ↗" : ""}</a>`;
  }).join("");
  $("pied").textContent = s.piedDePage || "";
  montrerImage($("logoBarre"), s.logo);
  montrerImage($("heroFond"), s.banniere);

  // Jeux
  const sj = d.sectionJeux || {};
  $("titreJeux").textContent = sj.titre || "Jeux";
  $("introJeux").textContent = sj.intro || "";
  const jeux = d.jeux || [];
  $("compteurJeux").textContent = jeux.length ? jeux.length + (jeux.length > 1 ? " JEUX" : " JEU") : "";
  $("videJeux").textContent = sj.vide || "Les premiers jeux arrivent bientôt.";
  $("videJeux").hidden = jeux.length > 0;
  $("grilleJeux").innerHTML = jeux.map((j) => `
    <button class="jeu" type="button" data-jeu="${echapper(j.id)}" aria-label="Jouer à ${echapper(j.titre)}">
      ${j.image
        ? `<div class="jaquette"><img src="${echapper(lien(j.image))}" alt="" loading="lazy"></div>`
        : `<div class="jaquette generee"><span class="initiales">${echapper(initiales(j.titre))}</span></div>`}
      <div class="jeu-infos">
        <h3>${echapper(j.titre)}</h3>
        ${j.genre ? `<span class="genre">${echapper(j.genre)}</span>` : ""}
        ${j.description ? `<p>${echapper(j.description)}</p>` : ""}
      </div>
    </button>`).join("");

  // Histoire
  const h = d.histoire || {};
  $("titreHistoire").textContent = h.titre || "Histoire";
  $("texteHistoire").innerHTML = String(h.texte || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("");
  $("histoireImage").hidden = !h.image;
  if (h.image) $("imageHistoire").src = lien(h.image);

  afficherBlocs(d);
  afficherSlides(d);
}

// Boutons de l'accueil (anciens sites : on reprend les deux boutons d'origine)
function boutonsAccueil(s) {
  if (Array.isArray(s.boutons)) return s.boutons;
  return [
    { texte: s.boutonJeux || "Voir les jeux", cible: "#jeux", style: "plein" },
    { texte: s.boutonHistoire || "Mon histoire", cible: "#histoire", style: "contour" },
  ];
}

// ---------- Carrousel « À la une » ----------
// Le jeu le plus récent : l'identifiant d'un jeu contient sa date d'ajout
function dernierJeu(d) {
  const jeux = d.jeux || [];
  if (!jeux.length) return null;
  const date = (j) => parseInt(String(j.id).slice(1), 36) || 0;
  return jeux.reduce((a, b) => (date(b) >= date(a) ? b : a));
}
// Cartes proposées tant que tu n'as rien enregistré dans l'onglet Carrousel
function slidesParDefaut(d) {
  const reseaux = (d.blocs || []).find((b) => b.type === "liens");
  const liste = [{ id: "s-jeu", type: "dernier-jeu", surtitre: "Dernière sortie", boutonTexte: "Jouer maintenant" }];
  if (reseaux) liste.push({
    id: "s-reseaux", type: "perso", surtitre: "Rejoins-moi", titre: "Suis BS sur les réseaux",
    texte: "Les coulisses de mes jeux, les prochaines sorties et des défis à relever.",
    image: "images/slide-reseaux.jpg", boutonTexte: "Voir mes réseaux", cible: "#bloc-" + reseaux.id,
  });
  liste.push({
    id: "s-actu", type: "perso", surtitre: "Actu Rocket League", titre: "Mercato RLCS 2027 : ça bouge",
    texte: "Gentle Mates sur zen, Vatira et Atow ? Vitality déjà sur sa relève. Le point sur les rumeurs du mercato européen.",
    image: "images/slide-actu-rl.jpg", boutonTexte: "Lire l'article", cible: "url",
    url: "https://www.team-aaa.com/fr/actualite/rlcs-2027-point-sur-les-rumeurs-et-les-pistes-du-mercato-europeen_137272",
  });
  return liste;
}
// La carte « accueil » des anciennes versions n'existe plus : le titre est fixe en haut
const slidesDe = (d) => (Array.isArray(d.slides) ? d.slides : slidesParDefaut(d)).filter((s) => s.type !== "accueil");

function boutonSlide(texte, cible, url) {
  if (!texte) return "";
  const externe = cible === "url", href = externe ? lienSur(url) : cible;
  if (!href) return "";
  return `<a class="bouton plein" href="${echapper(href)}"${externe ? ' target="_blank" rel="noopener"' : ""}>${echapper(texte)}${externe ? " ↗" : ""}</a>`;
}
// Image avec fond de secours si le fichier est introuvable
const imageCarte = (src) => `<span class="carte-secours"></span>${src ? `<img class="carte-image" src="${echapper(lien(src))}" alt="" draggable="false" onerror="this.remove()">` : ""}`;

function htmlCarte(s, d) {
  if (s.type === "dernier-jeu") {
    const j = dernierJeu(d);
    if (!j) return "";
    return `${imageCarte(j.image || d.site.banniere)}
      <button class="carte-jaquette" type="button" data-jeu="${echapper(j.id)}" aria-label="Jouer à ${echapper(j.titre)}">
        ${j.image ? `<img src="${echapper(lien(j.image))}" alt="" draggable="false">` : `<span class="jaquette generee"><span class="initiales">${echapper(initiales(j.titre))}</span></span>`}
      </button>
      <div class="carte-texte">
        <p class="surtitre"><span class="badge">NEW</span>${echapper(s.surtitre || "Dernière sortie")}</p>
        <h3 class="carte-titre relief">${echapper(j.titre)}</h3>
        ${j.description ? `<p class="desc">${echapper(j.description)}</p>` : ""}
        <div class="hero-boutons"><button class="bouton plein" type="button" data-jeu="${echapper(j.id)}">▶ ${echapper(s.boutonTexte || "Jouer maintenant")}</button></div>
      </div>`;
  }
  if (!s.titre && !s.texte && !s.image) return "";
  return `${imageCarte(s.image)}
    <div class="carte-texte">
      ${s.surtitre ? `<p class="surtitre">${echapper(s.surtitre)}</p>` : ""}
      ${s.titre ? `<h3 class="carte-titre relief">${echapper(s.titre)}</h3>` : ""}
      ${s.texte ? `<p class="desc">${echapper(s.texte)}</p>` : ""}
      ${s.boutonTexte ? `<div class="hero-boutons">${boutonSlide(s.boutonTexte, s.cible, s.url)}</div>` : ""}
    </div>`;
}

// Carrousel infini : les 2 premières cartes sont recopiées à la fin.
// Arrivé sur la copie, on revient sans animation sur la vraie carte : la boucle ne se voit pas.
let slideActuelle = 0, pos = 0, nbCartes = 0;
const cartes = () => [...$("piste").children];

function afficherSlides(d) {
  const html = slidesDe(d).map((s) => htmlCarte(s, d)).filter(Boolean);
  nbCartes = html.length;
  $("carrousel").hidden = !nbCartes;
  const plusieurs = nbCartes > 1;
  const copies = plusieurs ? [0, 1 % nbCartes] : [];
  $("piste").innerHTML =
    html.map((h, i) => `<article class="carte" aria-roledescription="carte" data-i="${i}">${h}</article>`).join("") +
    copies.map((i) => `<article class="carte copie" aria-hidden="true" data-i="${i}">${html[i]}</article>`).join("");
  $("carrousel").style.setProperty("--duree", (Number(d.slidesDuree) || 6) + "s");
  $("progs").hidden = !plusieurs;
  document.querySelector(".carrousel-nav").hidden = !plusieurs;
  $("progs").innerHTML = html.map((_, i) => `<button class="prog" type="button" data-slide="${i}" aria-label="Aller à la carte ${i + 1}"><span></span></button>`).join("");
  placer(Math.min(slideActuelle, Math.max(nbCartes - 1, 0)), false);
}

const decalage = (p = pos) => { const c = cartes()[p]; return c ? c.offsetLeft : 0; };

function sansAnimation(f) {
  $("piste").classList.add("sans-transition");
  f();
  void $("piste").offsetWidth; // applique la position avant de réactiver les animations
  $("piste").classList.remove("sans-transition");
}

// Place la piste sur la position p (0 … nbCartes, la dernière étant la copie de la 1re carte)
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
      if (!c.classList.contains("copie")) {
        c.setAttribute("aria-label", `${k + 1} sur ${nbCartes}`);
        c.setAttribute("aria-hidden", String(!active));
      }
      c.querySelectorAll("a, button").forEach((el) => (el.tabIndex = active ? 0 : -1));
    });
  };
  animer ? faire() : sansAnimation(faire);
  [...$("progs").children].forEach((b, k) => {
    b.classList.remove("actif");
    b.classList.toggle("vue", k < slideActuelle);
    if (k === slideActuelle && nbCartes > 1) { void b.offsetWidth; b.classList.add("actif"); } // relance la barre
  });
  $("numeroSlide").textContent = String(slideActuelle + 1).padStart(2, "0") + " / " + String(nbCartes).padStart(2, "0");
}

function suivante() {
  if (nbCartes < 2) return;
  if (pos >= nbCartes) placer(0, false); // on était sur la copie : retour discret au début
  placer(pos + 1);
}
function precedente() {
  if (nbCartes < 2) return;
  if (pos <= 0) placer(nbCartes, false); // saut discret sur la copie de la 1re carte
  placer(pos - 1);
}
function allerA(i) { if (i !== slideActuelle || pos >= nbCartes) placer(i); }

// Une fois arrivé sur la copie, on se replace sur la vraie 1re carte
$("piste").addEventListener("transitionend", (e) => {
  if (e.target === $("piste") && e.propertyName === "transform" && pos >= nbCartes && !glisse) placer(0, false);
});
window.addEventListener("resize", () => placer(pos, false));

// Défilement automatique : quand la barre est pleine, on passe à la carte suivante
$("progs").addEventListener("animationend", (e) => { if (e.target.closest(".prog.actif")) suivante(); });
$("progs").addEventListener("click", (e) => { const b = e.target.closest("[data-slide]"); if (b) allerA(Number(b.dataset.slide)); });
$("slidePrec").addEventListener("click", precedente);
$("slideSuiv").addEventListener("click", suivante);

const zone = $("carrousel");
const pause = (oui) => zone.classList.toggle("pause", oui);
zone.addEventListener("mouseenter", () => pause(true));
zone.addEventListener("mouseleave", () => pause(zone.contains(document.activeElement) && document.activeElement !== document.body));
zone.addEventListener("focusin", () => pause(true));
zone.addEventListener("focusout", (e) => { if (!zone.contains(e.relatedTarget)) pause(zone.matches(":hover")); });
zone.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") precedente();
  if (e.key === "ArrowRight") suivante();
});

// Glisser à la souris ou au doigt : la piste suit le geste
let glisse = null, aGlisse = false;
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
    glisse.actif = true; aGlisse = true;
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
  pause(zone.matches(":hover"));
});
$("fenetre").addEventListener("dragstart", (e) => e.preventDefault());
// Après un glissé, on n'ouvre pas le lien ; un clic sur une carte voisine l'amène au centre
$("fenetre").addEventListener("click", (e) => {
  if (aGlisse) { e.preventDefault(); e.stopPropagation(); aGlisse = false; return; }
  const c = e.target.closest(".carte:not(.actif)");
  if (c) { e.preventDefault(); e.stopPropagation(); cartes().indexOf(c) > pos ? suivante() : precedente(); }
}, true);

// ---------- Blocs (ordre des sections + blocs ajoutés) ----------
const paragraphes = (t) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("");
const lienSur = (u) => { try { const x = new URL(String(u).trim()); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
const NOMS_SITES = { instagram: "Instagram", linkedin: "LinkedIn", youtube: "YouTube", youtu: "YouTube", tiktok: "TikTok", twitter: "X", x: "X", discord: "Discord", twitch: "Twitch", facebook: "Facebook", github: "GitHub", itch: "itch.io", snapchat: "Snapchat" };
function nomDuSite(u) {
  const morceaux = new URL(u).hostname.replace(/^www\./, "").split(".");
  const cle = morceaux.find((m) => NOMS_SITES[m]);
  return cle ? NOMS_SITES[cle] : morceaux[0].charAt(0).toUpperCase() + morceaux[0].slice(1);
}
function idYouTube(u) {
  const m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m ? m[1] : "";
}
const titreBloc = (b) => b.titre ? `<h2 class="relief">${echapper(b.titre)}</h2>` : "";

function htmlBloc(b) {
  switch (b.type) {
    case "texte":
      return `<div class="b-texte ${b.alignement === "centre" ? "centre" : ""}">${titreBloc(b)}<div class="b-paras">${paragraphes(b.texte)}</div></div>`;
    case "image":
      if (!b.image) return "";
      return `<figure class="b-image ${b.largeur === "moyenne" ? "moyenne" : ""}">${titreBloc(b)}<img src="${echapper(lien(b.image))}" alt="${echapper(b.legende || "")}" loading="lazy">${b.legende ? `<figcaption>${echapper(b.legende)}</figcaption>` : ""}</figure>`;
    case "encadre": {
      const url = lienSur(b.lienBouton);
      return `<div class="b-encadre" style="--fond-encadre:${echapper(b.couleur || "var(--accent)")}">${b.titre ? `<h2>${echapper(b.titre)}</h2>` : ""}${paragraphes(b.texte)}${b.texteBouton && url ? `<a class="bouton plein" href="${echapper(url)}" target="_blank" rel="noopener">${echapper(b.texteBouton)}</a>` : ""}</div>`;
    }
    case "liens": {
      const items = String(b.liens || "").split("\n").map((l) => {
        let [nom, url] = l.split("|").map((s) => (s || "").trim());
        if (!url && lienSur(nom)) { url = nom; nom = nomDuSite(nom); } // lien collé sans nom
        return { nom, url: lienSur(url) };
      }).filter((x) => x.nom && x.url);
      if (!items.length) return "";
      return `<div class="b-liens">${titreBloc(b)}<ul>${items.map((i) => `<li><a class="bouton" href="${echapper(i.url)}" target="_blank" rel="noopener">${echapper(i.nom)} ↗</a></li>`).join("")}</ul></div>`;
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

function afficherBlocs(d) {
  const blocs = d.blocs && d.blocs.length ? d.blocs : [{ id: "jeux", type: "jeux" }, { id: "histoire", type: "histoire" }];
  const noeuds = [];
  const menu = [`<li><a class="relief" href="#accueil" data-ferme>Accueil</a></li>`];
  const jeux = d.jeux || [];
  for (const b of blocs) {
    if (b.type === "jeux") {
      noeuds.push($("jeux"));
      menu.push(`<li><button class="relief menu-jeux" id="menuJeuxBtn" type="button" aria-expanded="false" aria-controls="menuListeJeux">${echapper(d.sectionJeux?.titre || "Jeux")} <span class="fleche" aria-hidden="true">▾</span></button>
        <ul class="menu-sous" id="menuListeJeux" hidden>${jeux.map((j) => `<li><button type="button" data-jeu="${echapper(j.id)}">${echapper(j.titre)}</button></li>`).join("")}
        <li><a class="tous" href="#jeux" data-ferme>${jeux.length ? "Voir tous les jeux" : "Bientôt des jeux ici"}</a></li></ul></li>`);
    } else if (b.type === "histoire") {
      noeuds.push($("histoire"));
      menu.push(`<li><a class="relief" href="#histoire" data-ferme>${echapper(b.titreMenu || "Histoire")}</a></li>`);
    } else {
      const html = htmlBloc(b);
      if (!html) continue;
      const s = document.createElement("section");
      s.className = "section bloc bloc-" + b.type;
      s.id = "bloc-" + b.id;
      s.innerHTML = html;
      noeuds.push(s);
      if (b.dansMenu && b.titre) menu.push(`<li><a class="relief" href="#bloc-${echapper(b.id)}" data-ferme>${echapper(b.titre)}</a></li>`);
    }
  }
  // Une section jeux ou histoire retirée de la liste reste cachée
  ["jeux", "histoire"].forEach((id) => { $(id).hidden = !noeuds.includes($(id)); if ($(id).hidden) noeuds.push($(id)); });
  $("sections").replaceChildren(...noeuds);
  $("menuLiens").innerHTML = menu.join("");
}

function montrerImage(img, chemin) {
  img.hidden = !chemin;
  if (chemin) img.src = lien(chemin); else img.removeAttribute("src");
}

// ---------- Menu burger ----------
function ouvrirMenu(ouvrir) {
  $("menu").classList.toggle("ouvert", ouvrir);
  $("menu").inert = !ouvrir;
  $("voile").hidden = !ouvrir;
  $("burger").setAttribute("aria-expanded", String(ouvrir));
  $("burger").setAttribute("aria-label", ouvrir ? "Fermer le menu" : "Ouvrir le menu");
}
$("burger").addEventListener("click", () => ouvrirMenu($("burger").getAttribute("aria-expanded") !== "true"));
$("voile").addEventListener("click", () => ouvrirMenu(false));
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#menuJeuxBtn");
  if (!btn) return;
  const ouvert = btn.getAttribute("aria-expanded") === "true";
  btn.setAttribute("aria-expanded", String(!ouvert));
  $("menuListeJeux").hidden = ouvert;
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("lecteur").hidden) { if (!document.fullscreenElement) fermerJeu(); }
  else ouvrirMenu(false);
});

// ---------- Clics : jeux et liens du menu ----------
document.addEventListener("click", (e) => {
  const j = e.target.closest("[data-jeu]");
  if (j) { ouvrirMenu(false); ouvrirJeu(j.dataset.jeu); return; }
  if (e.target.closest("[data-ferme]")) ouvrirMenu(false);
});

// ---------- Lecteur de jeu ----------
function ouvrirJeu(id) {
  const j = (donnees.jeux || []).find((x) => x.id === id);
  if (!j) return;
  jeuActuel = j;
  $("lecteurTitre").textContent = j.titre;
  $("lecteur").hidden = false;
  document.body.style.overflow = "hidden";
  monterJeu();
  if (!apercu) history.replaceState(null, "", "#jouer-" + id);
  $("btnFermer").focus();
}
function monterJeu() {
  const ancien = $("scene").querySelector("iframe");
  if (ancien) ancien.remove();
  $("chargement").hidden = false;
  const f = document.createElement("iframe");
  f.title = jeuActuel.titre;
  f.allow = "fullscreen; autoplay; gamepad";
  f.addEventListener("load", () => { $("chargement").hidden = true; f.focus(); });
  f.src = lien(jeuActuel.fichier);
  $("scene").appendChild(f);
}
function fermerJeu() {
  jeuActuel = null;
  const f = $("scene").querySelector("iframe");
  if (f) f.remove();
  $("lecteur").hidden = true;
  document.body.style.overflow = "";
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (!apercu) history.replaceState(null, "", location.pathname);
}
$("btnFermer").addEventListener("click", fermerJeu);
$("btnRejouer").addEventListener("click", () => jeuActuel && monterJeu());
$("btnPleinEcran").addEventListener("click", () => {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else $("lecteur").requestFullscreen?.().catch(() => {});
});

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
      const m = location.hash.match(/^#jouer-(.+)$/);
      if (m) ouvrirJeu(m[1]);
    })
    .catch((err) => {
      console.error(err);
      if (donnees) return; // le contenu est chargé : on ne masque pas le site pour une petite erreur
      $("videJeux").hidden = false;
      $("videJeux").textContent = "Le contenu du site n'a pas pu être chargé. Si tu as ouvert index.html en double-cliquant dessus, c'est normal : le site fonctionne une fois en ligne.";
    });
}
