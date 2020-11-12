import { OHLCV as CCXT_OHLCV } from "ccxt";
import { OHLCV } from "../../types";

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

export default reshapeOHLCV;
