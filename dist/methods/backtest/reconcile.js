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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const fillOrder_1 = __importDefault(require("./fillOrder"));
const reconcile = (candle, redisClient) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const openOrderIds = yield redisClient.lrange("openOrders", 0, -1);
        for (let i = 0; i < openOrderIds.length; i++) {
            const orderId = openOrderIds[i];
            const thisOrderRaw = yield redisClient.hgetall(orderId);
            const thisOrder = utils_1.decodeObject(thisOrderRaw);
            const fillThisOrder = () => __awaiter(void 0, void 0, void 0, function* () {
                return yield fillOrder_1.default(thisOrder, candle, redisClient);
            });
            // Fill market orders immediately
            if (thisOrder.type === "market") {
                yield fillThisOrder();
            }
            // Check limit order prices
            if (thisOrder.type === "limit") {
                if (thisOrder.side === "buy") {
                    if (thisOrder.price >= candle.low) {
                        yield fillThisOrder();
                    }
                }
                else if (thisOrder.side === "sell") {
                    if (thisOrder.price <= candle.high) {
                        yield fillThisOrder();
                    }
                }
            }
        }
    }
    catch (err) {
        throw err;
    }
});
exports.default = reconcile;
