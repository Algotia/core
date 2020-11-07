import { Balances, Exchange as CCXTExchange, Order as CCXTOrder } from "ccxt";

export const AllowedExchangeIDs = ["binance", "kucoin"] as const;

export type ExchangeID = typeof AllowedExchangeIDs[number];

export interface ExchangeModifications {
	OHLCVRecordLimit: number;
}

export interface Exchange extends CCXTExchange, ExchangeModifications {}

export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface SimulatedExchangeStore {
	currentTime: number;
	currentPrice: number;
	balance: Balances;
	openOrders: Order[];
	closedOrders: Order[];
	errors: string[];
}

export interface Order extends CCXTOrder {
	type: "market" | "limit";
}

export type Strategy = (exchange: Exchange, data: OHLCV) => Promise<any>;

