import { Balances } from "ccxt";
import { Exchange, ExchangeID, SimulatedExchangeStore } from "../../types/";
import { createExchange } from "../../utils";
import { createCreateOrder } from "./simulatedMethods";

type InitialBalance = Record<string, number>;

interface SimulatedExchangeResult {
	store: SimulatedExchangeStore;
	exchange: Exchange;
}

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

	const simulatedExchange = Object.assign({}, exchange, {
		createOrder: createCreateOrder(store, exchange),
	});

	return {
		exchange: simulatedExchange,
		store,
	};
};

export default simulateExchange;
