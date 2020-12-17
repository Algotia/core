import { Balances, Exchange as CCXT_Exchange } from "ccxt";
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
import { createExchange } from "../createExchange";

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
	derviesFrom?: ExchangeID;
	fees?: SimulatedExchange["fees"];
}

const simulateExchange = (
	options: SimulatedExchangeOptions
): SimulatedExchangeResult => {
	const { initialBalance } = options;

	let derviesFrom: ExchangeID, derviedExchange: Exchange;

	if (options && options.derviesFrom) {
		derviesFrom = options.derviesFrom;
		derviedExchange = createExchange(derviesFrom);
		options.fees = derviedExchange.fees as Fees;
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
		derviesFrom,
		rateLimit: 0,
		OHLCVRecordLimit: 1000,
		simulated: true,
		fees: optionsWithDefauls.fees,
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
		},
		fetchOHLCV: createFetchOHLCV(derviedExchange),
		fetchOrderBook: createFetchOrderBook(store, derviedExchange),
		createOrder: createCreateOrder(store, optionsWithDefauls.fees),
		editOrder: createEditOrder(store, optionsWithDefauls.fees),
		cancelOrder: createCancelOrder(store),
		fetchBalance: createFetchBalance(store),
		fetchOrder: createFetchOrder(store),
		fetchOrders: createFetchOrders(store),
		fetchOpenOrders: createFetchOpenOrders(store),
		fetchClosedOrders: createFetchClosedOrders(store),
		fetchMyTrades: createFetchMyTrades(store),
		loadMarkets: null,
	};

	if (derviesFrom) {
		exchange["derviesFrom"] = derviesFrom;
		exchange.has["loadMarkets"] = derviedExchange.has["loadMarkets"];
		exchange.has["fetchOHLCV"] = derviedExchange.has["fetchOHLCV"];
		exchange.has["fetchOrderBook"] = derviedExchange.has["fetchOrderBook"];
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
