import { ExchangeID, Timeframe, OHLCV, Exchange } from "../shared";

export interface BackfillOptions {
	since: number | string | Date;
	until: number | string | Date;
	pair: string;
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

export interface SingleBackfillOptions extends BackfillOptions {
	type?: "single";
	exchange?: ExchangeID;
}

export interface MultiBackfillOptions extends BackfillOptions {
	type: "multi";
	exchanges: ExchangeID[];
}

export type SingleBackfillSet = OHLCV[];

export type MultiBackfillSet<
	Opts extends MultiBackfillOptions = MultiBackfillOptions
> = Record<Opts["exchanges"][number], SingleBackfillSet>;

export interface BackfillSetDocument {
	candles: SingleBackfillSet;
}
