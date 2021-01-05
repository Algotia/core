import { Exchange as CCXT_Exchange, OHLCV } from "ccxt";
import { Exchange } from "../../types";

type FetchOHLCV = CCXT_Exchange["fetchOHLCV"];

const createFetchOHLCV = (derviedExchange?: Exchange): FetchOHLCV => {
	if (derviedExchange) {
		return derviedExchange.fetchOHLCV;
	}
	return async (
		symbol: string,
		timeframe: string,
		since: number,
		limit: number
	): Promise<OHLCV[]> => {
		try {
			return [];
		} catch (err) {
			throw err;
		}
	};
};

export default createFetchOHLCV;
