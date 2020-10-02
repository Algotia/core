import { Exchange as CcxtRawExchange, OHLCV as CcxtOHLCV } from "ccxt";

export const AllowedExchanges = [
	"binance",
	"bitstamp",
	"bittrex",
	"kucoin",
] as const;

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
	high: number;
	low: number;
	close: number;
	volume: number;
}
