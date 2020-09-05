"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../types");
const validateConfig = (config) => {
    const { exchange } = config;
    const { exchangeId, timeout } = exchange;
    const isExchangeIdValid = () => {
        if (Object.keys(types_1.AllowedExchangeIdsEnum).includes(exchangeId)) {
            return true;
        }
        else {
            return false;
        }
    };
    // create error for these
    if (!isExchangeIdValid) {
        throw new types_1.ConfigError(`${exchangeId} is not a valid exchange.`);
    }
    if (timeout < 3000) {
        throw new types_1.ConfigError(`The timeout in your configuration file (${timeout}}) is too short. Please make it a value above 3000`);
    }
    if (!config.db) {
        config.db = {};
    }
    return config;
};
exports.default = validateConfig;
