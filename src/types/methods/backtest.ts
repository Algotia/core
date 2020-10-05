import { ObjectId, MongoClient, WithId } from "mongodb";
import { OHLCV, SingleExchange, AllowedExchangeId } from "../../types";
import { Balances, Order, Exchange } from "ccxt";
import { Tedis } from "tedis";
import { BackfillDocument } from "./backfill";

type SyncStrategy = (exchange: any, data: any) => void;

type AsyncStrategy = (
	//TODO: ANY IS A HACK CHANGE THAT
	exchange: any,
	data: any
) => Promise<void>;

type Strategy = SyncStrategy | AsyncStrategy;

export interface SingleBalance {
	base: number;
	quote: number;
}

export type MultiBalance = {
	[key in AllowedExchangeId]: SingleBalance;
};

export type SingleInitData = {
	backfill: WithId<BackfillDocument>;
	exchange: BacktestingExchange;
};

export type MultiBacktestingExchange = {
	[key in AllowedExchangeId]?: BacktestingExchange;
};
export type MultiInitData = {
	backfill: WithId<BackfillDocument>;
	exchanges: MultiBacktestingExchange;
};

export interface BacktestInput {
	name?: string;
	backfillName: string;
	strategy: Strategy;
	initialBalance: SingleBalance | MultiBalance;
	type?: "single" | "multi";
}

export interface ProcessedBacktestOptions extends BacktestInput {
	baseAndQuote: SingleBalance | MultiBalance;
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
	exchange: SingleExchange;
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

export interface BacktestResults {
	backtest: BacktestDocument;
	errors: string[];
}
export interface BacktestDocument {
	name: string;
	backfillId: ObjectId;
	orders: Order[];
	balance: Balances;
}