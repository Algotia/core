import { Exchange as CCXT_Exchange } from "ccxt";
import { Order, SimulatedExchangeStore } from "../../../../types";

type FetchOrder = CCXT_Exchange["fetchOrder"];

const createFetchOrder = (store: SimulatedExchangeStore): FetchOrder => {
	return async (id: string, symbol?: string): Promise<Order> => {
		try {
			const matchId = (order: Order) => {
				return order.id === id;
			};
			const openOrder = store.openOrders.find(matchId);
			if (openOrder) return openOrder;

			const closedOrder = store.closedOrders.find(matchId);
			if (closedOrder) return closedOrder;

			throw new Error(`Order with id ${id} not found`);
		} catch (err) {
			throw err;
		}
	};
};

export default createFetchOrder
