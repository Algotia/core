import { Exchange } from "ccxt";

const createPublicApis = (exchange: Exchange) => {
	const {
		fetchMarkets,
		fetchCurrencies,
		fetchTradingLimits,
		fetchTradingFees,
		fetchTicker,
		fetchOrderBook,
		fetchTrades,
		fetchOHLCV
	} = exchange;

	const requiredApis = {
		fetchMarkets,
		fetchCurrencies,
		fetchTicker,
		fetchOrderBook,
		fetchTrades,
		fetchOHLCV
	};

	let addedApis = {};

	const addApi = (api: any) => (addedApis[api.name] = api);

	exchange.hasFetchTradingLimits && addApi(fetchTradingLimits);
	exchange.hasFetchTradingFees && addApi(fetchTradingFees);

	const publicApis = {
		...requiredApis,
		...addedApis
	};

	return publicApis;
};

export default createPublicApis;
