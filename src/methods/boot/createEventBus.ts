import { EventEmitter2 } from "eventemitter2";

const createEventBus = (): EventEmitter2 => {
	const eventBus = new EventEmitter2({
		wildcard: true,
		verboseMemoryLeak: true
	});

	return eventBus;
};

export default createEventBus;
