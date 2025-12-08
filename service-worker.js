console.log(crypto.randomUUID());
self.log_history ??= [];
log = (message, error, url) => {
	log_history.unshift([message, error, url]);
	if (self.document?.body) while (log_history[0]) {
		document.body.insertAdjacentHTML('beforeend', `<a${log_history[0][2] ? ` href="${log_history[0][2]}" target="_blank"` : ''} ${['info', 'error'][log_history[0][1]] ?? ''}>${log_history[0][0]}</a>`);
		break;//log_history.shift();
	}
};
init = (message = 0) => {
	console.warn('!');
	log('Welcome!' + message);
};
navigator.serviceWorker?.register('service-worker.js').then(registration => {
	// console.log('Service Worker registered with scope:', registration.scope);
	registration.onupdatefound = () => {
		console.log('New worker being installed => ', registration.installing);
		registration.installing.onstatechange = () => {
			if (registration.installing?.state === 'installed') {
				if (navigator.serviceWorker.controller) {
					// At this point, the old content will have been purged and
					// the fresh content will have been added to the cache.
					// It's the perfect time to display a "New content is
					// available; please refresh." message in your web app.
					log('New content is available; please refresh.');
					//location += '';
				} else {
					// At this point, everything has been precached.
					// It's the perfect time to display a
					// "Content is cached for offline use." message.
					log('Content is cached for offline use.');
				}
			}
		};
	};
	navigator.serviceWorker.ready.then(registration => {
		log('Our web app is being served cache-first by a service worker.', 0);
		/* SyncManager allows web apps to defer tasks to a Service Worker
		to be executed even when the user is offline or has closed the tab. */
		self.SyncManager && registration.sync.register('sync-updates').then(() => log('Background sync registered successfully')).catch(error => log(`Background Sync could not be registered ${error}`, 1));
		self.SyncManager && registration.sync.getTags().then(tags => {
			if (tags.includes('sync-updates')) {
				console.log('Background sync is already registered.');
			} else {
				console.log('Background sync is not currently registered.');
			}
		});
		navigator.serviceWorker.onmessage = event => {
			console.log('window receive: ' + event.data);
		};
		unregister = () => {
			registration.unregister();
		};
		init(1);
	});
	if (registration.installing) {
		log('Service worker installed.');
	} else if (registration.active) {
		log('Service worker active.'); // Service Worker is controlling the current page
	}
}).catch(error => log(`Service Worker registration failed: ${error}`, 1)) ?? init(0);
onload = (event, workerURL) => {
	log('Page and all resources loaded.');
	let installPrompt;
	addEventListener('beforeinstallprompt', event => {
		event.preventDefault(); // Prevent Chrome 76 and earlier from automatically showing the prompt
		installPrompt = event; // Stash the event so it can be triggered later.
		// Optionally, update your UI to show an install button or message
	});
	/*
	worker = new Worker(workerURL = URL.createObjectURL(new Blob([`
		
	`], {type: 'application/javascript'})));
	URL.revokeObjectURL(workerURL);
	worker.onmessage = event => {
		log(event.data);
		worker.terminate();
		delete worker;
	};
	*/
	onpointerup = event => {
		navigator.serviceWorker.controller.postMessage(1);
		if (installPrompt) {
			installPrompt.prompt();
			installPrompt.userChoice.then(({outcome}) => {
				console.log(`User response to the install prompt: ${outcome}`);
				if (outcome === 'accepted') {
					// Optionally, hide the install button if the user accepted
				}
				installPrompt = null;
			}).catch(error => {
				console.error('Error handling user choice:', error);
			});
		}
	};
};
addEventListener('install', event => {
	cacheName = 'november';
	synchronize = () => {
		return;
		// Logic to retrieve messages from IndexedDB and send them to the server
		return fetch('url', {	
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify([])
		});
	};
	log('Service Worker installing.');
	//self.postMessage('Service Worker installing.');
	/*clients.matchAll().then(clients => {
		clients.forEach(client => {
			client.postMessage(message);
		});
	});*/
	self.skipWaiting();
	event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
		'/',
		'/index.html',
		'service-worker.js',
		'styles.css',
		'manifest.json',
		'link.jpg',
	])).catch(error => console.error('Service Worker installation failed: ', error)));
});
addEventListener('activate', event => {
	event.waitUntil(clients.claim().then(() => console.log('SW has claimed all the clients')));
	event.waitUntil(self.registration?.navigationPreload.enable());
	const cacheWhiteList = [cacheName];
	event.waitUntil(caches.keys().then(cacheNames => {
		return Promise.all(cacheNames.map(cacheName => {
			if (!cacheWhiteList.includes(cacheName)) {
				return caches.delete(cacheName);
			}
		}));
	}));
	
	
	
	
	log('Service Worker activating.');
	self.clients.matchAll().then(clients => { // ServiceWorker broadcast to all connected Pages
		clients.forEach(client => {
			client.postMessage('Service Worker activating.');
		});
	});
	addEventListener('message', event => {
		console.log('sw receive: '+ event.data);
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true,
		}).then(clients => { // ServiceWorker broadcast to all connected Pages
			clients.forEach(client => {
				client.postMessage(event.data + 1);
				client.focus?.();
			});
			event.waitUntil(clients.openWindow('/'));
		});
	});
});
addEventListener('fetch', event => {
	event.preloadResponse && event.waitUntil(event.preloadResponse);
	event.respondWith(caches.match(event.request).then(cachedResponse => {
		if (cachedResponse) {
			console.log('Cached response: ', event.request.url);
			return cachedResponse;
		}
		return (event.preloadResponse || fetch(event.request)).then(response => response && caches.open(cacheName).then(cache => {
			 // Check for valid response (200 status, not an opaque or error type)
			if (!response || response.status !== 200 || response.type === 'error') {
				return response;
			}
			// For non-GET requests (e.g., POST), return without caching.
			// This is usually redundant as preload is only for navigation/GET, 
			// but it's good defensive programming.
			if (event.request.method !== 'GET') {
				return response;
			}
			response && cache.put(event.request, response.clone());
			return response;
		})).catch(error => {
			console.log('Response not found: ', error);
			if (event.request.url.includes('/todos')) return new Response(JSON.stringify([]), {
				headers: {'Content-Type': 'application/json'},
			});
			//return caches.match('/index.html').then(cachedResponse => cachedResponse);
			if (event.request.mode === 'navigate' || event.request.destination === 'document') { // Fallback for navigation requests (e.g., all HTML pages)
				return caches.match('/index.html');
			}
			// You can add other asset fallbacks here (e.g., a placeholder image)
			
			// throw error; // Must throw the error if no fallback is possible
		});
	}));
});
addEventListener('sync', event => {
	if (event.tag === 'sync-updates') { // You can have other conditions for different sync tags
		event.waitUntil(synchronize());
	}
});
/*
processPendingUpdates = async () => {
	const db = await idb.openDB('updates-store', 1);
	const updates = await db.getAll(PENDING_UPDATES);
	for (const update of updates) {
		try {
			await fetch(API_ENDPOINT, {
				method: 'POST',
				body: JSON.stringify(update),
				headers: {
					'Content-Type': 'application/json'
				}
			});
			await db.delete(PENDING_UPDATES, update.id);
		} catch (error) {
			console.error('Sync failed:', error);
		}
	}
};
// Client-side code (main.js)
const PENDING_UPDATES = 'pending-updates';
updateCachedFile = async (modifiedData) => {
	// Update cache
	const cache = await caches.open(cacheName);
	await cache.put('/data.json', new Response(JSON.stringify(modifiedData)));
	// Store update in IndexedDB
	const db = await idb.openDB('updates-store', 1, {
		upgrade(db) {
			db.createObjectStore(PENDING_UPDATES, {
				autoIncrement: true
			});
		}
	});
	await db.add(PENDING_UPDATES, modifiedData);
	// Register background sync
	if ('serviceWorker' in navigator && 'SyncManager' in window) {
		const registration = await navigator.serviceWorker.ready;
		await registration.sync.register('sync-updates');
	} else {
		window.addEventListener('online', processPendingUpdates); // Fallback: Retry when online
	}
};
*/
