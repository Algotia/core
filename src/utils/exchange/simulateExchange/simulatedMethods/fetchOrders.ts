import { Exchange as CCXT_Exchange, Params } from "ccxt";
import { Order, SimulatedExchangeStore } from "../../../../types";

type FetchOrders = CCXT_Exchange["fetchOrders"];

const createFetchOrders = (store: SimulatedExchangeStore): FetchOrders => {
	return async (
		symbol?: string,
		since?: number,
		limit?: number,
		params?: Params
	): Promise<Order[]> => {
		return store.openOrders.concat(store.closedOrders)
	};
};

export default createFetchOrders
