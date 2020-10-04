import {
	ExchangeID,
	Timeframe,
	OHLCV,
	SingleSyncStrategy,
	SingleAsyncStrategy,
	MultiSyncStartegy,
	MultiAsyncStartegy,
	Exchange,
} from "../shared";

export interface BacktestOptions {
	strategy:
		| SingleSyncStrategy
		| SingleAsyncStrategy
		| MultiSyncStartegy
		| MultiAsyncStartegy;
	since: number | string | Date;
	until: number | string | Date;
	symbol: string;
	timeframe: Timeframe;
	type?: "single" | "multi";
}

export interface ProcessedBackfillOptions extends BacktestOptions {
	since: number;
	until: number;
	recordsBetween: number;
	periodMS: number;
	exchange: Exchange;
}

export interface SingleBacktestOptions extends BacktestOptions {
	type?: "single";
	strategy: SingleSyncStrategy | SingleAsyncStrategy;
}

export interface MultiBacktestOptions extends BacktestOptions {
	type: "multi";
	strategy: MultiSyncStartegy | MultiAsyncStartegy;
}

export type SingleBackfillSet = OHLCV[];

export type MultiBackfillSet<Exchanges extends ExchangeID[]> = Record<
	Exchanges[number],
	SingleBackfillSet
>;
