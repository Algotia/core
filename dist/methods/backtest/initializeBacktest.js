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
const createExchange_1 = __importDefault(require("./createExchange"));
const initializeBacktest = (bootData, backtestInput) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mongoClient, redisClient, exchange } = bootData;
        const { backfillName, initialBalance } = backtestInput;
        const backfillCollection = yield utils_1.getBackfillCollection(mongoClient);
        const backfill = yield backfillCollection.findOne({
            name: backfillName
        });
        if (!backfill) {
            throw new Error(`Backfill ${backfillName} does not exist in the databse.`);
        }
        const startingBalance = {
            info: {
                free: initialBalance.quote,
                used: 0,
                total: initialBalance.quote
            },
            base: {
                free: initialBalance.base,
                used: 0,
                total: initialBalance.base
            },
            quote: {
                free: initialBalance.quote,
                used: 0,
                total: initialBalance.quote
            }
        };
        const encodedBalance = utils_1.encodeObject(startingBalance);
        yield redisClient.hmset("balance", Object.assign({}, encodedBalance));
        yield redisClient.set("backfillName", backfillName);
        yield redisClient.set("userCandleIdx", "0");
        yield redisClient.set("internalCandleIdx", "0");
        const backtestingExchange = yield createExchange_1.default(exchange, mongoClient, redisClient);
        return {
            backfill,
            backtestingExchange
        };
    }
    catch (err) {
        throw err;
    }
});
exports.default = initializeBacktest;
