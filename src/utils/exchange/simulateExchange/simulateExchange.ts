import { Balances } from "ccxt";
import {
	ExchangeID,
	SimulatedExchangeStore,
	SimulatedExchangeResult,
	SimulatedExchange,
} from "../../../types/";
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
import { createExchange } from "../../../utils";
import { createFillOrders, createUpdateContext } from "./controlMethods";

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

	balance = Object.assign({}, balance)
	balance.info = {...balance}

	return balance;
};

const simulateExchange = (
	exchangeId: ExchangeID,
	initialBalance: InitialBalance
): SimulatedExchangeResult => {
	const originalExchange = createExchange(exchangeId);

	let store: SimulatedExchangeStore = {
		currentTime: 0,
		currentPrice: 0,
		openOrders: [],
		closedOrders: [],
		errors: [],
		balance: createInitalBalance(initialBalance),
	};

	const exchange: SimulatedExchange = {
		...originalExchange,
		simulated: true,
		has: {
			...originalExchange["has"],
			createOrder: "simulated",
			editOrder: "simulated",
			cancelOrder: "simulated",
			fetchBalance: "simulated",
			fetchOrder: "simulated",
			fetchOrders: "simulated",
			fetchOpenOrders: "simulated",
			fetchClosedOrders: "simulated",
			fetchMyTrades: "simulated",
		},
		createOrder: createCreateOrder(store, originalExchange),
		editOrder: createEditOrder(store, originalExchange),
		cancelOrder: createCancelOrder(store),
		fetchBalance: createFetchBalance(store),
		fetchOrder: createFetchOrder(store),
		fetchOrders: createFetchOrders(store),
		fetchOpenOrders: createFetchOpenOrders(store),
		fetchClosedOrders: createFetchClosedOrders(store),
		fetchMyTrades: createFetchMyTrades(store)
	};


	const fillOrders = createFillOrders(store);
	const updateContext = createUpdateContext(store);

	return {
		exchange,
		store,
		updateContext,
		fillOrders,
	};
};

export default simulateExchange;
