import { Exchange as CCXT_Exchange, OrderBook, Params } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../types";

type FetchOrderBook = CCXT_Exchange["fetchOrderBook"];

const createFetchOrderBook = (
	store: SimulatedExchangeStore,
	derviedExchange?: Exchange
): FetchOrderBook => {
	if (derviedExchange) {
		return derviedExchange.fetchOrderBook;
	}
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
