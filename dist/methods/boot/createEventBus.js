"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const createEventBus = () => {
    const eventBus = new events_1.EventEmitter();
    return eventBus;
};
exports.default = createEventBus;
