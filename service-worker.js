/*
Service Worker filename versioning : no HTTP caching
preventing HTTP caching on the Service Worker file itself is crucial for reliable updates
Rely on filename versioning to force the browser to bypass local HTTP cache
and download the latest Service Worker file whenever you deploy an update.
*/
self.log_history ??= [];
const log = (message, error = 0, url = '') => {
	// Service Worker context (no document)
	if (!self.document) {
		console[error ? 'error' : 'log'](message, url);
		return;
	}
	// Window context (has document)
	log_history.unshift([message, error, url]);
	// Only process the latest log entry to avoid DOM spam/slowdown
	const entry = log_history[0];
	if (document.body) {
		document.body.insertAdjacentHTML('beforeend', `<a${entry[2] ? ` href="${entry[2]}" target="_blank"` : ''} class="${['info', 'error'][entry[1]] ?? ''}">${entry[0]}</a>`);
	}
};
const init = (message = 0) => {
	console.warn('App Initializing!');
	log('Welcome! ' + (message ? 'Service Worker registered.' : 'No Service Worker found.'));
};
// Checks if the global scope is the Service Worker
if (self.ServiceWorkerGlobalScope && self instanceof ServiceWorkerGlobalScope) {
	// 💡 FIX: The log function uses 'self.log_history' which only exists in the window. 
	//         The shared function handles this by checking 'self.document'.
	// const [,cacheName] = registration.installing.scriptURL.match(/.*\/(.+?)(?=\?|#|$)/);
	//const [cacheName] = 'https://example.com/assets/sub/sw-v1.js?hash=123#build'.match(/(?<=\/)[^/]+?(?=\?|#|$)/);
	const [,cacheName] = location.href.match(/.*\/(.+?)(?=\?|$)/);
	log('Service worker filename: ' + cacheName);
	addEventListener('install', event => {
		log('Service Worker installing.');
		skipWaiting();
		event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([
			'/',
			'index.html',
			'styles.css',
			'manifest.json',
			'link.jpg', // 💡 SUGGESTION: Ensure this is the correct path/name.
		])).catch(error => console.error('Service Worker installation failed: ', error)));
	});
	addEventListener('activate', event => {
		const cacheWhiteList = [cacheName];
		event.waitUntil(Promise.all([
			clients.claim().then(() => console.log('SW has claimed all the clients')),
			registration.navigationPreload.enable().then(() => log('Navigation preload enabled')),
			caches.keys().then(cacheNames => Promise.all(
				cacheNames.map(name => {
					if (!cacheWhiteList.includes(name)) {
						return caches.delete(name);
					}
				})
			)),
			clients.matchAll({
				type: 'window',
				includeUncontrolled: true,
			}).then(clients => {
				clients.forEach(client => {
					client.postMessage('Service Worker activating. New SW is now controlling the page.');
					// 💡 SUGGESTION: Only call client.focus() if it's necessary (e.g., notification click).
					// client.focus?.(); 
				});
				// 💡 FIX: The waitUntil here is confusing; opening a window shouldn't block the message event.
				// event.waitUntil(clients.openWindow('/'));
			})
		]));
		log('Service Worker activating.');
	});
	// 💡 FIX: This is the most robust implementation to prevent 'preloadResponse' cancellation.
	addEventListener('fetch', event => {
		// 💡 CRITICAL FIX: Don't intercept requests for the service worker itself
		if (event.request.url.includes(cacheName)) {
			return; // Let the browser fetch the service worker file directly
		}
		// 1. EXTEND LIFETIME: If preload is active, ensure the worker stays alive.
		// We create a variable for the preload promise for reuse.
		/*
		const preloadPromise = event.preloadResponse;
		if (preloadPromise) {
			event.waitUntil(Promise.resolve(preloadPromise).catch(() => {}));
		}*/
		// 2. Respond with the cache-first, network-or-preload-fallback logic.
		event.respondWith(caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) {
				console.log('Serving from cache: ', event.request.url);
				return cachedResponse;
			}
			Promise.resolve(event.preloadResponse).then(response => {
				// Check if preload succeeded and provided a valid response
				if (response) {
					return response;
				}
				// If preload failed or returned null/undefined, fall through to fetch
				throw new Error('Preload failed or was not available');
			}).catch(() => fetch(event.request)).then(response => {
				// Check for valid response and only cache GET requests
				if (response && response.status === 200 && response.type !== 'error' && event.request.method === 'GET') {
					return caches.open(cacheName).then(cache => {
						cache.put(event.request, response.clone()); // Cache the valid response
						return response; // Return the original response to the browser
					});
				}
				return response;
			}).catch(error => {
				console.error('Fetch failed: ', error, event.request.url);
				// Fallback for /todos endpoint (example data)
				if (event.request.url.includes('/todos')) return new Response(JSON.stringify([]), {
					headers: {
						status: 200, // Return 200 for successful fallback data retrieval
						headers: {
							'Content-Type': 'application/json'
						},
					},
				});
				// Fallback for navigation requests (HTML pages) // Serve the main offline page
				if (event.request.mode === 'navigate' || event.request.destination === 'document') {
					return caches.match('index.html').then(offlinePageResponse => offlinePageResponse || new Response('Offline Page Not Found in Cache', {
						status: 503,
						statusText: 'Service Unavailable',
						headers: {
							'Content-Type': 'text/plain'
						}
					}));
				}
				// INSTEAD of throwing the error, which is the source of the "not a Response" issue.
				return new Response('Network or Fetch Error', {
					status: 503,
					statusText: 'Service Unavailable',
					headers: {
						'Content-Type': 'text/plain'
					}
				});
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
		// Example: Reply to the client that sent the message
		if (event.source) {
			event.source.postMessage(event.data + 1); // Message received and processed
		}
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
		log('App ready to be installed (PWA prompt stored).');
	});
	// --- SERVICE WORKER REGISTRATION ---
	navigator.serviceWorker?.register(document.currentScript?.src).then(registration => {
		// 💡 FIX: Used a dynamic script source for the SW registration path.
		console.log('Service Worker registered with scope:', registration.scope);
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			log('New Service Worker activated and taking control. Reloading page...', 0, location.href);
			//window.location.reload();
		});
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
			if (self.SyncManager) {
				readyRegistration.sync.register('sync-updates').then(() => log('Background sync registered successfully')).catch(error => log(`Background Sync could not be registered: ${error}`, 1));
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
			onmessage = event => {
				if (event.origin === location.origin && event.source === navigator.serviceWorker.controller) {
					console.log('Message from Service Worker: ', event.data);
					// Process the message data
				}
				if (event.data && event.data.type === 'SW_ACTIVATED') {
					/*
					// 1. Terminate the existing Web Worker
					myGlobalWorker && myGlobalWorker.terminate();
					// 2. Load the new Web Worker script (forcing the browser to fetch the new code)
					myGlobalWorker = new Worker('new-worker-script.js');
					// Re-establish all message handlers...
					// 3. Re-initialize the main application logic that relies on the SW/Web Worker
					// soft re-initialization...
					*/
				}
				log('window receive: ' + event.data);
			};
			unregister = () => readyRegistration.unregister().then(success => {
				log('Service Worker successfully unregistered: ' + success, +!success);
			});
			init(1);
		});/*
		if (registration.installing) {
			log('Service worker installing.');
		} else if (registration.active) {
			log('Service worker active.');
		}*/
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
