import { Exchange as CCXT_Exchange, Order as CCXT_Order, Balances } from "ccxt";

export const AllowedExchangeIDs = ["binance", "kucoin"] as const;

export type ExchangeID = typeof AllowedExchangeIDs[number];

export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export  interface Order extends CCXT_Order {
	type: "market" | "limit"
}
export interface SimulatedExchangeStore {
	currentTime: number;
	currentPrice: number;
	balance: Balances;
	openOrders: Order[];
	closedOrders: Order[];
	errors: string[];
}


export interface Exchange {
	// inherited static properties
	id: ExchangeID;
	fees: CCXT_Exchange["fees"];
	rateLimit: CCXT_Exchange["rateLimit"],
	// custom static properties
	OHLCVRecordLimit: number;
	// public methods
	fetchOrderBook: CCXT_Exchange["fetchOrderBook"];
	fetchOHLCV: CCXT_Exchange["fetchOHLCV"];
	// private methods
	fetchBalance: CCXT_Exchange["fetchBalance"];
	createOrder: CCXT_Exchange["createOrder"];
	fetchOrder: CCXT_Exchange["fetchOrder"];
	fetchOrders: CCXT_Exchange["fetchOrders"];
	fetchOpenOrers: CCXT_Exchange["fetchOpenOrders"];
	fetchClosedOrders: CCXT_Exchange["fetchClosedOrders"];
	fetchMyTrades: CCXT_Exchange["fetchMyTrades"];
	ccxt: CCXT_Exchange;
}
