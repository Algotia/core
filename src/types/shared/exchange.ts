import { Exchange as CCXT_Exchange, Order, Balances } from "ccxt";

export const AllowedExchangeIDs = ["binance", "kucoin", "bitfinex"] as const;

export type ExchangeID = typeof AllowedExchangeIDs[number];

export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

interface ExchangeMethods {
	fetchStatus: CCXT_Exchange["fetchStatus"];
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
	loadMarkets: CCXT_Exchange["loadMarkets"];
}

export interface Fees {
	trading: {
		tierBased: boolean;
		percentage: boolean;
		taker: number;
		maker: number;
	};
}

// Static exchange props
export interface Exchange<ID extends ExchangeID | "simulated" = ExchangeID>
	extends ExchangeMethods {
	id: ID;
	OHLCVRecordLimit: number;
	fees: CCXT_Exchange["fees"];
	rateLimit: CCXT_Exchange["rateLimit"];
	has: Record<keyof ExchangeMethods, boolean | "simulated" | "emulated">;
	symbols: CCXT_Exchange["symbols"];
	markets: CCXT_Exchange["markets"];
	timeframes: CCXT_Exchange["timeframes"];
}

export interface SimulatedExchange extends Exchange {
	simulated: true;
	fees: Fees;
	derviesFrom?: ExchangeID;
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
	flushStore: () => void;
	store: SimulatedExchangeStore;
	exchange: SimulatedExchange;
}
