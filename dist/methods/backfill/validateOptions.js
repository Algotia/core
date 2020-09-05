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
const types_1 = require("../../types");
const chalk_1 = __importDefault(require("chalk"));
const compareSinceAndUntil = (sinceMs, untilMs) => {
    if (sinceMs >= untilMs) {
        let greaterOrEqual;
        if (sinceMs === untilMs)
            greaterOrEqual = "equal to";
        if (sinceMs > untilMs)
            greaterOrEqual = "greater than";
        throw new types_1.InputError(`Parameter ${chalk_1.default.bold.underline("since")} cannot be ${greaterOrEqual} parameter ${chalk_1.default.bold.underline("until")}`);
    }
};
const checkPeriod = (exchange, period) => {
    const allowedPeriods = Object.keys(exchange.timeframes);
    if (!allowedPeriods.includes(period)) {
        throw new types_1.InputError(`Period ${chalk_1.default.bold.underline(period)} does not exist on exchange ${chalk_1.default.bold.underline(exchange.name)} \n
			Allowed periods: ${allowedPeriods}
			`);
    }
};
const checkPair = (exchange, pair) => __awaiter(void 0, void 0, void 0, function* () {
    yield exchange.loadMarkets();
    const allowedPairs = Object.keys(exchange.markets);
    if (!allowedPairs.includes(pair)) {
        throw new types_1.InputError(`Pair ${chalk_1.default.bold.underline(pair)} does not exist on exchange
			${chalk_1.default.bold.underline(exchange.name)} \n
			Allowed pairs: ${allowedPairs}`);
    }
});
const checkRecordLimit = (exchange, recordLimit) => {
    if (recordLimit > exchange.historicalRecordLimit) {
        throw new types_1.InputError(`Record limit ${chalk_1.default.bold.underline(recordLimit)} must be less than the
			internal limit for ${exchange.name}: ${exchange.historicalRecordLimit}`);
    }
};
const validateOptions = (exchange, backfillOptions) => __awaiter(void 0, void 0, void 0, function* () {
    const { sinceMs, untilMs, period, pair, recordLimit } = backfillOptions;
    compareSinceAndUntil(sinceMs, untilMs);
    checkPeriod(exchange, period);
    checkRecordLimit(exchange, recordLimit);
    yield checkPair(exchange, pair);
});
exports.default = validateOptions;
