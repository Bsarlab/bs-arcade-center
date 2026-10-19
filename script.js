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

  // Liste des jeux dans le menu
  $("menuListeJeux").innerHTML =
    jeux.map((j) => `<li><button type="button" data-jeu="${echapper(j.id)}">${echapper(j.titre)}</button></li>`).join("") +
    `<li><a class="tous" href="#jeux" data-ferme>${jeux.length ? "Voir tous les jeux" : "Bientôt des jeux ici"}</a></li>`;

  // Histoire
  const h = d.histoire || {};
  $("titreHistoire").textContent = h.titre || "Histoire";
  $("texteHistoire").innerHTML = String(h.texte || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${echapper(p).replace(/\n/g, "<br>")}</p>`).join("");
  $("histoireImage").hidden = !h.image;
  if (h.image) $("imageHistoire").src = lien(h.image);
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
$("menuJeuxBtn").addEventListener("click", () => {
  const ouvert = $("menuJeuxBtn").getAttribute("aria-expanded") === "true";
  $("menuJeuxBtn").setAttribute("aria-expanded", String(!ouvert));
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
