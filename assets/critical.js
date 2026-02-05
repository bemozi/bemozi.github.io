(({use64bit = 1, schema} = {}) => {
	use64bit = use64bit === 1 ? 0n : 0;
	const HASH_SEED = 18321127 | 0, SALT_LOW = 19541101 | 0, SALT_HIGH = 19620705 | 0,
	hash = (string, seed = HASH_SEED | 0) => {
		for (let index = 0, length = string.length; index < length; ++index) seed = Math.imul(seed ^ string.charCodeAt(index), HASH_SEED);
		return seed >>> 0;
	}, getID = use64bit === 0 ? (key, parentID) => {
		key = typeof key === 'number' ? key | 0 : hash(key);
		return Math.imul(parentID ^ key, HASH_SEED) >>> 0;
	} : (key, parentID) => {
		key = typeof key === 'number' ? key | 0 : hash(key);
		const low = Math.imul((Number(parentID & 0xFFFFFFFFn) | 0) ^ key, SALT_LOW),
		high = Math.imul((Number((parentID >> 32n) & 0xFFFFFFFFn) | 0) ^ key, SALT_HIGH);
		return (BigInt((high ^ (high >>> 13)) >>> 0) << 32n) | BigInt((low ^ (low >>> 16)) >>> 0);
	}, resolve = result => result instanceof Result ? result : new Result(result),
	Result = class {
		constructor(data, error = null) {
			this.data = data;
			this.error = (this.success = error === null) ? 0 : error?.message || String(error);
		}
		valueOf() {return this.data}
		toString() {return String(this.data)}
		[Symbol.toPrimitive](hint) {
			if (hint === 'number') return Number(this.data) || 0;
			if (this.data === null || typeof this.data !== 'object') return this.data
			return String(this.data);
		}
		ok(callback) {return this.success ? callback(this.data) : this}
		or(fallback) {return this.success ? this : fallback(this.data)}
		on(callback, fallback) {return this.success ? callback(this.data) : fallback(this.error)}
	}, nodes = new Map(), edges = new Map(), State = class {
		constructor(parent, id, key) {
			this.parent = parent;
			this.id = id;
			this.key = key;
		}
	}, linkHandler = {
		apply: (target, thisArg, args) => {
			const state = target.state,
			key = state.key,
			ParentID = state.parent ? state.parent.id : use64bit;
			let method = schema.get(state.id);
			const isShared = method === undefined;
			if (isShared) method = schema.get(key);
			if (typeof method === 'function') {
				if (!isShared) return method(link(new State(null, use64bit, '')), ...args);
				const ParentNode = nodes.get(ParentID);
				return method(link(new State(null, use64bit, '')), {
					value: ParentNode,
					key,
					id: ParentID
				}, ...args);
			}
		}, get: (target, key) => {
			const state = target.state, currentID = state.id;
			if (key === 'value') return nodes.get(currentID);
			if (key === Symbol.toPrimitive) return hint => {
				const value = nodes.get(currentID);
				if (hint === 'number') return Number(value) || 0;
				if (value === null || typeof value !== 'object') return value;
				return String(value);
			};
			if (key === 'up') return (steps = 1) => {
				let current = state;
				while (steps-- && current.parent) current = current.parent;
				return link(current);
			};
			if (key === Symbol.iterator) return function*() {
				const branch = edges.get(currentID);
				if (!branch) return;
				for (const property of branch.keys()) yield property;
			};
			if (typeof key !== 'string') return;
			return link(new State(state, edges.get(currentID)?.get(key) ?? getID(key, currentID), key));
		}, set: (target, key, value) => {
			const state = target.state, currentID = state.id;
			let currentEdges = edges.get(currentID);
			const childID = currentEdges?.get(key) ?? getID(key, currentID),
			content = value?.constructor === Object ? undefined : value;
			if (content === undefined && !edges.has(childID) || value?.drop !== undefined) {
				if (value?.drop === 1) {
					const stack = [childID];
					while (stack.length) {
						const stackID = stack.pop(), stackIDEdges = edges.get(stackID);
						if (stackIDEdges) {
							stackIDEdges.forEach(nextID => stack.push(nextID));
							edges.delete(stackID);
						}
						nodes.delete(stackID);
					}
				} else nodes.delete(childID);
				let bubble = state;
				while (bubble.parent) {
					const bubbleID = bubble.parent.id, bubbleEdges = edges.get(bubbleID);
					bubbleEdges?.delete(bubble.key);
					if (bubbleEdges.size) break;
					edges.delete(bubbleID);
					bubble = bubble.parent;
				}
				return true;
			}
			if (content === undefined) nodes.delete(childID); else nodes.set(childID, content);
			if (currentEdges === undefined) edges.set(currentID, currentEdges = new Map());
			currentEdges.set(key, childID);
			return true;
		}, getPrototypeOf: target => {
			const hostNode = nodes.get(target.state.id);
			return hostNode ? Object.getPrototypeOf(hostNode) : null;
		}, has: (target, key) => {
			if (key === 'up' || key === 'value') return true;
			const hostEdges = edges.get(target.state.id);
			return hostEdges ? hostEdges.has(key) : false;
		}
	}, link = state => {
		const target = function() {};
		target.state = state;
		return new Proxy(target, linkHandler);
	};
	{
		const schemaMap = new Map(), stack = [use64bit, schema];
		while (stack.length) {
			const branch = stack.pop(), parentID = stack.pop(), isShared = branch === schema.shared;
			for (const key in branch) {
				const method = branch[key];
				if (typeof method === 'function') {
					if (key.endsWith('_run')) schemaMap.set(isShared ? key.slice(0, -4) : getID(key.slice(0, -4), parentID), (...args) => {
						try {
							const result = method(...args);
							return result instanceof Promise ? result.then(resolve).catch(error => new Result(args.length > 1 ? args : args[0], error)) : result instanceof Result ? result : new Result(result);
						} catch (error) {return new Result(args.length > 1 ? args : args[0], error)}
					}); else schemaMap.set(isShared ? key : getID(key, parentID), method);
				} else stack.push(getID(key, parentID), method);
			}
		}
		schema = schemaMap;
	}
	addEventListener('load', () => {
		const dialog = document.getElementsByTagName('dialog')[0];
		dialog.open || dialog.showModal();
		document.querySelector('main > button').addEventListener('click', () => {
			link(new State(null, use64bit, '')).main();
			schema.delete(getID('main', use64bit));
		}, {once: true});
	}, {once: true});
})({use64bit: 0, schema: {
	main: async z => {
		z.view.frame();
	}, shared: {
		make: (z, state, template, target, clear = false) => {
			const fragment = document.createRange().createContextualFragment(template),
			elements = fragment.querySelectorAll('[id]');
			for (const node of elements)(z[node.id] = node).removeAttribute('id');
			const container = target || (state.value instanceof HTMLElement ? state.value : document.body);
			if (clear) container.replaceChildren(fragment); else container.append(fragment);
		}, on: (z, state, type, handler, {stopPropagation = false, preventDefault = false, depth = 0} = {}) => {
			const node = state.value;
			if (!(node instanceof HTMLElement)) return;
			let types = z.eventTypes.value,
			registry = z.eventRegistry.value,
			signal = z.eventSignal.value;
			if (!types) {
				types = z.eventTypes = new Set();
				z.eventRegistry = registry = new WeakMap();
				const controller = new AbortController();
				z.eventController = controller;
				signal = z.eventSignal = controller.signal;
			}
			if (!types.has(type)) {
				types.add(type);
				addEventListener(type, event => {
					let currentNode = event.target, limit = depth;
					while (currentNode && --limit) {
						const meta = registry.get(currentNode)?.[event.type];
						if (meta) {
							if (meta.preventDefault) event.preventDefault();
							if (meta.stopPropagation) event.stopPropagation();
							meta.handler(event);
							return;
						}
						if (currentNode === document.body) break;
						currentNode = currentNode.parentElement;
					}
				}, {signal});
			}
			let entry = registry.get(node);
			if (!entry) registry.set(node, entry = {});
			entry[type] = {handler, stopPropagation, preventDefault, depth};
		},
	}, base: {
		snapshot: (z, source) => new Proxy({}, {
			get: (target, key) => target[key] || (target[key] = source[key])
		}), request_run: async (z, url, options = {}, type = null) => {
			const response = await fetch(url, options);
			if (!response.ok) throw new Error(`Server responded with ${response.status}`);
			return type ? response[type]() : response;
		}, stream_run: async (z, url, callback, lastSize = 0, chunkSize = 1048576) => {
			const contentRange = (await fetch(url, {
				headers: {'Range': 'bytes=0-0'}
			})).headers.get('content-range');
			if (!contentRange) return;
			const totalSize = +contentRange.split('/')[1];
			if (!totalSize || totalSize <= lastSize) return;
			const start = lastSize === 0 ? Math.max(0, totalSize - chunkSize) : lastSize,
			response = await fetch(url, {
				headers: {'Range': `bytes=${start}-${totalSize - 1}`}
			});
			if (!response.ok) return;
			const reader = response.body.getReader(), decoder = new TextDecoder(), EMPTY_UINT8 = new Uint8Array(0);
			let fragment = new Uint8Array(0), isFirstChunk = true;
			while (8) {
				const {done, value} = await reader.read();
				let chunk;
				if (fragment.length) {
					chunk = new Uint8Array(fragment.length + (value ? value.length : 0));
					chunk.set(fragment);
					if (value) chunk.set(value, fragment.length);
				} else chunk = value ? value : EMPTY_UINT8;
				let startIndex = 0, position;
				while ((position = chunk.indexOf(0, startIndex)) !== -1) {
					const segment = chunk.subarray(startIndex, position);
					startIndex = 1 + position;
					if (isFirstChunk) {
						isFirstChunk = false;
						if (start) continue;
					}
					const result = callback(decoder.decode(segment));
					if (result instanceof Promise) await result;
				}
				fragment = chunk.subarray(startIndex);
				if (done) break;
			}
		}, queue_run: async (z, tasks, {onEach, onDone, waitAll = false} = {}) => {
			let final;
			if (!onEach) final = (await Promise.allSettled(tasks)).map(response => response.status === 'fulfilled' ? response.value : response.reason); else if (waitAll) {
				const results = await Promise.allSettled(tasks);
				final = new Array(results.length);
				for (let index = 0, length = results.length; index < length; ++index) {
					const response = results[index];
					onEach(final[index] = response.status === 'fulfilled' ? response.value : response.reason, index);
				}
			} else {
				final = new Array(tasks.length);
				for (let index = 0, length = tasks.length; index < length; ++index) onEach(final[index] = await tasks[index], index);
			}
			return onDone ? onDone(final) : final;
		},
	}, view: {
		frame: async (z, value) => {
			const head = document.head;
			document.body.style.visibility = 'hidden';
			const stylesheet = head.querySelector('link[href="landing.css"]');
			stylesheet.href = 'application.css';
			z.body.make(`
				<header id="header">
					<button id="open" title="Open Directory">
						<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
					</button>
					<button id="edit" title="Toggle Edit Mode">
						<svg class="locked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
						<svg class="unlocked" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
					</button>
					<span></span>
					<button id="theme" title="Toggle Theme">
						<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>
						<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
					</button>
				</header>
				<div>
					<div>
						<nav id="first_menu" aria-label="Side menu"></nav>
						<div id="first_main"></div>
					</div>
					<div>
						<nav id="last_menu" aria-label="Content menu"></nav>
						<main id="last_main"></main>
					</div>
				</div>
				<footer id="footer"></footer>
			`, null, true);
			head.replaceChildren(...head.querySelectorAll(`
				meta[charset],
				meta[http-equiv],
				meta[name="referrer"],
				title,
				meta[name="viewport"],
				base,
				link[rel="stylesheet"],
				meta[name="theme-color"],
				link[rel="manifest"],
				link[rel="icon"],
				link[rel="apple-touch-icon"],
				script:not([type="application/ld+json"])
			`));
			requestAnimationFrame(() => {
				document.body.style.removeProperty('visibility');
			});
		},
	},
}});
