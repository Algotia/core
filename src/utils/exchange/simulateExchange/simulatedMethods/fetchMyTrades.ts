import { Exchange as CCXT_Exchange, Params, Trade } from "ccxt";
import { SimulatedExchangeStore } from "../../../../types";

type FetchMyTrades = CCXT_Exchange["fetchMyTrades"];

const createFetchMyTrades = (store: SimulatedExchangeStore): FetchMyTrades => {
	return async (
		symbol?: string,
		since?: string,
		limit?: string,
		params?: Params
	): Promise<Trade[]> => {
		try {
			const withTrades = store.closedOrders.filter((order)=>{
				if (order.trades.length && order.trades.length > 0) {
					return order
				}
			})

			let allTrades: Trade[] = [];

			for (const order of withTrades) {
				for (const trade of order.trades) {
					allTrades.push(trade)
				}
			}

			return allTrades;

		} catch (err) {
			throw err;
		}
	};
};

export default createFetchMyTrades;

