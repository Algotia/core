import ccxt from "ccxt";
import fs from "fs";
import Ajv from "ajv";
import log from "fancy-log";
import program from "commander";
import { MongoClient } from "mongodb";

import { bail } from "../utils/index";
import { Config } from "../types/interfaces/config";

export default async (userConfig: Config) => {
	try {
		const config = validateConfig(userConfig);
		const exchange = await connectExchange(config);
		await connectStore();

		const bootData = {
			config,
			exchange
		};
		return bootData;
	} catch (err) {
		console.log("Error in boot phase: ", err);
	}
};

const validateConfig = (userConfig: Config) => {
	// schema is generated at build-time with typescript-json-schema
	const schemaFile = fs.readFileSync(`${__dirname}/../config/config.schema.json`, "utf8");
	const configSchema = JSON.parse(schemaFile);

	const ajv = new Ajv();
	const validate = ajv.compile(configSchema);
	const valid = validate(userConfig);

	if (valid) {
		if (program.verbose) log("Configuration validated");
		return userConfig;
	} else {
		validate.errors.forEach((errObj) => {
			log.error(`error while validating schema: ${errObj.dataPath}: ${errObj.message}`);
		});
		bail("Could not validate configuration file.");
	}
};

const connectExchange = async (config: Config) => {
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

const connectStore = async () => {
	try {
		const url = "mongodb://localhost:27017";
		const dbname = "algotia";
		const options = {
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 7500,
			heartbeatFrequencyMS: 2000
		};

		const client = new MongoClient(url, options);

		await client.connect();

		const db = client.db(dbname);
		console.log(`Connected to ${db.databaseName} database`);
		await client.close();
	} catch (err) {
		if (err.message === "connect ECONNREFUSED 127.0.0.1:27017") {
			bail("Ensure that the mongodb daemon process is running and open on port 27017.");
		}
		bail("Error connecting to database: ", err);
	}
};
