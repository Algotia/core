import { ConfigOptions } from "../../types";
import { log, ccxt } from "../../utils";

const validateConfig = (config: ConfigOptions): ConfigOptions => {
	const { exchange } = config;
	const { exchangeId, timeout } = exchange;

	const isExchangeIdValid = ccxt.exchanges.includes(exchangeId);

	// create error for these
	if (!isExchangeIdValid) {
		throw new Error(`${exchangeId} is not a valid exchange.`);
	}

	if (timeout < 3000) {
		throw new Error(
			`The timeout in your configuration file (${timeout}}) is too short. Please make it a value above 3000`
		);
	}

	if (!config.db) {
		config.db = {};
	}

	return config;
};

export default validateConfig;
