import { ObjectId } from "mongodb";
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

export interface ActiveBacktestDocument {
	name: string;
	active: true;
	backfillId: ObjectId;
	balance: Balances;
	orders: Order[];
	userCandleIdx: number;
	internalCandleIdx: number;
}
