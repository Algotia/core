import { OHLCV as CcxtOHLCV } from "ccxt";
import { OHLCV } from "../../types/";

const reshapeOHLCV = (ohlcv: CcxtOHLCV[], periodMS: number): OHLCV[] => {
	let candles: OHLCV[] = [];

	for (let i = 0; i < ohlcv.length; i++) {
		const record = ohlcv[i];
		if (i !== 0) {
			if (record[0] !== candles[i - 1].timestamp + periodMS) {
				candles[i] = {
					timestamp: candles[i - 1].timestamp + periodMS,
					open: candles[i - 1].open,
					high: candles[i - 1].high,
					low: candles[i - 1].low,
					close: candles[i - 1].close,
					volume: 0,
				};
				continue;
			}
		}
		candles[i] = {
			timestamp: record[0],
			open: record[1],
			high: record[2],
			low: record[3],
			close: record[4],
			volume: record[5],
		};
	}
	return candles;
};

export default reshapeOHLCV;
