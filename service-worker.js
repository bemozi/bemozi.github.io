self.addEventListener('install', event => {
	log('Service Worker installing.');
});
self.addEventListener('activate', event => {
	log('Service Worker activating.');
});
self.addEventListener('fetch', event => {
	
});
onmessage = event => {
	postMessage(event.data * 2);
};
postMessage('service worker setup success');