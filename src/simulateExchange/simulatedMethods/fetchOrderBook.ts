import { Exchange as CCXT_Exchange, OrderBook, Params } from "ccxt";
import { Exchange, SimulatedExchangeStore } from "../../types";

type FetchOrderBook = CCXT_Exchange["fetchOrderBook"];

const createFetchOrderBook = (
	store: SimulatedExchangeStore,
	derviedExchange?: Exchange
): FetchOrderBook => {
	return async (
		symbol: string,
		limit?: number,
		params?: Params
	): Promise<OrderBook> => {
		if (derviedExchange) {
			return await derviedExchange.fetchOrderBook(symbol, limit, params);
		}
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
