const IMAGE_CACHE = "shree-mobile-product-images-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  const allowedCaches = [IMAGE_CACHE];

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
