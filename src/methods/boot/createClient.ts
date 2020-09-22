import { Config } from "../../types";
import { MongoClient } from "mongodb";

const createClient = async (configInput: Config): Promise<MongoClient> => {
	try {
		let port: number;
		if (configInput.mongo && configInput.mongo.port) {
			port = configInput.mongo.port;
		} else {
			port = 27017;
		}
		//const dbUrl = `mongodb://localhost:${port}`;

		const dbUrl =
			process.env.NODE_ENV === "test" && process.env.MONGO_URL
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
