const CACHE = "bang-shell-v2";
const SHELL = "/";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

async function refreshShell(cache) {
  const res = await fetch(SHELL, { cache: "no-cache" });
  if (!res.ok) return res;
  const html = await res.clone().text();
  const old = await cache.match(SHELL).then((r) => r && r.text());
  await cache.put(SHELL, res.clone());

  if (old !== undefined && old !== html) {
    for (const key of await cache.keys()) {
      if (new URL(key.url).pathname.startsWith("/_astro/")) await cache.delete(key);
    }
  }
  return res;
}

async function refreshAsset(request, cache) {
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin) return;

  const isShell = request.mode === "navigate" && url.pathname === "/";
  const isAsset = url.pathname.startsWith("/_astro/") || url.pathname === "/favicon.svg";
  if (!isShell && !isAsset) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(isShell ? SHELL : request);
      if (!cached) return isShell ? refreshShell(cache) : refreshAsset(request, cache);
      if (isShell) event.waitUntil(refreshShell(cache).catch(() => {}));
      return cached;
    }),
  );
});
