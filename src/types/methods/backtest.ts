import { ObjectId, Collection, WithId } from "mongodb";
import { OHLCV } from "../shared";
import ccxt, { Balances, Order, Exchange, Trade } from "ccxt";
import { RedisClient } from "redis";
import { Tedis } from "tedis";

type SyncStrategy = (exchange: Exchange, data: OHLCV) => void;
type AsyncStrategy = (exchange: Exchange, data: OHLCV) => Promise<void>;

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

export interface BacktestDocument {
	name: string;
	backfillId: ObjectId;
	balance: Balances;
	orders: Order[];
	trades: Trade[];
}

export interface ActiveBacktestDocument extends BacktestDocument {
	active: true;
	userCandleIdx: number;
	internalCandleIdx: number;
}

export type ActiveBacktestDocumentWithId = WithId<ActiveBacktestDocument>;

export interface Collections {
	backtest: Collection;
	backfill: Collection;
}

export interface MethodFactoryArgs {
	redisClient: Tedis;
	exchange: Exchange;
	collections: Collections;
}

export enum PrivateApiIds {
	FetchBalance = "fetchBalance",
	CreateOrder = "createOrder",
	CancelOrder = "cancelOrder",
	FetchOrders = "fetchOrders"
}
