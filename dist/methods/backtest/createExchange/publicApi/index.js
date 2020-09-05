"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createPublicApis = (exchange) => {
    const { fetchMarkets, fetchCurrencies, fetchTradingLimits, fetchTradingFees, fetchTicker, fetchOrderBook, fetchOHLCV, loadMarkets } = exchange;
    const requiredApis = {
        fetchMarkets,
        fetchCurrencies,
        fetchTicker,
        fetchOrderBook,
        fetchOHLCV,
        loadMarkets
    };
    let addedApis = {};
    const addApi = (api) => (addedApis[api.name] = api);
    exchange.hasFetchTradingLimits && addApi(fetchTradingLimits);
    exchange.hasFetchTradingFees && addApi(fetchTradingFees);
    const publicApis = Object.assign(Object.assign({}, requiredApis), addedApis);
    return publicApis;
};
exports.default = createPublicApis;
