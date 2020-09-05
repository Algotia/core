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
const helpers_1 = require("../helpers/");
const fetchBalance_1 = __importDefault(require("./fetchBalance"));
const uuid_1 = require("uuid");
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../../../../../utils");
const red = chalk_1.default.underline.red;
const green = chalk_1.default.underline.green;
const yellow = chalk_1.default.bold.yellow;
class InsufficientBalanceError extends Error {
    constructor(balanceAmount, orderAmount, currency) {
        super(`Strategy attempted to place order for: \n ${red(orderAmount)} ${yellow(currency)} \n Available balance is:  \n ${green(balanceAmount)} ${yellow(currency)}`);
        this.stack = null;
        this.name = "InsufficientBalanceError";
    }
}
const factory = (args) => {
    const { redisClient } = args;
    const createOrder = (symbol, type, side, amount, price, params) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const thisCandle = yield helpers_1.getThisCandle(args);
            const splitPair = yield helpers_1.getBackfillPair(args);
            const quoteCurrency = splitPair[1];
            const fetchBalance = fetchBalance_1.default(args);
            const balance = yield fetchBalance();
            const freeQuoteCurrency = balance.quote.free;
            let orderCost;
            if (price) {
                const cost = amount * price;
                orderCost = cost;
                if (cost > freeQuoteCurrency) {
                    throw new InsufficientBalanceError(balance.quote.free, orderCost, quoteCurrency);
                }
            }
            else {
                const cost = amount * thisCandle.close;
                orderCost = cost;
                if (cost > freeQuoteCurrency) {
                    throw new InsufficientBalanceError(balance.quote.free, orderCost, quoteCurrency);
                }
            }
            if (!price)
                price = thisCandle.close;
            const maker = 0.0005;
            const taker = 0.001;
            const order = {
                id: uuid_1.v4(),
                datetime: new Date(thisCandle.timestamp).toISOString(),
                timestamp: thisCandle.timestamp,
                lastTradeTimestamp: 0,
                status: "open",
                symbol,
                type,
                side,
                price: price,
                average: 0,
                amount: amount,
                // TODO: check if current candle price is greater than limit price
                // and if so fill the order completely
                filled: 0,
                remaining: amount,
                cost: orderCost,
                fee: {
                    currency: quoteCurrency,
                    cost: type === "market"
                        ? taker * (amount * price)
                        : maker * (amount * price),
                    rate: type === "market" ? taker : maker,
                    type: type === "market" ? "taker" : "maker"
                }
            };
            const orderKey = `order:${order.id}`;
            const encodedOrder = utils_1.encodeObject(order);
            yield redisClient.hmset(orderKey, Object.assign({}, encodedOrder));
            yield redisClient.rpush("openOrders", orderKey);
            return order;
        }
        catch (err) {
            throw err;
        }
    });
    return createOrder;
};
exports.default = factory;
