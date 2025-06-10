self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    (async () => {
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-notifications-count") {
    event.waitUntil(fetchLatestCount());
  }
});

const fetchLatestCount = async () => {
	
	return 'hello';
}