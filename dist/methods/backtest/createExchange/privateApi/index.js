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
const utils_1 = require("../../../../utils");
const methods_1 = __importDefault(require("./methods/"));
const createPrivateApis = (exchange, client, redisClient) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const backfill = yield utils_1.getBackfillCollection(client);
        const backtest = yield utils_1.getBacktestCollection(client);
        const collections = { backtest, backfill };
        const methodFactoryArgs = {
            redisClient,
            collections,
            exchange
        };
        //TODO: Do this more dynamically
        //const cancelOrder = privateApiFactories.cancelOrder(methodFactoryArgs);
        const createOrder = methods_1.default.createOrder(methodFactoryArgs);
        const fetchOrders = methods_1.default.fetchOrders(methodFactoryArgs);
        const fetchBalance = methods_1.default.fetchBalance(methodFactoryArgs);
        const privateApis = {
            //cancelOrder,
            createOrder,
            fetchOrders,
            fetchBalance
        };
        return privateApis;
    }
    catch (err) {
        throw err;
    }
});
exports.default = createPrivateApis;
