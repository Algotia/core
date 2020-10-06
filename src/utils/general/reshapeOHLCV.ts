import { OHLCV as CcxtOHLCV } from "ccxt";
import { OHLCV } from "../../types/";

const reshapeOHLCV = (ohlcv: CcxtOHLCV[]): OHLCV[] => {
	return ohlcv.map((candle) => ({
		timestamp: candle[0],
		open: candle[1],
		high: candle[2],
		low: candle[3],
		close: candle[4],
		volume: candle[5],
	}));
};

export default reshapeOHLCV;
