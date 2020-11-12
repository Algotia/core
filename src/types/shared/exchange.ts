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

export interface Order extends CCXT_Order {
	type: "market" | "limit";
}

interface ExchangeMethods {
	fetchOrderBook: CCXT_Exchange["fetchOrderBook"];
	fetchOHLCV: CCXT_Exchange["fetchOHLCV"];
	fetchBalance: CCXT_Exchange["fetchBalance"];
	createOrder: CCXT_Exchange["createOrder"];
	cancelOrder: CCXT_Exchange["cancelOrder"];
	editOrder: CCXT_Exchange["editOrder"];
	fetchOrder: CCXT_Exchange["fetchOrder"];
	fetchOrders: CCXT_Exchange["fetchOrders"];
	fetchOpenOrders: CCXT_Exchange["fetchOpenOrders"];
	fetchClosedOrders: CCXT_Exchange["fetchClosedOrders"];
	fetchMyTrades: CCXT_Exchange["fetchMyTrades"];
}


export interface Exchange extends ExchangeMethods  {
	ccxt: CCXT_Exchange;
	id: ExchangeID;
	OHLCVRecordLimit: number;
	fees: CCXT_Exchange["fees"];
	rateLimit: CCXT_Exchange["rateLimit"];
	has: Record<keyof ExchangeMethods, boolean | "simulated" | "emulated">;
}

export interface SimulatedExchange extends Exchange  {
	simulated: true
}

export interface SimulatedExchangeStore {
	currentTime: number;
	currentPrice: number;
	balance: Balances;
	openOrders: Order[];
	closedOrders: Order[];
	errors: string[];
}

export interface SimulatedExchangeResult {
	fillOrders: (candle: OHLCV) => void;
	updateContext: (time: number, price: number) => void;
	store: SimulatedExchangeStore;
	exchange: SimulatedExchange;
}
