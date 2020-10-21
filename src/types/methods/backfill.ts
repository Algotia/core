import { ExchangeID, Timeframe, OHLCV, Exchange } from "../shared";

export interface BackfillOptions {
	since: number | string | Date;
	until: number | string | Date;
	pair: string;
	timeframe: Timeframe;
}

export interface ProcessedBackfillOptions extends BackfillOptions {
	since: number;
	until: number;
	periodMS: number;
	exchange: Exchange;
	recordsBetween: number;
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

export type MultiBackfillSet<Opts extends MultiBackfillOptions> = Record<
	Opts["exchanges"][number],
	OHLCV
>[];

export interface BackfillSetDocument {
	candles: SingleBackfillSet;
}
