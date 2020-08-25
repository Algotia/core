import { ObjectId, Collection } from "mongodb";
import { OHLCV } from "../shared";
import { AllowedExchangeIds } from "./boot";
import ccxt, { Balances, Order, Exchange } from "ccxt";

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
}
export interface ActiveBacktestDocument extends BacktestDocument {
	active: true;
	userCandleIdx: number;
	internalCandleIdx: number;
}

export interface Collections {
	backtest: Collection;
	backfill: Collection;
}

export interface MethodFactoryArgs {
	exchange: Exchange;
	collections: Collections;
}

export enum PrivateApiIds {
	FetchBalance = "fetchBalance",
	CreateOrder = "createOrder",
	CancelOrder = "cancelOrder",
	FetchOrders = "fetchOrders"
}

export type createOrder = typeof Exchange.prototype.createOrder;
export type cancelOrder = typeof Exchange.prototype.cancelOrder;
export type fetchOrders = typeof Exchange.prototype.fetchOrders;
export type fetchBalance = typeof Exchange.prototype.fetchBalance;

export interface PrivateApi {
	fetchBalance: fetchBalance;
	createOrder: createOrder;
	cancelOrder: cancelOrder;
	fetchOrders: fetchOrders;
}
