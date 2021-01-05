import { OHLCV } from "../types";

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

export default fillEmptyCandles;
