/* In order to convert this interface into a JSON schema (https://json-schema.org/), we use typescript-json-schema
(https://github.com/YousefED/typescript-json-schema). This is currently ran as a npm script but we probably want to include that
in the build process (gulp/grunt task?)
*/

export interface Config {
	exchange: ExchangeConfig;
}

interface ExchangeConfig {
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
