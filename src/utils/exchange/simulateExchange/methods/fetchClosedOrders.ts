import { Exchange as CCXT_Exchange, Params } from "ccxt";
import { Order, SimulatedExchangeStore } from "../../../../types";

type FetchOpenOrders = CCXT_Exchange["fetchOpenOrders"];

const createFetchClosedOrders = (store: SimulatedExchangeStore): FetchOpenOrders => {
	return async (
		symbol?: string,
		since?: number,
		limit?: number,
		params?: Params
	): Promise<Order[]> => {
		return store.closedOrders
	};
};

export default createFetchClosedOrders
