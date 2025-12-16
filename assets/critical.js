const controller = new AbortController();
const {signal} = controller;

document.addEventListener('load', event => {
	
}, {signal});

document.addEventListener('beforeunload', event => {
	document.getElementsByTagName('dialog')[0].showModal();
}, {signal});
