import {
	BackfillOptions,
	SingleBackfillOptions,
	MultiBackfillOptions,
	SingleBackfillSet,
	MultiBackfillSet,
} from "./backfill";
import { Exchange } from "../index";
import { ExchangeRecord } from ".";
import { OHLCV } from "../shared";
import { Balances, Order } from "ccxt";

export interface BaseAndQuoteCurrencies {
	[key: string]: number;
}

export type SingleInitialBalance = BaseAndQuoteCurrencies;

type SingleSyncStrategy = (exchange: BacktestingExchange, data: OHLCV) => void;
type SingleAsyncStrategy = (
	exchange: BacktestingExchange,
	data: OHLCV
) => Promise<void>;

export type SingleStrategy = SingleSyncStrategy | SingleAsyncStrategy;

export interface SingleBacktestOptions extends SingleBackfillOptions {
	initialBalance: SingleInitialBalance;
	strategy: SingleStrategy;
}

export interface MultiBacktestOptions extends MultiBackfillOptions {
	initialBalance: ExchangeRecord<SingleInitialBalance>;
}

export interface SingleBacktestResults {
	options: SingleBackfillOptions;
	balance: Balances;
	openOrders: Order[];
	closedOrders: Order[];
	errors: string[];
}

type SupportedBackfillMethods =
	| "id"
	| "name"
	| "OHLCVRecordLimit"
	| "fees"
	| "countries"
	| "urls"
	| "version"
	| "has"
	| "timeframes"
	| "timeout"
	| "rateLimit"
	| "userAgent"
	| "headers"
	| "markets"
	| "symbols"
	| "currencies"
	| "marketsById"
	| "proxy"
	| "apiKey"
	| "secret"
	| "password"
	| "uid"
	| "requiredCredentials"
	| "options"
	| "fetchMarkets"
	| "fetchCurrencies"
	| "fetchTicker"
	| "fetchOrderBook"
	| "fetchTrades"
	| "fetchOHLCV"
	| "fetchBalance"
	| "createOrder"
	| "cancelOrder"
	| "editOrder"
	| "fetchOrder"
	| "fetchOpenOrders"
	| "fetchOrders"
	| "fetchMyTrades";

export type BacktestingExchange = Pick<Exchange, SupportedBackfillMethods>;
