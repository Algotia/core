import {
	Exchange,
	AnyAlgotia,
	BackfillOptions,
	BacktestingExchange,
} from "../../../types";
import createFetchBalance from "./fetchBalance";
import createCreateOrder from "./createOrder";

function backtestExchangeFactory(
	algotia: AnyAlgotia,
	options: BackfillOptions,
	exchange: Exchange
): BacktestingExchange {
	const backtestingExchange: BacktestingExchange = {
		id: exchange.id,
		name: exchange.name,
		OHLCVRecordLimit: exchange.OHLCVRecordLimit,
		fees: exchange.fees,
		countries: exchange.countries,
		urls: exchange.urls,
		version: exchange.version,
		has: exchange.has,
		timeframes: exchange.timeframes,
		timeout: exchange.timeout,
		rateLimit: exchange.rateLimit,
		userAgent: exchange.userAgent,
		headers: exchange.headers,
		markets: exchange.markets,
		symbols: exchange.symbols,
		currencies: exchange.currencies,
		marketsById: exchange.marketsById,
		proxy: exchange.proxy,
		apiKey: exchange.apiKey,
		secret: exchange.secret,
		password: exchange.password,
		uid: exchange.uid,
		requiredCredentials: exchange.requiredCredentials,
		options: exchange.options,
		// PUBLIC API
		fetchMarkets: exchange.fetchMarkets,
		fetchCurrencies: exchange.fetchCurrencies,
		fetchTicker: exchange.fetchTicker,
		fetchOrderBook: exchange.fetchOrderBook,
		fetchTrades: exchange.fetchTrades,
		fetchOHLCV: exchange.fetchOHLCV.bind(exchange),
		// PRIVATE API
		fetchBalance: createFetchBalance(algotia, options, exchange),
		createOrder: createCreateOrder(algotia, options, exchange),
		cancelOrder: exchange.cancelOrder,
		editOrder: exchange.editOrder,
		fetchOrder: exchange.fetchOrder,
		fetchOpenOrders: exchange.fetchOpenOrders,
		fetchOrders: exchange.fetchOrders,
		fetchMyTrades: exchange.fetchMyTrades,
	};

	return backtestingExchange;
}

export default backtestExchangeFactory;
