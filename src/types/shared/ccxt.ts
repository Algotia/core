import { Exchange as CcxtRawExchange, OHLCV as CcxtOHLCV } from "ccxt";

export const AllowedExchanges = ["binance", "bittrex", "kucoin"] as const;

// bitstamp behavior (and probably others) are very close to
// being able to be supported. For bitstmap we must subtract
// 1ms from the since input for backfills because it fetches
// all records AFTER input not on or after

export type ExchangeID = typeof AllowedExchanges[number];

// Define exchange modifications here so that they exist
// on the object type
export type ExchangeModifications = {
	readonly OHLCVRecordLimit: number;
};

// Stronger typed class
export class CcxtExchange extends CcxtRawExchange {
	id: ExchangeID;
}

export interface Exchange extends CcxtExchange, ExchangeModifications {}

export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}
