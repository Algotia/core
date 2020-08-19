import { OHLCV } from "..";

export interface BackfillInput {
	since: string;
	until?: string;
	pair: string;
	period?: string;
	recordLimit?: number;
	documentName?: string;
	verbose?: boolean;
}

export interface BackfillDocument {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	records: OHLCV[];
}

export interface ConvertedBackfillOptions extends BackfillInput {
	sinceMs: number;
	untilMs: number;
	period: string;
	periodMs: number;
	pair: string;
	recordsToFetch: number;
	recordLimit: number;
	verbose?: boolean;
}
