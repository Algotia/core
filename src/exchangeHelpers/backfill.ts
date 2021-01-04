import { Exchange, OHLCV, SimulatedExchange } from "../types";
import { parsePeriod, reshapeOHLCV } from "../utils/";

/** If no candles were returned (e.g.: downtime, no volume), fill period with last known candle prices, with timestamp value incremented to create continuous time series */
const fillEmptyCandles = (candles: OHLCV[], periodMs: number): OHLCV[] => {
	if (!candles) return [];

	let fullCandleSet: OHLCV[] = [];

	let timeCursor = candles[0].timestamp;

	// Recursively add candles for empty periods
	const addCandle = (candle1: OHLCV, candle2: OHLCV) => {
		fullCandleSet.push(candle1);
		timeCursor += periodMs;
		if (!candle2) {
			return;
		}
		if (candle1.timestamp !== candle2.timestamp - periodMs) {
			const dummyCandle: OHLCV = {
				timestamp: timeCursor,
				open: candle1.open,
				high: candle1.high,
				low: candle1.low,
				close: candle1.close,
				volume: candle1.volume,
			};
			addCandle(dummyCandle, candle2);
		}
	};

	for (let i = 0; i < candles.length; i++) {
		const thisCandle = candles[i];
		const aheadCandle = candles[i + 1];
		addCandle(thisCandle, aheadCandle);
	}

	return fullCandleSet;
};

interface BackfillArgs {
	from: number;
	to: number;
	pair: string;
	period: string;
	exchange: Exchange | SimulatedExchange;
}
/** This helper function is a wrapper around the CCXT method fetchOHLCV. It handles pagination and filling periods where no candles were returned with dummy candles. */
const backfill = async (args: BackfillArgs): Promise<OHLCV[]> => {
	const { from, to, pair, period, exchange } = args;
	const { periodMs } = parsePeriod(period);

	let recordsToFetch = Math.ceil((to - from) / periodMs);
	let candles: OHLCV[] = [];
	let timeCursor = from;
	let page = 0;

	while (recordsToFetch > 0) {
		if (page) {
			// Sleep to avoid getting rate limited
			await new Promise((resolve) =>
				setTimeout(resolve, exchange.rateLimit)
			);
		}

		const limit =
			recordsToFetch > exchange.OHLCVRecordLimit
				? exchange.OHLCVRecordLimit
				: recordsToFetch;

		// Fetch records from exchange
		const rawOHLCV = await exchange.fetchOHLCV(
			pair,
			period,
			timeCursor,
			limit
		);

		const ohlcv = reshapeOHLCV(rawOHLCV);

		const completeOHLCV = fillEmptyCandles(ohlcv, periodMs);

		recordsToFetch -= completeOHLCV.length;

		const lastTimestamp = completeOHLCV[completeOHLCV.length - 1].timestamp;

		timeCursor = lastTimestamp + periodMs;

		page++;

		candles.push(...completeOHLCV);
	}

	return candles;
};

export default backfill;
