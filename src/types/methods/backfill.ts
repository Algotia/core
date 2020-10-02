import {
	ExchangeID,
	Timeframe,
	OHLCV,
	SingleSyncStrategy,
	SingleAsyncStrategy,
	MultiSyncStartegy,
	MultiAsyncStartegy,
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
}

export interface SingleBacktestOptions extends BacktestOptions {
	type?: "single";
	strategy: SingleSyncStrategy | SingleAsyncStrategy;
}

export interface MultiBacktestOptions extends BacktestOptions {
	type: "multi";
	exchanges: ExchangeID[];
	strategy: MultiSyncStartegy | MultiAsyncStartegy;
}

export type SingleBackfillSet = OHLCV[];

export interface MultiBackfillSet<
	Opts extends MultiBacktestOptions = MultiBacktestOptions
> {
	records: Record<Opts["exchanges"][number], SingleBackfillSet>;
}
