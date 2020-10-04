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
	exchange?: ExchangeID;
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
