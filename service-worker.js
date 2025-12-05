generateRandomString = (length = 6) => Math.random().toString(36).substring(2, length + 2);
console.log(generateRandomString());
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
		navigator.serviceWorker.onmessage = event => {
			log(event.data);
		};
		navigator.serviceWorker.controller.postMessage(5);
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
addEventListener('install', event => {
	log('Service Worker installing.');
	//self.postMessage('Service Worker installing.');
	/*clients.matchAll().then(clients => {
		clients.forEach(client => {
			client.postMessage(message);
		});
	});*/
	clients.matchAll({
		includeUncontrolled: true,
		type: 'window',
	}).then(clients => {
		if (clients && clients.length) {
			// Send a response - the clients
			// array is ordered by last focused
			clients[0].postMessage(Service Worker installing.);
		}
	});
	console.log('Service Worker installing.');
});
addEventListener('activate', event => {
	log('Service Worker activating.');
	console.log('Service Worker activating.');
});
addEventListener('fetch', event => {
	log('fetch');
	console.log('fetch');
});
addEventListener('message', event => {
	
});
onload = (event, workerURL) => {
	log('Page and all resources loaded.');
	/*
	worker = new Worker(workerURL = URL.createObjectURL(new Blob([`
		
	`], {type: 'application/javascript'})));
	URL.revokeObjectURL(workerURL);
	worker.onmessage = event => {
		log(event.data);
		worker.terminate();
		delete worker;
	};
	onpointerup = event => {
		//worker.postMessage(10);
	};
	*/
};
