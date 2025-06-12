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
    console.log("Check count event received")
    event.waitUntil(fetchLatestCount());
  }
});

const fetchLatestCount = async () => {
	var response = await fetch(
    "https://home.atlassian.com/gateway/api/notification-log/api/3/notifications/count/unseen",
    {
      mode: 'no-cors',
    });
  if (!response.ok) {
    // TODO login?
    return;
  }
  
  var parsed = await response.json();
  console.log(parsed)

  if (isNaN(parsed.count)) {
    // TODO ask to login
  } else {
    var oldCount = await idb.get('count')
    if (oldCount && oldCount < parsed.count) {
      // TODO create notification
    }

    await idb.set('count', parsed.count)
  }
}

 const idb = (() => {
  let dbInstance;

  function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = new Promise((resolve, reject) => {
      const openreq = indexedDB.open('hermessian-store', 1);

      openreq.onerror = () => {
        reject(openreq.error);
      };

      openreq.onupgradeneeded = () => {
        openreq.result.createObjectStore('hermessian-count');
      };

      openreq.onsuccess = () => {
        resolve(openreq.result);
      };
    });

    return dbInstance;
  }

  async function withStore(type, callback) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('hermessian-count', type);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore('hermessian-count'));
    });
  }

  return {
    async get(key) {
      let request;
      await withStore('readonly', (store) => {
        request = store.get(key);
      });
      return request.result;
    },
    set(key, value) {
      return withStore('readwrite', (store) => {
        store.put(value, key);
      });
    },
    delete(key) {
      return withStore('readwrite', (store) => {
        store.delete(key);
      });
    },
  };
})();