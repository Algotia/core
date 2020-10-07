import { BackfillOptions, SingleBackfillOptions } from "./backfill";
import { Exchange } from "../index";

export interface BaseAndQuoteCurrencies {
	[key: string]: number;
}

export type SingleInitialBalance = BaseAndQuoteCurrencies;

export interface BacktestOptions extends BackfillOptions {}

export interface SingleBacktestOptions extends SingleBackfillOptions {
	initialBalance: SingleInitialBalance;
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
