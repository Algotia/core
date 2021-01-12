import { InitialBalance, SimulatedExchangeStore } from "../../types";
import { createInitialBalance } from "../../utils";

const createFlushStore = (
	store: SimulatedExchangeStore,
	initialBalance: InitialBalance
) => {
	return (): void => {
		store.balance = createInitialBalance(initialBalance);
		store.currentTime = 0;
		store.currentPrice = 0;
		store.openOrders = [];
		store.closedOrders = [];
		store.errors = [];
	};
};

export default createFlushStore;
