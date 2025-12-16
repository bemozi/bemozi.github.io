const controller = new AbortController();
const {signal} = controller;

document.addEventListener('load', event => {
	document.getElementsByTagName('dialog')[0].showModal();
}, {signal});

document.addEventListener('beforeunload', event => {
	
}, {signal});
