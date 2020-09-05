"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tedis_1 = require("tedis");
const createRedisClient = () => {
    const client = new tedis_1.Tedis();
    return client;
};
exports.default = createRedisClient;
