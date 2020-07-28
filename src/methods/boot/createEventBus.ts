import { EventEmitter } from "events";

const createEventBus = (): EventEmitter => {
	const eventBus = new EventEmitter();
	return eventBus;
};

export default createEventBus;
