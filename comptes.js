// =========================================================
// BS arcade center : comptes joueurs (Supabase)
// Connexion par e-mail + mot de passe, profil (pseudo + avatar).
// Le profil est transmis aux jeux de trois façons :
//   1. localStorage « bs-profil »  -> { id, pseudo, avatar }
//   2. window.parent.BS_PROFIL      (depuis un jeu ouvert sur le site)
//   3. message { type: "bs-profil", profil } envoyé au jeu quand il s'ouvre
// Réglages dans l'admin, onglet « Comptes ».
// =========================================================
(() => {
  const LIB = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  let sb = null, session = null, profil = null, chargement = null, etat = { mode: "connexion", message: "", erreur: "", envoi: false };
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reglages = () => (typeof donnees !== "undefined" && donnees?.comptes) || {};
  const actifs = () => { const c = reglages(); return !!(c.actif && /^https:\/\/.+/.test(c.url || "") && (c.cle || "").length > 20); };

  // ---------- Avatars dessinés (images autonomes, utilisables dans les jeux) ----------
  const FONDS = ["#E9DFD3", "#D6E4D2", "#D3DDEA", "#EBD3CC", "#E3D6E6", "#D2E3E3", "#EDE2C4", "#DADADF", "#CFE0D8", "#E8D8C8", "#D9D2EA", "#E6D0D6"];
  const PEAUX = ["#F1D3B3", "#E2B48F", "#C68E63", "#8D5A3B", "#F3DCC4", "#B97C55"];
  const CHEVEUX = ["#2E241C", "#5A4836", "#8C5A2B", "#C9A26B", "#3B3B45", "#A0522D"];
  function avatarDessine(n) {
    const fond = FONDS[n % 12], peau = PEAUX[n % 6], ch = CHEVEUX[(n * 5) % 6], style = n % 4;
    const coiffure = [
      `<path d="M28 44c0-18 10-28 22-28s22 10 22 28c-6-8-14-12-22-12s-16 4-22 12z" fill="${ch}"/>`,
      `<path d="M26 50c-2-22 10-34 24-34s26 12 24 34c-2-10-8-14-10-14-6 4-22 4-28 0-2 0-8 4-10 14z" fill="${ch}"/><circle cx="50" cy="14" r="9" fill="${ch}"/>`,
      `<path d="M26 40c4-16 14-22 24-22s20 6 24 22H26z" fill="${ch}"/><rect x="22" y="38" width="56" height="6" rx="3" fill="${ch}"/>`,
      `<path d="M24 58c-4-26 8-42 26-42s30 16 26 42c-2-14-6-22-10-24-10 6-22 6-32 0-4 2-8 10-10 24z" fill="${ch}"/>`,
    ][style];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${fond}"/><path d="M18 100c2-20 16-30 32-30s30 10 32 30z" fill="${ch}" opacity=".85"/><rect x="42" y="60" width="16" height="14" rx="6" fill="${peau}"/><circle cx="50" cy="46" r="22" fill="${peau}"/>${coiffure}<circle cx="42" cy="48" r="2.6" fill="#2A211A"/><circle cx="58" cy="48" r="2.6" fill="#2A211A"/><path d="M43 56c4 4 10 4 14 0" stroke="#2A211A" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="37" cy="54" r="3" fill="#E89A8A" opacity=".45"/><circle cx="63" cy="54" r="3" fill="#E89A8A" opacity=".45"/></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }
  const AVATARS = Array.from({ length: 12 }, (_, i) => avatarDessine(i));
  const avatarDe = (p) => p?.avatar || AVATARS[0];

  // ---------- Transmission du profil aux jeux ----------
  function partagerProfil() {
    const p = session && profil ? { id: session.user.id, pseudo: profil.pseudo, avatar: avatarDe(profil) } : null;
    window.BS_PROFIL = p;
    try { p ? localStorage.setItem("bs-profil", JSON.stringify(p)) : localStorage.removeItem("bs-profil"); } catch {}
    const f = document.querySelector("#scene iframe");
    try { f?.contentWindow?.postMessage({ type: "bs-profil", profil: p }, "*"); } catch {}
    majBouton();
  }
  // Un jeu peut aussi demander le profil : postMessage({ type: "bs-profil?" })
  addEventListener("message", (e) => {
    if (e.data?.type === "bs-profil?" && e.source) e.source.postMessage({ type: "bs-profil", profil: window.BS_PROFIL || null }, "*");
  });

  // ---------- Supabase ----------
  function chargerLib() {
    if (window.supabase?.createClient) return Promise.resolve();
    chargement ??= new Promise((ok, ko) => { const s = document.createElement("script"); s.src = LIB; s.onload = ok; s.onerror = () => ko(new Error("lib")); document.head.appendChild(s); });
    return chargement;
  }
  async function lireProfil() {
    if (!session) { profil = null; return; }
    const { data } = await sb.from("profils").select("pseudo, avatar").eq("id", session.user.id).maybeSingle();
    profil = data || { pseudo: session.user.user_metadata?.pseudo || session.user.email.split("@")[0], avatar: "" };
  }
  window.demarrerComptes = async () => {
    majBouton();
    if (!actifs() || sb || (typeof apercu !== "undefined" && apercu)) return;
    try {
      await chargerLib();
      const c = reglages();
      sb = window.supabase.createClient(c.url.trim(), c.cle.trim(), { auth: { persistSession: true, storageKey: "bs-session" } });
      ({ data: { session } } = await sb.auth.getSession());
      await lireProfil();
      partagerProfil();
      setTimeout(() => window.BS_PLATEFORME.verifierNouveautes?.(), 1200);
      sb.auth.onAuthStateChange(async (evt, s) => {
        session = s;
        if (evt === "PASSWORD_RECOVERY") { etat.mode = "nouveau-mdp"; }
        await lireProfil(); partagerProfil();
        if (evt === "SIGNED_IN") setTimeout(() => window.BS_PLATEFORME.verifierNouveautes?.(), 1200);
        if (typeof pageActuelle !== "undefined" && pageActuelle === "compte") rafraichir();
      });
      if (typeof pageActuelle !== "undefined" && pageActuelle === "compte") rafraichir();
    } catch (e) {
      console.error(e);
      etat.erreur = "Les comptes sont momentanément indisponibles.";
    }
  };

  // ---------- Bouton en haut à droite ----------
  function majBouton() {
    const b = $("btnCompte"); if (!b) return;
    b.hidden = !actifs();
    if (session && profil) {
      b.innerHTML = `<img src="${esc(avatarDe(profil))}" alt=""><span>${esc(profil.pseudo)}</span>`;
      b.classList.add("connecte"); b.setAttribute("aria-label", "Mon compte : " + profil.pseudo);
    } else {
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg><span>${esc(T("compte_connexion"))}</span>`;
      b.classList.remove("connecte"); b.setAttribute("aria-label", T("compte_connexion"));
    }
    window.BS_PLATEFORME?.majCloche?.();
    const lp = $("lecteurProfil");
    if (lp) { lp.hidden = true; if (profil) lp.innerHTML = `<img src="${esc(avatarDe(profil))}" alt=""><span>${esc(profil.pseudo)}</span>`; }
  }
  window.majCompte = majBouton;

  // ---------- Page « Mon compte » ----------
  const rafraichir = () => { const v = $("vue"); if (v && pageActuelle === "compte") { v.innerHTML = PAGES.compte(); } };
  const champ = (id, label, type, extra = "") => `<label class="champ-compte"><span>${label}</span><input id="${id}" name="${id}" type="${type}" ${extra}></label>`;
  const alerte = () => (etat.erreur ? `<p class="alerte erreur" role="alert">${esc(etat.erreur)}</p>` : etat.message ? `<p class="alerte" role="status">${esc(etat.message)}</p>` : "");

  PAGES.compte = () => {
    const entete = (titre, texte) => `<section class="entete-page"><div class="conteneur entete-illu"><div><p class="etiquette">${t("compte_etiquette")}</p><h1>${titre}</h1><p class="accroche">${texte}</p></div>${dessin("choisir", "entete-dessin")}</div></section>`;
    if (!actifs()) return entete(t("compte_titre_off"), t("compte_texte_off"));
    if (!sb && !(typeof apercu !== "undefined" && apercu)) return entete(t("compte_titre"), t("compte_chargement")) + `<section class="section serree"><div class="conteneur">${alerte()}</div></section>`;
    if (etat.mode === "nouveau-mdp") return entete(t("compte_mdp_titre"), "") + `<section class="section serree"><div class="conteneur"><form class="carte-compte" data-compte="nouveau-mdp">${alerte()}
      ${champ("cMdp", t("compte_nouveau_mdp"), "password", 'required minlength="6" autocomplete="new-password"')}
      <button class="btn plein grand" type="submit" ${etat.envoi ? "disabled" : ""}>${t("compte_enregistrer")}</button></form></div></section>`;

    if (!session) {
      const inscription = etat.mode === "inscription", oubli = etat.mode === "oubli";
      return entete(t("compte_titre"), t("compte_texte")) + `
  <section class="section serree"><div class="conteneur">
    <div class="compte-grille">
      <form class="carte-compte" data-compte="${etat.mode}" novalidate>
        <div class="onglets-compte" role="tablist">
          <button type="button" role="tab" data-mode-compte="connexion" aria-selected="${etat.mode === "connexion"}">${t("compte_onglet_connexion")}</button>
          <button type="button" role="tab" data-mode-compte="inscription" aria-selected="${inscription}">${t("compte_onglet_inscription")}</button>
        </div>
        ${alerte()}
        ${inscription ? champ("cPseudo", t("compte_pseudo"), "text", 'required maxlength="30" autocomplete="nickname"') : ""}
        ${champ("cEmail", t("compte_email"), "email", 'required autocomplete="email"')}
        ${oubli ? "" : champ("cMdp", t("compte_mdp"), "password", `required minlength="6" autocomplete="${inscription ? "new-password" : "current-password"}"`)}
        <button class="btn plein grand" type="submit" ${etat.envoi ? "disabled" : ""}>${oubli ? t("compte_envoyer_lien") : inscription ? t("compte_creer") : t("compte_se_connecter")}</button>
        ${etat.mode === "connexion" ? `<button class="lien-discret" type="button" data-mode-compte="oubli">${t("compte_oubli")}</button>` : oubli ? `<button class="lien-discret" type="button" data-mode-compte="connexion">${t("compte_retour")}</button>` : ""}
        <p class="compte-note">${t("compte_note")}</p>
      </form>
      <div class="compte-atouts">
        <div class="compte-avatars-demo" aria-hidden="true">${AVATARS.slice(0, 6).map((a) => `<img src="${a}" alt="">`).join("")}</div>
        <ul>${["compte_atout1", "compte_atout2", "compte_atout3"].map((k) => `<li>${I.coche}${t(k)}</li>`).join("")}</ul>
      </div>
    </div>
  </div></section>`;
    }

    const p = profil || { pseudo: "", avatar: "" }, choisi = avatarDe(p);
    return entete(`${t("compte_bonjour")} ${esc(p.pseudo)}`, t("compte_texte_connecte")) + `
  <section class="section serree"><div class="conteneur">
    <form class="carte-compte large" data-compte="profil">
      ${alerte()}
      <div class="profil-tete">
        <span class="profil-avatar"><img id="apercuAvatar" src="${esc(choisi)}" alt=""></span>
        <div class="profil-champs">
          ${champ("cPseudo", t("compte_pseudo"), "text", `required maxlength="30" value="${esc(p.pseudo)}" autocomplete="nickname"`)}
          <p class="meta">${esc(session.user.email)}</p>
        </div>
      </div>
      <p class="sous-titre">${t("compte_choisir_avatar")}</p>
      <div class="grille-avatars" role="radiogroup" aria-label="${t("compte_choisir_avatar")}">
        ${AVATARS.map((a, i) => `<button type="button" class="choix-avatar" role="radio" aria-checked="${a === choisi}" data-avatar="${i}"><img src="${a}" alt="Avatar ${i + 1}"></button>`).join("")}
        <label class="choix-avatar photo" title="${t("compte_ma_photo")}">${I.photo}<span>${t("compte_ma_photo")}</span><input type="file" id="cPhoto" accept="image/png,image/jpeg,image/webp" hidden></label>
      </div>
      <div class="boutons">
        <button class="btn plein grand" type="submit" ${etat.envoi ? "disabled" : ""}>${t("compte_enregistrer")}</button>
        <a class="btn grand" href="#/jeux">${t("compte_aller_jouer")}</a>
        <a class="btn grand" href="#/joueur/${esc(session.user.id)}">${t("joueur_mon_profil")}</a>
        <button class="btn grand" type="button" data-deconnexion>${t("compte_deconnexion")}</button>
      </div>
    </form>
  </div></section>`;
  };

  // ---------- Actions ----------
  let avatarChoisi = null, photoEnAttente = null;
  const trad = (m) => {
    const s = String(m || "");
    if (/Invalid login/i.test(s)) return "E-mail ou mot de passe incorrect.";
    if (/already registered|already been registered/i.test(s)) return "Un compte existe déjà avec cet e-mail. Connecte-toi.";
    if (/Password should be/i.test(s)) return "Le mot de passe doit faire au moins 6 caractères.";
    if (/Email not confirmed/i.test(s)) return "Confirme d'abord ton e-mail grâce au lien reçu.";
    if (/rate limit|too many/i.test(s)) return "Trop d'essais, réessaie dans quelques minutes.";
    if (/valid email|invalid email/i.test(s)) return "Cette adresse e-mail n'est pas valide.";
    return "Une erreur est survenue. Réessaie dans un instant.";
  };
  async function redimensionner(fichier) {
    const img = await createImageBitmap(fichier);
    const c = document.createElement("canvas"), t = 256; c.width = c.height = t;
    const s = Math.min(img.width, img.height);
    c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, t, t);
    return new Promise((ok) => c.toBlob(ok, "image/jpeg", .86));
  }
  const adresseSite = () => location.origin + location.pathname;

  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode-compte]");
    if (m) { etat = { ...etat, mode: m.dataset.modeCompte, message: "", erreur: "" }; rafraichir(); return; }
    const a = e.target.closest("[data-avatar]");
    if (a) {
      avatarChoisi = AVATARS[Number(a.dataset.avatar)]; photoEnAttente = null;
      document.querySelectorAll(".choix-avatar").forEach((b) => b.setAttribute("aria-checked", String(b === a)));
      $("apercuAvatar").src = avatarChoisi; return;
    }
    if (e.target.closest("[data-deconnexion]")) { sb?.auth.signOut(); etat = { mode: "connexion", message: "À bientôt !", erreur: "" }; }
  });
  document.addEventListener("change", async (e) => {
    if (e.target.id !== "cPhoto" || !e.target.files[0]) return;
    try {
      photoEnAttente = await redimensionner(e.target.files[0]); avatarChoisi = null;
      $("apercuAvatar").src = URL.createObjectURL(photoEnAttente);
      document.querySelectorAll(".choix-avatar").forEach((b) => b.setAttribute("aria-checked", String(b.classList.contains("photo"))));
    } catch { notifier("Cette image n'a pas pu être lue"); }
  });
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-compte]"); if (!f || !sb) return;
    e.preventDefault();
    const v = (id) => (f.querySelector("#" + id)?.value || "").trim();
    etat = { ...etat, envoi: true, erreur: "", message: "" };
    const garder = { email: v("cEmail"), pseudo: v("cPseudo") };
    try {
      const mode = f.dataset.compte;
      if (mode === "connexion") {
        const { error } = await sb.auth.signInWithPassword({ email: v("cEmail"), password: v("cMdp") });
        if (error) throw error;
        etat.message = "";
      } else if (mode === "inscription") {
        if (!v("cPseudo")) throw new Error("pseudo");
        const { data, error } = await sb.auth.signUp({ email: v("cEmail"), password: v("cMdp"), options: { data: { pseudo: v("cPseudo") }, emailRedirectTo: adresseSite() + "#/compte" } });
        if (error) throw error;
        if (data.session) {
          session = data.session;
          await sb.from("profils").upsert({ id: data.user.id, pseudo: v("cPseudo"), avatar: AVATARS[Math.floor(Math.random() * 12)] });
          await lireProfil(); partagerProfil();
          etat.message = "Bienvenue ! Choisis ton avatar.";
        } else {
          etat.mode = "connexion"; etat.message = "Compte créé ! Clique sur le lien reçu par e-mail pour l'activer, puis connecte-toi.";
        }
      } else if (mode === "oubli") {
        const { error } = await sb.auth.resetPasswordForEmail(v("cEmail"), { redirectTo: adresseSite() + "#/compte" });
        if (error) throw error;
        etat.message = "Si un compte existe, un e-mail pour changer de mot de passe vient d'être envoyé.";
      } else if (mode === "nouveau-mdp") {
        const { error } = await sb.auth.updateUser({ password: v("cMdp") });
        if (error) throw error;
        etat.mode = "connexion"; etat.message = "Mot de passe changé !";
      } else if (mode === "profil") {
        if (!v("cPseudo")) throw new Error("pseudo");
        let avatar = avatarChoisi || profil?.avatar || AVATARS[0];
        if (photoEnAttente) {
          const chemin = `${session.user.id}/avatar.jpg`;
          const { error } = await sb.storage.from("avatars").upload(chemin, photoEnAttente, { upsert: true, contentType: "image/jpeg", cacheControl: "60" });
          if (error) throw error;
          avatar = sb.storage.from("avatars").getPublicUrl(chemin).data.publicUrl + "?v=" + Date.now();
        }
        const { error } = await sb.from("profils").upsert({ id: session.user.id, pseudo: v("cPseudo").slice(0, 30), avatar, maj: new Date().toISOString() });
        if (error) throw error;
        photoEnAttente = null; avatarChoisi = null;
        await lireProfil(); partagerProfil();
        notifier("Profil enregistré !");
      }
    } catch (err) {
      console.error(err);
      etat.erreur = err?.message === "pseudo" ? "Choisis un pseudo." : trad(err?.message);
    }
    etat.envoi = false;
    rafraichir();
    // On garde ce qui a été tapé après un message d'erreur
    if (etat.erreur) { if ($("cEmail") && garder.email) $("cEmail").value = garder.email; if ($("cPseudo") && garder.pseudo && !session) $("cPseudo").value = garder.pseudo; }
  });

  // =========================================================
  // Sauvegardes liées au compte + classements (utilisés par les jeux)
  // =========================================================
  const EXCLUES = /^(bs-|sb-)/;
  const REGISTRE = "bs-cles-jeux"; // { idDuJeu: [clés localStorage écrites par ce jeu] }
  const lireLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const clesDuJeu = (id) => new Set(lireLS(REGISTRE, {})[id] || []);
  function noterCles(id, cles) {
    const r = lireLS(REGISTRE, {}); r[id] = [...new Set([...(r[id] || []), ...cles])];
    try { localStorage.setItem(REGISTRE, JSON.stringify(r)); } catch {}
  }
  const instantane = () => { const m = new Map(); for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!EXCLUES.test(k)) m.set(k, localStorage.getItem(k)); } return m; };
  let partie = null; // { id, avant: Map, cles: Set, envoye: string, minuterie }
  const connecte = () => !!(sb && session);

  async function envoyerSauvegarde(final) {
    const p = partie; if (!p || !connecte()) return;
    const maintenant = instantane();
    maintenant.forEach((v, k) => { if (p.avant.get(k) !== v) p.cles.add(k); });
    noterCles(p.id, p.cles);
    const donneesJeu = {}; p.cles.forEach((k) => { const v = localStorage.getItem(k); if (v !== null) donneesJeu[k] = v; });
    const texte = JSON.stringify(donneesJeu);
    if (texte === p.envoye || texte === "{}") return;
    p.envoye = texte;
    try {
      const { error } = await sb.from("sauvegardes").upsert({ joueur: session.user.id, jeu: p.id, donnees: { cles: donneesJeu }, maj: new Date().toISOString() });
      if (error) throw error;
      if (final) notifier(T("sauvegarde_ok"));
    } catch (e) { console.warn("Sauvegarde non envoyée", e); p.envoye = ""; }
  }

  // ---------- Joueurs présents dans un jeu (temps réel Supabase) ----------
  let salle = null;
  const imageSure = (u) => { u = String(u || ""); return /^data:image\/svg\+xml,[A-Za-z0-9%._~!*()-]+$/.test(u) || /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/avatars\/[A-Za-z0-9\/_.-]+(\?v=\d+)?$/.test(u) ? u : ""; };
  function afficherPresents(liste) {
    const z = $("lecteurJoueurs"); if (!z) return;
    z.hidden = !liste.length;
    $("lecteurProfil") && ($("lecteurProfil").hidden = true);
    const moi = session?.user?.id, max = 6;
    z.innerHTML = `<span class="presents-titre">${liste.length > 1 ? liste.length + " " + esc(T("presents_titre_n")) : esc(T("presents_titre_1"))}</span>`
      + liste.slice(0, max).map((p) => `<span class="present ${p.id === moi ? "moi" : ""}" title="${esc(p.pseudo)}"><img src="${esc(imageSure(p.avatar) || AVATARS[0])}" alt=""><b>${esc(p.id === moi ? T("classement_toi") : p.pseudo)}</b></span>`).join("")
      + (liste.length > max ? `<span class="present plus">+${liste.length - max}</span>` : "");
  }
  async function rejoindreSalle(id) {
    quitterSalle();
    if (!sb?.channel) return;
    const moi = session?.user?.id;
    salle = sb.channel("jeu-" + id, { config: { presence: { key: moi || "invite-" + Math.random().toString(36).slice(2) } } });
    salle.on("presence", { event: "sync" }, () => {
      const etat = salle.presenceState(), vus = new Map();
      Object.values(etat).flat().forEach((p) => { if (p.id && p.pseudo && !vus.has(p.id)) vus.set(p.id, { id: p.id, pseudo: String(p.pseudo).slice(0, 30), avatar: p.avatar }); });
      const liste = [...vus.values()].sort((a, b) => (a.id === moi ? -1 : b.id === moi ? 1 : 0));
      afficherPresents(liste);
    });
    salle.subscribe(async (statut) => {
      if (statut === "SUBSCRIBED" && session && profil) await salle.track({ id: session.user.id, pseudo: profil.pseudo, avatar: avatarDe(profil) });
    });
  }
  function quitterSalle() {
    if (salle) { try { sb.removeChannel(salle); } catch {} salle = null; }
    const z = $("lecteurJoueurs"); if (z) { z.hidden = true; z.innerHTML = ""; }
  }

  // Affichage d'un score. Formats spéciaux (choisis par le jeu avec « libelle ») :
  //   "chrono"         -> le score est un temps en secondes
  //   "chrono+argent"  -> temps en secondes, moins l'argent final / 10 000 000 (le plus rapide gagne, puis le plus riche)
  const FORMATS = { chrono: "Temps", "chrono+argent": "Temps · argent final" };
  const duree = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min ${String(x).padStart(2, "0")} s`; };
  function texteScore(l) {
    const v = Number(l?.score);
    if (l?.libelle === "chrono") return duree(v);
    if (l?.libelle === "chrono+argent") { const sec = Math.ceil(v - 1e-9), argent = Math.round((sec - v) * 1e7); return duree(sec) + " · " + argent.toLocaleString("fr-FR") + " $"; }
    return v.toLocaleString("fr-FR");
  }
  const uniteScore = (l) => (l?.ordre === "cumul" ? T("classement_victoires") : FORMATS[l?.libelle] || l?.libelle || T("classement_score"));

  // Si Supabase refuse un score, on le dit au lieu de l'ignorer
  function erreurScore(e) {
    const m = String((e && (e.code + " " + e.message)) || "");
    notifier(/PGRST202|42883|does not exist|Could not find/i.test(m)
      ? "Score non enregistré : la base des classements n'est pas installée (admin → Comptes → code SQL)."
      : /JWT|401|expired/i.test(m) ? "Score non enregistré : reconnecte-toi à ton compte." : "Score non enregistré : " + (e?.message || "erreur inconnue"), 6000);
  }
  window.BS_PLATEFORME = {
    actif: () => actifs(),
    // Avant d'ouvrir un jeu : on remet la sauvegarde du joueur connecté
    async avantJeu(id) {
      if (partie) await this.apresJeu(partie.id);
      if (!actifs()) return;
      if (!sb) { try { await window.demarrerComptes(); } catch {} }
      try { rejoindreSalle(id); } catch (e) { console.warn(e); }
      if (!connecte()) return;
      const cles = clesDuJeu(id);
      let restaure = {};
      try {
        const { data } = await sb.from("sauvegardes").select("donnees").eq("joueur", session.user.id).eq("jeu", id).maybeSingle();
        restaure = data?.donnees?.cles || {};
      } catch (e) { console.warn(e); }
      // On efface ce qu'un autre joueur aurait laissé sur cet appareil, puis on remet la partie de ce joueur
      const proprios = lireLS("bs-proprio-jeux", {});
      if (Object.keys(restaure).length || (proprios[id] && proprios[id] !== session.user.id)) {
        cles.forEach((k) => { if (!(k in restaure)) localStorage.removeItem(k); });
        Object.entries(restaure).forEach(([k, v]) => { try { localStorage.setItem(k, v); } catch {} cles.add(k); });
      }
      proprios[id] = session.user.id;
      try { localStorage.setItem("bs-proprio-jeux", JSON.stringify(proprios)); } catch {}
      partie = { id, avant: instantane(), cles, envoye: JSON.stringify(restaure), minuterie: setInterval(() => envoyerSauvegarde(false), 20000) };
    },
    // Après le jeu (fermeture ou changement) : on envoie la progression
    async apresJeu(id) {
      quitterSalle();
      if (!partie || partie.id !== id) return;
      clearInterval(partie.minuterie);
      await new Promise((ok) => setTimeout(ok, 60)); // laisse le jeu finir d'écrire
      await envoyerSauvegarde(true);
      partie = null;
      setTimeout(() => this.verifierNouveautes?.(), 2500);
    },
    // Score : ordre "haut" (plus c'est grand mieux c'est) ou "bas" (golf)
    async score(valeur, o = {}) {
      const id = (typeof jeuActuel !== "undefined" && jeuActuel?.id) || partie?.id;
      if (!id || !connecte() || !Number.isFinite(valeur)) return null;
      const ordre = ["haut", "bas"].includes(o.ordre) ? o.ordre : "haut";
      const { data, error } = await sb.rpc("envoyer_score", { p_jeu: id, p_score: valeur, p_ordre: ordre, p_libelle: String(o.libelle || "").slice(0, 20) });
      if (error) { console.warn(error); erreurScore(error); return null; }
      return data;
    },
    // Victoire : +1 au compteur du joueur (une seule fois par partie)
    async victoire() {
      const id = (typeof jeuActuel !== "undefined" && jeuActuel?.id) || partie?.id;
      if (!id || !connecte()) return null;
      const k = "v-" + id, now = Date.now();
      if (this[k] && now - this[k] < 20000) return null;
      this[k] = now;
      const { data, error } = await sb.rpc("envoyer_score", { p_jeu: id, p_score: 1, p_ordre: "cumul", p_libelle: "victoires" });
      if (error) { console.warn(error); erreurScore(error); return null; }
      return data;
    },
    async classement(id) {
      if (!sb) return [];
      const { data, error } = await sb.from("scores").select("score, ordre, libelle, joueur, profils(pseudo, avatar)").eq("jeu", id).limit(100);
      if (error) { console.warn("Classement illisible", error); this.erreurClassement = error.message; return []; }
      this.erreurClassement = "";
      const ordre = data[0]?.ordre || "haut";
      return data.sort((a, b) => (ordre === "bas" ? a.score - b.score : b.score - a.score)).slice(0, 10);
    },
    async afficherClassement(id) {
      const zone = document.getElementById("classementJeu"); if (!zone || !actifs()) return;
      if (!sb) { try { await window.demarrerComptes(); } catch {} }
      const lignes = await this.classement(id);
      if (!document.body.contains(zone)) return;
      const moi = session?.user?.id, unite = uniteScore(lignes[0]);
      const medailles = ["🥇", "🥈", "🥉"];
      zone.innerHTML = `<div class="conteneur"><div class="classement">
        <div class="classement-tete"><div><p class="etiquette">${t("classement_etiquette")}</p><h2>${t("classement_titre")}</h2></div>${lignes.length ? `<span class="meta">${esc(unite)}</span>` : ""}</div>
        ${this.erreurClassement ? `<p class="alerte erreur">Classement indisponible : ${esc(this.erreurClassement)}</p>` : ""}
        ${lignes.length ? `<ol class="classement-liste">${lignes.map((l, i) => `<li class="${l.joueur === moi ? "moi" : ""}">
            <span class="rang">${medailles[i] || i + 1}</span>
            <img src="${esc(imageSure(l.profils?.avatar) || AVATARS[i % 12])}" alt="">
            <b><a class="lien-joueur" href="#/joueur/${esc(l.joueur)}">${esc(l.profils?.pseudo || "Joueur")}</a>${l.joueur === moi ? ` <small>· ${t("classement_toi")}</small>` : ""}</b>
            <span class="points">${esc(texteScore(l))}</span></li>`).join("")}</ol>` : `<p class="classement-vide">${t("classement_vide")}</p>`}
        ${session ? "" : `<a class="classement-connexion" href="#/compte">${t("classement_connexion")} ${I.droite}</a>`}
      </div></div>`;
    },
  };
  // =========================================================
  // Navigation : invitations, page Classements, profils publics
  // =========================================================
  const P = window.BS_PLATEFORME;
  const pret = async () => { if (!sb && actifs()) { try { await window.demarrerComptes(); } catch {} } return !!sb; };
  const nombre = (n) => Number(n).toLocaleString("fr-FR");
  const medaille = (i) => ["🥇", "🥈", "🥉"][i] || String(i + 1);
  const trier = (l) => l.sort((a, b) => ((a.ordre || "haut") === "bas" ? a.score - b.score : b.score - a.score));
  const uniteDe = uniteScore;
  const avatarSur = (p, i = 0) => imageSure(p?.avatar) || AVATARS[i % 12];
  const imgJeu = (j) => (j.image ? `<img src="${esc(lien(j.image))}" alt="" loading="lazy">` : `<span class="sans-image">${esc(initiales(j.titre))}</span>`);
  // Tous les scores, regroupés par jeu (le site est petit : une seule requête suffit)
  async function tousLesScores() {
    const { data, error } = await sb.from("scores").select("score, ordre, libelle, joueur, jeu, maj, profils(pseudo, avatar)").limit(2000);
    if (error) throw error;
    const parJeu = new Map();
    data.forEach((l) => { if (!parJeu.has(l.jeu)) parJeu.set(l.jeu, []); parJeu.get(l.jeu).push(l); });
    parJeu.forEach(trier);
    return parJeu;
  }
  // Semaine du lundi 0 h au dimanche 23 h 59 (heure de l'appareil)
  function semaine() {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const fin = new Date(d); fin.setDate(fin.getDate() + 7);
    const numero = Math.floor((d.getTime() - new Date(2024, 0, 1).getTime()) / (7 * 864e5) + .5);
    return { debut: d, fin, numero };
  }
  const reste = (fin) => {
    const ms = fin - Date.now(), j = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
    return j > 0 ? `${j} j ${h} h` : `${h} h ${Math.floor((ms % 36e5) / 6e4)} min`;
  };
  const ligneClassement = (l, i, moi) => `<li class="${l.joueur === moi ? "moi" : ""}">
    <span class="rang">${medaille(i)}</span><img src="${esc(avatarSur(l.profils, i))}" alt="">
    <b><a class="lien-joueur" href="#/joueur/${esc(l.joueur)}">${esc(l.profils?.pseudo || "Joueur")}</a>${l.joueur === moi ? ` <small>· ${t("classement_toi")}</small>` : ""}</b>
    <span class="points">${esc(texteScore(l))}</span></li>`;

  // Bandeau « Untel t'invite à jouer »
  P.afficherInvitation = async (de, j) => {
    if (!j || !(await pret())) return;
    try {
      const { data } = await sb.from("profils").select("pseudo, avatar").eq("id", de).maybeSingle();
      if (!data || !document.getElementById("bandeauInvitation")) return;
      $("invitationTexte").textContent = T("invite_bandeau", { pseudo: data.pseudo, jeu: j.titre });
      $("invitationAvatar").innerHTML = `<img src="${esc(avatarSur(data))}" alt="">`;
    } catch (e) { console.warn(e); }
  };

  // Page « Classements » : défi de la semaine + podium de chaque jeu
  P.afficherClassements = async () => {
    const zone = $("zoneClassements"); if (!zone) return;
    if (!(await pret())) return;
    let parJeu;
    try { parJeu = await tousLesScores(); } catch (e) { console.warn(e); zone.innerHTML = `<section class="section serree"><div class="conteneur"><p class="alerte erreur">${esc(T("classement_vide"))}</p></div></section>`; return; }
    if (!document.body.contains(zone)) return;
    const moi = session?.user?.id, jeux = [...(donnees.jeux || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const s = semaine(), defi = jeux.length ? jeux[s.numero % jeux.length] : null;
    let htmlDefi = "";
    if (defi) {
      const lignes = (parJeu.get(defi.id) || []).filter((l) => new Date(l.maj) >= s.debut).slice(0, 5);
      htmlDefi = `<section class="section serree"><div class="conteneur">
        <div class="defi" style="--c:${couleurJeu(defi)}" data-couleur="${esc(defi.id)}">
          <a class="defi-image" href="#/jeu/${esc(defi.id)}" aria-label="${esc(defi.titre)}">${imgJeu(defi)}</a>
          <div class="defi-corps">
            <p class="etiquette">${I.trophee}${t("defi_etiquette")} <span class="defi-reste">${t("defi_fin")} ${reste(s.fin)}</span></p>
            <h2>${esc(defi.titre)}</h2>
            <p>${t("defi_texte")}</p>
            ${lignes.length ? `<ol class="classement-liste">${lignes.map((l, i) => ligneClassement(l, i, moi)).join("")}</ol>` : `<p class="classement-vide">${t("defi_vide")}</p>`}
            <div class="boutons"><button class="btn plein grand" type="button" data-jouer="${esc(defi.id)}">${I.jouer}${t("defi_jouer")}</button>
            ${session ? "" : `<a class="btn grand" href="#/compte">${t("compte_connexion")}</a>`}</div>
          </div>
        </div></div></section>`;
    }
    const cartes = jeux.map((j) => {
      const l = parJeu.get(j.id) || [];
      return `<article class="carte-podium" style="--c:${couleurJeu(j)}" data-couleur="${esc(j.id)}">
        <a class="podium-tete" href="#/jeu/${esc(j.id)}"><span class="podium-image">${imgJeu(j)}</span><span><b>${esc(j.titre)}</b><small>${l.length ? esc(uniteDe(l[0])) : ""}</small></span></a>
        ${l.length ? `<ol class="classement-liste compacte">${l.slice(0, 3).map((x, i) => ligneClassement(x, i, moi)).join("")}</ol>` : `<p class="classement-vide">${t("classement_vide")}</p>`}
        <a class="lien-fleche" href="#/jeu/${esc(j.id)}">${t("classements_tout")} ${I.droite}</a>
      </article>`;
    }).join("");
    zone.innerHTML = htmlDefi + `<section class="section serree"><div class="conteneur">
      ${enteteSection(t("classement_etiquette"), t("classements_jeux_titre"))}
      <div class="grille-podiums">${cartes}</div>
      ${session ? "" : `<a class="classement-connexion" href="#/compte">${t("classement_connexion")} ${I.droite}</a>`}
    </div></section>`;
    (donnees.jeux || []).forEach(calculerCouleur);
  };

  // Profil public d'un joueur : avatar, pseudo, meilleurs scores et rang dans chaque jeu
  P.afficherJoueur = async (id) => {
    const zone = $("zoneJoueur"); if (!zone) return;
    const vide = (texte) => { zone.innerHTML = `<section class="entete-page centre"><div class="conteneur">${dessin("perdu", "dessin-404")}<p class="etiquette">${t("joueur_etiquette")}</p><h1>${texte}</h1><div class="boutons centre"><a class="btn plein" href="#/classements">${t("nav_classements")}</a></div></div></section>`; };
    if (!(await pret())) return vide(t("classements_off"));
    let p, parJeu;
    try {
      ({ data: p } = await sb.from("profils").select("pseudo, avatar").eq("id", id).maybeSingle());
      parJeu = await tousLesScores();
    } catch (e) { console.warn(e); return vide(t("joueur_introuvable")); }
    if (!document.body.contains(zone)) return;
    if (!p) return vide(t("joueur_introuvable"));
    const lignes = [];
    parJeu.forEach((l, jeu) => { const i = l.findIndex((x) => x.joueur === id); const j = trouverJeu(jeu); if (i >= 0 && j) lignes.push({ j, l: l[i], rang: i, total: l.length }); });
    lignes.sort((a, b) => a.rang - b.rang || a.j.titre.localeCompare(b.j.titre, "fr"));
    const podiums = lignes.filter((x) => x.rang < 3).length, victoires = lignes.filter((x) => x.l.ordre === "cumul").reduce((n, x) => n + Number(x.l.score), 0);
    const moi = session?.user?.id === id;
    document.title = p.pseudo + " · " + (donnees.site?.nom || "");
    zone.innerHTML = `
  <section class="entete-page">
    <div class="conteneur profil-public">
      <span class="profil-public-avatar"><img src="${esc(avatarSur(p))}" alt=""></span>
      <div>
        <p class="etiquette">${t("joueur_etiquette")}</p>
        <h1>${esc(p.pseudo)}</h1>
        <div class="chiffres">
          <div><b>${lignes.length}</b><small>${t("joueur_stat_jeux")}</small></div>
          <div><b>${podiums}</b><small>${t("joueur_stat_podiums")}</small></div>
          <div><b>${nombre(victoires)}</b><small>${t("joueur_stat_victoires")}</small></div>
        </div>
        ${moi ? `<div class="boutons"><a class="btn" href="#/compte">${t("compte_etiquette")}</a></div>` : ""}
      </div>
    </div>
  </section>
  <section class="section serree"><div class="conteneur">
    <div id="badgesJoueur"></div>
    <p class="sous-titre">${t("joueur_jeux")}</p>
    ${lignes.length ? `<div class="liste-records">${lignes.map(({ j, l, rang, total }) => `
      <a class="record" href="#/jeu/${esc(j.id)}" style="--c:${couleurJeu(j)}" data-couleur="${esc(j.id)}">
        <span class="record-image">${imgJeu(j)}</span>
        <span class="record-texte"><b>${esc(j.titre)}</b><small>${esc(uniteDe(l))} : ${esc(texteScore(l))}</small></span>
        <span class="record-rang">${medaille(rang)}<small>${rang + 1}/${total}</small></span>
      </a>`).join("")}</div>` : `<p class="classement-vide">${t("joueur_vide")}</p>`}
  </div></section>`;
    (donnees.jeux || []).forEach(calculerCouleur);
    P.badgesHTML(id, parJeu).then((h) => { if ($("badgesJoueur")) $("badgesJoueur").innerHTML = h; });
  };

  // =========================================================
  // Partie 3 : communauté (badges, réactions, livre d'or, notifications)
  // =========================================================
  const ordinal = (n) => (n === 1 ? "1er" : n + "e");
  const ilYa = (d) => {
    const s = (Date.now() - new Date(d).getTime()) / 1000;
    if (s < 60) return "à l'instant";
    if (s < 3600) return "il y a " + Math.floor(s / 60) + " min";
    if (s < 86400) return "il y a " + Math.floor(s / 3600) + " h";
    if (s < 7 * 86400) return "il y a " + Math.floor(s / 86400) + " j";
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };
  const jeuDuDefi = () => {
    const jeux = [...(donnees.jeux || [])].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    return jeux.length ? jeux[semaine().numero % jeux.length] : null;
  };
  const estModerateur = () => !!session && !!donnees.contact?.email && session.user.email?.toLowerCase() === String(donnees.contact.email).trim().toLowerCase();

  // ---------- Badges (calculés à partir des classements, rien à installer) ----------
  const G = { // petits dessins au centre des badges
    etoile: '<path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z"/>',
    grille: '<rect x="5" y="5" width="6" height="6" rx="1.5"/><rect x="13" y="5" width="6" height="6" rx="1.5"/><rect x="5" y="13" width="6" height="6" rx="1.5"/><rect x="13" y="13" width="6" height="6" rx="1.5"/>',
    pile: '<rect x="4" y="8" width="10" height="12" rx="2"/><path d="M8 5h9a2 2 0 0 1 2 2v10"/>',
    podium: '<path d="M4 19v-5h5v5M9 19V9h6v10M15 19v-7h5v7M3 19h18"/>',
    couronne: '<path d="M4 17 3 7l5 4 4-6 4 6 5-4-1 10z"/><path d="M5 20h14"/>',
    diamant: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M12 20 9 9l3-5 3 5z"/>',
    coupe: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
    flamme: '<path d="M12 21c-4 0-6-2.7-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 1.5-2 1.5-3 2 2 2.5 4.5 2.5 7 0 3.3-2 6-6 6z"/>',
    cible: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2"/>',
    plume: '<path d="M20 4c-8 0-13 5-14 13l-2 3M20 4c0 7-5 12-12 12M9 13l4-4"/>',
  };
  const BADGES = [
    ["premier", "Premier score", "Marque des points dans un jeu", "etoile", (c) => c.jeux >= 1],
    ["touche", "Touche-à-tout", "Sois classé dans 3 jeux différents", "grille", (c) => c.jeux >= 3],
    ["collection", "Collectionneur", "Sois classé dans tous les jeux du site", "pile", (c) => c.total > 0 && c.jeux >= c.total],
    ["podium", "Sur le podium", "Finis dans le top 3 d'un classement", "podium", (c) => c.podiums >= 1],
    ["champion", "Champion", "Sois 1er d'un classement", "couronne", (c) => c.premiers >= 1],
    ["legende", "Légende", "Sois 1er dans 3 classements", "diamant", (c) => c.premiers >= 3],
    ["victoire", "Première victoire", "Gagne une partie", "coupe", (c) => c.victoires >= 1],
    ["serie", "Inarrêtable", "Cumule 10 victoires", "flamme", (c) => c.victoires >= 10],
    ["defi", "Défi relevé", "Bats ton record sur le jeu du défi de la semaine", "cible", (c) => c.defi],
    ["plume", "Belle plume", "Écris dans un livre d'or", "plume", (c) => c.messages >= 1],
  ];
  function statsDe(id, parJeu, messages = 0) {
    const c = { jeux: 0, podiums: 0, premiers: 0, victoires: 0, defi: false, messages, total: (donnees.jeux || []).length };
    const defi = jeuDuDefi(), debut = semaine().debut;
    parJeu.forEach((l, jeu) => {
      if (!trouverJeu(jeu)) return;
      const i = l.findIndex((x) => x.joueur === id); if (i < 0) return;
      c.jeux++; if (i < 3) c.podiums++; if (i === 0) c.premiers++;
      if (l[i].ordre === "cumul") c.victoires += Number(l[i].score) || 0;
      if (defi && jeu === defi.id && new Date(l[i].maj) >= debut) c.defi = true;
    });
    return c;
  }
  const badgesDe = (c) => BADGES.map(([cle, nom, aide, dessin, test]) => ({ cle, nom, aide, dessin, obtenu: !!test(c) }));
  const htmlBadge = (b) => `<div class="badge-jeu ${b.obtenu ? "obtenu" : ""}" title="${esc(b.aide)}">
    <span class="badge-medaille"><svg viewBox="0 0 24 24" aria-hidden="true">${G[b.dessin]}</svg></span>
    <b>${esc(b.nom)}</b><small>${b.obtenu ? esc(b.aide) : esc(T("badges_aide")) + " · " + esc(b.aide)}</small></div>`;
  async function nbMessages(id) {
    try { const { count, error } = await sb.from("messages").select("id", { count: "exact", head: true }).eq("joueur", id); return error ? 0 : count || 0; } catch { return 0; }
  }
  P.badgesHTML = async (id, parJeu) => {
    const liste = badgesDe(statsDe(id, parJeu, await nbMessages(id)));
    return `<p class="sous-titre">${t("badges_titre")} <span class="meta">${liste.filter((b) => b.obtenu).length} / ${liste.length}</span></p><div class="grille-badges">${liste.map(htmlBadge).join("")}</div>`;
  };

  // ---------- Notifications (gardées sur l'appareil, par joueur) ----------
  const cleNotifs = () => "bs-notifs-" + (session?.user?.id || "");
  const lireNotifs = () => (session ? lireLS(cleNotifs(), []) : []);
  const ecrireNotifs = (l) => { try { localStorage.setItem(cleNotifs(), JSON.stringify(l.slice(0, 30))); } catch {} };
  function ajouterNotif(n) { if (!session) return; ecrireNotifs([{ ...n, date: Date.now(), lu: false }, ...lireNotifs()]); majCloche(); }
  const ICONES_NOTIF = { depasse: "⚡", record: "🎉", badge: "🏅" };
  function majCloche() {
    const z = $("zoneNotifs"); if (!z) return;
    z.hidden = !(actifs() && session);
    const nb = lireNotifs().filter((n) => !n.lu).length;
    $("notifsNb").hidden = !nb; $("notifsNb").textContent = nb > 9 ? "9+" : nb;
    $("btnNotifs").setAttribute("aria-label", T("notifs_titre") + (nb ? ` (${nb})` : ""));
  }
  function ouvrirNotifs(ouvrir) {
    const p = $("panneauNotifs"); if (!p) return;
    p.hidden = !ouvrir; $("btnNotifs").setAttribute("aria-expanded", String(ouvrir));
    if (!ouvrir) return;
    const l = lireNotifs();
    p.innerHTML = `<p class="panneau-titre">${t("notifs_titre")}</p>` + (l.length ? `<ul>${l.map((n) => `<li class="${n.lu ? "" : "nouvelle"}"><a href="${esc(n.lien || "#/classements")}" data-fermer-notifs>
      <span class="notif-icone" aria-hidden="true">${ICONES_NOTIF[n.type] || "•"}</span><span><span class="notif-texte">${esc(n.texte)}</span><small>${ilYa(n.date)}</small></span></a></li>`).join("")}</ul>` : `<p class="panneau-vide">${t("notifs_vide")}</p>`);
    ecrireNotifs(l.map((n) => ({ ...n, lu: true }))); majCloche();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("#btnNotifs")) { ouvrirNotifs($("panneauNotifs").hidden); return; }
    if (e.target.closest("[data-fermer-notifs]") || !e.target.closest("#panneauNotifs")) ouvrirNotifs(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("panneauNotifs")?.hidden) ouvrirNotifs(false); });
  addEventListener("hashchange", () => ouvrirNotifs(false));

  // Compare la situation actuelle à la dernière visite : dépassements et nouveaux badges
  let verification = null;
  async function verifierNouveautes() {
    if (!connecte() || verification) return;
    verification = (async () => {
      const moi = session.user.id, parJeu = await tousLesScores();
      const rangs = {};
      parJeu.forEach((l, jeu) => { const i = l.findIndex((x) => x.joueur === moi); if (i >= 0 && trouverJeu(jeu)) rangs[jeu] = { rang: i + 1, devant: l.slice(0, i).map((x) => x.joueur) }; });
      const cleR = "bs-rangs-" + moi, avant = lireLS(cleR, null);
      if (avant) Object.entries(rangs).forEach(([jeu, r]) => {
        const a = avant[jeu]; if (!a || r.rang <= a.rang) return;
        const nouveau = r.devant.find((x) => !a.devant.includes(x)); if (!nouveau) return;
        const pseudo = parJeu.get(jeu).find((x) => x.joueur === nouveau)?.profils?.pseudo || "Quelqu'un";
        ajouterNotif({ type: "depasse", texte: T("notif_depasse", { pseudo, jeu: trouverJeu(jeu).titre, rang: ordinal(r.rang) }), lien: "#/jeu/" + jeu });
      });
      try { localStorage.setItem(cleR, JSON.stringify(rangs)); } catch {}
      const obtenus = badgesDe(statsDe(moi, parJeu, await nbMessages(moi))).filter((b) => b.obtenu);
      const cleB = "bs-badges-" + moi, avantB = lireLS(cleB, null);
      if (avantB) obtenus.filter((b) => !avantB.includes(b.cle)).forEach((b) => ajouterNotif({ type: "badge", texte: T("notif_badge", { badge: b.nom }), lien: "#/joueur/" + moi }));
      try { localStorage.setItem(cleB, JSON.stringify(obtenus.map((b) => b.cle))); } catch {}
    })().catch((e) => console.warn(e)).finally(() => { verification = null; });
    return verification;
  }
  P.verifierNouveautes = verifierNouveautes;
  P.majCloche = majCloche;

  // Nouveau record : message pendant la partie + notification
  const scoreOriginal = P.score;
  P.score = async function (valeur, o = {}) {
    const id = (typeof jeuActuel !== "undefined" && jeuActuel?.id) || partie?.id;
    let avant = null;
    if (id && connecte()) { try { avant = (await sb.from("scores").select("score").eq("joueur", session.user.id).eq("jeu", id).maybeSingle()).data?.score ?? null; } catch {} }
    const res = await scoreOriginal.call(this, valeur, o);
    if (res !== null && res !== undefined && Number(res) === Number(valeur) && (avant === null || Number(avant) !== Number(valeur))) {
      const j = trouverJeu(id), texte = T("notif_record", { jeu: j?.titre || "", score: FORMATS[o.libelle] ? texteScore({ score: valeur, libelle: o.libelle }) : nombre(valeur) + (o.libelle ? " " + o.libelle : "") });
      notifier(texte, 4000); ajouterNotif({ type: "record", texte, lien: "#/jeu/" + id });
    }
    return res;
  };

  // ---------- Réactions et livre d'or (page d'un jeu) ----------
  const REACTIONS = [["aime", "❤️", "J'adore"], ["rire", "😂", "Trop drôle"], ["feu", "🔥", "Addictif"], ["wow", "😮", "Bluffant"], ["bravo", "👏", "Bravo"]];
  let avis = { jeu: null, reactions: [], messages: [], indispo: false, envoi: false, erreur: "" };
  function dessinerAvis() {
    const zone = $("avisJeu"); if (!zone || zone.dataset.jeu !== avis.jeu) return;
    const moi = session?.user?.id, modo = estModerateur();
    const compte = (e) => avis.reactions.filter((r) => r.emoji === e).length, mien = (e) => avis.reactions.some((r) => r.emoji === e && r.joueur === moi);
    zone.innerHTML = `<div class="conteneur"><div class="avis">
      <div class="classement-tete"><div><p class="etiquette">${t("avis_etiquette")}</p><h2>${t("avis_titre")}</h2></div></div>
      ${avis.indispo ? `<p class="classement-vide">${t("livre_indispo")}</p>` : `
      <p class="sous-titre">${t("avis_reagir")}</p>
      <div class="reactions" role="group" aria-label="${t("avis_reagir")}">${REACTIONS.map(([k, e, nom]) => `<button class="reaction" type="button" data-reaction="${k}" aria-pressed="${mien(k)}" title="${nom}"><span class="reaction-emoji" aria-hidden="true">${e}</span><b>${compte(k)}</b><small>${nom}</small></button>`).join("")}</div>
      <p class="sous-titre">${t("livre_titre")} <span class="meta">${avis.messages.length || ""}</span></p>
      ${session ? `<form class="livre-form" data-livre>
        <img src="${esc(avatarDe(profil))}" alt="">
        <div><textarea id="livreTexte" maxlength="280" rows="2" placeholder="${t("livre_placeholder")}" required></textarea>
        <div class="livre-bas"><small>${t("livre_regle")}</small><button class="btn plein petit" type="submit" ${avis.envoi ? "disabled" : ""}>${t("livre_envoyer")}</button></div>
        ${avis.erreur ? `<p class="alerte erreur">${esc(avis.erreur)}</p>` : ""}</div>
      </form>` : `<a class="classement-connexion" href="#/compte">${t("avis_connexion")} ${I.droite}</a>`}
      ${avis.messages.length ? `<ul class="livre">${avis.messages.map((m) => `<li>
        <img src="${esc(avatarSur(m.profils))}" alt="">
        <div><p class="livre-auteur"><a class="lien-joueur" href="#/joueur/${esc(m.joueur)}">${esc(m.profils?.pseudo || "Joueur")}</a><small>${ilYa(m.cree)}</small>
          ${m.joueur === moi || modo ? `<button class="lien-discret" type="button" data-supprimer-message="${esc(m.id)}">${t("livre_supprimer")}</button>` : ""}</p>
        <p class="livre-texte">${esc(m.texte)}</p></div></li>`).join("")}</ul>` : `<p class="classement-vide">${t("livre_vide")}</p>`}`}
    </div></div>`;
  }
  P.afficherAvis = async (id) => {
    if (!$("avisJeu") || !(await pret())) return;
    avis = { jeu: id, reactions: [], messages: [], indispo: false, envoi: false, erreur: "" };
    try {
      const [r, m] = await Promise.all([
        sb.from("reactions").select("joueur, emoji").eq("jeu", id).limit(2000),
        sb.from("messages").select("id, joueur, texte, cree, profils(pseudo, avatar)").eq("jeu", id).order("cree", { ascending: false }).limit(40),
      ]);
      if (r.error || m.error) throw r.error || m.error;
      avis.reactions = r.data; avis.messages = m.data;
    } catch (e) { console.warn("Livre d'or pas encore installé dans Supabase ?", e); avis.indispo = true; }
    dessinerAvis();
  };
  document.addEventListener("click", async (e) => {
    const r = e.target.closest("[data-reaction]");
    if (r && avis.jeu) {
      if (!session) { location.hash = "#/compte"; return; }
      const k = r.dataset.reaction, moi = session.user.id, deja = avis.reactions.some((x) => x.emoji === k && x.joueur === moi);
      avis.reactions = deja ? avis.reactions.filter((x) => !(x.emoji === k && x.joueur === moi)) : [...avis.reactions, { joueur: moi, emoji: k }];
      dessinerAvis();
      const q = deja ? sb.from("reactions").delete().eq("joueur", moi).eq("jeu", avis.jeu).eq("emoji", k) : sb.from("reactions").insert({ joueur: moi, jeu: avis.jeu, emoji: k });
      const { error } = await q; if (error) { console.warn(error); P.afficherAvis(avis.jeu); }
      return;
    }
    const sup = e.target.closest("[data-supprimer-message]");
    if (sup && avis.jeu) {
      const { error } = await sb.from("messages").delete().eq("id", sup.dataset.supprimerMessage);
      if (!error) { avis.messages = avis.messages.filter((m) => String(m.id) !== sup.dataset.supprimerMessage); dessinerAvis(); }
    }
  });
  document.addEventListener("submit", async (e) => {
    const f = e.target.closest("[data-livre]"); if (!f || !session) return;
    e.preventDefault();
    const texte = $("livreTexte").value.trim().slice(0, 280); if (!texte) return;
    avis.envoi = true; avis.erreur = ""; dessinerAvis();
    const { data, error } = await sb.from("messages").insert({ joueur: session.user.id, jeu: avis.jeu, texte }).select("id, joueur, texte, cree").single();
    avis.envoi = false;
    if (error) { avis.erreur = /row-level|policy|42501/i.test(error.message + error.code) ? T("livre_trop") : T("livre_indispo"); dessinerAvis(); $("livreTexte").value = texte; return; }
    avis.messages = [{ ...data, profils: { pseudo: profil.pseudo, avatar: avatarDe(profil) } }, ...avis.messages];
    dessinerAvis(); setTimeout(verifierNouveautes, 500);
  });

  // Si la page est fermée pendant une partie, on tente un dernier envoi
  addEventListener("pagehide", () => { if (partie) envoyerSauvegarde(false); });
  // À la déconnexion, la progression des jeux est retirée de l'appareil (elle reste sur le compte)
  const deconnexionOriginale = () => { const r = lireLS(REGISTRE, {}); Object.values(r).flat().forEach((k) => { try { localStorage.removeItem(k); } catch {} }); };
  document.addEventListener("click", (e) => { if (e.target.closest("[data-deconnexion]")) deconnexionOriginale(); }, true);
})();
