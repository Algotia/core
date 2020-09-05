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
const saveBacktest = (backtest, mongoClient) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const backtestCollection = yield utils_1.getBacktestCollection(mongoClient);
        const documentCount = yield backtestCollection.countDocuments();
        const backtestName = `backtest-${documentCount + 1}`;
        const backtestDocument = Object.assign(Object.assign({}, backtest), { name: backtestName });
        yield backtestCollection.insertOne(backtestDocument);
        return backtestDocument;
    }
    catch (err) {
        throw err;
    }
});
exports.default = saveBacktest;
