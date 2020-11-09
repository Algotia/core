import { Balances } from "ccxt";
import { ExchangeID, SimulatedExchangeStore, SimulatedExchangeResult } from "../../../types/";
import { createExchange } from "../../../utils";
import { createCreateOrder } from "./methods";
import { fillOrders } from "./helpers";

type InitialBalance = Record<string, number>

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

const simulateExchange = (
	exchangeId: ExchangeID,
	initialBalance: InitialBalance
): SimulatedExchangeResult => {
	const exchange = createExchange(exchangeId);

	let store: SimulatedExchangeStore = {
		currentTime: 0,
		currentPrice: 0,
		openOrders: [],
		closedOrders: [],
		errors: [],
		balance: createInitalBalance(initialBalance),
	};

	// Override 'has' with "simulated" for simulated method
	
	// Override methods
	exchange.createOrder = createCreateOrder(store, exchange);
	exchange.has.createOrder = "simulated"

	//TODO: Simulate the following:
	// fetchBalance
	// fetchOrder
	// fetchOrders
	// fetchOpenOrers
	// fetchClosedOrders
	// fetchMyTrades

	// Helper Methods
	const updateContext = (time: number, price: number) => {
		store.currentTime = time;
		store.currentPrice = price;
	};

	return {
		exchange,
		store,
		updateContext,
		fillOrders
	};
};

export default simulateExchange;
