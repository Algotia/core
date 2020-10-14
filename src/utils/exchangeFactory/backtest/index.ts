import {
	Exchange,
	AnyAlgotia,
	BackfillOptions,
	BacktestingExchange,
} from "../../../types";
import createFetchBalance from "./fetchBalance";
import createCreateOrder from "./createOrder";
import createCancelOrder from "./cancelOrder";

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
		fetchMarkets: exchange.fetchMarkets.bind(exchange),
		fetchCurrencies: exchange.fetchCurrencies.bind(exchange),
		fetchTicker: exchange.fetchTicker.bind(exchange),
		fetchOrderBook: exchange.fetchOrderBook.bind(exchange),
		fetchTrades: exchange.fetchTrades.bind(exchange),
		fetchOHLCV: exchange.fetchOHLCV.bind(exchange),
		// PRIVATE API
		fetchBalance: createFetchBalance(algotia, options, exchange),
		createOrder: createCreateOrder(algotia, options, exchange),
		cancelOrder: createCancelOrder(algotia, options, exchange),
		editOrder: exchange.editOrder,
		fetchOrder: exchange.fetchOrder,
		fetchOpenOrders: exchange.fetchOpenOrders,
		fetchOrders: exchange.fetchOrders,
		fetchMyTrades: exchange.fetchMyTrades,
	};

	return backtestingExchange;
}

export default backtestExchangeFactory;
