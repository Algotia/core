import { Exchange as CCXT_Exchange, OHLCV } from "ccxt";
import { Exchange } from "../../types";

type FetchOHLCV = CCXT_Exchange["fetchOHLCV"];

const createFetchOHLCV = (derviedExchange?: Exchange): FetchOHLCV => {
	return async (
		symbol: string,
		timeframe: string,
		since: number,
		limit: number
	): Promise<OHLCV[]> => {
		try {
			if (derviedExchange) {
				return await derviedExchange.fetchOHLCV(
					symbol,
					timeframe,
					since,
					limit
				);
			}
			return [];
		} catch (err) {
			throw err;
		}
	};
};

export default createFetchOHLCV;
