export interface ExchangeConfigOptionsInterface {
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
}

export type ExchangeConfigOptions = ExchangeConfigOptionsInterface;

export interface ConfigOptionsInterface {
	exchange: ExchangeConfigOptions;
}

export type ConfigOptions = ConfigOptionsInterface;

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
