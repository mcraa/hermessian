const broadcast = new BroadcastChannel('hermessian-messages');

// to receive: pong, result
broadcast.onmessage = (event) => {
  if (event.data && event.data.type === 'hermessian-pong') {
    // TODO we are good else ask for install extension
  }

  if (event.data && event.data.type === 'hermessian-check-result') {
    // TODO show notification
    const response = JSON.parse(event.data.content)
    if (response && !isNaN(response.count)) {
      handleNewCount(response.count)
        .then(() => { console.log('New count set') })
        .catch(console.log);
    }
  }
};

// to send: pong, response
const sendResponse = (responseType, data) => {
    broadcast.postMessage({ type: responseType, content: data });
}

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
  
  sendResponse({ type: 'hermessian-ping', });
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-notifications-count") {
    console.log("Check count event received")
    event.waitUntil(fetchLatestCount());
  }
});

const handleNewCount = async (newCount) => {
  var oldCount = await idb.get('count')
    if (oldCount && oldCount < newCount) {
      self.registration.showNotification(
        `${newCount - oldCount} new notifications`,
        { body: `${newCount} unread in total` }
      ).catch((error) => {
        console.log(error);
      });

    }

    if (self.navigator.setAppBadge && newCount > 0) {
      self.navigator.setAppBadge(newCount)
    }

    if (newCount == 0 && self.navigator.clearAppBadge) {
      self.navigator.clearAppBadge()
    }

    await idb.set('count', newCount)
}

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
    await handleNewCount(parsed.count);
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
