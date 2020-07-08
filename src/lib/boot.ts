import ccxt from "ccxt";
import Ajv from "ajv";
import { MongoClient } from "mongodb";
import * as TJS from "ts-json-schema-generator";
import { Exchange } from "ccxt";

import { log } from "../utils/index";
import { ConfigOptionsInterface, BootOptions } from "../types/index";

export default async (
	userConfig: any,
	bootOptions?: BootOptions
): Promise<{ config: ConfigOptionsInterface; exchange: Exchange }> => {
	try {
		const validateConfig = (config: any): ConfigOptionsInterface => {
			// schema is generated at build-time with typescript-json-schema
			const tjsConfig = {
				path: "./src/types/index.ts",
				tsconfig: "./tsconfig.json",
				type: "ConfigOptions"
			};

			const schema = TJS.createGenerator(tjsConfig).createSchema(tjsConfig.type);

			const ajv = new Ajv({ allErrors: true });
			const validate = ajv.compile(schema);
			const valid = validate(config);

			if (valid) return userConfig;
			if (!valid) {
				bootOptions.verbose &&
					validate.errors.forEach((err) => {
						log.error(`Error validating schema: ${err.dataPath} ${err.message}`);
					});
				throw new Error(`${validate.errors}`);
			}

			return userConfig;
		};

		const connectExchange = async (config: ConfigOptionsInterface): Promise<Exchange> => {
			try {
				const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
				const exchange = new ccxt[exchangeId]({
					apiKey,
					secret: apiSecret,
					timeout
				});

				return exchange;
			} catch (err) {
				log.error(err);
			}
		};

		const connectStore = async (verbose?: boolean): Promise<void> => {
			try {
				const url = "mongodb://localhost:27017";
				const dbname = "algotia";
				const dbOptions = {
					useUnifiedTopology: true,
					serverSelectionTimeoutMS: 7500,
					heartbeatFrequencyMS: 2000
				};

				const client = new MongoClient(url, dbOptions);

				await client.connect();
				// create 'algotia' database in mongo
				client.db(dbname);
				await client.close();
				if (verbose) await client.close();
			} catch (err) {
				if (err.message === "connect ECONNREFUSED 127.0.0.1:27017") {
					throw new Error(
						"Ensure that the mongodb daemon process is running and open on port 27017."
					);
				}
				throw new Error("Error connecting to database: " + err);
			}
		};

		const config: ConfigOptionsInterface = validateConfig(userConfig);
		const exchange: Exchange = await connectExchange(config);
		await connectStore();

		const bootData = {
			config,
			exchange
		};
		return bootData;
	} catch (err) {
		return Promise.reject(new Error(`Error in boot phase: ${err}`));
	}
};
