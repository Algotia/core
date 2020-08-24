import { ConfigOptions, AllowedExchangeIdsEnum } from "../../types";

const validateConfig = (config: ConfigOptions): ConfigOptions => {
	const { exchange } = config;
	const { exchangeId, timeout } = exchange;

	const isExchangeIdValid = () => {
		if (Object.keys(AllowedExchangeIdsEnum).includes(exchangeId)) {
			return true;
		} else {
			return false;
		}
	};

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
