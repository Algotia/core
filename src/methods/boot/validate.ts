import ccxt from "ccxt";
import { isExchangeID, Config } from "../../types";

class ConfigError extends TypeError {
	constructor(message: string) {
		super(message);
	}
}

const validateConfig = <Conf extends Config>(config: Conf): Conf => {
	const { exchange } = config;
	for (const id in exchange) {
		if (!isExchangeID(id)) {
			if (!ccxt.exchanges.includes(id)) {
				throw new ConfigError(`Exchange ${id} is not a valid exchange id.`);
			}
			throw new ConfigError(`Exchange ${id} is not a supported exchange id.`);
		} else {
			const exchangeConfig = exchange[id];
			if (typeof exchangeConfig === "boolean") {
			} else {
				const { timeout, apiKey, secret } = exchangeConfig;
				if (timeout < 3000) {
					throw new ConfigError(
						`Timeout cannot be less than 3000 ms, configured timeout was ${timeout}`
					);
				}
				if (apiKey) {
					if (typeof apiKey !== "string") {
						throw new ConfigError("Configured apiKey is not a string.");
					}

					if (apiKey === "") {
						throw new ConfigError("Cannot pass an empty apiKey.");
					}
				}
				if (secret) {
					if (typeof secret !== "string") {
						throw new ConfigError("Configured secret is not a string.");
					}

					if (apiKey === "") {
						throw new ConfigError("Cannot pass an empty secret.");
					}
				}
			}
		}
	}

	return config;
};

export default validateConfig;
