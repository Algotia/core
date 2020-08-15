import { ConfigOptions } from "../../types";
import { MongoClient } from "mongodb";
import { log } from "../../utils";

const createClient = async (
	configInput: ConfigOptions
): Promise<MongoClient> => {
	try {
		const port = configInput.db.port || 27017;
		const dbUrl = `mongodb://localhost:${port}`;
		const dbOptions = {
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 7500,
			heartbeatFrequencyMS: 2000
		};
		const client: MongoClient = new MongoClient(dbUrl, dbOptions);

		!client.isConnected() && (await client.connect());

		client.db("algotia");

		return client;
	} catch (err) {
		log.error(err);
	}
};

export default createClient;
