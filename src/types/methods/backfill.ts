import { ExchangeID, Timeframe, OHLCV, Exchange } from "../shared";

export interface BackfillOptions {
	startDate: number | string | Date;
	endDate: number | string | Date;
	asset: string;
	timeframe: Timeframe;
}

export interface ProcessedBackfillOptions extends BackfillOptions {
	/** Raw, untouched input */
	startDate: number;
	endDate: number;
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

export type MultiBackfillSet<
	Opts extends MultiBackfillOptions = MultiBackfillOptions
> = Record<Opts["exchanges"][number], OHLCV>[];

export interface BackfillSetDocument {
	candles: SingleBackfillSet;
}
