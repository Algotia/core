import { createInitialBalance } from "../utils";
import {
	SimulatedExchangeStore,
	SimulatedExchangeResult,
	SimulatedExchange,
	ExchangeID,
	Fees,
	Exchange,
	InitialBalance,
} from "../types/";
import {
	createCancelOrder,
	createCreateOrder,
	createEditOrder,
	createFetchBalance,
	createFetchClosedOrders,
	createFetchMyTrades,
	createFetchOpenOrders,
	createFetchOrder,
	createFetchOrders,
} from "./simulatedMethods";
import {
	createFillOrders,
	createFlushStore,
	createUpdateContext,
} from "./controlMethods";
import createFetchOHLCV from "./simulatedMethods/fetchOHLCV";
import createFetchOrderBook from "./simulatedMethods/fetchOrderBook";

interface SimulatedExchangeOptions {
	initialBalance: InitialBalance;
	derviesFrom?: Exchange;
	fees?: SimulatedExchange["fees"];
}

const simulateExchange = (
	options: SimulatedExchangeOptions
): SimulatedExchangeResult => {
	const { initialBalance } = options;

	let derivesFrom: Exchange;

	if (options && options.derviesFrom) {
		derivesFrom = options.derviesFrom;
		options.fees = derivesFrom.fees as Fees;
	}

	const defaultOptions: SimulatedExchangeOptions = {
		initialBalance,
		fees: {
			trading: {
				tierBased: false,
				percentage: true,
				taker: 0.001,
				maker: 0.001,
			},
		},
	};

	const optionsWithDefauls = Object.assign({}, defaultOptions, options);

	let store: SimulatedExchangeStore = {
		currentTime: 0,
		currentPrice: 0,
		openOrders: [],
		closedOrders: [],
		errors: [],
		balance: createInitialBalance(initialBalance),
	};

	const exchange: SimulatedExchange = {
		id: derivesFrom ? derivesFrom.id : ("simulated" as ExchangeID),
		rateLimit: 0,
		OHLCVRecordLimit: 1000,
		simulated: true,
		fees: optionsWithDefauls.fees,
		symbols: derivesFrom ? derivesFrom.symbols : null,
		markets: derivesFrom ? derivesFrom.markets : null,
		currencies: derivesFrom ? derivesFrom.currencies : null,
		timeframes: derivesFrom ? derivesFrom.timeframes : null,
		has: {
			createOrder: "simulated",
			editOrder: "simulated",
			cancelOrder: "simulated",
			fetchBalance: "simulated",
			fetchOrder: "simulated",
			fetchOrders: "simulated",
			fetchOpenOrders: "simulated",
			fetchClosedOrders: "simulated",
			fetchMyTrades: "simulated",
			fetchOHLCV: derivesFrom
				? derivesFrom.has["fetchOHLCV"]
				: "simulated",
			fetchOrderBook: derivesFrom
				? derivesFrom.has["fetchOrderBook"]
				: "simulated",
			loadMarkets: derivesFrom ? derivesFrom.has["loadMarkets"] : false,
			fetchStatus: derivesFrom ? derivesFrom.has["fetchStatus"] : false,
			fetchCurrencies: derivesFrom
				? derivesFrom.has["fetchCurrencies"]
				: false,
		},
		fetchOHLCV: createFetchOHLCV(derivesFrom),
		fetchOrderBook: createFetchOrderBook(store, derivesFrom),
		createOrder: createCreateOrder(
			store,
			optionsWithDefauls.fees,
			derivesFrom
		),
		editOrder: createEditOrder(store, optionsWithDefauls.fees),
		cancelOrder: createCancelOrder(store),
		fetchBalance: createFetchBalance(store),
		fetchOrder: createFetchOrder(store),
		fetchOrders: createFetchOrders(store),
		fetchOpenOrders: createFetchOpenOrders(store),
		fetchClosedOrders: createFetchClosedOrders(store),
		fetchMyTrades: createFetchMyTrades(store),
		fetchCurrencies: derivesFrom ? derivesFrom.fetchCurrencies : null,
		fetchStatus: derivesFrom ? derivesFrom.fetchStatus : null,
		loadMarkets: null,
	};

	if (derivesFrom) {
		exchange.derviesFrom = derivesFrom.id;
		exchange.loadMarkets = async () => {
			await derivesFrom.loadMarkets();
			exchange.markets = derivesFrom.markets;
			exchange.symbols = derivesFrom.symbols;
			exchange.currencies = derivesFrom.currencies;
			return exchange.markets;
		};
	}

	const fillOrders = createFillOrders(store);
	const updateContext = createUpdateContext(store);
	const flushStore = createFlushStore(store, initialBalance);

	return {
		exchange,
		store,
		updateContext,
		fillOrders,
		flushStore,
	};
};

export default simulateExchange;
