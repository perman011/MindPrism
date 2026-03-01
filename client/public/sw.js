const CACHE_NAME = "mindprism-v1";
const API_CACHE = "mindprism-api-v1";
const AUDIO_CACHE = "mindprism-audio-v1";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (url.pathname.startsWith("/api/books") || url.pathname.startsWith("/api/categories") || url.pathname.startsWith("/api/shorts")) {
    event.respondWith(staleWhileRevalidate(event.request, API_CACHE));
    return;
  }

  if (url.pathname.startsWith("/api/")) return;

  if (event.request.destination === "audio" || url.pathname.match(/\.(mp3|wav|ogg|m4a)$/)) {
    event.respondWith(cacheFirst(event.request, AUDIO_CACHE));
    return;
  }

  if (
    event.request.destination === "script" ||
    event.request.destination === "style" ||
    event.request.destination === "image" ||
    event.request.destination === "font" ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(event.request, CACHE_NAME));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/").then((r) => r || offlineFallback())
      )
    );
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);

  if (cached) {
    fetchPromise.catch(() => {});
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;
  return new Response(JSON.stringify({ error: "Offline" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function offlineFallback() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MindPrism - Offline</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #F5F0EB; color: #111827; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { text-align: center; padding: 2rem; max-width: 400px; }
    .logo { width: 80px; height: 80px; margin: 0 auto 1.5rem; border-radius: 50%; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center; }
    .logo img { width: 56px; height: 56px; object-fit: contain; }
    h1 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
    p { font-size: 0.875rem; color: rgba(17,24,39,0.6); line-height: 1.5; margin-bottom: 1.5rem; }
    .gold { color: #341539; }
    .btn { display: inline-block; padding: 0.75rem 2rem; background: #341539; color: #fff; font-weight: 600; border: none; border-radius: 9999px; font-size: 0.875rem; cursor: pointer; text-decoration: none; }
    .btn:hover { background: #2A0F2E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><img src="/icons/icon-192.png" alt="MindPrism"></div>
    <h1>You're currently <span class="gold">offline</span></h1>
    <p>Check your internet connection and try again. Your cached books and progress are safe.</p>
    <button class="btn" onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "MindPrism";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "mindprism-notification",
    data: { url: data.url || "/" },
    actions: data.actions || [],
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "mindprism-sync") {
    event.waitUntil(syncQueuedActions());
  }
});

async function syncQueuedActions() {
  try {
    const cache = await caches.open("mindprism-sync-queue");
    const requests = await cache.keys();
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const body = await response.json();
        try {
          await fetch(body.url, {
            method: body.method,
            headers: body.headers,
            body: JSON.stringify(body.data),
            credentials: "include",
          });
          await cache.delete(request);
        } catch {}
      }
    }
  } catch {}
}
