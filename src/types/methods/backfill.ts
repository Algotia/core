import { OHLCV } from "..";
import { AllowedExchangeId } from "../../types";

type BackfillType = "single" | "multi";

export interface BackfillInput {
	since: string;
	until?: string;
	pair: string;
	period: string;
	recordLimit?: number;
	documentName?: string;
	type?: BackfillType;
	exchanges?: AllowedExchangeId[];
	verbose?: boolean;
}

export type SingleCandleSet = OHLCV[];

export type MultiCandleSets = {
	[key in AllowedExchangeId]: SingleCandleSet;
};

export interface BackfillDocument {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	type: BackfillType;
	candles: SingleCandleSet | MultiCandleSets;
	exchanges: AllowedExchangeId[];
}

export interface ConvertedBackfillOptions extends BackfillInput {
	sinceMs: number;
	untilMs: number;
	period: string;
	periodMs: number;
	pair: string;
	recordsToFetch: number;
	recordLimit: number;
}
