import { parsePeriod, roundTime } from "../../../utils";
import { Exchange as CCXT_Exchange, OHLCV } from "ccxt";

type FetchOHLCV = CCXT_Exchange["fetchOHLCV"];

const createFetchOHLCV = (): FetchOHLCV => {
	return async (
		symbol: string,
		timeframe: string,
		since: number,
		limit: number
	): Promise<OHLCV[]> => {
		try {
			const { periodMs } = parsePeriod(timeframe);
			const nearestCandleToSince = roundTime(
				new Date(since),
				periodMs,
				"ceil"
			).getTime();

			let candles: OHLCV[] = [];
			let timeCursor = nearestCandleToSince;

			for (let i = 0; i < limit; i++) {
				const candle: OHLCV = [timeCursor, 1, 1, 1, 1, 1];
				candles.push(candle);
				timeCursor += periodMs;
			}

			const randomNum = Math.floor(Math.random() * 10);

			for (let i = 0; i < randomNum; i++) {
				const randomIndex = Math.floor(Math.random() * limit) + 1;
				candles.splice(randomIndex, 1);
			}

			return candles;
		} catch (err) {
			throw err;
		}
	};
};

export default createFetchOHLCV;
