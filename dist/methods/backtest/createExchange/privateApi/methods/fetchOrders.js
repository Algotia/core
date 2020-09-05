"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const flat_1 = require("flat");
const factory = (args) => {
    const { redisClient } = args;
    const fetchOrders = (symbol, since, limit, params) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const orderIds = yield redisClient.lrange("openOrders", 0, -1);
            const orderPromises = orderIds.map((orderId) => __awaiter(void 0, void 0, void 0, function* () {
                const rawOrderHash = yield redisClient.hgetall(orderId);
                const structuredOrder = flat_1.unflatten(rawOrderHash);
                return structuredOrder;
            }));
            return Promise.all(orderPromises);
        }
        catch (err) {
            throw err;
        }
    });
    return fetchOrders;
};
exports.default = factory;
