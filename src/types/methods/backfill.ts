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

export interface BackfillOptions {
	since: number | string | Date;
	until: number | string | Date;
	symbol: string;
	timeframe: Timeframe;
	type?: "single" | "multi";
}

export interface ProcessedBackfillOptions extends BackfillOptions {
	since: number;
	until: number;
	recordsBetween: number;
	periodMS: number;
	exchange: Exchange;
}

export interface BacktestOptions extends BackfillOptions {
	strategy:
		| SingleSyncStrategy
		| SingleAsyncStrategy
		| MultiSyncStartegy
		| MultiAsyncStartegy;
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

export interface BackfillSetDocument {
	candles: SingleBackfillSet;
}
