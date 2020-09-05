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
const utils_1 = require("../../utils");
const uuid_1 = require("uuid");
const fillOrder = (order, candle, redisClient) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { timestamp } = candle;
        const { id, price, type, amount, symbol, side } = order;
        const quoteCurrency = symbol.split("/")[1];
        let orderPrice;
        let orderCost;
        let takerOrMaker;
        let feeRate;
        //TODO: handle fees dynamically
        if (type === "market") {
            orderPrice = candle.open;
            orderCost = orderPrice * amount;
            takerOrMaker = "taker";
            feeRate = 0.001;
        }
        else {
            orderPrice = price;
            orderCost = orderPrice * amount;
            takerOrMaker = "maker";
            feeRate = 0.0005;
        }
        const orderId = `order:${id}`;
        const trade = {
            id: uuid_1.v4(),
            timestamp,
            datetime: new Date(timestamp).toISOString(),
            symbol,
            side,
            takerOrMaker,
            price: orderPrice,
            amount,
            cost: orderCost,
            fee: {
                cost: feeRate * orderCost,
                currency: quoteCurrency,
                type: takerOrMaker,
                rate: feeRate
            }
        };
        const filledOrder = Object.assign(Object.assign({}, order), { lastTradeTimestamp: timestamp, status: "closed", average: orderPrice, filled: amount, remaining: 0, cost: orderCost, trades: [trade], fee: {
                currency: quoteCurrency,
                type: takerOrMaker,
                cost: feeRate * orderCost,
                rate: feeRate
            } });
        const oldBalanceRaw = yield redisClient.hgetall("balance");
        const oldBalance = utils_1.decodeObject(oldBalanceRaw);
        const newBalance = {
            info: {
                free: oldBalance.info.total - orderCost,
                used: oldBalance.info.used,
                total: oldBalance.info.total - orderCost
            },
            quote: {
                free: oldBalance.quote.total - orderCost,
                used: oldBalance.quote.used,
                total: oldBalance.quote.total - orderCost
            },
            base: {
                free: oldBalance.base.total + amount,
                used: oldBalance.base.used,
                total: oldBalance.base.total + amount
            }
        };
        const encodedOrder = utils_1.encodeObject(filledOrder);
        const encodedBalance = utils_1.encodeObject(newBalance);
        yield redisClient.hmset(orderId, Object.assign({}, encodedOrder));
        yield redisClient.hmset("balance", Object.assign({}, encodedBalance));
        yield redisClient.lrem("openOrders", -1, orderId);
    }
    catch (err) {
        throw err;
    }
});
exports.default = fillOrder;
