import ccxt from "ccxt";
import { isExchangeID, Config } from "../../types";
import { exec } from "child_process";

class ConfigError extends TypeError {
	constructor(message: string) {
		super(message);
	}
}

const validateConfig = (config: Config): Config => {
	try {
		const { exchange } = config;

		//TODO: check if mongodb is running
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
		exec("command -v mongod", (err) => {
			if (err) throw new Error("Mongod is not installed");
		});

		exec("mongo --eval '{ping: 1}'", (err) => {
			const port = 27017;
			if (err) throw new Error(`Mongo server is not running on ${port}`);
		});

		exec("command -v redis-server", (err) => {
			if (err) {
				throw new Error("Redis server is not installed");
			}
		});

		exec("redis-cli PING", (err) => {
			if (err) {
				const port = 6379;
				throw new Error(`Redis server is npot running on ${port}`);
			}
		});

		return config;
	} catch (err) {
		throw err;
	}
};

export default validateConfig;
