import { MongoClient, Db } from "mongodb";

const connectToDb = async (client: MongoClient): Promise<Db> => {
	try {
		const dbName = "algotia";
		if (!client.isConnected()) {
			await client.connect();
		}
		return client.db(dbName);
	} catch (err) {
		throw err;
	}
};

export default connectToDb;
