import { Balances } from "ccxt";
import { SimulatedExchangeStore } from "../../types";

//TODO: THIS METHOD IS A DUP OF simulateExchange:createInitalBalance
const createInitalBalance = (
	initialBalance: Record<string, number>
): Balances => {
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

	balance = Object.assign({}, balance);
	balance.info = { ...balance };

	return { ...balance };
};

const createFlushStore = (
	store: SimulatedExchangeStore,
	initialBalance: Record<string, number>
) => {
	return (): void => {
		store.balance = createInitalBalance(initialBalance);
		store.currentTime = 0;
		store.currentPrice = 0;
		store.openOrders = [];
		store.closedOrders = [];
		store.errors = [];
	};
};

export default createFlushStore;
