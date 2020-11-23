import { OrderBook, Params } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../../types";

type FetchOrderBook = Exchange["fetchOrderBook"];

const createFetchOrderBook = (
	store: SimulatedExchangeStore
): FetchOrderBook => {
	return async (
		symbol: string,
		limit?: number,
		params?: Params
	): Promise<OrderBook> => {
		return {
			nonce: 0,
			datetime: new Date(store.currentTime).toISOString(),
			timestamp: store.currentTime,
			asks: [],
			bids: [],
		};
	};
};

export default createFetchOrderBook;
