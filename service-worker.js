log_history = [];
log = (message, error, url) => {
	log_history.push([message, error, url]);
	if (document) while (log_history[0]) {
		document.body.insertAdjacentHTML('beforeend', `<a${log_history[0][2] ? ` href="${log_history[0][2]}" target="_blank"` : ''}${log_history[0][1] ? ' error' : ''}>${log_history[0][0]}</a>`);
		log_history.shift();
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
		log('Our web app is being served cache-first by a service worker.');
		unregister = () => {
			registration.unregister();
		};
		init(1);
	});
	if (registration.installing) {
		log('Service worker is installed.');
	} else if (registration.active) {
		log('Service worker is active.');
	}
}).catch(error => log(`Service Worker registration failed: ${error}`, 1)) ?? init();
self.addEventListener('install', event => {
	log('Service Worker installing.');
});
self.addEventListener('activate', event => {
	console.log('Service Worker activating.');
	log('Service Worker activating.');
});
self.addEventListener('fetch', event => {
	console.log('fetch');
});
onload = (event, workerURL) => {
	log('load');
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
