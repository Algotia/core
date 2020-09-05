"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ccxt_1 = __importDefault(require("ccxt"));
const types_1 = require("../../types/");
const exchangeModifications = [
    {
        name: "historicalRecordLimit",
        binance: 1500,
        //bitfinex: 10000
        bitstamp: 1000
    }
];
const extendExchanges = (allowedExchanges) => {
    exchangeModifications.forEach((modification) => {
        const { name } = modification, exchanges = __rest(modification, ["name"]);
        for (const exchangeId in exchanges) {
            const exchange = allowedExchanges[exchangeId];
            exchange.prototype[name] = modification[exchangeId];
        }
    });
    return allowedExchanges;
};
const extractAllowedExchanges = (exchanges, ccxtOriginal) => {
    const exchangeArr = exchanges.map((exchange) => {
        return { [exchange]: ccxtOriginal[exchange] };
    });
    return Object.assign({}, ...exchangeArr);
};
const createExchangesArr = () => {
    return Object.values(types_1.AllowedExchangeIdsEnum);
};
const wrapCcxt = (ccxtOriginal) => {
    const allowedExchanges = createExchangesArr();
    const extractedExchanges = extractAllowedExchanges(allowedExchanges, ccxtOriginal);
    const extendedExchanges = extendExchanges(extractedExchanges);
    return Object.assign({ exchanges: allowedExchanges }, extendedExchanges);
};
const ccxt = wrapCcxt(ccxt_1.default);
exports.default = ccxt;
