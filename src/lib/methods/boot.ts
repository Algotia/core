import ccxt, { Exchange } from "ccxt";
import { MongoClient, Db } from "mongodb";
import { log } from "../../utils/";
import { ConfigOptions, BootOptions, BootData } from "../../types/";

// validateConfig
const validateConfig = (config: ConfigOptions): ConfigOptions => {
	try {
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

		return config;
	} catch (err) {
		log.error(err);
	}
};

// connectExchange
const connectExchange = async (
	config: ConfigOptions,
	options?: BootOptions
): Promise<Exchange> => {
	try {
		const { exchangeId, apiKey, apiSecret, timeout } = config.exchange;
		const exchange: Exchange = new ccxt[exchangeId]({
			apiKey,
			secret: apiSecret,
			timeout
		});
		if (options) {
			options.verbose && log.info(`Created an instance of ${exchange.name}.`);
		}
		exchange.checkRequiredCredentials();
		return exchange;
	} catch (err) {
		log.error(err);
	}
};

const connectToDatabase = async (): Promise<{
	db: Db;
	client: MongoClient;
}> => {
	try {
		const dbUrl = "mongodb://localhost:27017";
		const dbName = "algotia";
		const dbOptions = {
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 7500,
			heartbeatFrequencyMS: 2000
		};
		const client: MongoClient = new MongoClient(dbUrl, dbOptions);
		await client.connect();
		const db = client.db(dbName);

		return { db, client };
	} catch (err) {
		log.error(err);
	}
};

const boot = async (
	configInput: ConfigOptions,
	bootOptions?: BootOptions
): Promise<BootData> => {
	try {
		const config: ConfigOptions = validateConfig(configInput);
		const exchange: Exchange = await connectExchange(configInput, bootOptions);
		const { db, client } = await connectToDatabase();

		const bootData: BootData = {
			config,
			exchange,
			db,
			client
		};
		return bootData;
	} catch (err) {
		log.error(err);
	}
};

export default boot;
