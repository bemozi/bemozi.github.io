self.log_history ??= [];
const log = (message, error = 0, url = '') => {
	// Service Worker context (no document)
	if (!self.document) {
		console[error ? 'error' : 'log'](message, url);
		return;
	}
	// Window context (has document)
	self.log_history.unshift([message, error, url]);
	// Only process the latest log entry to avoid DOM spam/slowdown
	const entry = self.log_history[0];
	if (document.body) {
		document.body.insertAdjacentHTML('beforeend', `<a${entry[2] ? ` href="${entry[2]}" target="_blank"` : ''} class="${['info', 'error'][entry[1]] ?? ''}">${entry[0]}</a>`);
	}
};
const init = (message = 0) => {
	console.warn('App Initializing!');
	log('Welcome! ' + (message ? 'Service Worker registered.' : 'No Service Worker found.'));
};
// Checks if the global scope is the Service Worker
if ('ServiceWorkerGlobalScope' in self && self instanceof ServiceWorkerGlobalScope) {
	// 💡 FIX: The log function uses 'self.log_history' which only exists in the window. 
	//         The shared function handles this by checking 'self.document'.
	let cacheName = 'november';
	addEventListener('install', event => {
		log('Service Worker installing.');
		self.skipWaiting();
		event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
			'/',
			'/index.html',
			'styles.css',
			'manifest.json',
			'link.jpg', // 💡 SUGGESTION: Ensure this is the correct path/name.
			// 'service-worker.js', // 💡 SUGGESTION: Don't cache the SW file itself.
		])).catch(error => console.error('Service Worker installation failed: ', error)));
	});
	addEventListener('activate', event => {
		event.waitUntil(Promise.all([
			clients.claim().then(() => console.log('SW has claimed all the clients')),
			self.registration?.navigationPreload.enable()
		]));
		const cacheWhiteList = [cacheName];
		event.waitUntil(
			caches.keys().then(cacheNames => Promise.all(
				cacheNames.map(name => {
					if (!cacheWhiteList.includes(name)) {
						return caches.delete(name);
					}
				})
			))
		);
		log('Service Worker activating.');
		self.clients.matchAll().then(clients => clients.forEach(client => {
			client.postMessage('Service Worker activating. New SW is now controlling the page.');
		}));
	});
	// 💡 FIX: This is the most robust implementation to prevent 'preloadResponse' cancellation.
	addEventListener('fetch', event => {
		// 1. EXTEND LIFETIME: If preload is active, ensure the worker stays alive.
		if (event.preloadResponse) {
			event.waitUntil(event.preloadResponse);
		}
		// 2. Respond with the cache-first, network-or-preload-fallback logic.
		event.respondWith(caches.match(event.request).then(cachedResponse => {
				if (cachedResponse) {
					console.log('Serving from cache: ', event.request.url);
					return cachedResponse;
				}
				// Fallback to preload or network fetch
				return (event.preloadResponse || fetch(event.request)).then(response => {
					// Check for valid response and only cache GET requests
					if (!response || response.status !== 200 || response.type === 'error' || event.request.method !== 'GET') {
						return response;
					}
					return caches.open(cacheName).then(cache => {
						cache.put(event.request, response.clone()); // Cache the valid response
						return response; // Return the original response to the browser
					});
				}).catch(error => {
					console.error('Fetch failed: ', error, event.request.url);
					// Fallback for /todos endpoint (example data)
					if (event.request.url.includes('/todos')) return new Response(JSON.stringify([]), {
						headers: {
							'Content-Type': 'application/json'
						},
					});
					// Fallback for navigation requests (HTML pages)
					if (event.request.mode === 'navigate' || event.request.destination === 'document') {
						return caches.match('/index.html'); // Serve the main offline page
					}
					// Must throw error if no fallback is possible
					throw error;
				});
		}));
	});
	const synchronize = () => {
		// 💡 SUGGESTION: Replace this with actual IndexedDB read and POST logic.
		// Logic to retrieve messages from IndexedDB and send them to the server
		log('Attempting background sync (synchronize function called)...');
		return Promise.resolve(); // Return a resolved promise for now
		/*
		return fetch('your-sync-url', {
		    method: 'POST',
		    // ... headers and body with data from IndexedDB
		});
		*/
	};
	addEventListener('sync', event => {
		if (event.tag === 'sync-updates') {
			log('Background sync event received.');
			event.waitUntil(synchronize());
		}
	});
	addEventListener('message', event => {
		console.log('sw receive: ' + event.data);
		self.clients.matchAll({
			type: 'window',
			includeUncontrolled: true,
		}).then(clients => {
			clients.forEach(client => {
				client.postMessage(event.data + 1);
				// 💡 SUGGESTION: Only call client.focus() if it's necessary (e.g., notification click).
				// client.focus?.(); 
			});
			// 💡 FIX: The waitUntil here is confusing; opening a window shouldn't block the message event.
			// event.waitUntil(clients.openWindow('/'));
		});
	});
} else {
	// 💡 FIX: Moved `crypto.randomUUID()` here, as it's not standard in all SW scopes.
	console.log(crypto.randomUUID());
	// 💡 FIX: Removed global function definitions from the SW code block to the shared/window section.
	let unregister; // Function to unregister SW
	let installPrompt; // For PWA installation
	// --- PWA Installation Prompt Logic ---
	addEventListener('beforeinstallprompt', event => {
		event.preventDefault();
		installPrompt = event;
		log('App ready to be installed (PWA prompt stored).', 0);
	});
	// --- SERVICE WORKER REGISTRATION ---
	navigator.serviceWorker?.register(self.document?.currentScript?.src || 'service-worker.js').then(registration => {
		// 💡 FIX: Used a dynamic script source for the SW registration path.
		// console.log('Service Worker registered with scope:', registration.scope);
		registration.onupdatefound = () => {
			console.log('New worker being installed => ', registration.installing);
			registration.installing.onstatechange = () => {
				if (registration.installing?.state === 'installed') {
					if (navigator.serviceWorker.controller) {
						log('New content is available; please refresh.', 0, location.href);
					} else {
						log('Content is cached for offline use.');
					}
				}
			};
		};
		navigator.serviceWorker.ready.then(readyRegistration => {
			log('Our web app is being served cache-first by a service worker.');
			if ('SyncManager' in self) {
				readyRegistration.sync.register('sync-updates')
					.then(() => log('Background sync registered successfully'))
					.catch(error => log(`Background Sync could not be registered: ${error}`, 1));

				readyRegistration.sync.getTags().then(tags => {
					if (tags.includes('sync-updates')) {
						console.log('Background sync is already registered.');
					} else {
						console.log('Background sync is not currently registered.');
					}
				});
			} else {
				log('Background Sync is not supported in this browser.', 1);
			}
			navigator.serviceWorker.onmessage = event => {
				console.log('window receive: ' + event.data);
				log('SW Message: ' + event.data);
			};
			unregister = () => readyRegistration.unregister().then(success => {
				log('Service Worker successfully unregistered: ' + success, +!success);
			});
			init(1);
		});
		if (registration.installing) {
			log('Service worker installing.');
		} else if (registration.active) {
			log('Service worker active.');
		}
	}).catch(error => log(`Service Worker registration failed: ${error}`, 1)) ?? init(0);
	onload = () => {
		log('Page and all resources loaded.');
		onpointerup = event => {
			// Check if controller is available before posting message
			if (navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage(1);
			} else {
				console.warn('Cannot post message: Service Worker controller is unavailable.');
			}
			if (installPrompt) {
				installPrompt.prompt();
				installPrompt.userChoice.then(({outcome}) => {
					console.log(`User response to the install prompt: ${outcome}`);
					if (outcome === 'accepted') {
						log('PWA installation accepted!');
					} else {
						log('PWA installation dismissed.', 1);
					}
					installPrompt = null;
				}).catch(error => {
					console.error('Error handling user choice:', error);
				});
			}
		};
	};
}
