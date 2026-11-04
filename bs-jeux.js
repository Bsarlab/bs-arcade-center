// =========================================================
// BS arcade center : petit outil à inclure dans un jeu
//   <script src="../bs-jeux.js"></script>
// Donne au jeu :
//   BS.profil      -> { id, pseudo, avatar } du joueur connecté (ou null)
//   BS.score(n)    -> envoie un score au classement (le meilleur est gardé)
//   BS.score(n, { ordre: "bas" })  -> quand le plus petit score gagne (golf)
//   BS.victoire()  -> ajoute une victoire au classement du jeu
// Sans compte, ou si le jeu est ouvert tout seul, ces fonctions ne font rien.
// =========================================================
(function () {
  var parentSite = null, profil = null;
  try { if (window.parent !== window && window.parent.BS_PLATEFORME) parentSite = window.parent; } catch (e) {}
  try { profil = (parentSite && parentSite.BS_PROFIL) || JSON.parse(localStorage.getItem("bs-profil") || "null"); } catch (e) {}
  var appeler = function (nom, args) {
    try { if (parentSite) return parentSite.BS_PLATEFORME[nom].apply(parentSite.BS_PLATEFORME, args); } catch (e) {}
    return Promise.resolve(null);
  };
  // N'accepte que les avatars du site (dessins) ou les photos stockées chez Supabase
  var imageSure = function (u) {
    u = String(u || "");
    if (/^data:image\/svg\+xml,[A-Za-z0-9%._~!*()-]+$/.test(u) && u.length < 6000) return u;
    if (/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/avatars\/[A-Za-z0-9\/_.-]+(\?v=\d+)?$/.test(u)) return u;
    return "";
  };
  window.BS = {
    imageSure: imageSure,
    profil: profil,
    connecte: !!profil,
    score: function (valeur, options) { return appeler("score", [Number(valeur), options || {}]); },
    victoire: function () { return appeler("victoire", []); },
  };
  // Mise à jour si le joueur se connecte pendant que le jeu est ouvert
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "bs-profil") { window.BS.profil = e.data.profil; window.BS.connecte = !!e.data.profil; }
  });
})();
