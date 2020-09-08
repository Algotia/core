import { ObjectId, MongoClient } from "mongodb";
import { OHLCV } from "../shared";
import { Balances, Order, Exchange } from "ccxt";
import { Tedis } from "tedis";

type SyncStrategy = (
	exchange: Exchange | BacktestingExchange,
	data: OHLCV
) => void;
type AsyncStrategy = (
	exchange: Exchange | BacktestingExchange,
	data: OHLCV
) => Promise<void>;

type Strategy = SyncStrategy | AsyncStrategy;

interface BaseAndQuoteBalances {
	base: number;
	quote: number;
}

export interface BacktestInput {
	name?: string;
	backfillName: string;
	strategy: Strategy;
	initialBalance: BaseAndQuoteBalances;
}

export interface BaseAndQuoteCurrencies {
	base: string;
	quote: string;
}

export interface ProcessedBacktestOptions extends BacktestInput {
	baseAndQuote: BaseAndQuoteCurrencies;
	backfillId: ObjectId;
	name: string;
}

export interface PrivateApi {
	createOrder: CreateOrder;
	fetchBalance: FetchBalance;
	fetchOrders: FetchOrders;
}

export interface PublicApi {
	fetchMarkets: typeof Exchange.prototype.fetchMarkets;
	fetchCurrencies: typeof Exchange.prototype.fetchCurrencies;
	fetchTradingLimits?: typeof Exchange.prototype.fetchTradingLimits;
	fetchTradingFees?: typeof Exchange.prototype.fetchTradingFees;
	fetchTicker: typeof Exchange.prototype.fetchTicker;
	fetchOrderBook: typeof Exchange.prototype.fetchOrderBook;
	fetchOHLCV: typeof Exchange.prototype.fetchOHLCV;
	loadMarkets: typeof Exchange.prototype.loadMarkets;
}

export interface BacktestingExchange extends PrivateApi, PublicApi {}

export interface MethodFactoryArgs {
	mongoClient: MongoClient;
	redisClient: Tedis;
	exchange: Exchange;
}

export enum PrivateApiIds {
	FetchBalance = "fetchBalance",
	CreateOrder = "createOrder",
	CancelOrder = "cancelOrder",
	FetchOrders = "fetchOrders"
}

export type PartialOrder = Partial<Order>;

export type FetchOrders = (
	symbol?: string,
	since?: number,
	limit?: number,
	params?: {}
) => Promise<PartialOrder[]>;
export type FetchBalance = () => Promise<Balances>;

export type CreateOrder = (
	symbol: string,
	type: string,
	side: "buy" | "sell",
	amount: number,
	price?: number,
	params?: {
		clientOrderId: string;
	}
) => Promise<PartialOrder>;

export interface BacktestDocument {
	name: string;
	backfillId: ObjectId;
	orders: Order[];
	balance: Balances;
}
