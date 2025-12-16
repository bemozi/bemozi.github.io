const controller = new AbortController();
const {signal} = controller;

addEventListener('load', event => {
	
}, {signal});

const dialog = document.getElementsByTagName('dialog')[0];

addEventListener('pointermove', event => {
	dialog.open || dialog.showModal();
}, {signal});

addEventListener('beforeunload', event => {
	
}, {signal});
