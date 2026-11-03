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
      sb.auth.onAuthStateChange(async (evt, s) => {
        session = s;
        if (evt === "PASSWORD_RECOVERY") { etat.mode = "nouveau-mdp"; }
        await lireProfil(); partagerProfil();
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
    const lp = $("lecteurProfil");
    if (lp) { lp.hidden = !(session && profil); if (profil) lp.innerHTML = `<img src="${esc(avatarDe(profil))}" alt=""><span>${esc(profil.pseudo)}</span>`; }
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
})();
