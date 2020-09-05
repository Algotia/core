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
const initializeBacktest_1 = __importDefault(require("./initializeBacktest"));
const reconcile_1 = __importDefault(require("./reconcile"));
const convertPeriodToMs_1 = __importDefault(require("../../utils/time/convertPeriodToMs"));
const saveBacktest_1 = __importDefault(require("./saveBacktest"));
const backtest = (bootData, backtestInput) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { redisClient, mongoClient } = bootData;
        const { strategy } = backtestInput;
        const { backtestingExchange, backfill } = yield initializeBacktest_1.default(bootData, backtestInput);
        const { period, userCandles, internalCandles } = backfill;
        const timesToReconcile = convertPeriodToMs_1.default(period) / 60000;
        let strategyIndex = 0;
        let backtestErrors = [];
        for (let i = 0; i < internalCandles.length; i++) {
            const thisInternalCandle = internalCandles[i];
            if (i % timesToReconcile === 0) {
                try {
                    yield strategy(backtestingExchange, userCandles[strategyIndex]);
                }
                catch (err) {
                    backtestErrors.push(`${err.message} at candle ${i}`);
                }
                finally {
                    strategyIndex++;
                    yield redisClient.incr("userCandleIdx");
                }
            }
            yield reconcile_1.default(thisInternalCandle, redisClient);
        }
        const endingBalanceRaw = yield redisClient.hgetall("balance");
        const endingBalance = utils_1.decodeObject(endingBalanceRaw);
        const allOrderIds = yield redisClient.keys("order:*");
        const allOrders = yield Promise.all(allOrderIds.map((orderId) => __awaiter(void 0, void 0, void 0, function* () {
            const rawOrderHash = yield redisClient.hgetall(orderId);
            const orderHash = utils_1.decodeObject(rawOrderHash);
            return orderHash;
        })));
        const backtest = {
            backfillId: backfill._id,
            balance: endingBalance,
            orders: allOrders
        };
        const backtestDocument = yield saveBacktest_1.default(backtest, mongoClient);
        yield redisClient.command("FLUSHALL");
        return {
            backtest: backtestDocument,
            errors: backtestErrors
        };
    }
    catch (err) {
        throw err;
    }
});
exports.default = backtest;
