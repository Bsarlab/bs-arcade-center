// BS arcade center : petit service qui permet d'installer le site comme une appli.
// Il va toujours chercher la dernière version sur internet, et ne sert la copie
// gardée sur l'appareil que si la connexion est coupée. Rien à régler.
const CACHE = "bs-arcade-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./", "index.html"])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((l) => Promise.all(l.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  // Seulement les pages du site : pas les vidéos, pas l'admin, pas Supabase ni les autres sites
  if (r.method !== "GET" || u.origin !== location.origin || r.headers.has("range") || /\.(mp4|webm)$/i.test(u.pathname) || /admin\.html$/.test(u.pathname)) return;
  // site.json est demandé avec un numéro différent à chaque visite : on n'en garde qu'une copie
  const cle = /site\.json$/.test(u.pathname) ? u.origin + u.pathname : r;
  e.respondWith(
    fetch(r).then((rep) => {
      if (rep.ok && rep.type === "basic") { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(cle, copie)).catch(() => {}); }
      return rep;
    }).catch(() => caches.match(cle).then((c) => c || (r.mode === "navigate" ? caches.match("index.html") : undefined)))
  );
});
