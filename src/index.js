const cacheName = 'static-cache';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if the request is for a static file and serve accordingly
  if (pathname === "/") {
    return serveStatic('index.html', 'text/html');
  } else if (pathname === "/styles.css") {
    return serveStatic('styles.css', 'text/css');
  } else if (pathname === "/script.js") {
    return serveStatic('script.js', 'application/javascript');
  } else {
    return new Response('404 Not Found', { status: 404 });
  }
}

async function serveStatic(fileName, contentType) {
  const cache = caches.default;
  const cacheKey = new Request(fileName, { cf: { cacheTtl: 3600 } });

  // Try to find the response in the cache
  let response = await cache.match(cacheKey);
  if (response) {
    return response;
  }

  // If not in cache, fetch from GitHub and cache the response
  const url = `https://raw.githubusercontent.com/valentinvieriu/domain42/main/src/${fileName}`;
  response = await fetch(url, {
    headers: {
      'Content-Type': contentType
    }
  });

  if (response.ok) {
    const clonedResponse = response.clone();
    event.waitUntil(cache.put(cacheKey, clonedResponse));
  }

  return response;
}
