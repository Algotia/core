import { Exchange as CcxtExchange } from "ccxt";
export const AllowedExchanges = ["binance", "bitstamp"] as const;
export type AllowedExchangeId = typeof AllowedExchanges[number];

export class SingleExchange extends CcxtExchange {
	historicalRecordLimit?: number;
}

export type MultipleExchanges = {
	[key in AllowedExchangeId]: SingleExchange;
};

export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}
