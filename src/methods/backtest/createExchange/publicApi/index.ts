import { Exchange } from "ccxt";
import { PublicApi } from "../../../../types";

const createPublicApis = (exchange: Exchange): PublicApi => {
	const {
		fetchMarkets,
		fetchCurrencies,
		fetchTradingLimits,
		fetchTradingFees,
		fetchTicker,
		fetchOrderBook,
		fetchOHLCV,
		loadMarkets
	} = exchange;

	const requiredApis = {
		fetchMarkets,
		fetchCurrencies,
		fetchTicker,
		fetchOrderBook,
		fetchOHLCV,
		loadMarkets
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
