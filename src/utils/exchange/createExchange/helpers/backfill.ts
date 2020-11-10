import { Exchange, OHLCV } from "../../../../types";
import { parsePeriod, reshapeOHLCV } from "../../../../utils/";

const fillEmptyCandles = (candles: OHLCV[], periodMs: number): OHLCV[] => {
	if (!candles) return [];

	let fullCandleSet: OHLCV[] = [];

	let timeCursor = candles[0].timestamp;

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

const backfill = async (
	from: number,
	to: number,
	pair: string,
	period: string,
	exchange: Exchange
): Promise<OHLCV[]> => {
	try {
		const { periodMs } = parsePeriod(period);

		let recordsToFetch = Math.ceil((to - from) / periodMs);
		let candles: OHLCV[] = [];
		let timeCursor = from;
		let page = 0;

		while (recordsToFetch > 0) {
			if (page) {
				await new Promise((resolve) =>
					setTimeout(resolve, exchange.rateLimit)
				);
			}

			const limit =
				recordsToFetch > exchange.OHLCVRecordLimit
					? exchange.OHLCVRecordLimit
					: recordsToFetch;

			const rawOHLCV = await exchange.fetchOHLCV(
				pair,
				period,
				timeCursor,
				limit
			);

			const ohlcv = reshapeOHLCV(rawOHLCV);

			const completeOHLCV = fillEmptyCandles(ohlcv, periodMs);

			recordsToFetch -= completeOHLCV.length;

			timeCursor =
				completeOHLCV[completeOHLCV.length - 1].timestamp + periodMs;
			page++;

			candles.push(...completeOHLCV);
		}
		return candles;
	} catch (err) {
		throw err;
	}
};

export default backfill;
