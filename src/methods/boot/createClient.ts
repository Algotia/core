import { ConfigOptions } from "../../types";
import { MongoClient } from "mongodb";

const createClient = async (
	configInput: ConfigOptions
): Promise<MongoClient> => {
	try {
		const port = configInput.db.port || 27017;
		//const dbUrl = `mongodb://localhost:${port}`;

		const dbUrl =
			process.env.NODE_ENV === "test"
				? process.env.MONGO_URL
				: `mongodb://localhost:${port}`;
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
		throw err;
	}
};

export default createClient;
