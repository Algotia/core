import { ExchangeID, OHLCV } from "../../types";
import { createExchange, parsePeriod } from "../../utils/";
import { OHLCV as CCXT_OHLCV } from "ccxt";

const fillEmptyCandles = (candles: OHLCV[], periodMs: number): OHLCV[] => {
	let fullRecordSet: OHLCV[] = [];
	for (let i = 0; i < candles.length; i++) {
		const thisCandle = candles[i];
		const aheadCandle = candles[i + 1];

		if (i === candles.length - 1) {
			fullRecordSet.push(thisCandle);
			continue;
		}

		fullRecordSet.push(thisCandle);

		function addCandle(candle1: OHLCV, candle2: OHLCV) {
			if (candle1.timestamp !== candle2.timestamp - periodMs) {
				const dummyCandle = {
					timestamp: candle1.timestamp + periodMs,
					...candle1,
				};

				fullRecordSet.push(dummyCandle);
				addCandle(dummyCandle, candle2);
			}
		}

		addCandle(thisCandle, aheadCandle);
	}
	return fullRecordSet;
};

const reshapeOHLCV = (rawCandles: CCXT_OHLCV[]): OHLCV[] => {
	return rawCandles.map((ohlcv) => {
		return {
			timestamp: ohlcv[0],
			open: ohlcv[1],
			high: ohlcv[2],
			low: ohlcv[3],
			close: ohlcv[4],
			volume: ohlcv[5],
		};
	});
};

const backfill = async (
	from: number,
	to: number,
	pair: string,
	period: string,
	exchangeId: ExchangeID
): Promise<OHLCV[]> => {
	try {
		const exchange = createExchange(exchangeId);
		const { periodMs, amount, unit } = parsePeriod(period);

		let recordsToFetch = Math.ceil((to - from) / periodMs);
		let candles: OHLCV[] = [];
		let timeCursor = from;
		let page = 0;

		while (recordsToFetch) {
			if (page) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
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
			timeCursor = completeOHLCV[completeOHLCV.length - 1].timestamp + periodMs;
			page++;

			candles.push(...completeOHLCV);
		}
		return candles;
	} catch (err) {
		throw err;
	}
};

export default backfill;
