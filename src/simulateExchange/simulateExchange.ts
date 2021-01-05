import { Balances } from "ccxt";
import {
	SimulatedExchangeStore,
	SimulatedExchangeResult,
	SimulatedExchange,
	ExchangeID,
	Fees,
	Exchange,
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

type InitialBalance = Record<string, number>;

const createInitalBalance = (initialBalance: InitialBalance): Balances => {
	let balance: Balances;

	const keys = Object.keys(initialBalance);

	for (const currency of keys) {
		balance = Object.assign({}, balance, {
			[currency]: {
				free: initialBalance[currency],
				used: 0,
				total: initialBalance[currency],
			},
		});
	}

	balance.info = { ...balance };

	return balance;
};

interface SimulatedExchangeOptions {
	initialBalance: InitialBalance;
	derviesFrom?: Exchange;
	fees?: SimulatedExchange["fees"];
}

const simulateExchange = (
	options: SimulatedExchangeOptions
): SimulatedExchangeResult => {
	const { initialBalance } = options;

	let derviesFrom: Exchange;

	if (options && options.derviesFrom) {
		derviesFrom = options.derviesFrom;
		options.fees = derviesFrom.fees as Fees;
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
		balance: createInitalBalance(initialBalance),
	};

	const exchange: SimulatedExchange = {
		id: "simulated",
		rateLimit: 0,
		OHLCVRecordLimit: 1000,
		simulated: true,
		fees: optionsWithDefauls.fees,
		symbols: null,
		markets: null,
		timeframes: null,
		has: {
			fetchOHLCV: "simulated",
			fetchOrderBook: "simulated",
			createOrder: "simulated",
			editOrder: "simulated",
			cancelOrder: "simulated",
			fetchBalance: "simulated",
			fetchOrder: "simulated",
			fetchOrders: "simulated",
			fetchOpenOrders: "simulated",
			fetchClosedOrders: "simulated",
			fetchMyTrades: "simulated",
			loadMarkets: false,
			fetchStatus: false,
		},
		fetchOHLCV: createFetchOHLCV(derviesFrom),
		fetchOrderBook: createFetchOrderBook(store, derviesFrom),
		createOrder: createCreateOrder(
			store,
			optionsWithDefauls.fees,
			derviesFrom
		),
		editOrder: createEditOrder(store, optionsWithDefauls.fees),
		cancelOrder: createCancelOrder(store),
		fetchBalance: createFetchBalance(store),
		fetchOrder: createFetchOrder(store),
		fetchOrders: createFetchOrders(store),
		fetchOpenOrders: createFetchOpenOrders(store),
		fetchClosedOrders: createFetchClosedOrders(store),
		fetchMyTrades: createFetchMyTrades(store),
		fetchStatus: null,
		loadMarkets: null,
	};

	if (derviesFrom) {
		// set static props
		exchange["derviesFrom"] = derviesFrom.id as ExchangeID;
		exchange["symbols"] = derviesFrom.symbols;
		exchange["markets"] = derviesFrom.markets;
		exchange["timeframes"] = derviesFrom.timeframes;

		// set 'has' props
		exchange.has["fetchStatus"] = derviesFrom.has["fetchStatus"];
		exchange.has["loadMarkets"] = derviesFrom.has["loadMarkets"];
		exchange.has["fetchOHLCV"] = derviesFrom.has["fetchOHLCV"];
		exchange.has["fetchOrderBook"] = derviesFrom.has["fetchOrderBook"];

		// set methods
		// Note: fetchOHLCV and fetchOrderBook handle this in their factory functions
		exchange.fetchStatus = derviesFrom.fetchStatus;
		exchange["loadMarkets"] = async () => {
			const markets = await derviesFrom.loadMarkets();
			exchange["markets"] = markets;
			exchange["symbols"] = Object.keys(markets);
			return markets;
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
