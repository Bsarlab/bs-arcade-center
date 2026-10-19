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
  $("boutonJeux").textContent = s.boutonJeux || "Voir les jeux";
  $("boutonHistoire").textContent = s.boutonHistoire || "Mon histoire";
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
}

// ---------- Blocs (ordre des sections + blocs ajoutés) ----------
const paragraphes = (t) => String(t || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
  .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("");
const lienSur = (u) => { try { const x = new URL(String(u).trim()); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
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
      const items = String(b.liens || "").split("\n").map((l) => { const [nom, url] = l.split("|").map((s) => (s || "").trim()); return { nom, url: lienSur(url) }; }).filter((x) => x.nom && x.url);
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
    .catch(() => {
      $("videJeux").hidden = false;
      $("videJeux").textContent = "Le contenu du site n'a pas pu être chargé. Si tu as ouvert index.html en double-cliquant dessus, c'est normal : le site fonctionne une fois en ligne.";
    });
}
