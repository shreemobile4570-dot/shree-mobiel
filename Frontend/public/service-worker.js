const STATIC_CACHE = "shree-mobile-static-v1";
const IMAGE_CACHE = "shree-mobile-product-images-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const allowedCaches = [STATIC_CACHE, IMAGE_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => !allowedCaches.includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

const isImageRequest = (request) =>
  request.destination === "image" ||
  /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(new URL(request.url).pathname);

const fetchAndCacheImage = async (request) => {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) return cachedResponse;

  const networkResponse = await fetch(request);
  if (networkResponse && networkResponse.status < 400) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (isImageRequest(request)) {
    event.respondWith(fetchAndCacheImage(request));
    return;
  }

  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => cachedResponse || fetch(request))
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_PRODUCT_IMAGES" || !Array.isArray(event.data.urls)) {
    return;
  }

  event.waitUntil(
    caches.open(IMAGE_CACHE).then((cache) =>
      Promise.all(
        event.data.urls.map((url) =>
          fetch(url, { mode: "no-cors" })
            .then((response) => cache.put(url, response))
            .catch(() => null)
        )
      )
    )
  );
});
