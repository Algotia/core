import { Exchange } from "../../types";
import { MongoClient } from "mongodb";
import { getBacktestCollection } from "../../utils";

const createBacktestingExchange = (exchange: Exchange, client: MongoClient) => {
	// --- PUBLIC API ---
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

	const knownApis = {
		fetchMarkets,
		fetchCurrencies,
		fetchTicker,
		fetchOrderBook,
		fetchTrades,
		fetchOHLCV
	};

	let addedApis = {};

	const addApi = (api) => (addedApis[api.name] = api);

	exchange.hasFetchTradingLimits && addApi(fetchTradingLimits);
	exchange.hasFetchTradingFees && addApi(fetchTradingFees);

	const publicApis = {
		...knownApis,
		...addedApis
	};

	// --- END PUBLIC API ---
	//
	// --- PRIVATE API ---

	const fetchBalance = async () => {
		const backtestCollection = await getBacktestCollection(client);
		const thisBackfill = await backtestCollection.findOne({ active: true });

		return thisBackfill.balance;
	};

	const privateApi = {
		fetchBalance
	};
	// --- END PRIVATE API ---
	const backtestExchange = {
		...publicApis,
		...privateApi
	};

	return backtestExchange;
};

export default createBacktestingExchange;
