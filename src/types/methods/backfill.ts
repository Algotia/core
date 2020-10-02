import { ExchangeID, Timeframe, OHLCV } from "../shared";

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
}

export interface SingleBackfillOptions extends BackfillOptions {
	type: "single";
}

export interface MultiBackfillOptions extends BackfillOptions {
	type: "multi";
	exchanges: ExchangeID[];
}

export interface SingleBackfillSet {
	records: OHLCV[];
}

export interface MultiBackfillSet<
	Opts extends MultiBackfillOptions = MultiBackfillOptions
> {
	records: Record<Opts["exchanges"][number], OHLCV[]>;
}
