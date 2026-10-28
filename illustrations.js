// =========================================================
// BS arcade center : logo et illustrations dessinés en SVG.
// Ils prennent automatiquement les tons du site (classes il-1 à il-5,
// voir style.css) : changer la couleur dans l'admin les recolore.
// =========================================================
(() => {
  const svg = (vb, contenu, cls = "") => `<svg class="illu ${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">${contenu}</svg>`;

  // Logo : carré arrondi, rond et triangle « lecture » qui se chevauchent
  window.LOGO_BS = () => svg("0 0 48 48", `
    <rect class="il-4" width="48" height="48" rx="14"/>
    <circle class="il-3" cx="19" cy="24" r="11"/>
    <path class="il-f" d="M24 14.5c0-1.6 1.7-2.6 3.1-1.8l13.2 7.6c1.4.8 1.4 2.8 0 3.6l-13.2 7.6c-1.4.8-3.1-.2-3.1-1.8z"/>
    <circle class="il-2" cx="12" cy="36" r="3"/>`, "logo-bs");

  // Version « couleurs fixes » du logo pour l'onglet du navigateur (favicon)
  window.FAVICON_BS = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="14" fill="${t.principal}"/><circle cx="19" cy="24" r="11" fill="${t.moyen}"/><path fill="${t.fond}" d="M24 14.5c0-1.6 1.7-2.6 3.1-1.8l13.2 7.6c1.4.8 1.4 2.8 0 3.6l-13.2 7.6c-1.4.8-3.1-.2-3.1-1.8z"/><circle cx="12" cy="36" r="3" fill="${t.clair}"/></svg>`;

  window.ILLUS = {
    // Étagère de jeux (page Jeux)
    ludotheque: svg("0 0 400 300", `
      <circle class="il-2" cx="300" cy="80" r="56"/>
      <rect class="il-1" x="20" y="226" width="360" height="54" rx="14"/>
      <rect class="il-3" x="56" y="96" width="62" height="130" rx="10"/>
      <rect class="il-f" x="66" y="112" width="42" height="8" rx="4"/>
      <rect class="il-4" x="124" y="70" width="70" height="156" rx="10"/>
      <circle class="il-2" cx="159" cy="132" r="18"/>
      <rect class="il-f" x="138" y="190" width="42" height="8" rx="4"/>
      <rect class="il-2" x="200" y="118" width="54" height="108" rx="10" transform="rotate(10 227 172)"/>
      <rect class="il-5" x="262" y="150" width="70" height="76" rx="12"/>
      <path class="il-3" d="M297 150c-18-20-12-50 6-62 4 22 18 34 12 62z"/>
      <path class="il-4" d="M287 150c-22-6-34-26-28-44 16 10 30 16 34 44z"/>
      <circle class="il-c" cx="297" cy="188" r="10"/>
      <path class="il-4" d="M294 183v10l8-5z"/>`),

    // Bureau de créateur (À propos)
    atelier: svg("0 0 400 300", `
      <rect class="il-1" x="30" y="40" width="200" height="200" rx="100"/>
      <rect class="il-2" x="20" y="236" width="360" height="16" rx="8"/>
      <rect class="il-5" x="96" y="96" width="196" height="128" rx="14"/>
      <rect class="il-3" x="108" y="108" width="172" height="104" rx="8"/>
      <circle class="il-f" cx="194" cy="160" r="26"/>
      <path class="il-4" d="M186 147v26l22-13z"/>
      <rect class="il-4" x="176" y="224" width="36" height="12" rx="4"/>
      <path class="il-4" d="M318 236v-92l34-40" stroke-width="8" style="fill:none;stroke:var(--principal);stroke-linecap:round"/>
      <path class="il-3" d="M330 84l38 22-18 26-36-20z"/>
      <rect class="il-c" x="40" y="196" width="60" height="40" rx="6" transform="rotate(-8 70 216)"/>
      <rect class="il-2" x="52" y="208" width="34" height="5" rx="2.5" transform="rotate(-8 70 216)"/>
      <rect class="il-4" x="300" y="206" width="26" height="30" rx="6"/>
      <rect class="il-3" x="306" y="186" width="4" height="24" rx="2" transform="rotate(-10 308 198)"/>
      <rect class="il-5" x="314" y="184" width="4" height="26" rx="2" transform="rotate(8 316 197)"/>`),

    // Enveloppe et avion en papier (Contact)
    lettre: svg("0 0 400 300", `
      <circle class="il-1" cx="200" cy="160" r="120"/>
      <path class="il-3" d="M300 70c-40 0-70 20-90 50" style="fill:none;stroke:var(--moyen);stroke-width:4;stroke-dasharray:2 12;stroke-linecap:round"/>
      <path class="il-4" d="M300 52l64-22-26 66-14-26z"/>
      <path class="il-3" d="M324 70l14 26 -6-30z"/>
      <rect class="il-4" x="96" y="138" width="208" height="128" rx="14"/>
      <rect class="il-c" x="116" y="96" width="168" height="120" rx="10"/>
      <rect class="il-2" x="136" y="120" width="96" height="10" rx="5"/>
      <rect class="il-2" x="136" y="142" width="128" height="8" rx="4"/>
      <rect class="il-2" x="136" y="160" width="110" height="8" rx="4"/>
      <path class="il-3" d="M96 152l104 70 104-70v100a14 14 0 0 1-14 14H110a14 14 0 0 1-14-14z"/>
      <path class="il-5" d="M96 252l80-56 24 16 24-16 80 56a14 14 0 0 1-14 14H110a14 14 0 0 1-14-14z" opacity=".35"/>
      <rect class="il-c" x="26" y="58" width="78" height="46" rx="16"/>
      <path class="il-c" d="M44 100l-6 18 22-14z"/>
      <circle class="il-3" cx="50" cy="81" r="5"/><circle class="il-3" cx="65" cy="81" r="5"/><circle class="il-3" cx="80" cy="81" r="5"/>`),

    // Étape 1 : choisir une carte
    choisir: svg("0 0 240 160", `
      <rect class="il-2" x="20" y="20" width="58" height="56" rx="10"/>
      <rect class="il-4" x="90" y="20" width="58" height="56" rx="10"/>
      <rect class="il-2" x="160" y="20" width="58" height="56" rx="10"/>
      <rect class="il-2" x="20" y="88" width="58" height="56" rx="10"/>
      <rect class="il-3" x="90" y="88" width="58" height="56" rx="10"/>
      <rect class="il-2" x="160" y="88" width="58" height="56" rx="10"/>
      <circle class="il-f" cx="119" cy="48" r="12"/>
      <path class="il-5" d="M128 60l34 14-14 6 12 18-8 5-12-18-10 10z"/>`),

    // Étape 2 : jouer
    jouer: svg("0 0 240 160", `
      <rect class="il-5" x="30" y="16" width="180" height="116" rx="14"/>
      <rect class="il-3" x="40" y="26" width="160" height="96" rx="8"/>
      <circle class="il-f" cx="120" cy="74" r="28"/>
      <path class="il-4" d="M111 60v28l24-14z"/>
      <rect class="il-2" x="96" y="132" width="48" height="10" rx="4"/>
      <path class="il-4" d="M206 14l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>
      <path class="il-3" d="M26 118l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>`),

    // Étape 3 : partager le lien
    partager: svg("0 0 240 160", `
      <rect class="il-5" x="40" y="14" width="76" height="134" rx="14"/>
      <rect class="il-2" x="48" y="28" width="60" height="104" rx="6"/>
      <rect class="il-c" x="54" y="70" width="48" height="20" rx="10"/>
      <rect class="il-4" x="60" y="77" width="20" height="6" rx="3"/>
      <path class="il-3" d="M126 92c22-6 40-24 54-48" style="fill:none;stroke:var(--moyen);stroke-width:3;stroke-dasharray:2 9;stroke-linecap:round"/>
      <path class="il-4" d="M176 30l46-16-18 48-10-20z"/>
      <path class="il-3" d="M194 42l10 20-4-24z"/>`),

    // Boîte mystère (prochains jeux)
    mystere: svg("0 0 240 150", `
      <circle class="il-2" cx="190" cy="34" r="20"/>
      <rect class="il-4" x="62" y="62" width="116" height="74" rx="10"/>
      <rect class="il-3" x="54" y="46" width="132" height="26" rx="8"/>
      <rect class="il-2" x="112" y="46" width="16" height="90"/>
      <path class="il-2" d="M120 46c-10-22-38-26-36-8 2 12 24 10 36 8zM120 46c10-22 38-26 36-8-2 12-24 10-36 8z"/>
      <circle class="il-f" cx="88" cy="100" r="17"/>
      <text x="88" y="112" text-anchor="middle" class="il-txt petit">?</text>
      <path class="il-3" d="M40 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>`),

    // Portrait (quand il n'y a pas encore de photo)
    portrait: svg("0 0 300 360", `
      <rect class="il-2" x="20" y="20" width="260" height="340" rx="130"/>
      <circle class="il-3" cx="150" cy="150" r="58"/>
      <path class="il-4" d="M50 360c10-90 50-130 100-130s90 40 100 130z"/>
      <circle class="il-1" cx="236" cy="70" r="18"/>
      <circle class="il-4" cx="64" cy="300" r="10"/>`),

    // Page introuvable : carte et chemin pointillé
    perdu: svg("0 0 400 300", `
      <path class="il-1" d="M40 70l100-30 120 30 100-30v190l-100 30-120-30-100 30z"/>
      <path class="il-2" d="M140 40v190M260 70v190"/>
      <path style="fill:none;stroke:var(--moyen);stroke-width:5;stroke-dasharray:4 14;stroke-linecap:round" d="M80 210c40-10 40-80 100-70s60 60 120 20"/>
      <circle class="il-4" cx="80" cy="210" r="10"/>
      <path class="il-4" d="M300 160c-16-18-22-28-22-38a22 22 0 0 1 44 0c0 10-6 20-22 38z"/>
      <circle class="il-f" cx="300" cy="122" r="8"/>
      <text x="200" y="120" text-anchor="middle" class="il-txt grand">?</text>`),

    // Liste vide
    vide: svg("0 0 240 150", `
      <rect class="il-1" x="40" y="40" width="160" height="96" rx="14"/>
      <rect class="il-2" x="60" y="20" width="120" height="26" rx="10"/>
      <circle class="il-3" cx="120" cy="88" r="20"/>
      <path class="il-f" d="M113 79v18l15-9z"/>`),
  };
})();
