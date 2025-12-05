console.warn('!');
onload = (event, workerURL) => {
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
	log = (message, error, url) => {
		document.body.insertAdjacentHTML('beforeend', `<a${url ? ` href="${url}" target="_blank"` : ''}${error ? ' error' : ''}>${message}</a>`);
	};
	/^(https?:)/.test(location) && navigator.serviceWorker?.register('/service-worker.js').then(registration => {
		// console.log('Service Worker registered with scope:', registration.scope);
		registration.onupdatefound = () => {
			console.log('New worker being installed => ', registration.installing);
			registration.installing.onstatechange = () => {
				if (registration.installing.state === 'installed') {
					if (navigator.serviceWorker.controller) {
						// At this point, the old content will have been purged and
						// the fresh content will have been added to the cache.
						// It's the perfect time to display a "New content is
						// available; please refresh." message in your web app.
						log('New content is available; please refresh.');
						location += '';
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
			log('Our web app is being served cache-first by a service worker.');
			unregister = () => {
				registration.unregister();
			};
		});
		if (registration.installing) {
			log('Service worker installed');
		} else if (registration.active) {
			log('Service worker active!');
		}
	}).catch(error => log(`Service Worker registration failed: ${error}`, 1));
	
};
if (self?.log) {
	self.addEventListener('install', event => {
		log('Service Worker installing.');
	});
	self.addEventListener('activate', event => {
		log('Service Worker activating.');
	});
	self.addEventListener('fetch', event => {
		log('fetch');
	});
}
