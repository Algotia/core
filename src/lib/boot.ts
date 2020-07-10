import ccxt, { Exchange } from "ccxt";
import { MongoClient } from "mongodb";

import { log } from "../utils/index";
import { ConfigOptions, BootOptions } from "../types/index";

export default async (
	config: ConfigOptions,
	bootOptions?: BootOptions
): Promise<{ config: ConfigOptions; exchange: Exchange }> => {
	try {
		if (!bootOptions) bootOptions = { verbose: false };
		const connectExchange = async (config: ConfigOptions): Promise<Exchange> => {
			try {
				const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
				const exchange: Exchange = new ccxt[exchangeId]({
					apiKey,
					secret: apiSecret,
					timeout
				});
				if (bootOptions.verbose) {
					log.info(`Created an instance of ${exchange.name}.`);
				}
				return exchange;
			} catch (err) {
				throw new Error("Error creating a ccxt instance: " + err);
			}
		};

		const connectStore = async (): Promise<void> => {
			try {
				const dbUrl = "mongodb://localhost:27017";
				const dbname = "algotia";
				const dbOptions = {
					useUnifiedTopology: true,
					serverSelectionTimeoutMS: 7500,
					heartbeatFrequencyMS: 2000
				};

				const client = new MongoClient(dbUrl, dbOptions);

				await client.connect();
				client.db(dbname);
				bootOptions.verbose && log.info(`Connected to ${client.db.name} database.`);
				await client.close();
			} catch (err) {
				if (err.message === "connect ECONNREFUSED 127.0.0.1:27017") {
					throw new Error(
						"Ensure that the mongodb daemon process is running and open on port 27017."
					);
				}
				throw new Error("Error connecting to database: " + err);
			}
		};

		const exchange: Exchange = await connectExchange(config);
		await connectStore();

		const bootData = {
			config,
			exchange
		};
		return bootData;
	} catch (err) {
		return Promise.reject(err);
	}
};
