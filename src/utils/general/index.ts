import { OHLCV as CcxtOHLCV } from "ccxt";
import { OHLCV, isExchangeID, AnyAlgotia, Exchange } from "../../types/";

export const reshapeOHLCV = (ohlcv: CcxtOHLCV[]): OHLCV[] => {
	return ohlcv.map((candle) => ({
		timestamp: candle[0],
		open: candle[1],
		high: candle[2],
		low: candle[3],
		close: candle[4],
		volume: candle[5],
	}));
};

export const getDefaultExchange = (algotia: AnyAlgotia): Exchange => {
	const { config, exchanges } = algotia;
	const key = Object.keys(config.exchange)[0];
	if (isExchangeID(key)) {
		return exchanges[key];
	}
};
