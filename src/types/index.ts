export interface IConfigOptions {
	exchange: {
		/**
		 * The name of the exchange you'd like to use. For now, must match an ID from https://github.com/ccxt/ccxt
		 */
		exchangeId: string;
		/**
		 * API key from exchange.
		 */
		apiKey?: string;
		/**
		 * API secret from exchange.
		 */
		apiSecret?: string;
		/**
		 * Timeout, as documented by ccxt.
		 */
		timeout?: number;
	};
}

export type ConfigOptions = IConfigOptions;

export interface IListOptions {
	pretty?: boolean;
}

export type ListOptions = IListOptions;

export interface IDeleteOptions {
	verbose?: boolean;
}

export type DeleteOptions = IDeleteOptions;

export interface BackfillOptions {
	sinceInput: string;
	untilInput?: string;
	pair: string;
	period?: string;
	recordLimit?: number;
	documentName?: string;
	verbose?: boolean;
}
export interface IBackfillResults {
	name: string;
	period: string;
	pair: string;
	since: number;
	until: number;
	records: OHLCV[];
}

export type BackfillResults = IBackfillResults;

export interface BootOptions {
	verbose?: boolean;
}

// numbers are stored as strings in mongo.
export interface IOHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export type OHLCV = IOHLCV;

export interface IBackfillDocument {
	name: string;
	period: string;
	pair: string;
	since: string;
	until: string;
	records: OHLCV[];
}

export type BackfillDocument = IBackfillDocument;
