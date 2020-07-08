export interface ConfigOptionsInterface {
	exchange: {
		/**
		 * The name of the exchange you'd like to use. For now, must match an ID from https://github.com/ccxt/ccxt
		 */
		exchangeId: string;
		/**
		 * API key from exchange.
		 */
		apiKey: string;
		/**
		 * API secret from exchange.
		 */
		apiSecret: string;
		/**
		 * Timeout, as documented by ccxt.
		 */
		timeout?: number;
	};
}

export type ConfigOptions = ConfigOptionsInterface;

export interface ListOptionsInterface {
	pretty?: boolean;
}

export type ListOptions = ListOptionsInterface;

export interface DeleteOptionsInterface {
	verbose?: boolean;
}

export type DeleteOptions = DeleteOptionsInterface;

export interface BackfillOptions {
	sinceInput: string | number;
	untilInput?: string | number;
	pair: string;
	period?: string;
	recordLimit?: number;
	documentName?: string;
	verbose?: boolean;
}

export interface BootOptions {
	verbose?: boolean;
}

// numbers are stored as strings in mongo.
export interface OHLCV {
	timestamp: number;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

export interface BackfillDocumentInterface {
	name: string;
	period: string;
	pair: string;
	since: string;
	until: string;
	records: OHLCV[];
}

export type BackfillDocument = BackfillDocumentInterface;
