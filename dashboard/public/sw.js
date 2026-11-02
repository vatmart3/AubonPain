/*
 * Service worker minimal : rend l'application installable et affiche une
 * page hors-ligne lisible. Aucune donnée de vente n'est mise en cache ici
 * (elles sont privées et doivent toujours être fraîches).
 */
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("abp-shell-v1").then((c) => c.add(OFFLINE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
